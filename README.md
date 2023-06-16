# Introduction

This repository contains *BridgeToken* and *BridgePool* smart contracts. Both smart contract should be deployed to Sepolia and Mumbai chains. This repository also contains script that should be executed by node. Project represents bridge (not production ready) between this two chains. After initial mint of token inside deployment transaction, token can not be minted nor burned anymore. When user wants to bridge tokens from origin to destination chain, tokens will be transfered to *BridgePool* smart contract on origin chain and will be transfered from *BridgePool* contract on destination chain to receiving address. Bridging is done by node. To become node one must stake *BridgeToken* on *BridgePool* contract.

## BridgeToken

Simple *ERC20* token with fixed supply that is initialy minted in deployment transaction. Initial supply is minted when smart contract is deployed. Initial supply represents total supply and can not be increased or decreased.

## BridgePool

The *BridgePool* contract implements a bridge pool that allows users to deposit tokens on one blockchain and execute a bridge transfer to receive the equivalent tokens on the other blockchain. It also supports staking and voting to blacklist bridge nodes. Inside smart contract lock period is defined. When node executes a bridge transfer he can not execute another bridge transfer until lock period expires. Purpose of this functionality is to protect tokens on *BridgePool* smart contract from nodes. Also node can not execute bridge transfers if bridging amount is bigger then 10% of staked amount of node. With this two protections smart contract is protected from *bad* nodes. If one node executes fake transfer he will steal maximum of 10% tokens but will lose whole stake portion. Node can lose stake portion if other nodes vote to blacklist him. When node successfully executes bridging transaction he is rewarded with 5% of bridging amount.

### Functions
```cpp
function deposit(uint256 amount, address receiver)
```
Allows a user to deposit tokens into the bridge pool, specifying the amount and the receiver's address. First, BrigdePool must have allowance to spend given amount of BridgeToken.

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

## Setup and usage

1. Clone the repository
```bash
git clone https://github.com/kitanovicd/Bridge.git
```
2. Install dependencies
```bash
cd bridge
npm install
```
3. Configure environment variables
* Create a .env file in the project root.
* Set the following variables:

```makefile
SEPOLIA_RPC_URL=<Sepolia RPC URL>
MUMBAI_RPC_URL=<Mumbai RPC URL>
SEPOLIA_PRIVATE_KEY=<Sepolia private key>
MUMBAI_PRIVATE_KEY=<Mumbai private key>
```

4. Deploy the contracts<br>
* Change constructor parameters in line 12 in *deploy.ts*.

```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network mumbai
```

5. Run the scripts
* To stake the tokens and become node:
```bash
npx hardhat run ./scripts/stake.ts
```
* To listen for deposit events and trigger bridge transfers:
```bash
npx hardhat run ./scripts/bridge.ts
```

