/*
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

// Web3 has bad types so we have to import the lib through require()
// See https://github.com/ethereum/web3.js/issues/3734

const { version } = require('../package.json');

import * as ethers from 'ethers';
import * as zksync from 'zksync-web3';
import { BlockchainTimeModel, Encoder, IBlockchain, ServiceVersionModel, TransactionModel, ValueTimeLockModel } from '@extrimian-sidetree/common';
import utils from './utils';
import { EthereumBlock } from './types';
import { AnchoredDataSerializer } from '@extrimian-sidetree/core';
import { RPCEventFetcher } from './Events';

const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class ZKSyncLedger implements IBlockchain {
  public ethersContract: ethers.Contract;
  protected lastSyncedBlockchainTime: number = 0;
  cachedBlockchainTime: BlockchainTimeModel | undefined;
  private logger: Console;
  private networkId: number = 0;
  private eventFetcher: RPCEventFetcher;
  constructor(
    public wallet: zksync.Wallet,
    private eventPullchunkSize: number,
    public contractAddress: string,
    private startingBlockchainTime: number,
    private rpcUrl: string,
    logger?: Console,
  ) {
    this.logger = logger ?? console;
    this.ethersContract = new ethers.Contract(contractAddress, anchorContractArtifact.abi, wallet);
    this.eventFetcher = new RPCEventFetcher(this.rpcUrl, contractAddress, this.ethersContract)

  }

  public async initialize() {
    this.networkId = await this.wallet.getChainId()
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block: EthereumBlock = await utils.getBlock('latest', this.rpcUrl);
    const blockchainTime: BlockchainTimeModel = {
      time: block.number,
      hash: block.hash,
    };
    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }
  protected getWriteData(anchorString: string): { numberOfOperations: number, buffer: Buffer } {


    const anchorObject = AnchoredDataSerializer.deserialize(anchorString);
    const { coreIndexFileUri, numberOfOperations } = anchorObject;
    const buffer = Encoder.base58ToBuffer(coreIndexFileUri);
    return { numberOfOperations, buffer };

  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public write = async (anchorString: string, _fee = 0): Promise<void> => {

    const contract = await this.ethersContract;
    const { numberOfOperations, buffer } = this.getWriteData(anchorString);

    try {
      debugger;
      const gas = await contract.estimateGas.anchorHash(
        '0x' + buffer.toString('hex').substring(4),
        numberOfOperations
      );

      const currentGasPrice = await this.wallet.provider.getGasPrice();

      const gasPrice = Math.round(parseInt(currentGasPrice.toString()) * 1).toString();

      const txn = await contract.functions.anchorHash('0x' + buffer.toString('hex').substring(4),
        numberOfOperations, { gasPrice: gasPrice, gasLimit: gas });
      debugger;

      switch (this.networkId) {
        // zk mainnet
        case 324:
          this.logger.info(
            `ZK sync era mainnet transaction successful: ${txn.transactionHash}`
          );
          break;
        // zk testnet
        case 280:
          this.logger.info(
            `ZK sync era goerli transaction successful: ${txn.transactionHash}`
          );
          break;
        default:
          this.logger.info(
            `Transaction successful:`, txn
          );
      }
    } catch (err) {
      const errr = err;
      console.log(errr);
      debugger;
      const error = err as Error;
      this.logger.error(error.message);
      throw err;
    }
  };


  getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'eth',
      version,
    });
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





  public extendSidetreeTransactionWithTimestamp = async (
    transactions: TransactionModel[]
  ): Promise<TransactionModel[]> => {
    return utils.extendSidetreeTransactionWithTimestamp(
      transactions,
      this.rpcUrl
    );
  };
  //-> read clasic
  //-> read con otro _getTransactions


  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: any; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {

    let from: number;
    if (this.isNumber(fromBlock)) {
      from = fromBlock as number
    } else {
      from = (await utils.getBlock(fromBlock, this.rpcUrl)).number
    }
    let to;
    if (this.isNumber(to)) {
      to = toBlock as number
    } else {
      to = (await utils.getBlock(toBlock, this.rpcUrl)).number
    }
    this.logger.log(`fetching chunked events`);
    let blockFrom = (from > this.lastSyncedBlockchainTime) ? from : this.lastSyncedBlockchainTime;
    const { events, lastSynced } = await utils.getPastEventsChunked(this.eventFetcher, blockFrom, to, this.eventPullchunkSize);

    this.logger.log(`finished fetching events`);
    if (lastSynced > this.lastSyncedBlockchainTime) {
      this.lastSyncedBlockchainTime = lastSynced
    }

    const txns = events.map((log) =>
      utils.eventLogToSidetreeTransaction(log)
    );
    if (options && options.omitTimestamp) {
      return txns;
    }

    return utils.extendSidetreeTransactionWithTimestamp(txns, this.rpcUrl);
  };

  public _getTransactionsSince = async (
    fromBlock: number | string,
    toBlock: number | string,
    since: number,
    options?: { filter?: any; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    let transactions: TransactionModel[] = await this._getTransactions(fromBlock, toBlock, options);
    return transactions.filter(x => x.transactionNumber > since);
  }


  public async read(
    sinceTransactionNumber?: number,//path 1
    transactionTimeHash?: string //path 2
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    let used = process.memoryUsage();
    console.log("before the read")
    console.log(`Memory usage (in bytes):`);
    console.log(`  - Heap total: ${used.heapTotal / (1024 * 1024)} MB`);
    console.log(`  - Heap used: ${used.heapUsed / (1024 * 1024)} MB`);
    console.log(`  - RSS (Resident Set Size): ${used.rss}`);
    const options = {
      omitTimestamp: true,
    };
    let transactions: TransactionModel[];
    // if(sinceTransactionNumber) does not work because 0 evaluates to false
    // but 0 is a valid value of sinceTransactionNumber...

    // 1-> chunkeado
    // 2-> llevar registro (en memoria) de el ultimo bloque leido
    /*
    path 3: dame todo desde epoch
    path 2: dame un solo bloque, basado en el tiempo de la transacción 
    path 1: levantame la ultima transaccion registrada, (no guarda el ultimo estado leido) y desde ahi en adelante,
    dame todo 

    */

    if (sinceTransactionNumber !== undefined) {
      // Busca en la blockchain desde el bloque del startingTime del contrato y el último bloque.
      // Filtra buscando la transacción con transactionNumber = sinceTransactionNumber para usarla como punto de partida
      transactions = await this._getTransactionsSince(this.startingBlockchainTime, 'latest', sinceTransactionNumber, options)
    } else if (transactionTimeHash) {
      const block = await utils.getBlock(transactionTimeHash, this.rpcUrl);
      if (block && block.number) {
        transactions = await this._getTransactions(
          block.number,
          block.number,
          options
        );
      } else {
        transactions = [];
      }
    } else {
      let fromBlock: number = (this.startingBlockchainTime);
      transactions = await this._getTransactions(fromBlock, 'latest', options);
    }

    return {
      moreTransactions: false,
      transactions,
    };
  }

  private isNumber(n: any) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }
}
