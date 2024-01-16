# RSKLedger

This package contains an implementation of the Sidetree ledger interface on the RSK Ledger. It extends the [Ethereum ledger](../ledger-ethereum/README.md) defined in this package.

# Key differences

## Logic

This implementation overrides the read method of the Ethereum Ledger package

As the Rootstock node is not able to withstand event lookout given a big window of blocks, this ledger can perform the read of the events in a chunked manner. The Chunk size is a parameter that can be modified.

It keeps track of the blocks that it has read (on runtime) to reduce the number of requests that it needs to perform on each read, if the application is reloaded that number will be lost.

## Constructor parameters

- **web3:** A Web3 instance
- **eventPullChunckSize:** The maxium number of blocks that can be looked on a read request
- **contractAddress (optional):** address of the sidetree contract
- **startingBlockchainTime (optional):** The blockchain time where the events will start being pulled (it is suggested to set the time of the creation of the contract)
- **logger (optional):** A logger