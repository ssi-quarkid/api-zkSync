
import { TransactionModel, ITransactionStore } from '@extrimian-sidetree/common';
/**
 * Implementation of ITransactionStore that stores the transaction data in a MongoDB database.
 */
export default class TransactionStore implements ITransactionStore {

  /**
   * Initialize the MongoDB transaction store.
   */
  public async initialize(

  ): Promise<void> {
  
  }

  public async stop(): Promise<void> {
  }

  /**
   * Returns the number of transactions in the store.
   * Mainly used by tests.
   */
  public async getTransactionsCount(): Promise<number> {
    return 0
  }

  public async getTransaction(
    _transactionNumber: number
  ): Promise<TransactionModel | undefined> {
    return
  }

  public async getTransactionsLaterThan(
    _transactionNumber: number | undefined,
    _max: number | undefined
  ): Promise<TransactionModel[]> {
    return []
  }

  /**
   * Clears the transaction store.
   */
  public async clearCollection() {

  }

  async addTransaction(_transaction: TransactionModel): Promise<void> {
  }

  async getLastTransaction(): Promise<TransactionModel | undefined> {
    return;
  }

  async getExponentiallySpacedTransactions(): Promise<TransactionModel[]> {
    return []
  }

  async removeTransactionsLaterThan(_transactionNumber?: number): Promise<void> {

  }

  /**
   * Remove transactions by transaction time hash
   * @param transactionTimeHash the transaction time hash which the transactions should be removed for
   */
  public async removeTransactionByTransactionTimeHash(
    _transactionTimeHash: string
  ) {
  }

  /**
   * Gets the list of processed transactions.
   * Mainly used for test purposes.
   */
  public async getTransactions(): Promise<TransactionModel[]> {
    return [];
  }

  /**
   * Gets a list of transactions between the bounds of transaction time. The smaller value will be inclusive while the bigger be exclusive
   * @param inclusiveBeginTransactionTime The first transaction time to begin querying for
   * @param exclusiveEndTransactionTime The transaction time to stop querying for
   */
  public async getTransactionsStartingFrom(
    _inclusiveBeginTransactionTime: number,
    _exclusiveEndTransactionTime: number
  ): Promise<TransactionModel[]> {
    return []
  }


}
