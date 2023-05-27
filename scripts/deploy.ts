import hre from "hardhat";
import { ethers } from "hardhat";
import { writeFileSync, readFileSync } from "fs";

async function main() {
  const networkName = hre.network.name;

  console.log("Deploying contracts to network: " + networkName + "...");

  const BridgeToken = await ethers.getContractFactory("BridgeToken");
  const bridgeToken = await BridgeToken.deploy([]);
  await bridgeToken.deployed();

  const BridgePool = await ethers.getContractFactory("BridgePool");
  const bridgePool = await BridgePool.deploy(bridgeToken.address);
  await bridgePool.deployed();

  const deployedContracts = readFileSync("deployed-contracts.json", "utf8");
  const deployedContractsJson = JSON.parse(deployedContracts);

  console.log("Contracts deployed to network: " + networkName);

  deployedContractsJson[networkName] = {
    bridgeToken: bridgeToken.address,
    bridgePool: bridgePool.address,
  };

  writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(deployedContractsJson, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
