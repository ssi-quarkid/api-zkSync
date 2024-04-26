import {
  ErrorCode,
  PublicKeyPurpose,
  PatchAction,
  // Encoder, // we don't require base64url

  SidetreeError,
} from '@quarkid-sidetree/common';

import * as URI from 'uri-js';
import ArrayMethods from './util/ArrayMethods';

import InputValidator from './InputValidator';


/**
 * Class that handles the composition of operations into final external-facing document.
 */
export default class DocumentValidator {
  /**
    * Validates the schema of the given full document state.
    * @throws SidetreeError if given document patch fails validation.
    */
  private static validateDocument(document: any) {
    if (document === undefined) {
      throw new SidetreeError(ErrorCode.DocumentComposerDocumentMissing);
    }

    const allowedProperties = new Set(['publicKeys', 'services', 'controller']);
    for (const property in document) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerUnknownPropertyInDocument,
          `Unexpected property ${property} in document.`
        );
      }
    }

    // Verify 'publicKeys' property if it exists.
    if ('publicKeys' in document) {
      DocumentValidator.validatePublicKeys(document.publicKeys);
    }

    // Verify 'services' property if it exists.
    if ('services' in document) {
      // Verify each entry in services array.
      DocumentValidator.validateServices(document.services);
    }
  }

  /**
   * Validates the schema of the given update document patch.
   * @throws SidetreeError if given document patch fails validation.
   */
  public static validateDocumentPatches(patches: any) {
    if (!Array.isArray(patches)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerUpdateOperationDocumentPatchesNotArray
      );
    }

    for (const patch of patches) {
      DocumentValidator.validatePatch(patch);
    }
  }

  private static validatePatch(patch: any) {
    const action = patch.action;
    switch (action) {
      case PatchAction.Replace:
        DocumentValidator.validateDocument(patch.document);
        break;
      case PatchAction.AddPublicKeys:
        DocumentValidator.validateAddPublicKeysPatch(patch);
        break;
      case PatchAction.RemovePublicKeys:
        DocumentValidator.validateRemovePublicKeysPatch(patch);
        break;
      case PatchAction.AddServices:
        DocumentValidator.validateAddServicesPatch(patch);
        break;
      case PatchAction.RemoveServices:
        DocumentValidator.validateRemoveServicesPatch(patch);
        break;
      default:
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchMissingOrUnknownAction
        );
    }
  }

  private static validateAddPublicKeysPatch(patch: any) {
    const patchProperties = Object.keys(patch);
    if (patchProperties.length !== 2) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchMissingOrUnknownProperty
      );
    }

    DocumentValidator.validatePublicKeys(patch.publicKeys);
  }

  private static validatePublicKeys(publicKeys: any) {
    if (!Array.isArray(publicKeys)) {
      throw new SidetreeError(ErrorCode.DocumentComposerPublicKeysNotArray);
    }

    const publicKeyIdSet: Set<string> = new Set();
    for (const publicKey of publicKeys) {
      const allowedProperties = new Set([
        'id',
        'type',
        'purposes',
        'publicKeyJwk',
      ]);
      for (const property in publicKey) {
        if (!allowedProperties.has(property)) {
          throw new SidetreeError(
            ErrorCode.DocumentComposerPublicKeyUnknownProperty,
            `Unexpected property, ${property}, in publicKey.`
          );
        }
      }

      InputValidator.validateNonArrayObject(
        publicKey.publicKeyJwk,
        'publicKeyJwk'
      );

      if (typeof publicKey.type !== 'string') {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPublicKeyTypeMissingOrIncorrectType
        );
      }

      DocumentValidator.validateId(publicKey.id);

      // 'id' must be unique
      if (publicKeyIdSet.has(publicKey.id)) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPublicKeyIdDuplicated
        );
      }
      publicKeyIdSet.add(publicKey.id);

      if ('purposes' in publicKey) {
        if (!Array.isArray(publicKey.purposes)) {
          throw new SidetreeError(
            ErrorCode.DocumentComposerPublicKeyPurposesIncorrectType
          );
        }

        if (ArrayMethods.hasDuplicates(publicKey.purposes)) {
          throw new SidetreeError(
            ErrorCode.DocumentComposerPublicKeyPurposesDuplicated
          );
        }

        const validPurposes = new Set(Object.values(PublicKeyPurpose));
        // Purpose must be one of the valid ones in PublicKeyPurpose
        for (const purpose of publicKey.purposes) {
          if (!validPurposes.has(purpose)) {
            throw new SidetreeError(
              ErrorCode.DocumentComposerPublicKeyInvalidPurpose
            );
          }
        }
      }
    }
  }

  private static validateRemovePublicKeysPatch(patch: any) {
    const allowedProperties = new Set(['action', 'ids']);
    for (const property in patch) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerUnknownPropertyInRemovePublicKeysPatch,
          `Unexpected property ${property} in remove-public-keys patch.`
        );
      }
    }

    if (!Array.isArray(patch.ids)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchPublicKeyIdsNotArray
      );
    }

    for (const id of patch.ids) {
      DocumentValidator.validateId(id);
    }
  }

  /**
   * validate update patch for removing services
   */
  private static validateRemoveServicesPatch(patch: any) {
    const allowedProperties = new Set(['action', 'ids']);
    for (const property in patch) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerUnknownPropertyInRemoveServicesPatch,
          `Unexpected property ${property} in remove-services patch.`
        );
      }
    }

    if (!Array.isArray(patch.ids)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchServiceIdsNotArray
      );
    }

    for (const id of patch.ids) {
      DocumentValidator.validateId(id);
    }
  }

  /**
   * Validates update patch for adding services.
   */
  private static validateAddServicesPatch(patch: any) {
    const patchProperties = Object.keys(patch);
    if (patchProperties.length !== 2) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchMissingOrUnknownProperty
      );
    }

    if (!Array.isArray(patch.services)) {
      throw new SidetreeError(ErrorCode.DocumentComposerPatchServicesNotArray);
    }

    DocumentValidator.validateServices(patch.services);
  }

  /**
   * Validates and parses services.
   * @param services The services to validate and parse.
   */
  private static validateServices(services: any) {
    if (!Array.isArray(services)) {
      throw new SidetreeError(ErrorCode.DocumentComposerPatchServicesNotArray);
    }

    const serviceIdSet: Set<string> = new Set();
    for (const service of services) {
      const serviceProperties = Object.keys(service);
      if (serviceProperties.length !== 3) {
        // type, id, and serviceEndpoint
        throw new SidetreeError(
          ErrorCode.DocumentComposerServiceHasMissingOrUnknownProperty
        );
      }

      DocumentValidator.validateId(service.id);
      if (serviceIdSet.has(service.id)) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchServiceIdNotUnique,
          'Service id has to be unique'
        );
      }
      serviceIdSet.add(service.id);

      if (typeof service.type !== 'string') {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchServiceTypeNotString
        );
      }

      if (service.type.length > 30) {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchServiceTypeTooLong
        );
      }

      // `serviceEndpoint` validations.
      const serviceEndpoint = service.serviceEndpoint;
      if (typeof serviceEndpoint === 'string') {
        const uri = URI.parse(service.serviceEndpoint);
        if (uri.error !== undefined) {
          throw new SidetreeError(
            ErrorCode.DocumentComposerPatchServiceEndpointStringNotValidUri,
            `Service endpoint string '${serviceEndpoint}' is not a valid URI.`
          );
        }
      } else if (typeof serviceEndpoint === 'object') {
        // Allow `object` type only if it is not an array.
        if (Array.isArray(serviceEndpoint)) {
          throw new SidetreeError(
            ErrorCode.DocumentComposerPatchServiceEndpointCannotBeAnArray
          );
        }
      } else {
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchServiceEndpointMustBeStringOrNonArrayObject
        );
      }
    }
  }

  private static validateId(id: any) {
    if (typeof id !== 'string') {
      throw new SidetreeError(
        ErrorCode.DocumentComposerIdNotString,
        `ID not string: ${JSON.stringify(id)} is of type '${typeof id}'`
      );
    }
    if (id.length > 50) {
      throw new SidetreeError(ErrorCode.DocumentComposerIdTooLong);
    }
  }
}
