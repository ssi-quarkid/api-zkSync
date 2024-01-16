import { BlockchainTimeModel, IBlockchain, TransactionModel, ValueTimeLockModel, ServiceVersionModel } from '@extrimian-sidetree/common';
import { Account, ProviderInterface } from "starknet";
export declare class StarkNetLedger implements IBlockchain {
    account: Account;
    provider: ProviderInterface;
    starkNetNodeUrl: string;
    contractAddress: string;
    private logger;
    private cachedBlockchainTime;
    private from;
    private networkId;
    private anchorContract;
    private eventResolver;
    private maxGasFee;
    constructor(account: Account, provider: ProviderInterface, starkNetNodeUrl: string, contractAddress: string, logger?: Console);
    private getAnchorContract;
    initialize(): Promise<void>;
    get approximateTime(): BlockchainTimeModel;
    private getPastEvents;
    _getTransactions: (fromBlock: number, toBlock?: number, sinceTransaction?: number, options?: any) => Promise<TransactionModel[]>;
    extendSidetreeTransactionWithTimestamp: (transactions: TransactionModel[]) => Promise<TransactionModel[]>;
    getLatestTime(): Promise<BlockchainTimeModel>;
    write: (anchorString: string, _fee?: number) => Promise<void>;
    read(sinceTransactionNumber?: number, transactionTimeHash?: string): Promise<{
        moreTransactions: boolean;
        transactions: TransactionModel[];
    }>;
    getFirstValidTransaction(_transactions: TransactionModel[]): Promise<TransactionModel | undefined>;
    getFee(_transactionTime: number): Promise<number>;
    getValueTimeLock(_lockIdentifier: string): Promise<ValueTimeLockModel | undefined>;
    getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined>;
    getServiceVersion(): Promise<ServiceVersionModel>;
}
