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

import {
  Account,
  Contract,
  defaultProvider,
  Provider,
  Signer,
  ec,
  json,
  number,
  GetBlockResponse,
  uint256,
  ProviderInterface
} from "starknet";

import { TransactionModel, Encoder } from '@extrimian-sidetree/common';
import { AnchoredDataSerializer } from '@extrimian-sidetree/core';
import { StarkNetEvent, StarknetEventError, StarkNetEventRequestParams } from "./StarknetEvents";




const getAccounts = (account: Account): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    if (!account.address)
      reject("no account address");

    resolve([account.address]);
  });
;



const eventLogToSidetreeTransaction = (
  log: StarkNetEvent
): TransactionModel => {

  const hash_low = log.data[0]
  const hash_high = log.data[1]
  const transactionNumber = Number.parseInt(log.data[2])
  const numberOfOperation = Number.parseInt(log.data[3])
  const anchorFileHash = uint256toHex(hash_low, hash_high);
  const coreIndexFileUri = Encoder.bufferToBase58(
    Buffer.from(
      '1220' + anchorFileHash.replace('0x', ''),
      'hex'
    )
  );


  const anchorObject = {
    coreIndexFileUri,
    numberOfOperations: numberOfOperation,
  };

  const anchorString = AnchoredDataSerializer.serialize(anchorObject);

  return {
    transactionNumber: transactionNumber,
    transactionTime: log.block_number,
    transactionTimeHash: log.block_hash,
    anchorString,
    transactionFeePaid: 0,
    normalizedTransactionFee: 0,
    writer: 'writer',
  };
};

const getBlock = async (
  provider: ProviderInterface,
  blockHashOrBlockNumber: string | number
): Promise<GetBlockResponse> => {
  return provider.getBlock(blockHashOrBlockNumber);
};

const getBlockchainTime = async (
  provider: ProviderInterface,
  blockHashOrBlockNumber: string | number
): Promise<string | number | null> => {
  const block: GetBlockResponse = await getBlock(provider, blockHashOrBlockNumber);
  if (block) {
    return block.block_number;
  }
  return null;
};

const extendSidetreeTransactionWithTimestamp = async (
  provider: ProviderInterface,
  txns: TransactionModel[]
): Promise<TransactionModel[]> => {
  return Promise.all(
    txns.map(async (txn) => {
      const timestamp = await getBlockchainTime(provider, txn.transactionTime);
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

//get max fee from the estimated fee as a string
function getMaxFee(overall_fee: any): string {
  const overHeadPercent = Math.round((1 + 0.5) * 100);
  return number.toFelt(number.toBN(overall_fee).mul(number.toBN(overHeadPercent)).div(number.toBN(100)))
}

function hexToUint256(num: string) : uint256.Uint256{
  const bn = number.toBN(num, 'hex');
  const uint = uint256.bnToUint256(bn);
  return uint;
}
function uint256toHex(low: any, high: any) {
  return number.toHex(uint256.uint256ToBN({ low: low, high: high }));
}

export default {
  eventLogToSidetreeTransaction,
  extendSidetreeTransactionWithTimestamp,
  getAccounts,
  getBlock,
  getBlockchainTime,
  getMaxFee,
  hexToUint256,
  uint256toHex
};
