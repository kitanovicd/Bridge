# Introduction

This repository contains *BridgeToken* and *BridgePool* smart contracts. Both smart contract should be deployed to Sepolia and Mumbai chains. This repository also contains script that should be executed by node. This project represents bridge (not production ready) between this two chains. After initial mint of token inside deployment transaction, token can not be minter nor burned any more. When user wants to bridge tokens from origin to destination chain tokens will be transfered to *BridgePool* smart contract on origin chain and will be transfered from *BridgePool* contract on destination chain to receiving address. Bridging is done by node. To become node one must stake *BridgeToken* on *BridgePool* contract.

## BridgeToken

Simple *ERC20* token that is initialy minted in deployment transaction. Initial supply is minted when smart contract is deployed. After initial *BridgePool* contract should maintain the same supply of token by burning bridged amount on origin chain.

## BridgePool

Smart contract responsible for monitoring bridging procedure of *BridgeToken*. When user wants to bridge token from one chain to another *BridgePool* should transfer *BridgeToken* from caller's address to his own. After taken supply is minted on destination chain *BridgePool* should burn preveously taken assets.

To install dependencies run:
<br>
&nbsp;&nbsp; _npm install_

To deploy smart contracts run:
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network sepholia_
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network mumbai_

Addresses of deployed contract should be stored inside _deployed-contracts.json_ file
