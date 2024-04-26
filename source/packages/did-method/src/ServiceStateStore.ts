
import { IServiceStateStore } from '@quarkid-sidetree/common';

/**
 * Implementation of IServiceStateStore using MongoDB database.
 */
export default class ServiceStateStore<T>
  implements IServiceStateStore<T> {
  /** Collection name for storing service state. */


  async put(_serviceState: T) {
  }

  public async get(): Promise<T> {
    return {} as T
  }
}
