import { ethers } from "ethers";
import { readFileSync } from "fs";
import { abi as BridgePoolABI } from "../artifacts/contracts/BridgePool.sol/BridgePool.json";

async function main() {
  const deployedContracts = readFileSync("deployed-contracts.json", "utf8");
  const deployedContractsJson = JSON.parse(deployedContracts);

  const bridgePoolAddress = deployedContractsJson["localhost"]["bridgePool"];

  //let provider = ethers.getDefaultProvider("homestead");
  let httpProvider = new ethers.providers.JsonRpcProvider();

  const contract = new ethers.Contract(
    bridgePoolAddress,
    BridgePoolABI,
    httpProvider
  );

  console.log(contract);

  contract.on("Deposit", async () => {
    console.log("Deposit event triggered");
  });
}

main();
