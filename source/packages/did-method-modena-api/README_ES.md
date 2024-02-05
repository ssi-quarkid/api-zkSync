# Modena API

Esta API inicializa y expone una instancia del [Modena](../did-method-modena/README_ES.md) core.

## Descripción

API basada en el framework de [Nest](https://github.com/nestjs/nest).

## Endpoints expuestos

Esta app va a correr por defecto en el puerto *3000*, puede ser cambiado por medio de la variable de ambiente **PORT**.

### POST /create

Toma un cuerpo JSON con una operación Sidetree válida.

### GET /resolve/:did-suffix

Resuelve el sufijo de did dado (sin el did-method incluido) en la red a la que el Core se conecta. Devuelve solamente el DID Document


### POST /operations

Realiza lo mismo que el /create, se creo para ser completamente compliant con la especifiacion sidetree.

### GET /1.0/identifiers/:did

Resuelve el did (con el method incluido) en la red del Core. Devuelve el did document al igual que la metadata. Cumple con el caso base de la especificacion sidetree

### GET /health/read

Checkea que lo ultimo el ultimo ciclo de lectura del nodo funciono de forma correcta y que el mismo no ocurrio hace mucho. Devuelve 200 si esta todo correcto


### GET /health/write

Checkea que lo ultimo el ultimo ciclo de escritura del nodo funciono de forma correcta y que el mismo no ocurrio hace mucho.  Devuelve 200 si esta todo correcto

### GET /health

Combina /health/write y /health/read.Devuelve 200 si esta todo correcto

### GET /

Da una informacion mas completa sobre el estado del nodo. Configuracion de blockchain, duracion de intervalos, bloques explorados e informacion de cuando sucedieron eventos.



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

