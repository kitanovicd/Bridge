# Introduction

This repository contains *BridgeToken* and *BridgePool* smart contracts. Both smart contract should be deployed to Sepolia and Mumbai chains. This repository also contains script that should be executed by node. Project represents bridge (not production ready) between this two chains. After initial mint of token inside deployment transaction, token can not be minted nor burned anymore. When user wants to bridge tokens from origin to destination chain, tokens will be transfered to *BridgePool* smart contract on origin chain and will be transfered from *BridgePool* contract on destination chain to receiving address. Bridging is done by node. To become node one must stake *BridgeToken* on *BridgePool* contract.

## BridgeToken

Simple *ERC20* token that is initialy minted in deployment transaction. Initial supply is minted when smart contract is deployed. Initial supply represents total supply and can not be increased or decreased.

## BridgePool

The *BridgePool* contract implements a bridge pool that allows users to deposit tokens on one blockchain and execute a bridge transfer to receive the equivalent tokens on the other blockchain. It also supports staking and voting to blacklist bridge nodes. Inside smart contract lock period is defined. When node executes a bridge transfer he can not execute another bridge transfer until lock period expires. Purpose of this functionality is to protect tokens on *BridgePool* smart contract from nodes. Also node can not execute bridge transfers if bridging amount is bigger then 10% of staked amount of node. With this two protections smart contract is protected from *bad* nodes. If one node executes fake transfer he will steal maximum of 10% tokens but will lose whole stake portion which is him. Node can lose stake portion if other nodes vote to blacklist him. When node successfully executes bridging transaction he is rewarded with 5% of bridging amount.

### Functions
```cpp
function deposit(uint256 amount, address receiver)
```
Allows a user to deposit tokens into the bridge pool, specifying the amount and the receiver's address.

```cpp
function executeBridge(uint256 originChainDepositID, address receiver, uint256 amount)
```
Executes a bridge transfer from the other blockchain to the current blockchain. Only bridge nodes can call this function.

```cpp
function stake(uint256 amount)
```
Stakes tokens in the bridge pool to become a bridge node.

```cpp
function unstake(uint256 amount) Unstakes tokens from the bridge pool.
```
Unstakes tokens. Unstaked portion is send to caller.

```cpp
function voteToBlacklistNode(address node)
```
Votes to blacklist a bridge node.

To install dependencies run:
<br>
&nbsp;&nbsp; _npm install_

To deploy smart contracts run:
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network sepholia_
<br>
&nbsp;&nbsp; _npx hardhat run scripts/deploy.ts --network mumbai_

Addresses of deployed contract should be stored inside _deployed-contracts.json_ file
