import { ethers } from "ethers";
import { readFileSync } from "fs";
import { abi as BridgePoolABI } from "../artifacts/contracts/BridgePool.sol/BridgePool.json";
import { abi as BridgeTokenABI } from "../artifacts/contracts/BridgeToken.sol/BridgeToken.json";
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

  const bridgeTokenAddressSepolia =
    deployedContractsJson["sepolia"]["bridgeToken"];
  const bridgeTokenAddressMumbai =
    deployedContractsJson["mumbai"]["bridgeToken"];

  let httpProviderSepolia = new ethers.providers.JsonRpcProvider(
    SEPOLIA_RPC_URL
  );
  let walletSepolia = new ethers.Wallet(
    SEPOLIA_PRIVATE_KEY!,
    httpProviderSepolia
  );
  let httpProviderMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  let walletMumbai = new ethers.Wallet(MUMBAI_PRIVATE_KEY!, httpProviderMumbai);

  const bridgeTokenSepolia = new ethers.Contract(
    bridgeTokenAddressSepolia,
    BridgeTokenABI,
    httpProviderSepolia
  );
  const bridgePoolSepolia = new ethers.Contract(
    bridgePoolAddressSepolia,
    BridgePoolABI,
    httpProviderSepolia
  );
  const bridgeTokenMumbai = new ethers.Contract(
    bridgeTokenAddressMumbai,
    BridgeTokenABI,
    httpProviderMumbai
  );
  const bridgeContractMumbai = new ethers.Contract(
    bridgePoolAddressMumbai,
    BridgePoolABI,
    httpProviderMumbai
  );

  const approveSepoliaTx = await bridgeTokenSepolia
    .connect(walletSepolia)
    .approve(bridgePoolSepolia.address, ethers.utils.parseEther("10"));
  await approveSepoliaTx.wait();

  const stakeSepoliaTx = await bridgePoolSepolia
    .connect(walletSepolia)
    .stake(ethers.utils.parseEther("10"));
  await stakeSepoliaTx.wait();

  const approveMumbaiTx = await bridgeTokenMumbai
    .connect(walletMumbai)
    .approve(bridgeContractMumbai.address, ethers.utils.parseEther("10"));
  await approveMumbaiTx.wait();

  const stakeMumbaiTx = await bridgeContractMumbai
    .connect(walletMumbai)
    .stake(ethers.utils.parseEther("10"));
  await stakeMumbaiTx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
