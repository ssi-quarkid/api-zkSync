# Ethereum Ledger

This package contains an implementation of the Sidetree ledger interface on the Ethereum ledger. It is similar to the ledger-ethereum developed on the original sidetree package but it contains some modifications to allow inherence, it also exports the utilities necessary to help them.

## Usage

```
npm install --save @quarkid-sidetree/ethereum
```

## Development

```
npm install
npm run test
```

## Deploying the contract to live network (ropsten, mainnet, etc...)

1) Fill in the values in `.env` for production use. Need:
  - funded mnemonic
  - rpc url (use infura)
2) Check that truffle-config.js contains the network you want to deploy to
3) `npx truffle migrate --network ropsten`

