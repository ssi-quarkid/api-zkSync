# ZKSync Ledger

Este paquete contiene una implementación de la interfaz de Sidetree ledger en la Blockchain de ZKSync. Extiende el [RSKLedger](../ledger-ethereum/README_ES.md) definido en este paquete, dado que se necesita la lectura de eventos fragmentados.

# Diferencias Clave

## Escritura

La blockchain de ZKSync recomienda el uso del paquete ethers, se ha realizado una prueba con la clase padre (LedgerRSK), pero ha habido problemas con las operaciones de escritura, por lo que el el mismo se ha reescrito utilizando la libreria ethers.

## Constructor

- **wallet:** Una wallet ethers
- **web3:** Una instancia de Web3
- **eventPullChunckSize:** El número máximo de bloques que se pueden consultar en una solicitud de lectura
- **contractAddress:** dirección del contrato de sidetree
- **startingBlockchainTime (opcional):** El tiepo en la blockchain en el que comenzarán a extraerse los eventos (se sugiere establecer el bloque en el que se creo contrato, cualquier tiempo despues traera incosistencias)
- **logger (opcional):** Un logger de eventos