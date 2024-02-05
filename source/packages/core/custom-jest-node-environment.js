const NodeEnvironment = require("jest-environment-node");

const { TextEncoder, TextDecoder } = require("util");

class MyEnvironment extends NodeEnvironment {
  constructor(config) {
    super(
      {...config,
        globals: {
          ...config.globals, 
          Uint32Array: Uint32Array,
          Uint8Array: Uint8Array,
          ArrayBuffer: ArrayBuffer,
          TextEncoder: TextEncoder,
          TextDecoder: TextDecoder,
        }
      }
      );
  }
}

module.exports = MyEnvironment;
