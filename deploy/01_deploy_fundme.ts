import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { 
    MINIMUM_VALUE, 
    TARGET,
    LOCK_TIME,
    developmentChains,
    networkConfig
} from "../helper-hardhat-config"; 

import { verify } from "./utils";

const deployFundMe : DeployFunction = async (hre : HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { firstAccount } = await getNamedAccounts();
    const chainId = network.config.chainId;
    if (!chainId) throw new Error("Chain ID is undefined - check your network configuration");

    let dataFeedAddr;
    let confirmations;
    if(developmentChains.includes(network.name)) {
        const mock = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mock.address;
        confirmations = 0;
    } else {
        dataFeedAddr = networkConfig[chainId].ethUsdDataFeed;
        confirmations = networkConfig[chainId].blockConfirmations;
    }

    log("Deploying FundMe contract...");
    const FundMe = await deploy("FundMe", {
        from: firstAccount,
        log: true,
        args: [MINIMUM_VALUE, TARGET, LOCK_TIME, dataFeedAddr],
        waitConfirmations: confirmations
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(
            FundMe.address,
            [MINIMUM_VALUE, TARGET, LOCK_TIME, dataFeedAddr],
            "contracts/FundMe.sol:FundMe"
        )
    }//必须使用代理才能验证
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];

//npx hardhat deploy --network sepolia --tags fundme