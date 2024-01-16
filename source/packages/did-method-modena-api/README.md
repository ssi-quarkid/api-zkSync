# Modena API

This API initializes and exposes an instance of the [Modena](../did-method-modena/README.md) core.

## Description

[Nest](https://github.com/nestjs/nest) framework based API.

## Exposed endpoints

The app will be running by default on the *3000* port, it can be changed via the **PORT** enviroment variable

### POST /create

Takes a JSON body with a valid DID operation.



### GET /resolve/:did-suffix
Resolves the given did-suffix (without the did-method) in the network that the core connects to.

## Installation

```bash
$ npm install -g @nestjs/cli

$ npm install

$ nest build
```

## Running the app

```bash
$ npm run start
```

