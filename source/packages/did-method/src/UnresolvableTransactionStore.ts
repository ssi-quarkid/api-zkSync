
import {
  TransactionModel,
  UnresolvableTransactionModel,
  IUnresolvableTransactionStore,
} from '@extrimian-sidetree/common';

/**
 * Implementation of `IUnresolvableTransactionStore` that stores the transaction data in a MongoDB database.
 */
export default class UnresolvableTransactionStore
  implements IUnresolvableTransactionStore {


  /**
   * Initialize the MongoDB unresolvable transaction store.
   */
  public async initialize(): Promise<void> {
  
  }

  public async stop(): Promise<void> {
  }

  /**
   * * Clears the unresolvable transaction store.
   */
  public async clearCollection() {

  }

  public async recordUnresolvableTransactionFetchAttempt(
    _transaction: TransactionModel
  ): Promise<void> {
    return;
  }

  public async removeUnresolvableTransaction(
    _transaction: TransactionModel
  ): Promise<void> {
   
  }

  public async getUnresolvableTransactionsDueForRetry(
    _maximumReturnCount?: number
  ): Promise<TransactionModel[]> {
   return []
  }

  public async removeUnresolvableTransactionsLaterThan(
    _transactionNumber?: number
  ): Promise<void> {

  }

  /**
   * Gets the list of unresolvable transactions.
   * Mainly used for test purposes.
   */
  public async getUnresolvableTransactions(): Promise<
    UnresolvableTransactionModel[]
  > {
    return [];
  }


}
