// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import {IERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BridgePool {
    using SafeERC20 for IERC20;

    IERC20 public token;

    event Deposit(
        address indexed sender,
        address indexed receiver,
        uint256 indexed amount
    );

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount, address receiver) external {
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposit(msg.sender, receiver, amount);
    }

    function withdraw(uint256 amount) external {
        token.transfer(msg.sender, amount);
    }
}
