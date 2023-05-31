import { ethers } from "ethers";
import { readFileSync } from "fs";
import { abi as BridgePoolABI } from "../artifacts/contracts/BridgePool.sol/BridgePool.json";

const SEPOLIA_RPC_URL = "https://rpc2.sepolia.org";
const MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com";

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY;

async function main() {
  const deployedContracts = readFileSync("deployed-contracts.json", "utf8");
  const deployedContractsJson = JSON.parse(deployedContracts);

  const bridgePoolAddressSepolia =
    deployedContractsJson["sepolia"]["bridgePool"];
  const bridgePoolAddressMumbai = deployedContractsJson["mumbai"]["bridgePool"];

  let httpProviderSepolia = new ethers.providers.JsonRpcProvider(
    SEPOLIA_RPC_URL
  );

  let walletSepolia = new ethers.Wallet(
    SEPOLIA_PRIVATE_KEY!,
    httpProviderSepolia
  );

  const bridgePoolSepolia = new ethers.Contract(
    bridgePoolAddressSepolia,
    BridgePoolABI,
    httpProviderSepolia
  );

  let httpProviderMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  let walletMumbai = new ethers.Wallet(MUMBAI_PRIVATE_KEY!, httpProviderMumbai);

  const bridgePoolMumbai = new ethers.Contract(
    bridgePoolAddressMumbai,
    BridgePoolABI,
    httpProviderMumbai
  );

  bridgePoolSepolia.on("Deposit", (sender, receiver, amount) => {
    console.log("Deposit event triggered on Sepolia blockchain");

    bridgePoolMumbai
      .connect(walletMumbai)
      .executeBridge(receiver, amount, { gasLimit: 1000000 });
  });

  bridgePoolMumbai.on("Deposit", (sender, receiver, amount) => {
    console.log("Deposit event triggered on Mumbai blockchain");

    bridgePoolSepolia
      .connect(walletSepolia)
      .executeBridge(receiver, amount, { gasLimit: 1000000 });
  });

  bridgePoolSepolia.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered on Sepolia blockchain");
  });

  bridgePoolMumbai.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered on Mumbai blockchain");
  });
}

main();
