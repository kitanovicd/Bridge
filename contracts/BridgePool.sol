// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error CallerNotBridge();
error NotEnoughStake();
error AlreadyBlacklisted();
error AlreadyExecuted();
error Locked();

contract BridgePool {
    using SafeERC20 for IERC20;

    uint256 public constant LOCK_PERIOD = 1 days;
    uint256 public constant MINIMUM_STAKE_AMOUNT = 10 ether;
    uint256 public constant BRIDGE_FEE_PERCENTAGE = 5;
    uint256 public constant HUNDRED = 100;

    uint256 public lastDepositID;
    uint256 public totalStaked;
    IERC20 public token;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public blacklistVotes;
    mapping(address => uint256) public lockedUntil;
    mapping(uint256 => bool) public executedDeposits;

    event Deposit(
        uint256 indexed depostID,
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
    event ExecuteBridge(
        uint256 indexed depositID,
        address indexed node,
        address indexed receiver,
        uint256 amount
    );
    event Stake(address indexed sender, uint256 indexed amount);
    event Unstake(address indexed sender, uint256 indexed amount);
    event VoteToBlacklistNode(address indexed voter, address indexed node);

    modifier onlyBridgeNode() {
        if (stakes[msg.sender] == 0) {
            revert CallerNotBridge();
        }

        _;
    }

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount, address receiver) external {
        token.safeTransferFrom(msg.sender, address(this), amount);

        lastDepositID++;

        emit Deposit(lastDepositID, msg.sender, receiver, amount);
    }

    function executeBridge(
        uint256 originChainDepositID,
        address receiver,
        uint256 amount
    ) external onlyBridgeNode {
        if (executedDeposits[originChainDepositID]) {
            revert AlreadyExecuted();
        }

        if (lockedUntil[msg.sender] > block.timestamp) {
            revert Locked();
        }

        if (amount > stakes[msg.sender] / 10) {
            revert NotEnoughStake();
        }

        uint256 fee = (amount * BRIDGE_FEE_PERCENTAGE) / HUNDRED;
        uint256 amountAfterFee = amount - fee;

        token.safeTransfer(receiver, amountAfterFee);
        token.safeTransfer(msg.sender, fee);

        executedDeposits[originChainDepositID] = true;
        lockedUntil[msg.sender] = block.timestamp + LOCK_PERIOD;

        emit ExecuteBridge(originChainDepositID, msg.sender, receiver, amount);
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

    function unstake(uint256 amount) external {
        //Does not need onlyBridge modifier
        //If caller is not a bridge node, it will revert with NotEnoughStake
        if (amount > stakes[msg.sender]) {
            revert NotEnoughStake();
        }

        if (lockedUntil[msg.sender] > block.timestamp) {
            revert Locked();
        }

        token.safeTransfer(msg.sender, amount);

        stakes[msg.sender] -= amount;
        totalStaked -= amount;

        emit Unstake(msg.sender, amount);
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
