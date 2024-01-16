# Modena API

Esta API inicializa y expone una instancia del [Modena](../did-method-modena/README_ES.md) core.

## Descripción

API basada en el framework de [Nest](https://github.com/nestjs/nest).

## Endpoints expuestos

Esta app va a correr por defecto en el puerto *3000*, puede ser cambiado por medio de la variable de ambiente **PORT**.

### POST /create

Toma un cuerpo JSON con una operación DID válida.

### GET /resolve/:did-suffix

Resuelve el sufijo de did dado (sin el did-method incluido) en la red a la que el Core se conecta. 

## Instalación

```bash
$ npm install -g @nestjs/cli

$ npm install

$ nest build
```

## Correr la app

```bash
$ npm run start
```

