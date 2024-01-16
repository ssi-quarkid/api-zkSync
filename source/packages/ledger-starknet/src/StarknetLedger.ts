
import {
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
  ValueTimeLockModel,
  ServiceVersionModel,
  Encoder,
  Logger,
} from '@extrimian-sidetree/common';

import {
  Account,
  Contract,
  number,
  GetBlockResponse,
  ProviderInterface,
  uint256
} from "starknet";

import utils from './utils';
import sidetreeCompiled from './abi/sidetree_compiled.json'
import { StarkNetEventRequestParams, StarkNetEventResponse, StarkNetEvent, StarkNetEventResolver } from './StarknetEvents';
import { AnchoredDataSerializer } from '@extrimian-sidetree/core';


export class StarkNetLedger implements IBlockchain {

  private logger: Console;

  private cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };
  private from = '';
  private networkId = 0;
  private anchorContract: Contract;
  private eventResolver: StarkNetEventResolver;
  private maxGasFee = 10 * 1000 * 1000 * 1000 * 1000;

  constructor(
    public account: Account,
    public provider: ProviderInterface,
    public starkNetNodeUrl: string,
    public contractAddress: string,
    logger?: Console
  ) {
    this.logger = logger || console;
    this.contractAddress = contractAddress;
    this.anchorContract = new Contract(
      sidetreeCompiled.abi as any,
      contractAddress,
      account
    )
    this.account = account;
    this.provider = provider;
    this.eventResolver = new StarkNetEventResolver(starkNetNodeUrl);
  }


  private async getAnchorContract(): Promise<Contract> {
    if (!this.contractAddress) {
      await this.initialize();
    }
    return this.anchorContract;
  }

  public async initialize(): Promise<void> {

    this.logger.info(
      `Using Starknet contract at address ${this.contractAddress}`
    );

    await this.getLatestTime();
  }

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }


  private async getPastEvents(params: StarkNetEventRequestParams, sinceTransaction?: number): Promise<StarkNetEvent[]> {
    params.page_number = 0;
    params.page_size = 1024;
    let events: StarkNetEvent[] = [];
    let is_last_page;
    let sinceTransactionFound = true;

    if (sinceTransaction !== undefined) {
      sinceTransactionFound = false;
    }

    while (!is_last_page) {

      const res = await this.eventResolver.getEvents(params);
      if (res.result) {

        if (sinceTransactionFound) {
          events.push(...res.result.events);
        }
        else {

          for (let idx = 0; idx < res.result.events.length; idx++) {
            let event = res.result.events[idx];
            if (!sinceTransactionFound) {
              let transactionNum = parseInt(number.hexToDecimalString(event.data[2]));
              if (transactionNum > (sinceTransaction as number)) {
                sinceTransactionFound = true;
                events.push(event);
              }
            } else {
              events.push(event);
            }
          }

        }

        is_last_page = res.result.is_last_page;
        params.page_number++;
      } else {
        if (res.error)
          this.logger.log(`Error getting the events ${res.error.message}`);
        else
          this.logger.log(`Error getting the events unknown`);

        return [];
      }
    }

    this.logger.log(`found ${events.length} events related to the contract`);
    return events;
  }


  public _getTransactions = async (
    fromBlock: number, toBlock?: number, sinceTransaction?: number, options?: any
  ): Promise<TransactionModel[]> => {
    const contract = await this.getAnchorContract();

    const logs: StarkNetEvent[] = await this.getPastEvents({
      address: contract.address,
      fromBlock: fromBlock,
      toBlock: toBlock,
    }, sinceTransaction)


    const txns = logs.map((log: StarkNetEvent) =>
      utils.eventLogToSidetreeTransaction(log)
    );

    if (options && options.omitTimestamp) {
      return txns;
    }
    return utils.extendSidetreeTransactionWithTimestamp(this.provider, txns);
  };

  public extendSidetreeTransactionWithTimestamp = async (
    transactions: TransactionModel[]
  ): Promise<TransactionModel[]> => {
    return utils.extendSidetreeTransactionWithTimestamp(
      this.provider,
      transactions
    );
  };


  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block: GetBlockResponse = await this.provider.getBlock('latest');
    const blockchainTime: BlockchainTimeModel = {
      time: block.block_number,
      hash: block.block_hash,
    };
    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  public write = async (anchorString: string, _fee = 0): Promise<void> => {

    const contract: Contract = await this.getAnchorContract();

    const anchorObject = AnchoredDataSerializer.deserialize(anchorString);
    const { coreIndexFileUri, numberOfOperations } = anchorObject;
    const buffer = Encoder.base58ToBuffer(coreIndexFileUri);

    try {

      let anchorHash = buffer.toString('hex').substring(4);
      const anchorHashUint256 = utils.hexToUint256(anchorHash);
      const anchor_low = anchorHashUint256.low;
      const anchor_high = anchorHashUint256.high;

      const call = {
        contractAddress: (await this.getAnchorContract()).address,
        entrypoint: "anchor_hash",
        calldata: [number.toFelt(anchor_low), number.toFelt(anchor_high), number.toFelt(numberOfOperations)],
      }

      //estimate sidetree transaction fee
      const feeEstimate = await this.account.estimateFee(call)

      let maxFee = this.maxGasFee.toString();

      let fee = feeEstimate;

      maxFee = utils.getMaxFee(fee.suggestedMaxFee);


      //execute de sidetree transaction with the given fee
      const txn = await this.account.execute(call, [sidetreeCompiled.abi as any], { "maxFee": maxFee });

      this.logger.info(
        `Starknet transaction successful: ${txn.transaction_hash}`
      );

    } catch (err) {
      const errr = err;
      console.log(errr);
      const error = err as Error;
      this.logger.error(error.message);
    }
  };


  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {

    let transactions: TransactionModel[];
    const options = {
      omitTimestamp: true,
    };
    if (sinceTransactionNumber !== undefined) {
      transactions = await this._getTransactions(0, undefined, sinceTransactionNumber, options);
    }
    else if (transactionTimeHash) {
      const block = await utils.getBlock(this.provider, transactionTimeHash);
      if (block && block.block_number) {

        transactions = await this._getTransactions(
          block.block_number,
          block.block_number,
          undefined,
          options
        );

      } else {

        transactions = [];
      }

    } else {
      transactions = await this._getTransactions(0, undefined, undefined, options);
    }

    return {
      moreTransactions: false,
      transactions
    };

  }


  public async getFirstValidTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return Promise.resolve(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  getValueTimeLock(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'starknet',
      version: 1 as any,
    });
  }
}