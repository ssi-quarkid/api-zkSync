import {
  ErrorCode,
  PatchAction,
  // Encoder, // we don't require base64url
  DocumentModel,
  DidState,
  SidetreeError,
} from '@extrimian-sidetree/common';

import Did from './Did';
import JsObject from './util/JsObject';

/**
 * Class that handles the composition of operations into final external-facing document.
 */
export default class DocumentComposer {
  private static resolutionObjectContextUrl =
    'https://w3id.org/did-resolution/v1';
  private static didDocumentContextUrl = 'https://www.w3.org/ns/did/v1';
  private static jwsContextUrl = 'https://w3id.org/security/suites/jws-2020/v1';

  private static didDocumentContext = [
    DocumentComposer.didDocumentContextUrl,
    DocumentComposer.jwsContextUrl,
    // This last one disables JSON-LD Processing errors related to undefined terms
    // By assuming they are registered.
    { '@vocab': 'https://www.w3.org/ns/did#' },
  ];

  /**
   * Transforms the given DID state into a DID Document.
   */
  public static transformToExternalDocument(
    didState: DidState,
    did: Did,
    published: boolean
  ): any {
    // If the DID is deactivated.
    // Return required metadata and a document with only context and id if so
    if (didState.nextRecoveryCommitmentHash === undefined) {
      return DocumentComposer.createDeactivatedResolutionResult(
        did.shortForm,
        published
      );
    }

    const document = didState.document as DocumentModel;

    // Put each public key in verificationMethod
    // then populate the verification relationships by reference if a key has purposes,
    const verificationRelationships: Map<string, string[]> = new Map();
    const verificationMethod: any[] = [];
    if (Array.isArray(document.publicKeys)) {
      for (const publicKey of document.publicKeys) {
        const id = '#' + publicKey.id;
        const didDocumentPublicKey = {
          id: id,
          controller: did.isShortForm ? did.shortForm : did.longForm,
          type: publicKey.type,
          publicKeyJwk: publicKey.publicKeyJwk,
        };
        const purposeSet: Set<string> = new Set(publicKey.purposes);

        // add to verificationMethod no matter what,
        // then look at purpose to decide what verification relationship to add to
        verificationMethod.push(didDocumentPublicKey);

        if (purposeSet.size > 0) {
          const reference = didDocumentPublicKey.id;

          for (const purpose of purposeSet) {
            if (!verificationRelationships.has(purpose)) {
              verificationRelationships.set(purpose, [reference]);
            } else {
              verificationRelationships.get(purpose)!.push(reference);
            }
          }
        }
      }
    }

    // Only update `service` if the array is present
    let services;
    if (Array.isArray(document.services)) {
      services = [];
      for (const service of document.services) {
        const didDocumentService = {
          id: '#' + service.id,
          type: service.type,
          serviceEndpoint: service.serviceEndpoint,
        };

        services.push(didDocumentService);
      }
    }

    const baseId = did.isShortForm ? did.shortForm : did.longForm;
    const didDocument: any = {
      '@context': DocumentComposer.didDocumentContext,
      id: baseId,
    };

    didDocument.controller = (<any>document).controller;

    if (verificationMethod.length !== 0) {
      didDocument.verificationMethod = verificationMethod;
    }

    verificationRelationships.forEach((value, key) => {
      didDocument[key] = value;
    });

    if (services && services.length) {
      didDocument.service = services;
    }

    const didResolutionResult: any = {
      '@context': DocumentComposer.resolutionObjectContextUrl,
      didDocument: didDocument,
      didDocumentMetadata: {
        method: {
          published,
          recoveryCommitment: didState.nextRecoveryCommitmentHash,
          updateCommitment: didState.nextUpdateCommitmentHash,
        },
        versionId: didState.versionId.toString()
      },
    };

    if (did.isShortForm) {
      didResolutionResult.didDocumentMetadata.canonicalId = did.shortForm;
    } else {
      didResolutionResult.didDocumentMetadata.equivalentId = [did.shortForm];

      if (published) {
        didResolutionResult.didDocumentMetadata.canonicalId = did.shortForm;
      }
    }

    return didResolutionResult;
  }

