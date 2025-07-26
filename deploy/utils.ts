import { run } from "hardhat";

/**
 * Contract verification helper
 * @param contractAddress Deployed contract address
 * @param args Constructor arguments
 * @param contractPath Optional: Contract path for multi-contract projects
 */
export const verify = async (
  contractAddress: string,
  args: any[],
  contractPath?: string
) => {
  try {
    await run("verify:verify", {  //执行hardhat内置的验证任务, 自动读取etherscan.apiKey
      address: contractAddress,
      constructorArguments: args,
      ...(contractPath ? { contract: contractPath } : {}), //对象展开
    });
    console.log(`Contract verified successfully: ${contractAddress}`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Verification failed:", error.message);
    }
  }
};