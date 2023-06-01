import { ethers } from "ethers";
import { readFileSync } from "fs";
import { abi as BridgePoolABI } from "../artifacts/contracts/BridgePool.sol/BridgePool.json";
import dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;

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

  bridgePoolSepolia.on("Deposit", (depostID, sender, receiver, amount) => {
    console.log("Deposit event triggered on Sepolia blockchain");

    bridgePoolMumbai
      .connect(walletMumbai)
      .executeBridge(depostID, receiver, amount, { gasLimit: 1000000 });
  });

  bridgePoolMumbai.on("Deposit", (depostID, sender, receiver, amount) => {
    console.log("Deposit event triggered on Mumbai blockchain");

    bridgePoolSepolia
      .connect(walletSepolia)
      .executeBridge(depostID, receiver, amount, { gasLimit: 1000000 });
  });

  bridgePoolSepolia.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered on Sepolia blockchain");
  });

  bridgePoolMumbai.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered on Mumbai blockchain");
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
