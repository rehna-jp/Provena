require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config(); // ← ADD THIS LINE!

module.exports = {
  mocha: {
    timeout: 100000 // 100s for safety
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    // moonbase: {
    //   url: process.env.MOONBASE_RPC_URL || "https://rpc.api.moonbase.moonbeam.network",
    //   chainId: 1287,
    //   accounts: [process.env.PRIVATE_KEY],
    //   gas: 5000000,
    //   gasPrice: 1000000000 // 1 gwei
    // },
    neuroweb_testnet: {
      url: "https://lofar-testnet.origin-trail.network",
      chainId: 20430,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      Neuroweb: process.env.NEUROWEB_API_KEY || ""
    }
  }
};