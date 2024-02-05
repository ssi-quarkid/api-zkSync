import { ErrorCode, Multihash, SidetreeError, protocolParameters } from '@extrimian-sidetree/common';
import DocumentValidator from './DocumentValidator';


export const validateDelta = (delta: any) => {

  validateNonArrayObject(delta, 'delta')

  validateObjectContainsOnlyAllowedProperties(
    delta,
    ['patches', 'updateCommitment'],
    'delta'
  );

  // Validate `patches` property using the DocumentComposer.
  DocumentValidator.validateDocumentPatches(delta.patches);


  delta.updateCommitment.forEach((updateCommitment: string) => validateEncodedMultihash(
    updateCommitment,
    'update commitment'
  ));
};


function validateNonArrayObject(
  input: any,
  inputContextForErrorLogging: string
) {
  if (typeof input !== 'object') {
    throw new SidetreeError(
      ErrorCode.InputValidatorInputIsNotAnObject,
      `Input ${inputContextForErrorLogging} is not an object.`
    );
  }

  if (Array.isArray(input)) {
    throw new SidetreeError(
      ErrorCode.InputValidatorInputCannotBeAnArray,
      `Input ${inputContextForErrorLogging} object cannot be an array.`
    );
  }
}
/**
 * Validates that the given object only contains allowed properties.
 * @param inputContextForErrorLogging This string is used for error logging purposes only. e.g. 'document', or 'suffix data'.
 */
function validateObjectContainsOnlyAllowedProperties(
  input: object,
  allowedProperties: string[],
  inputContextForErrorLogging: string
) {
  const allowedPropertiesSet = new Set(allowedProperties);
  for (const property in input) {
    if (!allowedPropertiesSet.has(property)) {
      throw new SidetreeError(
        ErrorCode.InputValidatorInputContainsNowAllowedProperty,
        `Property '${property}' is not allowed in '${inputContextForErrorLogging}' object.`
      );
    }
  }
}

/**
* Validates that the given input is a multihash computed using a supported hash algorithm.
* @param inputContextForErrorLogging This string is used for error logging purposes only. e.g. 'document', or 'suffix data'.
*/
function validateEncodedMultihash(
  input: any,
  inputContextForErrorLogging: string
) {


  const supportedHashAlgorithmsInMultihashCode =
    protocolParameters.hashAlgorithmsInMultihashCode;
  Multihash.validateHashComputedUsingSupportedHashAlgorithm(
    input,
    supportedHashAlgorithmsInMultihashCode,
    inputContextForErrorLogging
  );
}