import type { HardhatUserConfig } from "hardhat/config";  
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@chainlink/env-enc";
import { config as loadEnv } from "@chainlink/env-enc";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-deploy"

import { ProxyAgent, setGlobalDispatcher } from "undici";
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent)


loadEnv();

// 声明环境变量类型
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SEPOLIA_RPC_URL: string;
      ACCOUNT1_PRIVATE_KEY: string;
      ACCOUNT2_PRIVATE_KEY: string;
      ETHERSCAN_API_KEY: string;
    }
  }
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  namedAccounts: {
    firstAccount: 0,
    secondAccount: 1,
  },
  mocha: {
    timeout: 600000
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [
        process.env.ACCOUNT1_PRIVATE_KEY,
        process.env.ACCOUNT2_PRIVATE_KEY,
      ],
      timeout: 600000,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },

  defaultNetwork: "hardhat",
  
};

export default config;


// SEPOLIA_RPC_URL https://sepolia.infura.io/v3/e8822367dabc4099a9dca3c02a5df5c9

// ETHERSCAN_API_KEY    MB37J7PJIQBV7ADHT5JJHZYVI1WX8ENE1C


