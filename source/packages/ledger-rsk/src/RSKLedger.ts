import {
  EthereumLedgerUtils as ethereumLedgerUtils,
  EthereumLedger,
  ElementEventData,
  EthereumFilter
} from '@quarkid-sidetree/ethereum';

import {
  BlockchainTimeModel,
  TransactionModel
} from '@quarkid-sidetree/common';
import Web3 from 'web3';


// Web3 has bad types so we have to import the lib through require()
// See https://github.com/ethereum/web3.js/issues/3734

export default class RSKLedger extends EthereumLedger {
  protected lastSyncedBlockchainTime: number = 0;
  protected startingTime = 0;
  constructor(
    web3: Web3,
    protected EventPullchunkSize: number,
    public contractAddress?: string,
    startingBlockchainTime?: number,
    logger?: Console
    //public blockchainSecurity: number = 10
  ) {
    super(web3, contractAddress, logger);
    if (startingBlockchainTime)
      this.startingTime = startingBlockchainTime;
    // this.anchorContract.options.gasPrice = '1200000000';
  }

  public async initialize(): Promise<void> {
    await super.initialize()

    if (!this.contractAddress) {
      this.startingTime = (await this.getLatestTime()).time;
    }
    await this.getLatestTime();
  }

  private isNumber(n: any) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: EthereumFilter; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {

    const contract = await this.getAnchorContract();
    let from: number;
    if (this.isNumber(fromBlock)) {
      from = fromBlock as number
    } else {
      from = (await ethereumLedgerUtils.getBlock(this.web3, fromBlock)).number
    }
    let to;
    if (this.isNumber(to)) {
      to = toBlock as number
    } else {
      to = (await ethereumLedgerUtils.getBlock(this.web3, toBlock)).number
    }
    this.logger.log(`fetching chunked events`);
    const { events, lastSynced } = await ethereumLedgerUtils.getPastEventsChunked(contract, 'Anchor', (from > this.lastSyncedBlockchainTime) ? from : this.lastSyncedBlockchainTime, to, this.EventPullchunkSize, (options && options.filter) || undefined);

    this.logger.log(`finished fetching events`);
    if (lastSynced > this.lastSyncedBlockchainTime) {
      this.lastSyncedBlockchainTime = lastSynced
    }

    const txns = events.map((log) =>
      ethereumLedgerUtils.eventLogToSidetreeTransaction(log as ElementEventData)
    );
    if (options && options.omitTimestamp) {
      return txns;
    }
    return ethereumLedgerUtils.extendSidetreeTransactionWithTimestamp(this.web3, txns);
  };

  public _getTransactionsSince = async (
    fromBlock: number | string,
    toBlock: number | string,
    since: number,
    options?: { filter?: EthereumFilter; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    let transactions: TransactionModel[] = await this._getTransactions(fromBlock, toBlock, options);
    return transactions.filter(x => x.transactionNumber > since);
  }


  public async read(
    sinceTransactionNumber?: number,//path 1
    transactionTimeHash?: string //path 2
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
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
      transactions = await this._getTransactionsSince(this.startingTime, 'latest', sinceTransactionNumber, options)
    } else if (transactionTimeHash) {
      const block = await ethereumLedgerUtils.getBlock(this.web3, transactionTimeHash);
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
      let fromBlock: number = (this.startingTime);
      transactions = await this._getTransactions(fromBlock, 'latest', options);
    }
    return {
      moreTransactions: false,
      transactions,
    };
  }

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }

}