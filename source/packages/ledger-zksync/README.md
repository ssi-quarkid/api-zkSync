# ZKSync Ledger

This package contains an implementation of the Sidetree ledger interface on the ZKSync Blockchain. It extends the [RSKLedger](../ledger-ethereum/README.md) defined in this package given that the chunked event read is needed.

# Key Differences

## Write

The ZKSync blockchain encourages the usage of the ethers package, a test has been made with the parent class but there have been problems with the write operations so the write method has been override utilizing the ethers library.

## Constructor

- **wallet:** An ethers wallet
- **web3:** A Web3 instance
- **eventPullChunckSize:** The maxium number of blocks that can be looked on a read request
- **contractAddress:** address of the sidetree contract
- **startingBlockchainTime (optional):** The blockchain time where the events will start being pulled (it is suggested to set the time of the creation of the contract)
- **logger (optional):** A logger