  private static createDeactivatedResolutionResult(
    did: string,
    published: boolean
  ) {
    const didDocument = {
      '@context': DocumentComposer.didDocumentContextUrl,
      id: did,
    };
    const didDocumentMetadata = {
      method: {
        published,
      },
      canonicalId: did,
    };
    return {
      '@context': DocumentComposer.resolutionObjectContextUrl,
      didDocument,
      didDocumentMetadata,
    };
  }

  /**
   * Applies the given patches in order to the given document.
   * NOTE: Assumes no schema validation is needed, since validation should've already occurred at the time of the operation being parsed.
   */
  public static applyPatches(document: any, patches: any[]) {
    // Loop through and apply all patches.
    for (const patch of patches) {
      DocumentComposer.applyPatchToDidDocument(document, patch);
    }
  }

  /**
   * Applies the given patch to the given DID Document.
   */
  private static applyPatchToDidDocument(document: DocumentModel, patch: any) {
    if (patch.action === PatchAction.Replace) {
      // In-place replacement of the document.
      JsObject.clearObject(document);
      Object.assign(document, patch.document);
    } else if (patch.action === PatchAction.AddPublicKeys) {
      DocumentComposer.addPublicKeys(document, patch);
    } else if (patch.action === PatchAction.RemovePublicKeys) {
      DocumentComposer.removePublicKeys(document, patch);
    } else if (patch.action === PatchAction.AddServices) {
      DocumentComposer.addServices(document, patch);
    } else if (patch.action === PatchAction.RemoveServices) {
      DocumentComposer.removeServices(document, patch);
    } else {
      throw new SidetreeError(
        ErrorCode.DocumentComposerApplyPatchUnknownAction,
        `Cannot apply invalid action: ${patch.action}`
      );
    }
  }

  /**
   * Adds public keys to document.
   */
  private static addPublicKeys(document: DocumentModel, patch: any) {
    const publicKeyMap = new Map(
      (document.publicKeys || []).map((publicKey) => [publicKey.id, publicKey])
    );

    // Loop through all given public keys and add them.
    // NOTE: If a key ID already exists, we will just replace the existing key.
    // Not throwing error will minimize the need (thus risk) of reusing exposed update reveal value.
    for (const publicKey of patch.publicKeys) {
      publicKeyMap.set(publicKey.id, publicKey);
    }

    document.publicKeys = Array.from(publicKeyMap.values());
  }

  /**
   * Removes public keys from document.
   */
  private static removePublicKeys(document: DocumentModel, patch: any) {
    if (document.publicKeys === undefined) {
      return;
    }

    const idsOfKeysToRemove = new Set(patch.ids);

    // Keep only keys that are not in the removal list.
    document.publicKeys = document.publicKeys.filter(
      (publicKey) => !idsOfKeysToRemove.has(publicKey.id)
    );
  }

  private static addServices(document: DocumentModel, patch: any) {
    const services = patch.services;

    if (document.services === undefined) {
      // create a new array if `services` does not exist
      document.services = [];
    }

    const idToIndexMapper = new Map();
    // map all id and their index
    for (const index in document.services) {
      idToIndexMapper.set(document.services[index].id, index);
    }

    for (const service of services) {
      if (idToIndexMapper.has(service.id)) {
        const idx = idToIndexMapper.get(service.id);
        document.services[idx] = service;
      } else {
        document.services.push(service);
      }
    }
  }

  private static removeServices(document: DocumentModel, patch: any) {
    if (document.services === undefined) {
      return;
    }

    const idsToRemove = new Set(patch.ids);
    document.services = document.services.filter(
      (service) => !idsToRemove.has(service.id)
    );
  }
}
