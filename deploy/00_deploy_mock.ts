import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { 
    DECIMAL, 
    INITIAL_ANSWER,
    developmentChains 
} from "../helper-hardhat-config"; 

const deployMock : DeployFunction = async (hre : HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { firstAccount } = await getNamedAccounts();

    if(developmentChains.includes(network.name)){   //仅在开发链上部署mock
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            log: true,
            args: [DECIMAL, INITIAL_ANSWER],
        })
        log("Mocks deployed!");
    } else {
        log("Skipping mock deployment: Using live price feed on", network.name);
    }
};

export default deployMock;
deployMock.tags = ["all", "mock"];
