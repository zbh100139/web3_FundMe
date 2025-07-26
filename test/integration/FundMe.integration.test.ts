import { ethers, deployments, getNamedAccounts, network } from "hardhat";
import { expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function() {
    this.timeout(1200000); // 20 分钟超时

    let fundMe: any;
    let firstAccount: any;

    beforeEach(async function() {
        await deployments.fixture(["fundme"]);
        const accounts = await getNamedAccounts();
        firstAccount = accounts.firstAccount;     
        const fundMeDeployment = await deployments.get("FundMe");
        //获取合约，自动返回第一个 Signer
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
      });
    
    it("fund and getFund successfully", 
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.4")});
            //等待 181 秒（模拟锁定期结束）
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            //执行提款，getFundTx表示已发送但尚未上链的交易
            const getFundTx = await fundMe.getFund()
            //拿到收据getFundReceipt
            const getFundReceipt = await getFundTx.wait()
            expect(getFundReceipt)
                .to.be.emit(fundMe, "FundWithdrawByOwner")
                .withArgs(ethers.parseEther("1"))
        }
    )

    it("fund and refund successfully", 
        async function () {
            await fundMe.fund({value: ethers.parseEther("0.1")});
            //等待 181 秒（模拟锁定期结束）
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            //执行提款，getFundTx表示已发送但尚未上链的交易（这里的交易指的是修改链上状态）
            const getFundTx = await fundMe.refund()
            //拿到收据getFundReceipt
            const getFundReceipt = await getFundTx.wait()
            expect(getFundReceipt)
                .to.be.emit(fundMe, "RefundByFunder")
                .withArgs(firstAccount, ethers.parseEther("0.1"))
        }
    )
})