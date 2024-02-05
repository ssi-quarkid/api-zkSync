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

import utils from './utils';

import { AnchoredDataSerializer } from '@extrimian-sidetree/core';


import {
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
  ValueTimeLockModel,
  ServiceVersionModel,
  Encoder,
} from '@extrimian-sidetree/common';

import {
  ElementContract,
  ElementEventData,
  EthereumBlock,
  EthereumFilter,
} from './types';
import Web3 from 'web3';

const { version } = require('../package.json');
// Web3 has bad types so we have to import the lib through require()
// See https://github.com/ethereum/web3.js/issues/3734
const Contract = require('web3-eth-contract');
const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class EthereumLedger implements IBlockchain {
  protected logger: Console;
  public anchorContract: ElementContract;
  protected cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };
  protected from = '';
  protected networkId = 0;

  constructor(
    public web3: Web3,
    public contractAddress?: string,
    logger?: Console,
    //public blockchainSecurity: number = 10
  ) {
    this.logger = logger ?? console;
    if (this.contractAddress) {
      this.anchorContract = new Contract(
        anchorContractArtifact.abi,
        this.contractAddress
      );
    } else {
      this.anchorContract = new Contract(anchorContractArtifact.abi);
    }
    this.anchorContract.setProvider(this.web3.currentProvider);

  }

  getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'eth',
      version,
    });
  }

  protected async getAnchorContract(): Promise<ElementContract> {
    if (!this.contractAddress) {
      await this.initialize();
    }
    return this.anchorContract;
  }

  public async initialize(): Promise<void> {
    // Set primary address
    const [from] = await utils.getAccounts(this.web3);
    this.from = from;
    this.networkId = await this.web3.eth.net.getId();
    // Set contract
    if (!this.contractAddress) {
      const deployContract = await this.anchorContract.deploy({
        data: anchorContractArtifact.bytecode,
      });
      const gas = await deployContract.estimateGas();
      const currentGasPrice = await this.web3.eth.getGasPrice();
      const gasPrice = currentGasPrice.toString();

      this.anchorContract.options.gasPrice = gasPrice;

      debugger;
      const instance = (await deployContract.send({
        from,
        gas,
        gasPrice,
      })) as ElementContract;
      debugger;

      this.contractAddress = instance!.options.address;
      this.logger.info(
        `Creating new Element contract at address ${this.contractAddress}`
      );
    } else {
      this.logger.info(
        `Using Element contract at address ${this.contractAddress}`
      );
    }
    this.anchorContract.options.address = this.contractAddress;
    // Refresh cached block time
    await this.getLatestTime();
  }

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: EthereumFilter; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    const contract = await this.getAnchorContract();
    const logs = await contract.getPastEvents('Anchor', {
      fromBlock,
      toBlock: toBlock || 'latest',
      filter: (options && options.filter) || undefined,
    });
    const txns = logs.map((log) =>
      utils.eventLogToSidetreeTransaction(log as ElementEventData)
    );
    if (options && options.omitTimestamp) {
      return txns;
    }
    return utils.extendSidetreeTransactionWithTimestamp(this.web3, txns);
  };


  public extendSidetreeTransactionWithTimestamp = async (
    transactions: TransactionModel[]
  ): Promise<TransactionModel[]> => {
    return utils.extendSidetreeTransactionWithTimestamp(
      this.web3,
      transactions
    );
  };
  //-> read clasic
  //-> read con otro _getTransactions

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    const options = {
      omitTimestamp: true,
    };
    let transactions: TransactionModel[];
    // if(sinceTransactionNumber) does not work because 0 evaluates to false
    // but 0 is a valid value of sinceTransactionNumber...
    if (sinceTransactionNumber !== undefined) {
      const sinceTransaction = await this._getTransactions(0, 'latest', {
        ...options,
        filter: { transactionNumber: [sinceTransactionNumber] },
      });
      if (sinceTransaction.length === 1) {
        transactions = await this._getTransactions(
          sinceTransaction[0].transactionTime,
          'latest',
          options
        );
      } else {
        transactions = [];
      }
    } else if (transactionTimeHash) {
      const block = await utils.getBlock(this.web3, transactionTimeHash);
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
      transactions = await this._getTransactions(0, 'latest', options);
    }
    return {
      moreTransactions: false,
      transactions,
    };
  }

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block: EthereumBlock = await utils.getBlock(this.web3, 'latest');
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

    const contract = await this.getAnchorContract();
    const { numberOfOperations, buffer } = this.getWriteData(anchorString);

    try {
      debugger;
      const methodCall = contract.methods.anchorHash(
        '0x' + buffer.toString('hex').substring(4),
        numberOfOperations
      );

      const currentGasPrice = await this.web3.eth.getGasPrice();
      const gas = await methodCall.estimateGas();
      const gasPrice = Math.round(parseInt(currentGasPrice) * 1).toString();

      const txn = await methodCall.send({
        from: this.from,
        gas,
        gasPrice
      });
      debugger;

      switch (this.networkId) {
        // Ropsten
        case 3:
          this.logger.info(
            `Ethereum transaction successful: https://ropsten.etherscan.io/tx/${txn.transactionHash}`
          );
          break;
        // Ganache
        case 13370:
          this.logger.info(
            `Ganache transaction successful: ${txn.transactionHash}`
          );
          break;
        //rsk
        case 30:
          this.logger.info(
            `RSK transaction successful: https://explorer.rsk.co/tx/${txn.transactionHash}`
          )
          break;
        //rsk tesnet
        case 31:
          this.logger.info(
            `RSK testnet transaction successful: https://explorer.tesnet.rsk.co/tx/${txn.transactionHash}`
          )
          break;
        default:
          this.logger.info(
            `Ethereum transaction successful: ${txn.transactionHash}`
          );
      }
    } catch (err) {
      const errr = err;
      console.log(errr);
      debugger;
      const error = err as Error;
      this.logger.error(error.message);
    }
  };

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
  protected getArtifact(): any {
    return anchorContractArtifact;
  }
}
