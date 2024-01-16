#  Implementación Modena sidetree

Modena-sidetree esta basado en la implementación Sidetree de referencia. Puede correr sobre una Blockchain del tipo Ethereum o sobre una StarkNet.

Dada una configuracion correcta es posible conectar un nodo a una red existente de Sidetree o a una nueva.

## Diseño

Comenzando como un fork de la implementación referencia de [element Sidetree](https://github.com/decentralized-identity/element) dejando solo lo requerido pero con el Core intacto.

Los siguientes paquetes fueron agregados:

- [did-method-modena](packages/did-method-modena/README_ES.md)
- [did-method-modena-api](packages/did-method-modena-api/README_ES.md)
- [ledger-starknet](packages/ledger-starknet/README_ES.md)

<br>

# Desplegar un nodo

Las configuraciones se pueden definir por medio de variables de entorno o modificando las predefinidas dentro de la carpeta ***/packages/did-method-modena-api/config***. Algunos ejemplos de los mismos se pueden encontrar en ***/packages/did-method-modena-api/configModena***.

## Requirimientos

- Acceso a una base de datos MongoDB.
- Acceso a un proveedor de IPFS.
- Un proveedor RPC para el Ledger.
- Una Wallet en esa Ledger, se requieren fondos para escribir operaciones o para lanzar un nuevo anclaje.

## Configuración por medio de variables de entorno

### General

- **DID_METHOD_NAME:** Define la base del nombre del DID method.

- **OBSERVING_INTERVAL_IN_SECONDS:** Intervalo en el que Modena va a escuchar para cambios en la red.

- **BATCHING_INTERVAL_IN_SECONDS:** Intervalo en el que Modena va a subir las operaciones DID a la red y escribir un nuevo Core Index File. (Esto tiene un impacto en el uso de gas).

- **PORT:** El puerto en el que la API va a escuchar. Por default es 3000.

- **MAX_CONCURRENT_DOWNLOADS:**

### Base de datos y CAS

- **CONTENT_ADDRESSABLE_STORE_SERVICE_URI:** URI para el CAS, en este caso un IPFS.

- **DATABASE_NAME:** El nombre de la base de datos que se usar en MongoDB

- **MONGO_DB_CONNECTION_STRING:** String para conectarse a la base de datos de MongoDB, es el mismo que se utiliza en compass.

### Configuración de Ledger

- **RPC_URL:** URL para que el nodo se conecte a la blockchain.

- **MODENA_ANCHOR_CONTRACT:** Dirección del contracto de anclaje de Sidetree en la Ledger.

- **STARTING_BLOCKCHAIN_TIME:** Número de bloque por el cual el core va a empezar a sincronizarse con la red.

- **BLOCKCHAIN_VERSION:** Utilice 'latest'

- **WALLET_PRIVATE_KEY:** Clave privada de la cuenta con la que se va a pagar las transacciones de escritura.

- **LEDGER_TYPE:** 'eth' para tipo Ethereum o 'starknet' para StarkNet.

- **ACCOUNT_ADDRESS (required for StarkNet only):** Dirección para el contrato de la cuenta.
          
Ejemplos para la configuracion por medio de variable de entorno se pueden encontrar en los archivos de docker-compose.

## Desplegar localmente

Se requiere node y npm instalados previamente, luego descargar globalmente los siguientes paquetes:


```bash
$ npm install -g @nestjs/cli

$ npm install -g lerna
```

*Nota: EL proyecto se testeo con node 14.19.0 y con npm 8.5.4*


Luego exporte las variables de entorno deseadas y corra:

```bash
# Limpiar el repo
$ lerna clean
# Descargar las depedencias y compilar
$ lerna run bootstrap --hoist
# Correr una instancia
$ cd packages/did-method-modena-api
$ nest start
```

## Despliguege en Docker

El dockerfiles y los archivos de docker-compose se encuentran en la raíz del proyecto.

- **docker-compose-modena.yml** crea una instance de modena corriendo en Matic.
- **docker-compose-tangoid-starknet.yml** creates an instance for modena running on StarkNet.

### Ejemplo

```bash
# Limpiar el repo
$ lerna clean
# Correr el compose
$ docker-compose -f docker-compose-tangoid-starknet.yml
# Checkear si el contenedor esta funcionando
$ docker ps
```


