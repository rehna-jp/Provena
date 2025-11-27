const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

// ADDED: EIP-712 Signature Helper
async function signTrustScore(signer, productId, trustScore, anomaliesHash, verificationHash, deadline, oracleAddress, chainId) {
  const domain = {
    name: "AIScoreOracle",
    version: "1",
    chainId: chainId,
    verifyingContract: oracleAddress
  };

  const types = {
    ReportTrustScore: [
      { name: "productId", type: "string" },
      { name: "trustScore", type: "uint256" },
      { name: "anomaliesHash", type: "bytes32" },
      { name: "verificationHash", type: "bytes32" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const value = {
    productId,
    trustScore,
    anomaliesHash,
    verificationHash,
    deadline
  };

  return await signer.signTypedData(domain, types, value);
}

async function deployAll() {
  const [admin, manufacturer, distributor, retailer, aiAgent, disputer] = await ethers.getSigners();

  // Deploy MockNEURO
  const MockNEURO = await ethers.getContractFactory("MockNEURO");
  const neuro = await MockNEURO.deploy();
  await neuro.waitForDeployment();
  
  // Fund accounts
  await neuro.mint(manufacturer.address, ethers.parseEther("10000"));
  await neuro.mint(distributor.address, ethers.parseEther("5000"));
  await neuro.mint(retailer.address, ethers.parseEther("3000"));
  await neuro.mint(admin.address, ethers.parseEther("10000"));

  // Deploy ReputationSystem
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputation = await upgrades.deployProxy(
    ReputationSystem,
    [admin.address],
    { initializer: "initialize", kind: "uups" }
  );
  await reputation.waitForDeployment();

  // Deploy TrustStaking
  const TrustStaking = await ethers.getContractFactory("TrustStaking");
  const staking = await TrustStaking.deploy(
    await neuro.getAddress(),
    await reputation.getAddress()
  );
  await staking.waitForDeployment();

  // Deploy AIScoreOracle
  const AIScoreOracle = await ethers.getContractFactory("AIScoreOracle");
  const oracle = await upgrades.deployProxy(
    AIScoreOracle,
    [await staking.getAddress(), admin.address],
    { initializer: "initialize", kind: "uups" }
  );
  await oracle.waitForDeployment();

  // Set AI Oracle in TrustStaking
  await staking.connect(admin).setAIOracle(await oracle.getAddress());

  // Deploy EscrowDispute
  const EscrowDispute = await ethers.getContractFactory("EscrowDispute");
  const escrow = await upgrades.deployProxy(
    EscrowDispute,
    [await neuro.getAddress(), await staking.getAddress(), admin.address],
    { initializer: "initialize", kind: "uups" }
  );
  await escrow.waitForDeployment();

  // Set Escrow in TrustStaking
  await staking.connect(admin).setEscrowDispute(await escrow.getAddress());

  // ADDED: Authorize TrustStaking in ReputationSystem
  await reputation.connect(admin).authorizeUpdater(await staking.getAddress());

  // Authorize AI Agent
  await oracle.connect(admin).authorizeAI(aiAgent.address);

  // Get chain ID for EIP-712
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  return {
    neuro, staking, reputation, oracle, escrow,
    admin, manufacturer, distributor, retailer, aiAgent, disputer,
    chainId
  };
}

describe("COMPREHENSIVE TRUSTCHAIN TESTS", function () {
  
  describe("1. Deployment & Setup", function () {
    it("Should deploy all contracts successfully", async function () {
      const { neuro, staking, reputation, oracle, escrow } = await deployAll();
      
      expect(await neuro.getAddress()).to.be.properAddress;
      expect(await staking.getAddress()).to.be.properAddress;
      expect(await reputation.getAddress()).to.be.properAddress;
      expect(await oracle.getAddress()).to.be.properAddress;
      expect(await escrow.getAddress()).to.be.properAddress;
    });

    it("Should set AI Oracle correctly", async function () {
      const { staking, oracle } = await deployAll();
      
      const oracleAddress = await oracle.getAddress();
      expect(await staking.aiOracle()).to.equal(oracleAddress);
    });

    it("Should authorize TrustStaking in ReputationSystem", async function () {
      const { staking, reputation } = await deployAll();
      
      const stakingAddress = await staking.getAddress();
      expect(await reputation.authorizedUpdaters(stakingAddress)).to.be.true;
    });
  });

  describe("2. Stakeholder Registration", function () {
    it("Should allow manufacturer registration", async function () {
      const { staking, manufacturer } = await deployAll();
      
      await staking.connect(manufacturer).registerStakeholder(0); // MANUFACTURER
      
      const stakeholder = await staking.stakeholders(manufacturer.address);
      expect(stakeholder.isRegistered).to.be.true;
      expect(stakeholder.sType).to.equal(0);
    });

    it("Should prevent double registration", async function () {
      const { staking, manufacturer } = await deployAll();
      
      await staking.connect(manufacturer).registerStakeholder(0);
      
      await expect(
        staking.connect(manufacturer).registerStakeholder(0)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("3. Happy Path - High Trust Score (≥90)", function () {
    it("Should distribute bonuses for high trust scores", async function () {
      const { neuro, staking, oracle, manufacturer, distributor, aiAgent, admin, chainId } = await deployAll();
      
      const productId = "HIGH-TRUST-001";
      const ual = "did:dkg:neuroweb:31337/0xabc123";
      const jsonLDHash = "QmHash123";
      
      // Register stakeholders
      await staking.connect(manufacturer).registerStakeholder(0);
      await staking.connect(distributor).registerStakeholder(1);
      
      // Approve tokens
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      await neuro.connect(distributor).approve(await staking.getAddress(), ethers.parseEther("100"));
      
      // Manufacturer stakes
      await staking.connect(manufacturer).manufacturerStake(
        productId, 
        ethers.parseEther("100"),
        ual,
        jsonLDHash
      );
      
      // Distributor stakes
      await staking.connect(distributor).distributorStake(productId, ethers.parseEther("50"));

      // Get balances before reward distribution
      const manuBalanceBefore = await neuro.balanceOf(manufacturer.address);
      const distBalanceBefore = await neuro.balanceOf(distributor.address);

      // AI reports high score (95)
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const anomaliesHash = ethers.ZeroHash;
      const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("verified"));
      
      const signature = await signTrustScore(
        aiAgent,
        productId,
        95,
        anomaliesHash,
        verificationHash,
        deadline,
        await oracle.getAddress(),
        chainId
      );

      await oracle.connect(aiAgent).reportTrustScore(
        productId,
        95,
        anomaliesHash,
        verificationHash,
        deadline,
        signature
      );

      // CRITICAL FIX: Fund the staking contract with enough tokens for rewards
      const stakingAddress = await staking.getAddress();
      await neuro.mint(stakingAddress, ethers.parseEther("1000")); // Add extra tokens for bonuses

      // Distribute rewards
      await staking.connect(admin).distributeRewards(productId);

      // Check balances after
      const manuBalanceAfter = await neuro.balanceOf(manufacturer.address);
      const distBalanceAfter = await neuro.balanceOf(distributor.address);

      // Manufacturer should get 120% (100 + 20% bonus)
      const expectedManuReward = ethers.parseEther("120");
      expect(manuBalanceAfter - manuBalanceBefore).to.equal(expectedManuReward);

      // Distributor should get 110% (50 + 10% bonus)
      const expectedDistReward = ethers.parseEther("55");
      expect(distBalanceAfter - distBalanceBefore).to.equal(expectedDistReward);
    });
  });

  describe("4. Medium Trust Score (75-89)", function () {
    it("Should return stakes without bonuses for medium scores", async function () {
      const { neuro, staking, oracle, manufacturer, distributor, aiAgent, admin, chainId } = await deployAll();
      
      const productId = "MEDIUM-TRUST-001";
      const ual = "did:dkg:neuroweb:31337/0xdef456";
      const jsonLDHash = "QmHash456";
      
      // Register and stake
      await staking.connect(manufacturer).registerStakeholder(0);
      await staking.connect(distributor).registerStakeholder(1);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      await neuro.connect(distributor).approve(await staking.getAddress(), ethers.parseEther("100"));
      
      await staking.connect(manufacturer).manufacturerStake(productId, ethers.parseEther("100"), ual, jsonLDHash);
      await staking.connect(distributor).distributorStake(productId, ethers.parseEther("50"));

      const manuBalanceBefore = await neuro.balanceOf(manufacturer.address);
      const distBalanceBefore = await neuro.balanceOf(distributor.address);

      // AI reports medium score (80)
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const signature = await signTrustScore(
        aiAgent,
        productId,
        80,
        ethers.ZeroHash,
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        await oracle.getAddress(),
        chainId
      );

      await oracle.connect(aiAgent).reportTrustScore(
        productId,
        80,
        ethers.ZeroHash,
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        signature
      );

      // Distribute rewards
      await staking.connect(admin).distributeRewards(productId);

      const manuBalanceAfter = await neuro.balanceOf(manufacturer.address);
      const distBalanceAfter = await neuro.balanceOf(distributor.address);

      // Should get back exactly what they staked (no bonuses)
      expect(manuBalanceAfter - manuBalanceBefore).to.equal(ethers.parseEther("100"));
      expect(distBalanceAfter - distBalanceBefore).to.equal(ethers.parseEther("50"));
    });
  });

  describe("5. Low Trust Score (<75)", function () {
    it("Should hold funds for low trust scores", async function () {
      const { neuro, staking, oracle, manufacturer, aiAgent, admin, chainId } = await deployAll();
      
      const productId = "LOW-TRUST-001";
      const ual = "did:dkg:neuroweb:31337/0xghi789";
      const jsonLDHash = "QmHash789";
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      await staking.connect(manufacturer).manufacturerStake(productId, ethers.parseEther("100"), ual, jsonLDHash);

      const manuBalanceBefore = await neuro.balanceOf(manufacturer.address);

      // AI reports low score (70)
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const signature = await signTrustScore(
        aiAgent,
        productId,
        70,
        ethers.keccak256(ethers.toUtf8Bytes("fraud-detected")),
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        await oracle.getAddress(),
        chainId
      );

      await oracle.connect(aiAgent).reportTrustScore(
        productId,
        70,
        ethers.keccak256(ethers.toUtf8Bytes("fraud-detected")),
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        signature
      );

      // Distribute rewards
      await staking.connect(admin).distributeRewards(productId);

      const manuBalanceAfter = await neuro.balanceOf(manufacturer.address);

      // Manufacturer should NOT get funds back (held for disputes)
      expect(manuBalanceAfter).to.equal(manuBalanceBefore);
    });
  });

  describe("6. Error Scenarios", function () {
    it("Should prevent unauthorized AI reporting", async function () {
      const { oracle, manufacturer, chainId } = await deployAll();
      
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      await expect(
        oracle.connect(manufacturer).reportTrustScore(
          "test",
          90,
          ethers.ZeroHash,
          ethers.ZeroHash,
          deadline,
          "0x00"
        )
      ).to.be.revertedWith("Not authorized AI");
    });

    it("Should prevent double product registration", async function () {
      const { neuro, staking, manufacturer } = await deployAll();
      
      const productId = "DUPLICATE-001";
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("300"));
      
      await staking.connect(manufacturer).manufacturerStake(
        productId,
        ethers.parseEther("100"),
        "ual1",
        "hash1"
      );
      
      await expect(
        staking.connect(manufacturer).manufacturerStake(
          productId,
          ethers.parseEther("100"),
          "ual2",
          "hash2"
        )
      ).to.be.revertedWith("Product exists");
    });

    it("Should reject empty product ID", async function () {
      const { neuro, staking, manufacturer } = await deployAll();
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      
      await expect(
        staking.connect(manufacturer).manufacturerStake(
          "",
          ethers.parseEther("100"),
          "ual",
          "hash"
        )
      ).to.be.revertedWith("Empty product ID");
    });

    it("Should reject empty UAL", async function () {
      const { neuro, staking, manufacturer } = await deployAll();
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      
      await expect(
        staking.connect(manufacturer).manufacturerStake(
          "PROD-001",
          ethers.parseEther("100"),
          "",
          "hash"
        )
      ).to.be.revertedWith("Empty UAL");
    });
  });

  describe("7. Dispute System", function () {
    it("Should allow dispute creation and resolution", async function () {
      const { neuro, staking, escrow, oracle, manufacturer, disputer, aiAgent, admin, chainId } = await deployAll();
      
      const productId = "DISPUTE-001";
      
      // Setup product with low score
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      await staking.connect(manufacturer).manufacturerStake(
        productId,
        ethers.parseEther("100"),
        "ual",
        "hash"
      );

      // AI reports low score
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const signature = await signTrustScore(
        aiAgent,
        productId,
        65,
        ethers.keccak256(ethers.toUtf8Bytes("anomalies")),
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        deadline,
        await oracle.getAddress(),
        chainId
      );

      await oracle.connect(aiAgent).reportTrustScore(
        productId,
        65,
        ethers.keccak256(ethers.toUtf8Bytes("anomalies")),
        ethers.keccak256(ethers.toUtf8Bytes("proof")),
        deadline,
        signature
      );

      // Distribute (will hold funds)
      await staking.connect(admin).distributeRewards(productId);

      // Open dispute
      await escrow.connect(disputer).openDispute(productId, "evidence-hash-ipfs");

      const dispute = await escrow.getDispute(productId);
      expect(dispute.status).to.equal(1); // OPEN

      // Resolve as fraud
      await escrow.connect(admin).resolveDispute(
        productId,
        manufacturer.address,
        ethers.parseEther("50")
      );

      const resolvedDispute = await escrow.getDispute(productId);
      // FIXED: Status is 2 for RESOLVED_FRAUD (enum: NONE=0, OPEN=1, RESOLVED_FRAUD=2, RESOLVED_HONEST=3)
      expect(resolvedDispute.status).to.equal(2); // RESOLVED_FRAUD
      expect(resolvedDispute.guiltyParty).to.equal(manufacturer.address);
    });
  });

  describe("8. DKG Integration", function () {
    it("Should store DKG data correctly", async function () {
      const { neuro, staking, manufacturer } = await deployAll();
      
      const productId = "DKG-TEST-001";
      const ual = "did:dkg:neuroweb:31337/0x123abc";
      const jsonLDHash = "QmTestHash123";
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      
      await staking.connect(manufacturer).manufacturerStake(
        productId,
        ethers.parseEther("100"),
        ual,
        jsonLDHash
      );

      const dkgData = await staking.getDKGData(productId);
      expect(dkgData.ual).to.equal(ual);
      expect(dkgData.knowledgeAssetHash).to.equal(jsonLDHash);
      expect(dkgData.verified).to.be.true;
    });

    it("Should verify DKG asset exists", async function () {
      const { neuro, staking, manufacturer } = await deployAll();
      
      const productId = "DKG-VERIFY-001";
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      
      await staking.connect(manufacturer).manufacturerStake(
        productId,
        ethers.parseEther("100"),
        "ual",
        "hash"
      );

      const isVerified = await staking.verifyDKGAsset(productId);
      expect(isVerified).to.be.true;
    });
  });

  describe("9. Reputation System Integration", function () {
    it("Should update reputation after successful delivery", async function () {
      const { neuro, staking, oracle, reputation, manufacturer, aiAgent, admin, chainId } = await deployAll();
      
      const productId = "REP-TEST-001";
      
      await staking.connect(manufacturer).registerStakeholder(0);
      await neuro.connect(manufacturer).approve(await staking.getAddress(), ethers.parseEther("200"));
      await staking.connect(manufacturer).manufacturerStake(
        productId,
        ethers.parseEther("100"),
        "ual",
        "hash"
      );

      // AI reports high score
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const signature = await signTrustScore(
        aiAgent,
        productId,
        95,
        ethers.ZeroHash,
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        await oracle.getAddress(),
        chainId
      );

      await oracle.connect(aiAgent).reportTrustScore(
        productId,
        95,
        ethers.ZeroHash,
        ethers.keccak256(ethers.toUtf8Bytes("verified")),
        deadline,
        signature
      );

      // CRITICAL FIX: Fund the staking contract with enough tokens for rewards
      const stakingAddress = await staking.getAddress();
      await neuro.mint(stakingAddress, ethers.parseEther("1000")); // Add extra tokens for bonuses

      // Distribute rewards (this should update reputation)
      await staking.connect(admin).distributeRewards(productId);

      const rep = await reputation.getReputation(manufacturer.address);
      expect(rep.successfulProducts).to.be.gt(0);
    });
  });
});