import config from "../../config/modena-node-config.json";
import wallet from "../../config/wallet-provider-config.json";
import { InputOptions } from '@extrimian-sidetree/did-method-modena';



export class ModenaConfig {

    public get didMethodName(): string {
        return process.env.DID_METHOD_NAME || config.didMethodName;
    }

    public get contentAddressableStoreServiceUri(): string {
        return process.env.CONTENT_ADDRESSABLE_STORE_SERVICE_URI || config.contentAddressableStoreServiceUri
    }
    public get databaseName(): string {
        return process.env.DATABASE_NAME || config.databaseName;
    }

    public get rpcUrl(): string {
        return process.env.RPC_URL || config.rpcUrl || '';

    }

    public get mongoDbConnectionString(): string {
        return process.env.MONGO_DB_CONNECTION_STRING || config.mongoDbConnectionString;
    }

    public get maxConcurrentDownloads(): number {
        return getNumber(process.env.MAX_CONCURRENT_DOWNLOADS) || config.maxConcurrentDownloads;
    }
    public get observingIntervalInSeconds(): number {

        return getNumber(process.env.OBSERVING_INTERVAL_IN_SECONDS) || config.observingIntervalInSeconds;
    }
    public get batchingIntervalInSeconds(): number {

        return getNumber(process.env.BATCHING_INTERVAL_IN_SECONDS) || config.batchingIntervalInSeconds;
    }

    public get ledgerType(): string {
        return process.env.LEDGER_TYPE || config.ledgerType;
    }

    public get versions(): [{ startingBlockchainTime: number, version: string }] {
        return [{
            "startingBlockchainTime": getNumber(process.env.STARTING_BLOCKCHAIN_TIME) || config.versions[0]?.startingBlockchainTime,
            "version": process.env.BLOCKCHAIN_VERSION || config.versions[0]?.version
        }]
    }

    public get secondaryRpcUrl(): string {
        return process.env.SECONDARY_RPC_URL || this.rpcUrl;
    }


    private ethWalletProviderConfigs(): InputOptions {
        let walletProviderConfig = getWalletEnv() || (wallet as any as InputOptions);
        walletProviderConfig['providerOrUrl'] = this.rpcUrl;
        return walletProviderConfig

    }

    public get secondaryWalletProviderConfigs(): InputOptions {
        let walletProviderConfig = getSecondaryWalletEnv() || getWalletEnv() || (wallet as any as InputOptions);
        walletProviderConfig['providerOrUrl'] = this.secondaryRpcUrl;
        return walletProviderConfig
    }


    public get walletProviderConfigs(): InputOptions {
        return this.ethWalletProviderConfigs();
    }


    public get modenaAnchorContract(): string {
        let anchor = null;
        if (config['modenaAnchorContract'])
            anchor = config['modenaAnchorContract'];
        return process.env.MODENA_ANCHOR_CONTRACT || anchor;
    }

}



function getNumber(envVar: string): number {
    return (!isNaN(Number(envVar))) ? Number(envVar) : undefined
}

function getWalletEnv(): { "privateKeys": string[] } {
    let aux = []
    aux.push(process.env.WALLET_PRIVATE_KEY)
    return (process.env.WALLET_PRIVATE_KEY) ? { "privateKeys": aux } : undefined
}
function getSecondaryWalletEnv(): { "privateKeys": string[] } {
    let aux = []
    aux.push(process.env.SECONDARY_WALLET_PRIVATE_KEY)
    return (process.env.SECONDARY_WALLET_PRIVATE_KEY) ? { "privateKeys": aux } : undefined
}

