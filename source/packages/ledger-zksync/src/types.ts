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


export interface EthereumBlock {
  number: number,
  hash: string,
  timestamp: number|string,
};

export type EthereumFilter = any;

export interface SidetreeEventData {
  blockHash: string;
  blockNumber: number;
  address: string;
    returnValues: {
      anchorFileHash: string;
      numberOfOperations: string;
    transactionNumber: string;
    writer: string;
  };
}

// export interface ElementContract extends Contract {
//   setProvider: Function;
// }
