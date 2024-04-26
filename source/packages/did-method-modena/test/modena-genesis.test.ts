// import { getNodeInstance } from "../src/provider";
// // import { clearCollection } from "./utils";
// import vectors from '@quarkid-sidetree/test-vectors';
// import { Modena } from "../src/Modena";
// import HDWalletProvider from "@truffle/hdwallet-provider";
// // import { clearCollection } from '../test/utils';

// let modena: Modena;

// beforeAll(async () => {
//     // await clearCollection('cas-cache');
//     // await clearCollection('service');
//     // await clearCollection('operations');
//     // await clearCollection('transactions');
//     // await clearCollection('queued-operations');
// });

// afterAll(async () => {
//     await modena.shutdown();
// });

// jest.setTimeout(1800 * 1000);

// process.env.UV_THREADPOOL_SIZE = "240000";
// const uniqueSuffix = 'EiD351yY0XqnbCJN2MaZSQJMgG-bqmgFMDRGKawfu6_mZA';

// describe("Modena", () => {
//     it("Run Modena Genesis", async () => {
//         console.log("Run Modena");
//         await new Promise((resolve) => {
//             setTimeout(resolve, 10 * 1000);
//         });

//         console.log("Node");
//         modena = await getNodeInstance({
//             contentAddressableStoreServiceUri: "http://127.0.0.1:5001",
//             modenaAnchorContract: undefined,
//             databaseName: "element-test",
//             didMethodName: "elem:rsk",
//             ethereumRpcUrl: "ws://20.121.254.1:80/rsktestnetwss",
//             mongoDbConnectionString: "mongodb://localhost:27017/",
//             batchingIntervalInSeconds: 5,
//             observingIntervalInSeconds: 5,
//             maxConcurrentDownloads: 20,
//             versions: [
//                 {
//                     startingBlockchainTime: 0,
//                     version: "latest"
//                 }
//             ],
//             walletProviderConfigs: {
//                 privateKeys: ["0x6533a225bffb2f5ff1fd519a6236e1241d95786b43de9796e9e6a70b227ecb4c"],
//                 providerOrUrl: "ws://20.121.254.1:80/rsktestnetwss"
//             }
//         });

//         await modena.initialize();

//         console.log("Node Initialized");

//         // await new Promise((resolve) => {
//         //     setTimeout(resolve, 30 * 1000);
//         // });

//         console.log("vectors");

//         const value = JSON.stringify(vectors.wallet.operations[0].op0);

//         const v = vectors;
//         console.log(v);
//         const operation0 = await modena.handleOperationRequest(
//             Buffer.from(JSON.stringify(vectors.wallet.operations[0].op0))
//         );
//         expect(operation0.status).toBe('succeeded');
//         expect(operation0.body).toBeDefined();


//         console.log("vector Created");

//         await new Promise((resolve) => {
//             setTimeout(resolve, 100 * 1000);
//         });


//         const did = `did:elem:rsk:${uniqueSuffix}`;
//         const operation1 = await modena.handleResolveRequest(did);
//         expect(operation1.status).toBe('succeeded');
//         expect(operation1.body.didDocument.id).toEqual(did);
//     });

//     // it("Run Modena Genesis", async () => {
//     //     const node = await getNodeInstance({
//     //         contentAddressableStoreServiceUri: "/ip4/127.0.0.1/tcp/5001",
//     //         databaseName: "element-test",
//     //         didMethodName: "elem:rsk",
//     //         ethereumRpcUrl: "ws://rskws.extrimian.com:8000/rsktestnetwss",
//     //         mongoDbConnectionString: "mongodb://localhost:27017/",
//     //         batchingIntervalInSeconds: 5,
//     //         observingIntervalInSeconds: 5,
//     //         maxConcurrentDownloads: 20,
//     //         modenaAnchorContract: "0x7606c1656C00665C0350b1709d0943cE1A74dcC6",
//     //         versions: [
//     //             {
//     //                 startingBlockchainTime: 0,
//     //                 version: "latest"
//     //             }
//     //         ]
//     //     });
//     //     await node.initialize();

//     //     await new Promise((resolve) => {
//     //         setTimeout(resolve, 30 * 1000);
//     //     });

//     //     await new Promise((resolve) => {
//     //         setTimeout(resolve, 10 * 1000);
//     //     });
//     //     const v = vectors;
//     //     console.log(v);
//     //     const operation0 = await node.handleOperationRequest(
//     //         Buffer.from(JSON.stringify(vectors.wallet.operations[0].op0))
//     //     );
//     //     expect(operation0.status).toBe('succeeded');
//     //     expect(operation0.body).toBeDefined();

//     //     await new Promise((resolve) => {
//     //         setTimeout(resolve, 260 * 1000);
//     //     });

//     //     const did = `did:elem:rsk:${uniqueSuffix}`;
//     //     const operation1 = await node.handleResolveRequest(did);
//     //     expect(operation1.status).toBe('succeeded');
//     //     expect(operation1.body.didDocument.id).toEqual(did);

//     // });
// });