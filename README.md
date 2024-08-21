## [Description](#description)
## [Technologies](#technologies)
## [Architecture](https://docs.quarkid.org/en/Arquitectura/) and [Documentation](https://docs.quarkid.org/en/Arquitectura/componentes/)
## Configurations: 
### 1. [Local Environment](#local-environment-configuration)
### 2. [Blockchain Network Modification](#blockchain-network-modification)
### 3. [Environment Variables](#environment-variables)
### 4. [Installation](#installation)
### 5. [Steps to Install the Component on a Server](#steps-to-install-the-component-on-a-server)
### 6. [Steps to Start a Quarkid Identity Node](https://github.com/ssi-quarkid/Nodo-QuickStart)

-------------------------------------------------------------------------------------------------------

## Description

ApiZksync is a component whose main functionality is the creation and management of decentralized identifiers (DID). One of the key features of this SideTree implementation is the ability to optimize transaction costs by minimizing the number of direct interactions with the blockchain while allowing users to modify their DIDs.

## Technologies

The application uses the following technologies:

* Node.js - 18.17.1
* Nest.js - 8.0.0
* Typescript - 4.*
* Yarn - 1.22.19

## Architecture
[Diagram](https://docs.quarkid.org/en/Arquitectura/)

## Documentation
[Link](https://docs.quarkid.org/en/Arquitectura/componentes/)

## Local Environment Configuration

The following needs to be installed beforehand:
```bash
npm install -g @nestjs/cli
```

Clone the repository

- Open the project with the selected editor
- Open a terminal and execute:

```bash
cd source
yarn
cd packages/did-method-modena-api
nest start
```

## Blockchain Network Modification

If you want to use this component anchored to another blockchain network, the following clarifications should be taken into account: 

Supported Ledgers:

This implementation supports anchoring a Sidetree network for a series of Level 2 BlockChains.
It supports any Ethereum-like blockchain, tests have been conducted with RSK and Polygon. The network is required to be compatible with Web3 and HDWalletProvider node.js modules.
For Starknet, tests were conducted using the StarkNet.js module and the ledger-starknet package, and a Sidetree network could be created.

- RPC_URL: URL for the node to connect to the blockchain.
- MODENA_ANCHOR_CONTRACT: Address of the Sidetree anchor contract in the Ledger.
- STARTING_BLOCKCHAIN_TIME: Block number from which the core will start synchronizing with the network.
- BLOCKCHAIN_VERSION: Use 'latest'
- WALLET_PRIVATE_KEY: Private key of the account that will pay for write transactions.
- LEDGER_TYPE: 'eth' for Ethereum type, 'starknet' for StarkNet, 'rsk' for polling in chunks, 'zksync' to use ethers wallet
- ACCOUNT_ADDRESS (only required in starknet): Address for the account contract.
- SECONDARY_WALLET_PRIVATE_KEY: (optional in zksync) Private key of the account that will perform reading in 'zksync'
- SECONDARY_RPC_URL: (optional in zksync) RPC for the wallet that reads from the blockchain in 'zksync'

## Environment Variables

### General

### Application environment variables
Environment variables must be configured in [Source](/source/packages/did-method-modena-api/config/modena-node-config.json)

- DID_METHOD_NAME: quarkid 
- CONTENT_ADDRESSABLE_STORE_SERVICE_URI: IP:PORT
- DATABASE_NAME: -zksync-mainnet-v1 
- RPC_URL: https://mainnet.era.zksync.io
- MONGO_DB_CONNECTION_STRING: mongodb://10.1.0.2:27017
- MAX_CONCURRENT_DOWNLOADS: 20
- OBSERVING_INTERVAL_IN_SECONDS: 30
- BATCHING_INTERVAL_IN_SECONDS: 21600
- STARTING_BLOCKCHAIN_TIME: 2652485
- BLOCKCHAIN_VERSION: latest
- MODENA_ANCHOR_CONTRACT 0xe0055B74422Bec15cB1625792C4aA0beDcC61AA7
- WALLET_PRIVATE_KEY: Private Key of an address with balance in the Zksync network
- ACCOUNT_ADDRESS: 0x9CAA73a4865fa9dbb125b6C7B2f03b6621234
- LEDGER_TYPE: zksync | rsk | eth Blockchain network to use

### Database and CAS

- CONTENT_ADDRESSABLE_STORE_SERVICE_URI: URI for the CAS, in this case an IPFS.
- DATABASE_NAME: The name of the database to be used in ferretdb
- MONGO_DB_CONNECTION_STRING: String to connect to the ferretdb database, it's the same used in compass.
- It's important to note that port 4001 must be open to synchronize with IPFS. If this port is not opened, the node will not be able to resolve identities that were created on another node.

### Ledger Configuration

- RPC_URL: URL for the node to connect to the blockchain.
- MODENA_ANCHOR_CONTRACT: Address of the Sidetree anchor contract in the Ledger.
- STARTING_BLOCKCHAIN_TIME: Block number from which the core will start synchronizing with the network.
- BLOCKCHAIN_VERSION: Use 'latest'
- WALLET_PRIVATE_KEY: Private key of the account that will pay for write transactions.
- LEDGER_TYPE: 'eth' for Ethereum type, 'starknet' for StarkNet, 'rsk' for polling in chunks, 'zksync' to use ethers wallet (better explained in other readmes)
- ACCOUNT_ADDRESS (only required in starknet): Address for the account contract.
- SECONDARY_WALLET_PRIVATE_KEY: (optional in zksync) Private key of the account that will perform reading in 'zksync'
- SECONDARY_RPC_URL: (optional in zksync) RPC for the wallet that reads from the blockchain in 'zksync'

### Network Requirements

The application must have internet connectivity to synchronize with the blockchain.

### Access Route

N/A

### Healthcheck

To check the health of the service, simply navigate to the base url with a / at the end, it will return a Status 200, with the corresponding info.

## Installation

1. Download and install docker, docker-compose, s2i
````
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
sudo yum repolist
sudo dnf install docker-ce
sudo systemctl start docker
sudo systemctl enable docker
````
````
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
````

````
wget ../source-to-image/releases/download/v1.3.6/source-to-image-v1.3.6-cd7d7ce9-linux-amd64.tar.gz
sudo tar -xvzf ./source-to-image-v1.3.6-cd7d7ce9-linux-amd64.tar.gz
sudo cp ./s2i /usr/local/bin
````

2. Give execution permission to docker-compose
````
sudo chmod +x /usr/local/bin/docker-compose
````

3. Build image

```
s2i build ../secictd/identidad-soberana/api-zksynk.git -r {TAG TO GENERATE} --context-dir source registry.access.redhat.com/ubi8/nodejs-18:latest api-zksynk-s2i |& tee /tmp/api-zksynk-s2i-build.log
```

4. Podman sockets

````
sudo systemctl start podman.socket
````
````
sudo systemctl status podman.socket
````

5. Docker-compose up
Since the app doesn't have permission to create the database in ferretdb,
create database in production ferretdb (and add path to ferretdb in the docker compose), "modena-zksync-testnet-v1"

````
/usr/local/bin/docker-compose -f docker-compose-zk-prod.yml up
````
6. Reboot service
````
podman generate systemd --files --name source_modenav4_1
````
````
cp -Z  container-source_modenav4_1.service  /etc/systemd/system
````
````
sudo systemctl daemon-reload
````
````
sudo loginctl enable-linger
..
````
## Steps to Install the Component on a Server

Prerequisites:
On an empty Linux server, you must install Docker.

To install Docker on Ubuntu, follow these steps:

1. Update the package index:
bash
sudo apt update

2. Install the necessary packages to allow apt to use a repository over HTTPS:
````
sudo apt install apt-transport-https ca-certificates curl software-properties-common
````
3. Download Docker's official GPG key:
````
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
````
4. Add the Docker repository to apt sources:
````
Copy code
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
````

5. Update the package index again so apt can use the newly added repository:
````
sudo apt update
````
6. Make sure you're about to install from the Docker repository instead of the default Ubuntu repository:
````
apt-cache policy docker-ce
````

8. Finally, install Docker:
````
sudo apt install docker-ce
````

Docker should now be installed, the service will start automatically after installation. To verify that Docker has been installed correctly, you can run the following command:
````
sudo systemctl status docker
````

### Now you have Docker installed on your Ubuntu machine. You can start using Docker to create, run, and manage containers.

## For the installation of QuarkID components, the steps are: 
 1)  Download the Docker Images, and install them on the server, with the following commands: 
````
 docker pull quarkid/api-proxy
 docker pull quarkid/api-zksync
 docker pull ipfs/kubo:latest
 docker pull ghcr.io/ferretdb/all-in-one
 ````

 2) Verify that the images have been downloaded
 ````
 docker image ls

 REPOSITORY TAG IMAGE ID SIZE
 quarkid/api-proxy latest cb8941a6fbe4 16 hours ago 1.26GB
 quarkid/api-zksync latest 13e12acfd1c0 5 months ago 3.56GB
 ipfs/kubo latest 71f8fff78bb2 3 days ago 94.6MB
 ghcr.io/ferretdb/all-in-one
````
3) Create the docker-compose.yml file with the following configuration. You should create an account in testnet and configure an address 
 and transfer balance to it to be able to execute transactions:
````
 ACCOUNT_ADDRESS=****
 WALLET_PRIVATE_KEY=****
 ````
 You should configure this data within the file.
 
 To create the file:
````
 nano docker-compose.yml
````
Step 4:
 Then execute 
````
docker compose up
````
