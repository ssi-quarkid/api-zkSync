
import { MockCas } from '@quarkid-sidetree/cas';
import { Modena } from "./Modena";
import { ModenaNodeConfigs } from "./Types";
export { ModenaNodeConfigs }
import Ipfs from '@decentralized-identity/sidetree/dist/lib/ipfs/Ipfs';
import { InputOptions } from "@truffle/hdwallet-provider/dist/constructor/Constructor";
import { getEthereumLedger, getRSKLedger, getZKSyncLedger } from "./LedgerProvider";
import { IEventEmitter } from '@quarkid-sidetree/common';




export { InputOptions };

const getLedger = async (modenaNodeConfigs: ModenaNodeConfigs) => {
    switch (modenaNodeConfigs.ledgerType) {

        case 'rsk':
            return await getRSKLedger(modenaNodeConfigs);
        case 'eth':
            return await getEthereumLedger(modenaNodeConfigs);
        case 'zksync':
            return await getZKSyncLedger(modenaNodeConfigs);
        default:
            return await getEthereumLedger(modenaNodeConfigs);
    }
}

const getTestCas = async () => {
    const cas = new MockCas();
    await cas.initialize();
    return cas;
};

const getCas = async (config: ModenaNodeConfigs) => {
    const cas = new Ipfs(
        config.contentAddressableStoreServiceUri,
        10
    );
    return cas;
};

export const getTestNodeInstance = async (
    modenaNodeConfigs: ModenaNodeConfigs
): Promise<Modena> => {
    console.log(`initializen a ${modenaNodeConfigs.ledgerType} ledger`)
    const ledger = await getLedger(modenaNodeConfigs);
    const cas = await getTestCas();
    const modena = new Modena(
        modenaNodeConfigs as any,
        modenaNodeConfigs.versions,
        cas,
        ledger
    );
    await modena.initialize();
    return modena;
};

export const getNodeInstance = async (
    modenaNodeConfigs: ModenaNodeConfigs, eventEmitter?: IEventEmitter
): Promise<Modena> => {

    const ledger = await getLedger(modenaNodeConfigs);
    // const ledger = new MockLedger();
    const cas = await getCas(modenaNodeConfigs);
    // const cas = new MockCas();
    const modena = new Modena(
        modenaNodeConfigs as any,
        modenaNodeConfigs.versions,
        cas,
        ledger
    );
    await modena.initialize(undefined, eventEmitter);
    return modena;
};
