# Modena Core

This package extends the ***did-method*** Core implementation. It exports the ***getNodeInstance*** methods which returns a running *Modena Core instance*.

It instanciates and links all the necessary components, utilizing the given parameters, better described here.

# Overview

The Core needs 3 key components to be initialized:


- A Ledger: To anchor the network, where new transactions will be emited and events will be listened to.

- A Database: In this case a **MongoDB** database, to store all the fetched transactions and operations from the SideTree network

- A CAS: In this case an **IPFS** node, where the network files will be stored to be synced to every node.


## Supported Ledgers

This implementation supports a the anchoring of a Sidetree network to a series of Layer 2 BlockChains.

### Ethereum

Any Ethereum-like blockchain, in our case we tested RSK and Polygon, should be supported (They must be compatible with the ***Web3*** and ***HDWalletProvider*** node.js modules).

### StarkNet

Using the StarkNet.js module and the ***ledger-starknet*** package we were able to create a Sidetree Network.


## Commands

```bash
# build
npm run build
```


