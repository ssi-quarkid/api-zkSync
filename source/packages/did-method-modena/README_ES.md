# Modena Core

Este paquete extiende la implementación del core ***did-method***. Exporta el método ***getNodeInstance*** que retorna una instancia del *Modena Core* ya funcionando.

Se encarga de instanciar y unir todos los componentes necesarios, utilizando los parámetros dados, mejor descriptos en la [documentación](../../README_ES.md) principal.

# Componentes

El Core necesita 3 componentes claves para ser inicializado: 

- Un Ledger: Para anclar la red, donde las nuevas transacciones realizadas y donde se escuchará a los eventos emitidos.

- Una base de datos: En este caso una base **MongoDB**, donde se guardan todas las transacciones y operaciones obtenidas de la red Sidetree.

- Un CAS: En este caso un nodo de **IPFS**, donde los archivos de la red van a estar guardados para que todos los nodos puedan sincronizarse.

## Ledger soportados

Esta implementación soporta el anclaje de una red Sidetree a varias Blokchains Layer 2.

### Ethereum

Cualquier blockchain similar a Ethereum, en nuestro caso probamos con RSK y Polygon, debe ser soportada (Deben ser compatibles con los modulos de node.js ***Web3*** y ***HDWalletProvider***)

### StarkNet

Usando el módulo StarkNet.js y el paquete ***ledger-starknet*** se pudo crear una red Sidetree en esta Blockchain.


## Comandos

```bash
# build
npm run build
```


