# Introduction

This repository contains BridgeToken and BridgePool smart contracts. Both smart contract should be deployed to Ethereum and Binance chains. This repository also contains script that should be executed by BRIDGE entity with node.

## BridgeToken

Simple ERC20 token that is mintable and burnable only by BridgePool contract. Initial supply is minted when smart contract is deployed. After initial BridgePool contract should maintain the same supply of token by burning bridged amount on origin chain.

## BridgePool

Smart contract responsible for monitoring bridging procedure of BridgeToken. When user wants to bridge token from one chain to another BridgePool should transfer BridgeToken from caller's address to his own.After taken supply is minted on destination chain BridgePool should burn preveously taken assets.

To install dependencies run:
<br>
&nbsp;&nbsp; _npm install_

To deploy smart contracts run:
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network sepholia_
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network mumbai_

Addresses of deployed contract should be stored inside _deployed-contracts.json_ file
