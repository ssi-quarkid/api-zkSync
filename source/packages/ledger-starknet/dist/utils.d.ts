import { Account, GetBlockResponse, uint256, ProviderInterface } from "starknet";
import { TransactionModel } from '@extrimian-sidetree/common';
import { StarkNetEvent } from "./StarknetEvents";
declare function getMaxFee(overall_fee: any): string;
declare function hexToUint256(num: string): uint256.Uint256;
declare function uint256toHex(low: any, high: any): string;
declare const _default: {
    eventLogToSidetreeTransaction: (log: StarkNetEvent) => TransactionModel;
    extendSidetreeTransactionWithTimestamp: (provider: ProviderInterface, txns: TransactionModel[]) => Promise<TransactionModel[]>;
    getAccounts: (account: Account) => Promise<string[]>;
    getBlock: (provider: ProviderInterface, blockHashOrBlockNumber: string | number) => Promise<GetBlockResponse>;
    getBlockchainTime: (provider: ProviderInterface, blockHashOrBlockNumber: string | number) => Promise<string | number | null>;
    getMaxFee: typeof getMaxFee;
    hexToUint256: typeof hexToUint256;
    uint256toHex: typeof uint256toHex;
};
export default _default;
