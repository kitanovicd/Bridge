// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeToken is ERC20 {
    uint256 public constant MINT_AMOUNT_PER_USER = 10000;

    constructor(address[] memory holders) ERC20("BridgeToken", "BT") {
        for (uint256 i = 0; i < holders.length; i++) {
            _mint(holders[i], MINT_AMOUNT_PER_USER * 10 ** decimals());
        }
    }
}
