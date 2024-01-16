export declare type StarkNetEventRequestParams = {
    fromBlock: number;
    toBlock?: number;
    address: string;
    key?: string;
    page_size?: number;
    page_number?: number;
    size_number?: number;
};
export interface StarkNetEvent {
    data: string[];
    keys: string[];
    from_address: string;
    block_hash: string;
    block_number: number;
    transaction_hash: string;
}
export declare type StarkNetEventGetResult = {
    events: StarkNetEvent[];
    page_number: number;
    is_last_page: boolean;
};
export declare type StarknetEventError = {
    code: number;
    message: string;
};
export declare type StarkNetEventResponse = {
    jsonrpc: string;
    result?: StarkNetEventGetResult;
    error?: StarknetEventError;
    id: number;
};
export declare class StarkNetEventResolver {
    starkNetNodeUrl: string;
    constructor(starkNetNodeUrl: string);
    getEvents(params: StarkNetEventRequestParams): Promise<StarkNetEventResponse>;
}
