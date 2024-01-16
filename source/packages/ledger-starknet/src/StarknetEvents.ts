import axios from "axios";


export type StarkNetEventRequestParams = {
    fromBlock: number,
    toBlock?: number, //default latest
    address: string,
    key?: string,
    page_size?: number,
    page_number?: number,
    size_number?: number
}

export interface StarkNetEvent {
    data: string[],
    keys: string[],
    from_address: string,
    block_hash: string,
    block_number: number,
    transaction_hash: string
}

export type StarkNetEventGetResult = {
    events: StarkNetEvent[],
    page_number: number,
    is_last_page: boolean
}
export type StarknetEventError = {
    code: number,
    message: string
}

export type StarkNetEventResponse = {
    jsonrpc: string,
    result?: StarkNetEventGetResult,
    error?: StarknetEventError,
    id: number
}






export class StarkNetEventResolver {
    public starkNetNodeUrl: string;
    constructor(starkNetNodeUrl: string) {
        this.starkNetNodeUrl = starkNetNodeUrl;
    }

    public async getEvents(params: StarkNetEventRequestParams): Promise<StarkNetEventResponse> {
        const body = {
            "jsonrpc": "2.0",
            "method": "starknet_getEvents",
            "params": [params],
            "id": 2
        }
        const res = await axios.post(this.starkNetNodeUrl, body)
        return res.data;
    }
}
