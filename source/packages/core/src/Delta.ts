import {
  ErrorCode,
  Logger,
  protocolParameters,
  SidetreeError,
} from '@extrimian-sidetree/common';

import JsonCanonicalizer from './util/JsonCanonicalizer';
import Operation from './Operation';

/**
 * Class containing reusable operation delta functionalities.
 */
export default class Delta {
  /**
   * Validates that delta is not null or undefined
   */
  private static validateDeltaIsDefined(delta: any) {
    if (delta === undefined || delta === null) {
      throw new SidetreeError(
        ErrorCode.DeltaIsNullOrUndefined,
        `Delta is ${delta}`
      );
    }
  }

  /**
   * Validates size of the delta object
   */
  public static validateDelta(delta: any) {
    // null and undefined cannot be turned into buffer
    Delta.validateDeltaIsDefined(delta);
    const size = Buffer.byteLength(
      JsonCanonicalizer.canonicalizeAsBuffer(delta)
    );
    if (size > protocolParameters.maxDeltaSizeInBytes) {
      const errorMessage = `${size} bytes of 'delta' exceeded limit of ${protocolParameters.maxDeltaSizeInBytes} bytes.`;
      Logger.info(errorMessage);
      throw new SidetreeError(ErrorCode.DeltaExceedsMaximumSize, errorMessage);
    }

    // Validate against delta schema.
    Operation.validateDelta(delta);
  }
}
