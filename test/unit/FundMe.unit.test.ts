import { ethers, deployments, getNamedAccounts, network } from "hardhat";
import { expect } from "chai";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers"
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function() {
      let fundMe: any;
      let fundMeSecondAccount: any;
      let firstAccount: string;
      let secondAccount: string;
      let mockV3Aggregator: any;

      beforeEach(async function() {
        await deployments.fixture(["all"]);
        const accounts = await getNamedAccounts();
        firstAccount = accounts.firstAccount;
        secondAccount = accounts.secondAccount;
        
        const fundMeDeployment = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
        
        //获取合约，自动返回第一个 Signer
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        // 使用 secondAccount 的 signer 来连接合约
        fundMeSecondAccount = fundMe.connect(await ethers.getSigner(secondAccount));
      });
      
      it("test if the owner is msg.sender", async function() {
        await fundMe.waitForDeployment();
        expect(await fundMe.owner()).to.equal(firstAccount);
      });

      it("test if the datafeed is assigned correctly", async function() {
        await fundMe.waitForDeployment();
        expect(await fundMe.dataFeed()).to.equal(mockV3Aggregator.address);
      });

      // fund, getFund, refund
      describe("fund()", function() {
        it("window closed, value greater than minimum, fund failed", async function() {
          await time.increase(200); //时间快进200秒
          await mine(); //生成新区块使时间生效
          await expect(fundMe.fund({value: ethers.parseEther("0.1")}))
            .to.be.revertedWith("window is closed");
        });

        it("window open, value is less than minimum, fund failed", async function() {
          await expect(fundMe.fund({value: ethers.parseEther("0.01")}))
            .to.be.revertedWith("Send more ETH");
        });

        it("Window open, value is greater minimum, fund success", async function() {
          await fundMe.fund({value: ethers.parseEther("0.1")});
          const balance = await fundMe.fundersToAmount(firstAccount);
          expect(balance).to.equal(ethers.parseEther("0.1"));
        });
      });

      describe("getFund()", function() {
        
        it("not owner, window closed, target reached, getFund failed", async function() {
          await fundMe.fund({value: ethers.parseEther("1")});
          await time.increase(200);
          await mine();
          await expect(fundMeSecondAccount.getFund())
            .to.be.revertedWith("this function can only be called by owner");
        });

        it("window open, target reached, getFund failed", async function() {
          await fundMe.fund({value: ethers.parseEther("1")});
          await expect(fundMe.getFund())
            .to.be.revertedWith("window is not closed");
        });

        it("window closed, target not reached, getFund failed", async function() {
          await fundMe.fund({value: ethers.parseEther("0.1")});
          await time.increase(200);
          await mine();            
          await expect(fundMe.getFund())
            .to.be.revertedWith("Target is not reached");
        });

        it("window closed, target reached, getFund success", async function() {
          await fundMe.fund({value: ethers.parseEther("1")});
          await time.increase(200);
          await mine();   
          await expect(fundMe.getFund())
            .to.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"));
        });
      });

      describe("refund()", function() {
        beforeEach(async function() {
          await fundMe.fund({value: ethers.parseEther("0.1")});
        });

        it("window open, target not reached, funder has balance", async function() {
          await expect(fundMeSecondAccount.refund())
            .to.be.revertedWith("window is not closed");
        });

        it("window closed, target reach, funder has balance", async function() {
          await fundMe.fund({value: ethers.parseEther("1")});
          await time.increase(200);
          await mine();  
          await expect(fundMe.refund())
            .to.be.revertedWith("Target is reached");
        });

        it("window closed, target not reach, funder does not has balance", async function() {
          await time.increase(200);
          await mine();  
          await expect(fundMeSecondAccount.refund())
            .to.be.revertedWith("there is no fund for you");
        });

        it("window closed, target not reached, funder has balance", async function() {
          await time.increase(200);
          await mine();  
          await expect(fundMe.refund())
            .to.emit(fundMe, "RefundByFunder")
            .withArgs(firstAccount, ethers.parseEther("0.1"));
        });
      });
    });

    // npx hardhat test test/unit/FundMe.unit.test.ts --network localhost