// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeToken is ERC20 {
    constructor(address[] memory holders) ERC20("BridgeToken", "BT") {
        for (uint256 i = 0; i < holders.length; i++) {
            _mint(holders[i], 10000 * 10 ** decimals());
        }
    }
}
