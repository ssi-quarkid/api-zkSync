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


class EthereumLedgerUtils {
  public getAccounts = getAccounts;
  public eventLogToSidetreeTransaction = eventLogToSidetreeTransaction;
  public extendSidetreeTransactionWithTimestamp = extendSidetreeTransactionWithTimestamp;
  public getBlock = getBlock;
  public getBlockchainTime = getBlockchainTime;
  public getPastEventsChunked = getPastEventsChunked;
}
import { TransactionModel, Encoder, Logger, LogColor } from '@quarkid-sidetree/common';
import { AnchoredDataSerializer } from '@quarkid-sidetree/core';
import Web3 from 'web3';
import { EthereumBlock, ElementEventData } from './types';
import { Contract, EventData } from 'web3-eth-contract';
const getAccounts = (web3: Web3): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((err: Error, accounts: string[]) => {
      if (err) {
        reject(err);
      }
      resolve(accounts);
    });
  });

const eventLogToSidetreeTransaction = (
  log: ElementEventData
): TransactionModel => {
  const coreIndexFileUri = Encoder.bufferToBase58(
    Buffer.from(
      '1220' + log.returnValues.anchorFileHash.replace('0x', ''),
      'hex'
    )
  );
  const anchorObject = {
    coreIndexFileUri,
    numberOfOperations: Number.parseInt(log.returnValues.numberOfOperations),
  };
  const anchorString = AnchoredDataSerializer.serialize(anchorObject);
  Logger.info(LogColor.yellow('Evento log to transaction: ' + log.returnValues.transactionNumber + ' from writer: ' + log.returnValues.writer));
  return {
    transactionNumber: Number.parseInt(log.returnValues.transactionNumber, 10),
    transactionTime: log.blockNumber,
    transactionTimeHash: log.blockHash,
    anchorString,
    transactionFeePaid: 0,
    normalizedTransactionFee: 0,
    writer: log.returnValues.writer,
  };
};

async function getBlock(
  web3: Web3,
  blockHashOrBlockNumber: string | number
): Promise<EthereumBlock> {
  const block: EthereumBlock = await new Promise((resolve, reject) => {
    web3.eth.getBlock(
      blockHashOrBlockNumber,
      (err: Error, b: EthereumBlock) => {
        if (err) {
          reject(err);
        }
        resolve(b);
      }
    );
  });
  return block;
};

const getBlockchainTime = async (
  web3: Web3,
  blockHashOrBlockNumber: string | number
): Promise<string | number | null> => {
  const block: EthereumBlock = await getBlock(web3, blockHashOrBlockNumber);
  if (block) {
    return block.timestamp;
  }
  return null;
};

const extendSidetreeTransactionWithTimestamp = async (
  web3: Web3,
  txns: TransactionModel[]
): Promise<TransactionModel[]> => {
  return Promise.all(
    txns.map(async (txn) => {
      const timestamp = await getBlockchainTime(web3, txn.transactionTime);
      if (typeof timestamp === 'number') {
        return {
          ...txn,
          transactionTimestamp: timestamp,
        };
      }
      return txn;
    })
  );
};

// Fetch all occurrences of events named @param event since @param fromBlock and applying @param filter, dividing the search in chunks of @param chunkSize
async function getPastEventsChunked(
  contract: Contract,
  event: string,
  fromBlock: number,
  toBlock: number,
  chunkSize: number,
  filter?: any,
): Promise<{ events: EventData[], lastSynced: number }> {

  if (chunkSize == 0)
    return { events: [], lastSynced: 0 }
  //si solo tengo que levantar un bloque
  if (fromBlock == toBlock) {
    return {
      events: await contract.getPastEvents(event,
        {
          fromBlock: fromBlock,
          toBlock: toBlock,
          filter: filter
        }),
      lastSynced: 0
    };
  }


  let lookingBlockFrom = fromBlock;
  let lookingBlockTo;
  let last = false;
  if (lookingBlockFrom + chunkSize < toBlock) {
    lookingBlockTo = fromBlock + chunkSize
  } else {
    lookingBlockTo = toBlock
    last = true;
  }
  let events: EventData[] = []

  try {
    while (lookingBlockFrom <= toBlock) {

      Logger.info(LogColor.yellow('Fetching events from block number: ' + lookingBlockFrom + ' to number: ' + lookingBlockTo));

      let fetchedEvents: EventData[] = await contract.getPastEvents(event,
        {
          fromBlock: lookingBlockFrom,
          toBlock: (lookingBlockTo == toBlock) ? toBlock : lookingBlockTo,
          filter: filter
        })

      events = events.concat(fetchedEvents);

      if (last)
        return {
          events: events,
          lastSynced: toBlock
        }

      //get next iteration window
      lookingBlockFrom = lookingBlockTo;
      if (lookingBlockFrom + chunkSize < toBlock) {
        lookingBlockTo = lookingBlockFrom + chunkSize
      } else {
        last = true;
        lookingBlockTo = toBlock;
      }
    }
  } catch (e) {
    console.log(e)
    Logger.error(LogColor.red(`Failed fetching blocks, from ${lookingBlockFrom} to ${lookingBlockTo}`))
    return {
      events: events,
      lastSynced: lookingBlockFrom
    }
  }
  return {
    events: events,
    lastSynced: lookingBlockTo
  }
}


export default {
  eventLogToSidetreeTransaction,
  extendSidetreeTransactionWithTimestamp,
  getAccounts,
  getBlock,
  getBlockchainTime,
  getPastEventsChunked,
  EthereumLedgerUtils
};
