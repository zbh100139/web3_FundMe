const DECIMAL: bigint = 8n;                    
const INITIAL_ANSWER: bigint = 300000000000n; 
const developmentChains: string[] = ["hardhat", "localhost"];
const LOCK_TIME: number = 180;                              
const MINIMUM_VALUE: bigint = 100000000000000000000n; 
const TARGET: bigint = 1000000000000000000000n; 

interface NetworkConfig {
    [chainId: number]: {
        ethUsdDataFeed: string;
        blockConfirmations: number;
    }
}

const networkConfig: NetworkConfig = {
  11155111: { // Sepolia
    ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    blockConfirmations: 5,
  },
};

export {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    LOCK_TIME,
    MINIMUM_VALUE,
    TARGET,
    networkConfig
}