module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network ID
      // from: "0xFC3b00f2938539Cb4448bA2b784452274D81d9D8" // Địa chỉ ví có ETH trên Ganache
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",    // Điều chỉnh phiên bản Solidity
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  }
};