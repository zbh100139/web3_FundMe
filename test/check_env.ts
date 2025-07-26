// scripts/check-env.ts
import { config as loadEnv } from "@chainlink/env-enc";

// 加载加密环境变量（和 hardhat.config.ts 一致）
loadEnv();

// 打印关键环境变量
console.log("=== 环境变量验证 ===");
console.log("SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "✅ 已加载" : "❌ 未加载");
console.log("ACCOUNT1_PRIVATE_KEY:", process.env.ACCOUNT1_PRIVATE_KEY ? "✅ 已加载" : "❌ 未加载");
console.log("ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY ? "✅ 已加载" : "❌ 未加载");

// 安全提示：私钥不应直接打印（此处仅用于测试）
if (process.env.ACCOUNT1_PRIVATE_KEY) {
  console.log("ACCOUNT1_PRIVATE_KEY 前5位:", process.env.ACCOUNT1_PRIVATE_KEY.slice(0, 5) + "...");
}