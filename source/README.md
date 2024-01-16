# Modena sidetree implementation

Modena-sidetree is based on the Sidetree reference implementation. It can be run either on top of an Etherum-like blockchain or the StarkNet one.

Provided the right configurations it's possible to deploy a node for an existing Sidetree network or creating a new one.


## Design

Starting as a fork of [element] (https://github.com/decentralized-identity/element) and leaving only the required packages for our needs, most of the core has been left intact.
The following packages have been modified:
- [ledger-ethereum](packages/ledger-ethereum/README.md)

The following packages have been added:

- [did-method-modena](packages/did-method-modena/README.md)
- [did-method-modena-api](packages/did-method-modena-api/README.md)
- [ledger-starknet](packages/ledger-starknet/README.md)
- [ledger-rsk](packages/ledger-rsk/README.md)
- [ledger-zksync](packages/ledger-zksync/README.md)

<br>

# Node Deployment

The configurations can be passed either through enviroment variables or their defaults can be modified directly on the json files under the ***/packages/did-method-modena-api/config*** folder.
Some examples can be found on ***/packages/did-method-modena-api/configModena***

## Requirements
- Access to a MongoDB database
- Access to an IPFS provider
- A RPC provider for your Ledger
- A Wallet on the Ledger, for deploying a new anchor or to making any operations founds are required


## Configuration via enviroment variables

### General

- **DID_METHOD_NAME:** Defines de base name for your DID method
- **OBSERVING_INTERVAL_IN_SECONDS:** How often is Modena going to listen for changes in the network
- **BATCHING_INTERVAL_IN_SECONDS:** How often is going Modena going to upload the processed DID operations to the network and write a new Core index file.(This has an impact on the gas usage)
- **PORT:** The port where the app is going to listen. If not defined it defaults to 3000.
- **MAX_CONCURRENT_DOWNLOADS:**

### Database and CAS

- **CONTENT_ADDRESSABLE_STORE_SERVICE_URI:** URI for your CAS, in most cases and IPFS.
- **DATABASE_NAME:** The name of the mongodb database where the fetched data is gonna be stored
- **MONGO_DB_CONNECTION_STRING:** String to connect to the MongoDB database, it's the same as the one used in compass


### Ledger configuration
- **RPC_URL:** URL for the RPC Node used to connect to the blockchain
- **MODENA_ANCHOR_CONTRACT:** Ledger address of a Sidetree anchor contract
- **STARTING_BLOCKCHAIN_TIME:** Starting block number where the core is going to sync with the network
- **BLOCKCHAIN_VERSION:** Use 'latest'
- **WALLET_PRIVATE_KEY:** Private key of the account used to pay for the write transactions

- **LEDGER_TYPE:** Either 'eth' for etherum or 'starknet' for StarkNet

- **ACCOUNT_ADDRESS (required for StarkNet only):** Address for the account contract  
          
Examples for the enviroment variables can be found under the docker-compose files

## Deploying Locally

Make sure you have node, npm and the following packages installed:

```bash
$ npm install -g @nestjs/cli

$ npm install -g lerna
```

*Note: The project has been tested with node 14.19.0 and npm 8.5.4*


Then export your desired enviroment variables and then run:
```bash
# Cleaning the repo
$ lerna clean
# Downloading dependencies and compiling
$ lerna run bootstrap --hoist
# Starting the instance
$ cd packages/did-method-modena-api
$ nest start
```

## Deploying on Docker

The Dockerfile and the docker-compose files can be found on the root of the project.

- **docker-compose-modena.yml** creates an instance for modena running on Matic.
- **docker-compose-tangoid-starknet.yml** creates an instance for modena running on StarkNet.

### Example

```bash
# Cleaning the repo
$ lerna clean
# Running the compose
$ docker-compose -f docker-compose-tangoid-starknet.yml up -d
# Check if the container is up
$ docker ps
```


