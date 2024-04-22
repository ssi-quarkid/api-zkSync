## [Descripción](https://github.com/gcba/api-zkSync/edit/master/README.md#descripci%C3%B3n)
## [Tecnologías](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#tecnolog%C3%ADas)
## [Arquitectura](https://docs.quarkid.org/Arquitectura/) y [Documentación](https://docs.quarkid.org/Arquitectura/componentes/)
## Configuraciones: 
### 1. [Entorno local](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#configuraraci%C3%B3n-de-entorno-local)
### 2. [Modificación de Red Blockchain](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#modificaci%C3%B3n-de-red-blockchain)
### 3. [Variables de entorno](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#modificaci%C3%B3n-de-red-blockchain)
### 4. [Instalación](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#modificaci%C3%B3n-de-red-blockchain)
### 5. [Pasos para instalar el componente en un servidor](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#pasos-para-instalar-el-componente-en-un-servidor)
### 6. [Pasos para iniciar un nodo de Identidad Quarkid](https://github.com/gcba/Nodo-QuickStar/tree/master)
## [Licencia](https://github.com/gcba/api-zkSync/tree/master?tab=readme-ov-file#licencia)


-------------------------------------------------------------------------------------------------------

## Descripción

ApiZksync es un componente cuya funcionalidad principal es la creación y gestión de identificadores descentralizados (DID). Una de las características clave de esta implementación de SideTree es la capacidad de optimizar los costos de transacción al minimizar la cantidad de interacciones directas con la cadena de bloques al igual que permitir al usuario modificaciones sobre sus DID.

## Tecnologías

La aplicación cuenta con las siguientes tecnologías:

* Node.js - 18.17.1
* Nest.js - 8.0.0
* Typescript - 4.*
* Yarn - 1.22.19

