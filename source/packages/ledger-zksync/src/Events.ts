import axios from "axios";
import { Contract, ethers } from "ethers";
interface RawLogData {
    blockHash: string;
    blockNumber: string;
    address: string;
    data: string;
    topics: string[];
}

function rawLogToSidetreeEvent(log: RawLogData, abi: Contract) {
    const decodedLog = abi.interface.parseLog(log);
    console.log(decodedLog)
    return {
        blockHash: log.blockHash,
        blockNumber: parseInt(log.blockNumber, 16),
        address: log.address,
        returnValues: {
            anchorFileHash: decodedLog.args.anchorFileHash,
            transactionNumber: decodedLog.args.transactionNumber.toNumber(),
            numberOfOperations: decodedLog.args.numberOfOperations.toNumber(),
            writer: decodedLog.args.writer,
        }
    };
}


export class RPCEventFetcher {
    private eventSignature : string;
    constructor(private rpcUrl: string, private contractAddress: string,  private abi: Contract) {
        this.eventSignature = 'Anchor(bytes32,uint256,uint256,address)';
        }

    async getLogs(params: {
        fromBlock: number | string
        toBlock: number | string
        filter?: any
    }) {

        let fromBlock = params.fromBlock
        let toBlock = params.toBlock
        if (typeof fromBlock == "number") {
            fromBlock = fromBlock.toString(16)
        }
        if (typeof toBlock == "number") {
            toBlock = toBlock.toString(16)

        }
        const filterOptions = {
            address: this.contractAddress,
            topics: [ethers.utils.id(this.eventSignature)],
            fromBlock,
            toBlock,
        };

        // Encode the filter options as data
        const requestData = {
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [filterOptions],
            id: 1
        };
        const res = await axios.post(this.rpcUrl, requestData)

        const rawLogs: RawLogData[] = res.data.result;

        return rawLogs.map((rawLog) => rawLogToSidetreeEvent(rawLog, this.abi))

    }


}
