//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款 (目标值通过美元标定，需要通过预言机进行转换，如果是本地测试，则使用模拟预言机)
// 4. 在锁定期内，没有达到目标值，投资人在锁定期以后退款  

contract FundMe {
    mapping(address => uint256) public fundersToAmount;

    uint256 immutable MINIMUM_VALUE;

    uint256 immutable TARGET;
    
    uint256 immutable LOCK_TIME;

    uint256 immutable DEPLOYMENTTIMESTAMP;

    AggregatorV3Interface public dataFeed;

    address public owner;

    event FundWithdrawByOwner(uint256);

    event RefundByFunder(address, uint256);

    constructor(uint256 minimumValue, uint256 target, uint256 lockTime, address dataFeedAddr) {
        MINIMUM_VALUE = minimumValue;
        TARGET = target;
        LOCK_TIME = lockTime;
        DEPLOYMENTTIMESTAMP = block.timestamp;
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
    }

    function fund() external payable {
        require(covertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < DEPLOYMENTTIMESTAMP + LOCK_TIME, "window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

    function getFund() external windowClose onlyOwner {
        require(covertEthToUsd(address(this).balance) >= TARGET, "Target is not reached");
        bool success;
        uint256 balance = address(this).balance;
        (success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed");
        emit FundWithdrawByOwner(balance);
    }

    function refund() external windowClose  {
        require(covertEthToUsd(address(this).balance) < TARGET, "Target is reached");
        require(fundersToAmount[msg.sender] != 0, "there is no fund for you");
        bool success;
        uint256 blance = fundersToAmount[msg.sender];
        (success, ) = payable(msg.sender).call{value: blance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        emit RefundByFunder(msg.sender, blance);
    }

    function covertEthToUsd(uint256 ethAmount) internal view returns (uint256) {
        (
             /* uint80 roundID */,
            int ethPrice,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return uint256(ethPrice) * ethAmount / (10 ** 8);  //以Wei为尺度表征的美元数量

    }


    modifier windowClose() {
        require(block.timestamp >= DEPLOYMENTTIMESTAMP + LOCK_TIME, "window is not closed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }


}




