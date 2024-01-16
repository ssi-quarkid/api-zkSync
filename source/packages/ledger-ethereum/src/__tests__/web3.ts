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

import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';

export const getWeb3 = (provider = 'http://localhost:8545'): Web3 => {
  console.log(provider);
  const prov = new HDWalletProvider({
    privateKeys: ["0x6533a225bffb2f5ff1fd519a6236e1241d95786b43de9796e9e6a70b227ecb4c"],
    providerOrUrl: provider
  });
  const web3 = new Web3(prov);
  web3.eth.transactionBlockTimeout = 50000;

  web3.eth.transactionPollingTimeout = 1000000;
  return web3;
};

export const web3 = getWeb3();
