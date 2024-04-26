import { EthereumLedger } from "@quarkid-sidetree/ethereum";
import Web3 from "web3";

export class GenesisBatch {

    constructor(private provider: Web3) {
    }

    async initialize(): Promise<void> {
        const ledger = new EthereumLedger(this.provider);
        await ledger.initialize();
    }
}