import { RSKLedger } from '@extrimian-sidetree/rsk';
import { ZKSyncLedger } from '@extrimian-sidetree/zksync';
import { EthereumLedger } from "@extrimian-sidetree/ethereum";
import { ModenaNodeConfigs } from "./Types";
import { ErrorLogger } from "./ErrorLogger";
import HDWalletProvider from "@truffle/hdwallet-provider";
import * as zksync from "zksync-web3";
import * as ethers from "ethers";

import Web3 from "web3";


function getWeb3Provider(modenaNodeConfigs: ModenaNodeConfigs) {
    const errorLogger = new ErrorLogger(modenaNodeConfigs.batchingIntervalInSeconds);
    let options = {
        keepAlive: true,
        withCredentials: false,
        timeout: 15 * 1000, // ms
    };

    const httpProvider = new Web3.providers.HttpProvider(modenaNodeConfigs.rpcUrl, options);
    let walletProviderArgs = modenaNodeConfigs.walletProviderConfigs;
    walletProviderArgs.providerOrUrl = httpProvider;
    const walletProvider = new HDWalletProvider(walletProviderArgs);
    walletProvider.engine.on('error', () => {
        errorLogger.log('RPC provider engine error');
    })
    return new Web3(walletProvider);
}

function getSecondaryWeb3Provider(modenaNodeConfigs: ModenaNodeConfigs) {
    const errorLogger = new ErrorLogger(modenaNodeConfigs.batchingIntervalInSeconds);
    let options = {
        keepAlive: true,
        withCredentials: false,
        timeout: 15 * 1000, // ms
    };
    const httpProviderReader = new Web3.providers.HttpProvider(modenaNodeConfigs.secondaryRpcUrl, options);

    let walletProviderArgsReader = modenaNodeConfigs.secondaryWalletProviderConfigs;
    walletProviderArgsReader.providerOrUrl = httpProviderReader;

    const walletProviderReader = new HDWalletProvider(walletProviderArgsReader);

    walletProviderReader.engine.on('error', () => {
        errorLogger.log('RPC provider engine error - Reader');
    })

    return new Web3(walletProviderReader);
}

export const getEthereumLedger = async (modenaNodeConfigs: ModenaNodeConfigs) => {
    const web3 = getWeb3Provider(modenaNodeConfigs);
    const ledger = new EthereumLedger(
        web3,
        (modenaNodeConfigs.modenaAnchorContract) ? modenaNodeConfigs.modenaAnchorContract.toLowerCase() : undefined
    );
    await ledger.initialize();
    return ledger;
};


export const getRSKLedger = async (modenaNodeConfigs: ModenaNodeConfigs) => {

    const web3 = getWeb3Provider(modenaNodeConfigs);
    const ledger = new RSKLedger(
        web3,
        2000,
        (modenaNodeConfigs.modenaAnchorContract) ? modenaNodeConfigs.modenaAnchorContract.toLowerCase() : undefined,
        modenaNodeConfigs.versions[0]?.startingBlockchainTime
    );
    await ledger.initialize();
    return ledger;
};

export const getZKSyncLedger = async (modenaNodeConfigs: ModenaNodeConfigs) => {



    const ethProvider = ethers.getDefaultProvider("mainnet");
    const PRIVATE_KEY: any = modenaNodeConfigs.walletProviderConfigs;
    const zkSyncProvider = new zksync.Provider(modenaNodeConfigs.rpcUrl);
    const zkSyncWallet = new zksync.Wallet(PRIVATE_KEY.privateKeys[0], zkSyncProvider, ethProvider);

    const ledger = new ZKSyncLedger(
        zkSyncWallet,
        50000,
        (modenaNodeConfigs.modenaAnchorContract) ? modenaNodeConfigs.modenaAnchorContract.toLowerCase() : '',
        modenaNodeConfigs.versions[0]?.startingBlockchainTime,
        modenaNodeConfigs.rpcUrl
    );
    await ledger.initialize();
    return ledger;
};

