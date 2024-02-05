## Descripción

ApiZksync es un componente cuya funcionalidad principal es la creación y gestión de identificadores descentralizados (DID). Una de las características clave de esta implementación de SideTree es la capacidad de optimizar los costos de transacción al minimizar la cantidad de interacciones directas con la cadena de bloques al igual que permitir al usuario modificaciones sobre sus DID.

## Tecnologías

La aplicación cuenta con las siguientes tecnologías:

* Node.js - 18.17.1
* Nest.js - 8.0.0
* Typescript - 4.*
* Yarn - 1.22.19

## Diagrama

## Licencia

Copyright [2023] [Gobierno de la Ciudad de Buenos Aires]

Licenciado bajo la Licencia Apache, Versión 2.0 (la "Licencia");
no puede utilizar este archivo excepto de conformidad con la Licencia.
Puede obtener una copia de la Licencia en

[LICENSE](http://www.apache.org/licenses/LICENSE-2.0)

A menos que lo exija la ley aplicable o se acuerde por escrito, el software
distribuido bajo la Licencia se distribuye "TAL CUAL",
SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO, ya sean expresas o implícitas.
Consulte la Licencia para conocer el idioma específico que rige los permisos y
limitaciones bajo la Licencia.

## Variables de Entorno

### Generales

### Variables de entorno de la aplicación

- DID_METHOD_NAME: Define el nombre base para su método DID
- OBSERVING_INTERVAL_IN_SECONDS: Con qué frecuencia irá a buscar cambios a la red.
- BATCHING_INTERVAL_IN_SECONDS: Con qué frecuencia cargará las operaciones DID procesadas en la red y escribirá un nuevo archivo de índice Core (Esto tiene un impacto en el uso de gas)
- PORT: El puerto donde escuchará la aplicación. Si no está definido, el valor predeterminado es 3000.
- MAX_CONCURRENT_DOWNLOADS: Cantidad máxima de descargas al mismo tiempo.

### Base de datos y CAS

- CONTENT_ADDRESSABLE_STORE_SERVICE_URI: URI para el CAS, en este caso un IPFS.
- DATABASE_NAME: El nombre de la base de datos que se usar en MongoDB
- MONGO_DB_CONNECTION_STRING: String para conectarse a la base de datos de MongoDB, es el mismo que se utiliza en compass.

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

4. podman sockets

````
sudo systemctl start podman.socket
````
````
sudo systemctl status podman.socket
````

5. docker-compose up
ya que la app no tiene permiso para crear la bbdd en mongo,
crear base de datos en mongo de produccion ( y agregar ruta al mongo en el docker compose), "modena-zksync-testnet-v1"

````
/usr/local/bin/docker-compose -f docker-compose-zk-prod.yml up
````
6. servicio de rebooteo
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

## Requerimientos de red

La aplicación debe tener conectividad a internet para poder sincronizar con blockchain.

## Ruta de acceso

- [Dev](http://10.9.10.43:8000/)
- [QA](http://10.9.10.43:8000/)
- [HML](http://10.9.10.43:8000/)
- [PROD](https://api-zksync.buenosaires.gob.ar/)

## Healthcheck

Para comprobar la salud del servicio basta con navegar la url base con una / al final, retornara un Status 200, con la info correspondiente.

