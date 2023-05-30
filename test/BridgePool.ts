import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { MockProvider, solidity } from "ethereum-waffle";
import { expect } from "chai";
import chai from "chai";

chai.use(solidity);

describe("BridgePool", () => {
  let deployer: Wallet;
  let wallets: Wallet[];

  let bridgeToken: any;
  let bridgePool: any;

  beforeEach(async () => {
    const provider = new MockProvider();

    [deployer, ...wallets] = provider.getWallets();
    const walletAddresses = wallets.map((wallet) => wallet.address);

    const BridgeToken = await ethers.getContractFactory("BridgeToken");
    bridgeToken = await BridgeToken.connect(deployer).deploy(walletAddresses);

    const BridgePool = await ethers.getContractFactory("BridgePool");
    bridgePool = await BridgePool.connect(deployer).deploy(bridgeToken.address);
  });

  it("Deployment test", async () => {
    const token = await bridgePool.token();
    expect(token).to.equal(bridgeToken.address);
  });

  describe("Deposit", () => {
    it("Should be able to deposit tokens", async () => {
      const depositor = wallets[1];
      const receiver = wallets[2];

      const amountToDeposit = ethers.utils.parseEther("1000");
      const approve = await bridgeToken
        .connect(depositor)
        .approve(bridgePool.address, amountToDeposit);
      await approve.wait();

      const balanceBefore = await bridgeToken.balanceOf(depositor.address);

      const deposit = await bridgePool
        .connect(depositor)
        .deposit(amountToDeposit, receiver.address);
      await deposit.wait();

      const balanceAfter = await bridgeToken.balanceOf(depositor.address);
      expect(balanceAfter).to.equal(balanceBefore.sub(amountToDeposit));

      const bridgePoolBalance = await bridgeToken.balanceOf(bridgePool.address);
      expect(bridgePoolBalance).to.equal(amountToDeposit);
    });
  });

  describe("Stake", () => {
    it("Should be able to stake tokens", async () => {
      const staker = wallets[1];

      const amountToStake = ethers.utils.parseEther("1000");
      const approve = await bridgeToken
        .connect(staker)
        .approve(bridgePool.address, amountToStake);
      await approve.wait();

      const allowance = await bridgeToken.allowance(
        staker.address,
        bridgePool.address
      );

      expect(allowance).to.equal(amountToStake);

      const balanceBefore = await bridgeToken.balanceOf(staker.address);

      const stake = await bridgePool.connect(staker).stake(amountToStake);
      await stake.wait();

      const balanceAfter = await bridgeToken.balanceOf(staker.address);
      expect(balanceAfter).to.equal(balanceBefore.sub(amountToStake));

      const bridgePoolBalance = await bridgeToken.balanceOf(bridgePool.address);
      expect(bridgePoolBalance).to.equal(amountToStake);

      const stakedAmount = await bridgePool.stakes(staker.address);
      expect(stakedAmount).to.equal(amountToStake);

      const totalStakedAmount = await bridgePool.totalStaked();
      expect(totalStakedAmount).to.equal(amountToStake);
    });

    it("Should not be able to stake lower than limit", async () => {
      const staker = wallets[1];

      const amountToStake = ethers.utils.parseEther("1");
      const approve = await bridgeToken
        .connect(staker)
        .approve(bridgePool.address, amountToStake);
      await approve.wait();

      const balanceBefore = await bridgeToken.balanceOf(staker.address);

      await expect(bridgePool.connect(staker).stake(amountToStake)).to.be
        .reverted;

      const balanceAfter = await bridgeToken.balanceOf(staker.address);
      expect(balanceAfter).to.equal(balanceBefore);
    });
  });

  describe("Execute bridge", () => {
    it("Should be able to execute bridge", async () => {
      const staker = wallets[1];

      const amountToStake = ethers.utils.parseEther("1000");
      const approve = await bridgeToken
        .connect(staker)
        .approve(bridgePool.address, amountToStake);
      await approve.wait();

      const stake = await bridgePool.connect(staker).stake(amountToStake);
      await stake.wait();

      const depositor = wallets[2];
      const receiver = wallets[3];

      const amountToDeposit = ethers.utils.parseEther("10");
      const approveDeposit = await bridgeToken
        .connect(depositor)
        .approve(bridgePool.address, amountToDeposit);
      await approveDeposit.wait();

      const deposit = await bridgePool
        .connect(depositor)
        .deposit(amountToDeposit, receiver.address);
      await deposit.wait();

      const bridgePoolBalanceBefore = await bridgeToken.balanceOf(
        bridgePool.address
      );
      const receiverBalanceBefore = await bridgeToken.balanceOf(
        receiver.address
      );
      const stakerBalanceBefore = await bridgeToken.balanceOf(staker.address);

      const executeBridge = await bridgePool
        .connect(staker)
        .executeBridge(receiver.address, amountToDeposit);
      await executeBridge.wait();

      const bridgePoolBalanceAfter = await bridgeToken.balanceOf(
        bridgePool.address
      );
      const receiverBalanceAfter = await bridgeToken.balanceOf(
        receiver.address
      );
      const stakerBalanceAfter = await bridgeToken.balanceOf(staker.address);

      expect(bridgePoolBalanceAfter).to.equal(
        bridgePoolBalanceBefore.sub(amountToDeposit)
      );
      expect(receiverBalanceAfter).to.equal(
        receiverBalanceBefore.add(amountToDeposit.mul(95).div(100))
      );
      expect(stakerBalanceAfter).to.equal(
        stakerBalanceBefore.add(amountToDeposit.mul(5).div(100))
      );
    });

    it("Should not be able to execute bridge for amount bigger then 10% of stake portion", async () => {
      const staker = wallets[1];

      const amountToStake = ethers.utils.parseEther("1000");
      const approve = await bridgeToken
        .connect(staker)
        .approve(bridgePool.address, amountToStake);
      await approve.wait();

      const stake = await bridgePool.connect(staker).stake(amountToStake);
      await stake.wait();

      const depositor = wallets[2];
      const receiver = wallets[3];

      const amountToDeposit = ethers.utils.parseEther("101");
      const approveDeposit = await bridgeToken
        .connect(depositor)
        .approve(bridgePool.address, amountToDeposit);
      await approveDeposit.wait();

      const deposit = await bridgePool
        .connect(depositor)
        .deposit(amountToDeposit, receiver.address);
      await deposit.wait();

      await expect(
        bridgePool
          .connect(staker)
          .executeBridge(receiver.address, amountToDeposit)
      ).to.be.reverted;
    });

    it("Should not be able to execute bridge before lock period expires", async () => {
      const staker = wallets[1];

      const amountToStake = ethers.utils.parseEther("1000");
      const approve = await bridgeToken
        .connect(staker)
        .approve(bridgePool.address, amountToStake);
      await approve.wait();

      const stake = await bridgePool.connect(staker).stake(amountToStake);
      await stake.wait();

      const depositor = wallets[2];
      const receiver = wallets[3];

      const amountToDeposit = ethers.utils.parseEther("10");
      const approveDeposit = await bridgeToken
        .connect(depositor)
        .approve(bridgePool.address, amountToDeposit);
      await approveDeposit.wait();

      const deposit = await bridgePool
        .connect(depositor)
        .deposit(amountToDeposit, receiver.address);
      await deposit.wait();

      const executeBridge = await bridgePool
        .connect(staker)
        .executeBridge(receiver.address, amountToDeposit);
      await executeBridge.wait();

      await expect(
        bridgePool
          .connect(staker)
          .executeBridge(receiver.address, amountToDeposit)
      ).to.be.reverted;
    });
  });
});
