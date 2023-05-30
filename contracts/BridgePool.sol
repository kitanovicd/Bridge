// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import {IERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {console} from "hardhat/console.sol";

error CallerNotBridge();
error NotEnoughStake();
error AlreadyBlacklisted();
error Locked();

contract BridgePool {
    using SafeERC20 for IERC20;

    uint256 public constant LOCK_PERIOD = 1 days;
    uint256 public constant MINIMUM_STAKE_AMOUNT = 10 ether;
    uint256 public constant BRIDGE_FEE_PERCENTAGE = 5;
    uint256 public constant HUNDRED = 100;

    uint256 public totalStaked;
    IERC20 public token;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public blacklistVotes;
    mapping(address => uint256) public nextAvailableTimestamp;

    event Deposit(
        address indexed sender,
        address indexed receiver,
        uint256 indexed amount
    );
    event ExecuteBridge(
        address indexed node,
        address indexed receiver,
        uint256 indexed amount
    );
    event Stake(address indexed sender, uint256 indexed amount);
    event VoteToBlacklistNode(address indexed voter, address indexed node);

    modifier onlyBridgeNode() {
        if (stakes[msg.sender] == 0) {
            revert CallerNotBridge();
        }

        _;
    }

    constructor(address tokenAddress) {
        console.log("konstruktor");
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount, address receiver) external {
        console.log("dddddd");
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposit(msg.sender, receiver, amount);
    }

    function executeBridge(
        address receiver,
        uint256 amount
    ) external onlyBridgeNode {
        if (nextAvailableTimestamp[msg.sender] > block.timestamp) {
            revert Locked();
        }

        if (amount > stakes[msg.sender] / 10) {
            revert NotEnoughStake();
        }

        uint256 fee = (amount * BRIDGE_FEE_PERCENTAGE) / HUNDRED;
        uint256 amountAfterFee = amount - fee;

        token.safeTransfer(receiver, amountAfterFee);
        token.safeTransfer(msg.sender, fee);

        nextAvailableTimestamp[msg.sender] = block.timestamp + LOCK_PERIOD;

        emit ExecuteBridge(msg.sender, receiver, amount);
    }

    function stake(uint256 amount) external {
        if (amount < MINIMUM_STAKE_AMOUNT) {
            revert NotEnoughStake();
        }

        token.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] += amount;
        totalStaked += amount;

        emit Stake(msg.sender, amount);
    }

    function voteToBlacklistNode(address node) external onlyBridgeNode {
        if (stakes[node] == 0) {
            revert AlreadyBlacklisted();
        }

        blacklistVotes[node] += stakes[msg.sender];

        if (blacklistVotes[node] > totalStaked / 2) {
            stakes[node] = 0;
        }

        emit VoteToBlacklistNode(msg.sender, node);
    }
}
