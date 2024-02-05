import {
  Encoder,
  ErrorCode,
  Multihash,
  OperationModel,
  OperationType,
  SidetreeError,
  SuffixDataModel
} from '@extrimian-sidetree/common';

import CreateOperation from './CreateOperation';
import Delta from './Delta';
import JsonCanonicalizer from './util/JsonCanonicalizer';
import { computeUniqueSuffix } from './computeUniqueSuffix';

// From:
// https://raw.githubusercontent.com/decentralized-identity/sidetree/master/lib/core/versions/latest/Did.ts

/**
 * Class containing reusable Sidetree DID related operations.
 */
export default class Did {
  /** `true` if DID is short form; `false` if DID is long-form. */
  public isShortForm: boolean;
  /** DID method name. */
  public didMethodName: string;
  /** DID unique suffix. */
  public uniqueSuffix: string;
  /** The create operation if the DID given is long-form, `undefined` otherwise. */
  public createOperation?: OperationModel;
  /** The short form. */
  public shortForm: string;
  /** The long form. */
  public longForm: string | undefined;

  /**
   * Parses the input string as Sidetree DID.
   * NOTE: Must not call this constructor directly, use the factory `create` method instead.
   * @param did Short or long-form DID string.
   * @param didMethodName The expected DID method given in the DID string. The method throws SidetreeError if mismatch.
   */
  private constructor(did: string, didMethodName: string) {
    this.didMethodName = didMethodName;
    const didPrefix = `did:${didMethodName}:`;

    if (!did.startsWith(didPrefix)) {
      throw new SidetreeError(
        ErrorCode.DidIncorrectPrefix,
        `Expected DID prefix ${didPrefix} not given in DID.`
      );
    }

    const didWithoutPrefix = did.split(didPrefix)[1];

    // split by : and if there is 1 element, then it's short form. Long form has 2 elements
    const didSplitLength = didWithoutPrefix.split(':').length;
    if (didSplitLength === 1) {
      this.isShortForm = true;
    } else {
      this.isShortForm = false;
    }

    if (this.isShortForm) {
      this.uniqueSuffix = did.substring(didPrefix.length);
    } else {
      // Long-form DID looks like:
      // 'did:<methodName>:<unique-portion>:Base64url(JCS({suffix-data, delta}))'

      this.uniqueSuffix = did.substring(didPrefix.length, did.lastIndexOf(':'));
      this.longForm = did;
    }

    if (this.uniqueSuffix.length === 0) {
      throw new SidetreeError(ErrorCode.DidNoUniqueSuffix);
    }

    this.shortForm = didPrefix + this.uniqueSuffix;
  }

  /**
   * Parses the input string as Sidetree DID.
   * @param didString Short or long-form DID string.
   */
  public static async create(
    didString: string,
    didMethodName: string
  ): Promise<Did> {
    const did = new Did(didString, didMethodName);

    // If DID is long-form, ensure the unique suffix constructed from the suffix data matches the short-form DID and populate the `createOperation` property.
    if (!did.isShortForm) {
      const initialStateEncodedJcs = Did.getInitialStateFromDidStringWithExtraColon(
        didString
      );
      const createOperation = Did.constructCreateOperationFromEncodedJcs(
        initialStateEncodedJcs
      );

      // NOTE: we cannot use the unique suffix directly from `createOperation.didUniqueSuffix` for comparison,
      // because a given long-form DID may have been created long ago,
      // thus this version of `CreateOperation.parse()` maybe using a different hashing algorithm than that of the unique DID suffix (short-form).
      // So we compute the suffix data hash again using the hashing algorithm used by the given unique DID suffix (short-form).
      const suffixDataJcsBuffer = JsonCanonicalizer.canonicalizeAsBuffer(
        createOperation.suffixData
      );
      const suffixDataHashMatchesUniqueSuffix = Multihash.verifyEncodedMultihashForContent(
        suffixDataJcsBuffer,
        did.uniqueSuffix
      );

      // If the computed suffix data hash is not the same as the unique suffix given in the DID string, the DID is not valid.
      if (!suffixDataHashMatchesUniqueSuffix) {
        throw new SidetreeError(
          ErrorCode.DidUniqueSuffixFromInitialStateMismatch
        );
      }

      did.createOperation = createOperation;
    }

    return did;
  }

  /**
   * Computes the DID unique suffix given the suffix data object.
   */
  public static computeUniqueSuffix(suffixDataModel: SuffixDataModel): string {
    return computeUniqueSuffix(suffixDataModel);
  }

  private static getInitialStateFromDidStringWithExtraColon(
    didString: string
  ): string {
    // DID example: 'did:<methodName>:<unique-portion>:Base64url(JCS({suffix-data, delta}))'

    const lastColonIndex = didString.lastIndexOf(':');

    const initialStateValue = didString.substring(lastColonIndex + 1);

    return initialStateValue;
  }

  private static constructCreateOperationFromEncodedJcs(
    initialStateEncodedJcs: string
  ): CreateOperation {
    // Initial state should be in the format base64url(JCS(initialState))
    const initialStateDecodedJcs = Encoder.decodeAsString(
      initialStateEncodedJcs
    );
    let initialStateObject;
    try {
      initialStateObject = JSON.parse(initialStateDecodedJcs);
    } catch {
      throw new SidetreeError(
        ErrorCode.DidInitialStateJcsIsNotJson,
        'Long form initial state should be encoded jcs.'
      );
    }

    Did.validateInitialStateJcs(initialStateEncodedJcs, initialStateObject);
    Delta.validateDelta(initialStateObject.delta);

    const createOperationRequest = {
      type: OperationType.Create,
      suffixData: initialStateObject.suffixData,
      delta: initialStateObject.delta,
    };
    const createOperationBuffer = Buffer.from(
      JSON.stringify(createOperationRequest)
    );
    const createOperation = CreateOperation.parseObject(
      createOperationRequest,
      createOperationBuffer
    );
    return createOperation;
  }

  /**
   * Make sure initial state is JCS
   */
  private static validateInitialStateJcs(
    initialStateEncodedJcs: string,
    initialStateObject: any
  ): void {
    const expectedInitialState = Encoder.encode(
      JsonCanonicalizer.canonicalizeAsBuffer(initialStateObject)
    );
    if (expectedInitialState !== initialStateEncodedJcs) {
      throw new SidetreeError(
        ErrorCode.DidInitialStateJcsIsNotJcs,
        'Initial state object and JCS string mismatch.'
      );
    }
  }
}
