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




import axios from 'axios';
import { TransactionModel, Encoder, Logger, LogColor } from '@extrimian-sidetree/common';
import { AnchoredDataSerializer } from '@extrimian-sidetree/core';
import { EthereumBlock, SidetreeEventData } from './types';
import { RPCEventFetcher } from './Events';

const eventLogToSidetreeTransaction = (
  log: SidetreeEventData
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
  blockHashOrBlockNumber: string | number,
  rpcUrl: string
): Promise<EthereumBlock> {
  return await getBlockInfo(rpcUrl,blockHashOrBlockNumber);
};



const getBlockchainTime = async (
  blockHashOrBlockNumber: string | number,
  rpcUrl: string
): Promise<string | number | null> => {
  const block: EthereumBlock = await getBlock(blockHashOrBlockNumber , rpcUrl);
  if (block) {
    return block.timestamp;
  }
  return null;
};

const extendSidetreeTransactionWithTimestamp = async (
  txns: TransactionModel[],
  rpcUrl: string
): Promise<TransactionModel[]> => {
  return Promise.all(
    txns.map(async (txn) => {
      const timestamp = await getBlockchainTime(txn.transactionTime , rpcUrl);
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
  eventFetcher: RPCEventFetcher,
  fromBlock: number,
  toBlock: number,
  chunkSize: number,
  filter?: any,
): Promise<{ events: SidetreeEventData[], lastSynced: number }> {

  if (chunkSize == 0)
    return { events: [], lastSynced: 0 }
  //si solo tengo que levantar un bloque
  if (fromBlock == toBlock) {
    return {
      events: await eventFetcher.getLogs(
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
  let events: SidetreeEventData[] = []

  try {
    while (lookingBlockFrom <= toBlock) {

      Logger.info(LogColor.yellow('Fetching events from block number: ' + lookingBlockFrom + ' to number: ' + lookingBlockTo));

      let fetchedEvents: SidetreeEventData[] = await eventFetcher.getLogs(
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
    Logger.error(LogColor.red(e))
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



async function getBlockInfo(endpoint: string, blockIdentifier: string | number): Promise< {
  number: number,
  hash: string,
  timestamp: number | string,
}> {
  try {
    // Create a JSON-RPC request object
    if( typeof blockIdentifier == "number"){
      blockIdentifier = blockIdentifier.toString(16)
    }

    const requestData = {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [blockIdentifier, false], // Replace 'false' with 'true' to get full transaction objects
      id: 1,
    };

    console.log(requestData)
    // Make an HTTP POST request to the Ethereum JSON-RPC endpoint
    const response = await axios.post(endpoint, requestData);

    // Check if the response contains an error
    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    // Extract block information from the response
    const result = response.data.result;

    if (!result) {
      throw new Error('Block not found');
    }
    // Extract the block number, block hash, and block timestamp
    const blockNumber = parseInt(result.number, 16);
    const blockHash = result.hash;
    const blockTimestamp = parseInt(result.timestamp, 16);
    
    return {
      number: blockNumber,
      hash: blockHash,
      timestamp: blockTimestamp,
    };
  } catch (error) {
    console.error('Error fetching block information:', error);
    throw error;
  }
}

export default {
  eventLogToSidetreeTransaction,
  extendSidetreeTransactionWithTimestamp,
  getBlock,
  getBlockchainTime,
  getPastEventsChunked
};

