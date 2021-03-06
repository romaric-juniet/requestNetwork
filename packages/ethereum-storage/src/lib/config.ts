import { Storage as StorageTypes } from '@requestnetwork/types';

// This contains default values used to use Ethereum Network and IPFS
// if information are not provided by the user
const config: any = {
  ethereum: {
    default: 'private',
    gasPriceDefault: '4000000000',
    nodeUrlDefault: {
      private: {
        timeout: 30000,
        url: 'http://localhost:8545',
      },
    },
  },
  ipfs: {
    default: 'private',
    nodeUrlDefault: {
      private: {
        port: 5001,
        private: 'localhost',
        protocol: 'http',
        timeout: 10000,
      },
      public: {
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        timeout: 10000,
      },
    },
  },
};

/**
 * Retrieve from config the default information to connect to ipfs
 * @returns IIpfsGatewayConnection the host, port, protocol and timeout threshold to connect to the gateway
 */
export function getDefaultIpfs(): StorageTypes.IIpfsGatewayConnection {
  return config.ipfs.nodeUrlDefault[config.ipfs.default];
}

/**
 * Retrieve from config the default provider url for Ethereum
 * @returns the url to connect to the network
 */
export function getDefaultEthereumProvider(): string {
  return config.ethereum.nodeUrlDefault[config.ethereum.default].url;
}

/**
 * Retrieve from config the timeout threshold for the default provider url for Ethereum
 * @returns the url to connect to the network
 */
export function getDefaultEthereumProviderTimeout(): number {
  return config.ethereum.nodeUrlDefault[config.ethereum.default].timeout;
}

/**
 * Retrieve from config the default name of the network for Ethereum
 * @returns the name of the network
 */
export function getDefaultEthereumNetwork(): string {
  return config.ethereum.default;
}

/**
 * Retrieve from config the default gas price to make transactions into Ethereum network
 * @returns the gas price as a string
 */
export function getDefaultEthereumGasPrice(): string {
  return config.ethereum.gasPriceDefault;
}
