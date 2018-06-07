
module.exports = {
  networks: {
    development: {
      host: "172.17.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" 
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};