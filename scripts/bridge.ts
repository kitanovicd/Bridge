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

  const contractMumbai = new ethers.Contract(
    bridgePoolAddressMumbai,
    BridgePoolABI,
    httpProviderMumbai
  );

  bridgePoolSepolia.on("Deposit", (sender, receiver, amount) => {
    console.log("Deposit event triggered");

    contractMumbai
      .connect(walletMumbai)
      .executeBridge(receiver, amount, { gasLimit: 1000000 });
  });

  contractMumbai.on("ExecuteBridge", () => {
    console.log("ExecuteBridge event triggered");
  });
}

main();
