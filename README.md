# Introduction

This repository contains *BridgeToken* and *BridgePool* smart contracts. Both smart contract should be deployed to Sepolia and Mumbai chains. This repository also contains script that should be executed by node. Project represents bridge (not production ready) between this two chains. After initial mint of token inside deployment transaction, token can not be minted nor burned anymore. When user wants to bridge tokens from origin to destination chain, tokens will be transfered to *BridgePool* smart contract on origin chain and will be transfered from *BridgePool* contract on destination chain to receiving address. Bridging is done by node. To become node one must stake *BridgeToken* on *BridgePool* contract.

## BridgeToken

Simple *ERC20* token that is initialy minted in deployment transaction. Initial supply is minted when smart contract is deployed. Initial supply represents total supply and can not be increased or decreased.

## BridgePool

The BridgePool contract implements a bridge pool that allows users to deposit tokens on one blockchain and execute a bridge transfer to receive the equivalent tokens on the other blockchain. It also supports staking and voting to blacklist bridge nodes.

### Functions
*deposit(uint256 amount, address receiver)*: Allows a user to deposit tokens into the bridge pool, specifying the amount and the receiver's address.
*executeBridge(uint256 originChainDepositID, address receiver, uint256 amount)*: Executes a bridge transfer from the other blockchain to the current blockchain. Only bridge nodes can call this function.
*stake(uint256 amount)*: Stakes tokens in the bridge pool to become a bridge node.
*unstake(uint256 amount)*: Unstakes tokens from the bridge pool.
*voteToBlacklistNode(address node)*: Votes to blacklist a bridge node.
To install dependencies run:
<br>
&nbsp;&nbsp; _npm install_

To deploy smart contracts run:
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network sepholia_
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network mumbai_

Addresses of deployed contract should be stored inside _deployed-contracts.json_ file
