import { InputOptions } from "@truffle/hdwallet-provider/dist/constructor/Constructor";

export type ModenaNodeConfigs = {
    contentAddressableStoreServiceUri: string;
    databaseName: string;
    didMethodName: string;
    mongoDbConnectionString: string;
    batchingIntervalInSeconds: number;
    observingIntervalInSeconds: number;
    maxConcurrentDownloads: number;
    secondaryRpcUrl: string;

    ledgerType: string;
    rpcUrl: string;


    versions: [
        {
            startingBlockchainTime: number;
            version: string;
        }
    ];
    secondaryWalletProviderConfigs: InputOptions;
    walletProviderConfigs: InputOptions;
    modenaAnchorContract: string;
    ethereumMnemonic?: string;
};
