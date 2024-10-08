
import {
  IOperationStore,
  AnchoredOperationModel,
} from '@quarkid-sidetree/common';


/**
 * Implementation of OperationStore that stores the operation data in
 * a ferretdb database.
 */
export default class
  implements IOperationStore {

  public async insertOrReplace(
    _operations: AnchoredOperationModel[]
  ): Promise<void> {

  }

  /**
   * Gets all operations of the given DID unique suffix in ascending chronological order.
   */
  public async get(_didUniqueSuffix: string): Promise<AnchoredOperationModel[]> {
    return []
  }

  public async delete(_transactionNumber?: number): Promise<void> {

  }

  public async deleteUpdatesEarlierThan(
    _didUniqueSuffix: string,
    _transactionNumber: number,
    _operationIndex: number
  ): Promise<void> {

  }


}
