import { ethers } from "ethers";
import { readFileSync } from "fs";
import { abi as BridgePoolABI } from "../artifacts/contracts/BridgePool.sol/BridgePool.json";

async function main() {
  const deployedContracts = readFileSync("deployed-contracts.json", "utf8");
  const deployedContractsJson = JSON.parse(deployedContracts);

  const bridgePoolAddressSepolia = deployedContractsJson["sepolia"]["bridgePool"];
  const bridgePoolAddressMumbai = deployedContractsJson["mumbai"]["bridgePool"];

  let httpProviderSepolia = new ethers.providers.JsonRpcProvider("https://rpc2.sepolia.org");
  let walletSepolia = new ethers.Wallet("", httpProviderSepolia)

  const contractSepolia = new ethers.Contract(
    bridgePoolAddressSepolia,
    BridgePoolABI,
    httpProviderSepolia
  );

  let httpProviderMumbai = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
  let walletMumbai = new ethers.Wallet("", httpProviderMumbai)

  const contractMumbai = new ethers.Contract(
    bridgePoolAddressMumbai,
    BridgePoolABI,
    httpProviderMumbai
  );

  contractSepolia.on("Deposit", (sender, receiver, amount) => {
    console.log("Deposit event triggered");
    contractMumbai.connect(walletMumbai).executeBridge(receiver, amount, {gasLimit: 1000000});
  });

  contractMumbai.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered");
  });
}

main();
