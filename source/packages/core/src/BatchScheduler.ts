import {
  ErrorCode,
  IBlockchain,
  IVersionManager,
  LogColor,
  Logger,
  SidetreeError,
} from '@extrimian-sidetree/common';

import timeSpan from 'time-span';
import EventCode from './EventCode';
import EventEmitter from './EventEmitter';

/**
 * Class that performs periodic writing of batches of Sidetree operations to CAS and blockchain.
 */
export default class BatchScheduler {
  /**
   * Denotes if the periodic batch writing should continue to occur.
   * Used mainly for test purposes.
   */
  private continuePeriodicBatchWriting = false;

  public constructor(
    private versionManager: IVersionManager,
    private blockchain: IBlockchain,
    private batchingIntervalInSeconds: number
  ) { }

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  public startPeriodicBatchWriting() {
    this.continuePeriodicBatchWriting = true;
    setImmediate(async () => this.writeOperationBatch());
  }

  /**
   * Stops periodic batch writing.
   * Mainly used for test purposes.
   */
  public stopPeriodicBatchWriting() {
    Logger.info(`Stopped periodic batch writing.`);
    this.continuePeriodicBatchWriting = false;
  }

  /**
   * Processes the operations in the queue.
   */
  public async writeOperationBatch() {
    const endTimer = timeSpan(); // For calculating time taken to write operations.

    try {
      Logger.info('Start operation batch writing...');

      // Get the correct version of the `BatchWriter`.
      const currentTime = (await this.blockchain.getLatestTime()).time;
      const batchWriter = this.versionManager.getBatchWriter(currentTime);

      const batchSize = await batchWriter.write();

      EventEmitter.emit(EventCode.SidetreeBatchWriterLoopSuccess, {
        batchSize,
      });
    } catch (error) {
      // Default the error to unexpected error.
      const loopFailureEventData = {
        code: ErrorCode.BatchSchedulerWriteUnexpectedError,
      };

      // Only overwrite the error code if this is a concrete known error.
      if (
        error instanceof SidetreeError &&
        error.code !== ErrorCode.BlockchainWriteUnexpectedError
      ) {
        loopFailureEventData.code = error.code;
      } else {
        Logger.error(
          'Unexpected and unhandled error during batch writing, investigate and fix:'
        );
        Logger.error(error);
      }

      EventEmitter.emit(
        EventCode.SidetreeBatchWriterLoopFailure,
        loopFailureEventData
      );
    } finally {
      let used = process.memoryUsage();
      console.log("before the collection")
      console.log(`Memory usage (in bytes):`);
      console.log(`  - Heap total: ${used.heapTotal / (1024 * 1024)} MB`);
      console.log(`  - Heap used: ${used.heapUsed / (1024 * 1024)} MB`);
      console.log(`  - RSS (Resident Set Size): ${used.rss}`);
      if (global.gc) {
        Logger.info(LogColor.green(`Running garbage collection, write`));
        global.gc();
        let used = process.memoryUsage();
        console.log("after the collection")
        console.log(`Memory usage (in bytes):`);
        console.log(`  - Heap total: ${used.heapTotal / (1024 * 1024)} MB`);
        console.log(`  - Heap used: ${used.heapUsed / (1024 * 1024)} MB`);
        console.log(`  - RSS (Resident Set Size): ${used.rss}`);
      }
      Logger.info(`End batch writing. Duration: ${endTimer.rounded()} ms.`);

      if (this.continuePeriodicBatchWriting) {
        Logger.info(
          `Waiting for ${this.batchingIntervalInSeconds} seconds before writing another batch.`
        );
        setTimeout(
          async () => this.writeOperationBatch(),
          this.batchingIntervalInSeconds * 1000
        );
      }
    }
  }
}
