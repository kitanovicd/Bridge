import hre from "hardhat";
import { ethers } from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";

async function main() {
  const networkName = hre.network.name;

  console.log("Deploying contracts to network: " + networkName + " ...");

  const BridgeToken = await ethers.getContractFactory("BridgeToken");
  // Change the arguments to the constructor of BridgeToken
  const bridgeToken = await BridgeToken.deploy([]);
  await bridgeToken.deployed();

  const BridgePool = await ethers.getContractFactory("BridgePool");
  const bridgePool = await BridgePool.deploy(bridgeToken.address);
  await bridgePool.deployed();

  const deployedContractsJson = existsSync("deployed-contracts.json")
    ? JSON.parse(readFileSync("deployed-contracts.json", "utf8"))
    : {};

  console.log("Contracts deployed to network: " + networkName);

  deployedContractsJson[networkName] = {
    bridgeToken: bridgeToken.address,
    bridgePool: bridgePool.address,
  };

  writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(deployedContractsJson, null, 2),
    { flag: "w", encoding: "utf8" }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
