import { Wallet } from "ethers";
import { MockProvider, solidity } from "ethereum-waffle";
import { expect } from "chai";
import chai from "chai";
import { ethers } from "hardhat";

chai.use(solidity);

describe("BridgeToken", () => {
  let deployer: Wallet;
  let wallets: Wallet[];

  let bridgeToken: any;

  beforeEach(async () => {
    const provider = new MockProvider();

    [deployer, ...wallets] = provider.getWallets();
    const walletAddresses = wallets.map((wallet) => wallet.address);

    const BridgeToken = await ethers.getContractFactory("BridgeToken");
    bridgeToken = await BridgeToken.connect(deployer).deploy(walletAddresses);
  });

  it("Initial amount should be minted to all wallets in deployment transaction", async () => {
    const decimals = await bridgeToken.decimals();
    expect(decimals).to.equal(18);

    const totalSupply = await bridgeToken.totalSupply();
    expect(totalSupply).to.equal(
      ethers.utils.parseEther((wallets.length * 10000).toString())
    );

    for (let i = 0; i < wallets.length; i++) {
      const balance = await bridgeToken.balanceOf(wallets[i].address);
      expect(balance).to.equal(ethers.utils.parseEther("10000"));
    }
  });

  it("Should be able to transfer tokens", async () => {
    const sender = wallets[1];
    const receiver = wallets[2];

    const balanceBefore = await bridgeToken.balanceOf(receiver.address);

    const amountToTransfer = ethers.utils.parseEther("1000");
    const transfer = await bridgeToken
      .connect(sender)
      .transfer(receiver.address, amountToTransfer);
    await transfer.wait();

    const balanceAfter = await bridgeToken.balanceOf(receiver.address);
    expect(balanceAfter).to.equal(balanceBefore.add(amountToTransfer));
  });
});
