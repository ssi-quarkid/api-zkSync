/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ErrorCode,
  SidetreeError,
  PublicKeyJwkSecp256k1,
  PublicKeyJwkEd25519,
  PrivateKeyJwkSecp256k1,
  PrivateKeyJwkEd25519,
  PrivateKeyJwk,
  PublicKeyJwk,
} from '@extrimian-sidetree/common';
import { JWK } from 'jose';
import * as bip39 from 'bip39';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import hdkey from 'hdkey';
import { from as keytoFrom } from '@trust/keyto';

/**
 * Class containing reusable JWK operations.
 */
export default class Jwk {
  /**
   * Generates ED25519 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateEd25519KeyPair(): Promise<
    [PublicKeyJwkEd25519, PrivateKeyJwkEd25519]
  > {
    const keyPair = await JWK.generate('OKP', 'Ed25519');
    const privateKey = keyPair.toJWK(true) as PrivateKeyJwkEd25519;
    const publicKey = keyPair.toJWK(false) as PublicKeyJwkEd25519;
    return [publicKey, privateKey];
  }

  // Helper method to generate keys from a mnemonic
  public static async getBufferAtIndex(
    mnemonic: string,
    index: number
  ): Promise<Buffer> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const hdPath = `m/44'/60'/0'/0/${index}`;
    const addrNode = root.derive(hdPath);
    return addrNode.privateKey;
  }

  private static async generateEd25519KeyPairFromMnemonic(
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwkEd25519, PrivateKeyJwkEd25519]> {
    const privateKeyBuffer = await Jwk.getBufferAtIndex(mnemonic, index);
    const keyPair = await Ed25519KeyPair.generate({
      secureRandom: () => {
        return privateKeyBuffer;
      },
    });
    const { publicKeyJwk, privateKeyJwk } = (await keyPair.export({
      type: 'JsonWebKey2020',
      privateKey: true,
    })) as any;
    return [publicKeyJwk, privateKeyJwk];
  }

  /**
   * Generates SECP256K1 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateSecp256k1KeyPair(): Promise<
    [PublicKeyJwkSecp256k1, PrivateKeyJwkSecp256k1]
  > {
    const keyPair = await JWK.generate('EC', 'secp256k1');
    const publicKey = keyPair.toJWK(false) as PublicKeyJwkSecp256k1;
    const privateKey = keyPair.toJWK(true) as PrivateKeyJwkSecp256k1;
    return [publicKey, privateKey];
  }

  public static async generateJwkKeyPairFromMnemonic(
    keyType: string,
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwk, PrivateKeyJwk]> {
    switch (keyType) {
      case 'secp256k1':
        return this.generateSecp256k1KeyPairFromMnemonic(mnemonic, index);
      case 'ed25519':
        return this.generateEd25519KeyPairFromMnemonic(mnemonic, index);
      default:
        throw new Error('Invalid key type');
    }
  }

  private static async generateSecp256k1KeyPairFromMnemonic(
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwkSecp256k1, PrivateKeyJwkSecp256k1]> {
    const privateKeyBuffer = await Jwk.getBufferAtIndex(mnemonic, index);
    const publicKeyJwk = keytoFrom(privateKeyBuffer, 'blk').toJwk('public');
    publicKeyJwk.crv = 'secp256k1';
    const privateKeyJwk = keytoFrom(privateKeyBuffer, 'blk').toJwk('private');
    privateKeyJwk.crv = 'secp256k1';
    return [publicKeyJwk, privateKeyJwk];
  }

  /**
   * Validates the given key is a public key in JWK format allowed by Sidetree.
   * @throws SidetreeError if given object is not a key in JWK format allowed by Sidetree.
   */
  public static validatePublicJwk(publicKeyJwk: any): void {
    console.warn('actually validate with a schema....', publicKeyJwk);
  }

  /**
   * Gets the public key given the private ES256K key.
   * Mainly used for testing purposes.
   */
  public static getCurve25519PublicKey(
    privateKey: PrivateKeyJwkEd25519
  ): PublicKeyJwkEd25519 {
    const keyCopy: any = Object.assign({}, privateKey);

    // Delete the private key portion.
    delete keyCopy.d;

    return keyCopy;
  }

  /**
   * Validates the given key is a SECP256K1 public key in JWK format allowed by Sidetree.
   * @throws SidetreeError if given object is not a SECP256K1 public key in JWK format allowed by Sidetree.
   */
  public static validateJwkEs256k(publicKeyJwk: any) {
    if (publicKeyJwk === undefined) {
      throw new SidetreeError(ErrorCode.JwkEs256kUndefined);
    }

    const allowedProperties = new Set(['kty', 'crv', 'x', 'y']);
    for (const property in publicKeyJwk) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(ErrorCode.JwkEs256kHasUnknownProperty);
      }
    }

    if (publicKeyJwk.kty !== 'EC') {
      throw new SidetreeError(ErrorCode.JwkEs256kMissingOrInvalidKty);
    }

    if (publicKeyJwk.crv !== 'secp256k1') {
      throw new SidetreeError(ErrorCode.JwkEs256kMissingOrInvalidCrv);
    }

    if (typeof publicKeyJwk.x !== 'string') {
      throw new SidetreeError(ErrorCode.JwkEs256kMissingOrInvalidTypeX);
    }

    if (typeof publicKeyJwk.y !== 'string') {
      throw new SidetreeError(ErrorCode.JwkEs256kMissingOrInvalidTypeY);
    }

    // `x` and `y` need 43 Base64URL encoded bytes to contain 256 bits.
    if (publicKeyJwk.x.length !== 43) {
      throw new SidetreeError(
        ErrorCode.JwkEs256kHasIncorrectLengthOfX,
        `SECP256K1 JWK 'x' property must be 43 bytes.`
      );
    }

    if (publicKeyJwk.y.length !== 43) {
      throw new SidetreeError(
        ErrorCode.JwkEs256kHasIncorrectLengthOfY,
        `SECP256K1 JWK 'y' property must be 43 bytes.`
      );
    }
  }
}