## Arquitectura
[Diagrama](https://docs.quarkid.org/Arquitectura/)

## Documentación
[Link](https://docs.quarkid.org/Arquitectura/componentes/)

## Configuraración de entorno local

Se requiere tener instalados previamente:
```bash
npm install -g @nestjs/cli
```

Clonar el repositorio

- Abrir el proyecto con el editor seleccionado
- Abrir una terminal y ejecutar:

```bash
cd source
yarn
cd packages/did-method-modena-api
nest start
```

## Modificación de red Blockchain

En caso de querer utilizar este componente anclado en alguna otra red blockchain, se deberá tener en cuenta las siguientes acalaraciones: 

Ledgers soportados:

Esta implementación admite el anclaje de una red Sidetree para una serie de BlockChains de Nivel 2.
Soporta cualquier blockchain similar a Ethereum, se realizaron pruebas con RSK y Polygon. Se requiere que la red sea compatible con los módulos Web3 y HDWalletProvider node.js.
Para Starknet, se realizaron pruebas usando el módulo StarkNet.js y el paquete ledger-starknet y se pudo crear una red Sidetree.

- RPC_URL: URL para que el nodo se conecte a la blockchain.
- MODENA_ANCHOR_CONTRACT: Dirección del contracto de anclaje de Sidetree en la Ledger.
- STARTING_BLOCKCHAIN_TIME: Número de bloque por el cual el core va a empezar a sincronizarse con la red.
- BLOCKCHAIN_VERSION: Utilice 'latest'
- WALLET_PRIVATE_KEY: Clave privada de la cuenta con la que se va a pagar las transacciones de escritura.
- LEDGER_TYPE: 'eth' para tipo Ethereum, 'starknet' para StarkNet, 'rsk' para polling en chunks, 'zksync' para utilizar wallet ethers
- ACCOUNT_ADDRESS (solo requerido en starknet): Dirección para el contrato de la cuenta.
- SECONDARY_WALLET_PRIVATE_KEY: (opcional en zksync) Clave privada de la cuenta con la que va a realizar la lectura en 'zksync'
- SECONDARY_RPC_URL:(opcional en zksync) RPC para la wallet que lee de la blockchain en 'zksync'

## Variables de Entorno

### Generales

### Variables de entorno de la aplicación
Se deben configurar las variables de entorno en [Source](/source/packages/did-method-modena-api/config/modena-node-config.json)

- DID_METHOD_NAME: quarkid 
- CONTENT_ADDRESSABLE_STORE_SERVICE_URI: IP:PUERTO
- DATABASE_NAME: -zksync-mainnet-v1 
- RPC_URL: https://mainnet.era.zksync.io
- MONGO_DB_CONNECTION_STRING: mongodb://10.1.0.2:27017
- MAX_CONCURRENT_DOWNLOADS: 20
- OBSERVING_INTERVAL_IN_SECONDS: 30
- BATCHING_INTERVAL_IN_SECONDS: 21600
- STARTING_BLOCKCHAIN_TIME: 2652485
- BLOCKCHAIN_VERSION: latest
- MODENA_ANCHOR_CONTRACT 0xe0055B74422Bec15cB1625792C4aA0beDcC61AA7
- WALLET_PRIVATE_KEY: Clave Privada de un address con saldo en la red Zksync
- ACCOUNT_ADDRESS: 0x9CAA73a4865fa9dbb125b6C7B2f03b6621234
- LEDGER_TYPE: zksync | rsk | eth Red blockchain a utilizar


### Base de datos y CAS

- CONTENT_ADDRESSABLE_STORE_SERVICE_URI: URI para el CAS, en este caso un IPFS.
- DATABASE_NAME: El nombre de la base de datos que se usar en MongoDB
- MONGO_DB_CONNECTION_STRING: String para conectarse a la base de datos de MongoDB, es el mismo que se utiliza en compass.
- Es importante tener en cuenta que el puerto 4001 debe estar abierto para sincronizar con IPFS. Si no se abre este puerto, el nodo no será capaz de resolver identidades que se crearon en otro nodo.

### Configuración de Ledger

- RPC_URL: URL para que el nodo se conecte a la blockchain.
- MODENA_ANCHOR_CONTRACT: Dirección del contracto de anclaje de Sidetree en la Ledger.
- STARTING_BLOCKCHAIN_TIME: Número de bloque por el cual el core va a empezar a sincronizarse con la red.
- BLOCKCHAIN_VERSION: Utilice 'latest'
- WALLET_PRIVATE_KEY: Clave privada de la cuenta con la que se va a pagar las transacciones de escritura.
- LEDGER_TYPE: 'eth' para tipo Ethereum, 'starknet' para StarkNet, 'rsk' para polling en chunks, 'zksync' para utilizar wallet ethers (mejor explicado en los otros readme)
- ACCOUNT_ADDRESS (solo requerido en starknet): Dirección para el contrato de la cuenta.
- SECONDARY_WALLET_PRIVATE_KEY: (opcional en zksync) Clave privada de la cuenta con la que va a realizar la lectura en 'zksync'
- SECONDARY_RPC_URL:(opcional en zksync) RPC para la wallet que lee de la blockchain en 'zksync'

### Requerimientos de red

La aplicación debe tener conectividad a internet para poder sincronizar con blockchain.

### Ruta de acceso

N/A

### Healthcheck

Para comprobar la salud del servicio basta con navegar la url base con una / al final, retornara un Status 200, con la info correspondiente.

## Instalación

1. Descargar e instalar docker, docker- compose ,s2i
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

2. Dar permiso de ejecucion docker-compose
````
sudo chmod +x /usr/local/bin/docker-compose
````

3. Bildear imagen


```
s2i build ../secictd/identidad-soberana/api-zksynk.git -r {TAG A GENERAR} --context-dir source registry.access.redhat.com/ubi8/nodejs-18:latest api-zksynk-s2i |& tee /tmp/api-zksynk-s2i-build.log
```

4. Podman sockets

````
sudo systemctl start podman.socket
````
````
sudo systemctl status podman.socket
````

5. Docker-compose up
ya que la app no tiene permiso para crear la bbdd en mongo,
crear base de datos en mongo de produccion ( y agregar ruta al mongo en el docker compose), "modena-zksync-testnet-v1"

````
/usr/local/bin/docker-compose -f docker-compose-zk-prod.yml up
````
6. Servicio de rebooteo
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
## Pasos para instalar el componente en un servidor

Prerequisitos:
En un servidor Linux vacío, usted debe instalar Docker.

Para instalar Docker en Ubuntu, sigue estos pasos:

1. Actualiza el índice de paquetes:
bash
sudo apt update

2. Instala los paquetes necesarios para permitir que apt utilice un repositorio sobre HTTPS:
````
sudo apt install apt-transport-https ca-certificates curl software-properties-common
````
3. Descarga la clave GPG oficial de Docker:
````
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
````
4. Añade el repositorio de Docker a las fuentes de apt:
````
Copy code
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
````

5. Actualiza el índice de paquetes nuevamente para que apt pueda utilizar el nuevo repositorio agregado:
````
sudo apt update
````
6. Asegúrate de que estás a punto de instalar desde el repositorio de Docker en lugar del repositorio predeterminado de Ubuntu:
````
apt-cache policy docker-ce
````

8. Finalmente, instala Docker:
````
sudo apt install docker-ce
````

Docker ahora debería estar instalado, el servicio se iniciará automáticamente después de la instalación. Para verificar que Docker se haya instalado correctamente, puedes ejecutar el siguiente comando:
````
sudo systemctl status docker
````

### Ahora tienes Docker instalado en tu máquina Ubuntu. Puedes comenzar a utilizar Docker para crear, ejecutar y administrar contenedores.

## Para la instalación de los componentes de QuarkID, los pasos son: 
 1)  Descargar las Imágenes Docker, e instalarlas en el server, con los siguientes comandos: 
````
 docker pull quarkid/api-proxy
 docker pull quarkid/api-zksync
 docker pull ipfs/kubo:latest
 docker pull mongo:latest
 ````

 2) Verificar que las imágenes se hayan descargado
 ````
 docker image ls

 REPOSITORY TAG IMAGE ID SIZE
 quarkid/api-proxy latest cb8941a6fbe4 16 hours ago 1.26GB
 quarkid/api-zksync latest 13e12acfd1c0 5 months ago 3.56GB
 ipfs/kubo latest 71f8fff78bb2 3 days ago 94.6MB
 mongo
````
3) Crear el archivo docker-compose.yml con la siguiente configuracion. Deberá crear en testnet una cuenta y configurar en un address 
 y se le transfiere saldo para poder ejecutar las transacciones:
````
 ACCOUNT_ADDRESS=****
 WALLET_PRIVATE_KEY=****
 ````
 Deberá configurar esos datos dentro del archivo.
 
 Para crear el archivo:
````
 nano docker-compose.yml
````
Paso 4:
 Luego ejecutar 
````
docker compose up
````
## Licencia
Derechos de autor © 2023 Gobierno de la Ciudad de Buenos Aires

Licenciado bajo la Licencia Apache, Versión 2.0 (la "Licencia");
usted no puede utilizar este archivo excepto en cumplimiento con la Licencia.
Puede obtener una copia de la Licencia en
http://www.apache.org/licenses/LICENSE-2.0.
A menos que lo requiera la ley aplicable o se acuerde por escrito, el software
distribuido bajo la Licencia se distribuye "TAL CUAL",
SIN GARANTÍAS O CONDICIONES DE NINGÚN TIPO, ya sean expresas o implícitas.
Consulte la Licencia para el idioma específico que rige los permisos y
limitaciones bajo la Licencia.
