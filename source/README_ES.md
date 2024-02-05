#  Implementación Modena sidetree

Modena-sidetree esta basado en la implementación Sidetree de referencia. Puede correr sobre una Blockchain del tipo Ethereum o sobre una StarkNet.

Dada una configuracion correcta es posible conectar un nodo a una red existente de Sidetree o a una nueva.

## Diseño

Comenzando como un fork de la implementación referencia de [element Sidetree](https://github.com/decentralized-identity/element) manteniendo varias partes del core intactas.

Los siguientes paquetes fueron agregados:

- [did-method-modena](packages/did-method-modena/README_ES.md)
- [did-method-modena-api](packages/did-method-modena-api/README_ES.md)
- [ledger-starknet](packages/ledger-starknet/README_ES.md)
- [ledger-zksync](packages/ledger-zksync/README_ES.md)
- [ledger-rsk](packages/ledger-rsk/README_ES.md)

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


- **LEDGER_TYPE:** 'eth' para tipo Ethereum, 'starknet' para StarkNet, 'rsk' para polling en chunks, 'zksync' para utilizar wallet ethers (mejor explicado en los otros readme)

- **ACCOUNT_ADDRESS (solo requerido en starknet):** Dirección para el contrato de la cuenta.

- **SECONDARY_WALLET_PRIVATE_KEY: (opcional en zksync)** Clave privada de la cuenta con la que va a realizar la lectura en 'zksync'

- **SECONDARY_RPC_URL:(opcional en zksync)** RPC para la wallet que lee de la blockchain en 'zksync'

Ejemplos para la configuracion por medio de variable de entorno se pueden encontrar en los archivos de docker-compose.

## Desplegar localmente

Se requiere node y yarn instalados previamente, luego descargar globalmente los siguientes paquetes:


```bash
$ npm install -g @nestjs/cli
```

Luego exporte las variables de entorno deseadas y corra:

```bash
# Limpiar el repo
$ yarn clean
# Descargar las depedencias y compilar
$ yarn
# Correr una instancia
$ cd packages/did-method-modena-api
$ nest start
```

## Despliguege en Docker

El dockerfile y los archivos de docker-compose se encuentran en la raíz del proyecto.

- **docker-compose-modena.yml** crea una instance de modena corriendo en Matic.
- **docker-compose-rsk.yml** crea una instance de modena corriendo en rsk.
- **docker-compose-bnb.yml** crea una instance de modena corriendo en bnb.
- **docker-compose-zksync.yml** crea una instance de modena corriendo en zksync.


### Ejemplo

```bash
# Limpiar el repo
$ yarn clean
# Correr el compose
$ docker-compose -f docker-compose-zksync.yml
# Checkear si el contenedor esta funcionando
$ docker ps
```


