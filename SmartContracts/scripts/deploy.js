const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Starting TrustChain deployment...\n");
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // 1. Deploy MockNEURO
  console.log("=".repeat(60));
  console.log("1️⃣  Deploying MockNEURO Token...");
  console.log("=".repeat(60));
  
  const MockNEURO = await ethers.getContractFactory("MockNEURO");
  const mockNEURO = await MockNEURO.deploy();
  await mockNEURO.waitForDeployment();
  const neuroAddress = await mockNEURO.getAddress();
  console.log("✅ MockNEURO deployed at:", neuroAddress);

  // Mint initial supply to deployer
  const mintTx = await mockNEURO.mint(deployer.address, ethers.parseEther("1000000"));
  await mintTx.wait();
  console.log("✅ Minted 1,000,000 NEURO to deployer\n");

  // 2. Deploy ReputationSystem (Upgradeable)
  console.log("=".repeat(60));
  console.log("2️⃣  Deploying ReputationSystem (UUPS Proxy)...");
  console.log("=".repeat(60));
  
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await upgrades.deployProxy(
    ReputationSystem,
    [deployer.address],
    { initializer: "initialize", kind: "uups" }
  );
  await reputationSystem.waitForDeployment();
  const repSystemAddr = await reputationSystem.getAddress();
  console.log("✅ ReputationSystem deployed at:", repSystemAddr);
  console.log("📝 Proxy pattern: UUPS (Upgradeable)\n");

  // 3. Deploy TrustStaking (Non-upgradeable, will be set with AI Oracle)
  console.log("=".repeat(60));
  console.log("3️⃣  Deploying TrustStaking Contract...");
  console.log("=".repeat(60));
  
  const TrustStaking = await ethers.getContractFactory("TrustStaking");
  const trustStaking = await TrustStaking.deploy(
    neuroAddress,
    repSystemAddr
  );
  await trustStaking.waitForDeployment();
  const trustStakingAddr = await trustStaking.getAddress();
  console.log("✅ TrustStaking deployed at:", trustStakingAddr);
  console.log("📝 Note: AI Oracle will be set in next step\n");

  // 4. Deploy AIScoreOracle (Upgradeable)
  console.log("=".repeat(60));
  console.log("4️⃣  Deploying AIScoreOracle (UUPS Proxy)...");
  console.log("=".repeat(60));
  
  const AIScoreOracle = await ethers.getContractFactory("AIScoreOracle");
  const aiScoreOracle = await upgrades.deployProxy(
    AIScoreOracle,
    [trustStakingAddr, deployer.address],
    { initializer: "initialize", kind: "uups" }
  );
  await aiScoreOracle.waitForDeployment();
  const aiOracleAddr = await aiScoreOracle.getAddress();
  console.log("✅ AIScoreOracle deployed at:", aiOracleAddr);
  console.log("📝 Proxy pattern: UUPS (Upgradeable)\n");

  // 5. Set AI Oracle in TrustStaking
  console.log("=".repeat(60));
  console.log("5️⃣  Connecting AI Oracle to TrustStaking...");
  console.log("=".repeat(60));
  
  const setOracleTx = await trustStaking.connect(deployer).setAIOracle(aiOracleAddr);
  await setOracleTx.wait();
  console.log("✅ AI Oracle set in TrustStaking");
  
  // Verify connection
  const oracleInStaking = await trustStaking.aiOracle();
  console.log("🔗 Verification: AI Oracle in TrustStaking =", oracleInStaking);
  console.log("✓ Connection verified:", oracleInStaking === aiOracleAddr ? "PASS" : "FAIL\n");

  // 6. Deploy EscrowDispute (Upgradeable)
  console.log("=".repeat(60));
  console.log("6️⃣  Deploying EscrowDispute (UUPS Proxy)...");
  console.log("=".repeat(60));
  
  const EscrowDispute = await ethers.getContractFactory("EscrowDispute");
  const escrowDispute = await upgrades.deployProxy(
    EscrowDispute,
    [neuroAddress, trustStakingAddr, deployer.address],
    { initializer: "initialize", kind: "uups" }
  );
  await escrowDispute.waitForDeployment();
  const escrowAddr = await escrowDispute.getAddress();
  console.log("✅ EscrowDispute deployed at:", escrowAddr);
  console.log("📝 Proxy pattern: UUPS (Upgradeable)\n");

  // 7. Set EscrowDispute in TrustStaking
  console.log("=".repeat(60));
  console.log("7️⃣  Connecting EscrowDispute to TrustStaking...");
  console.log("=".repeat(60));
  
  const setEscrowTx = await trustStaking.connect(deployer).setEscrowDispute(escrowAddr);
  await setEscrowTx.wait();
  console.log("✅ EscrowDispute set in TrustStaking");
  
  // Verify connection
  const escrowInStaking = await trustStaking.escrowDispute();
  console.log("🔗 Verification: EscrowDispute in TrustStaking =", escrowInStaking);
  console.log("✓ Connection verified:", escrowInStaking === escrowAddr ? "PASS" : "FAIL\n");

  // 8. CRITICAL: Authorize TrustStaking in ReputationSystem
  console.log("=".repeat(60));
  console.log("8️⃣  Authorizing TrustStaking in ReputationSystem...");
  console.log("=".repeat(60));
  
  const authTx = await reputationSystem.connect(deployer).authorizeUpdater(trustStakingAddr);
  await authTx.wait();
  console.log("✅ TrustStaking authorized as updater in ReputationSystem");
  
  // Verify authorization
  const isAuthorized = await reputationSystem.authorizedUpdaters(trustStakingAddr);
  console.log("🔗 Verification: TrustStaking authorized =", isAuthorized);
  console.log("✓ Authorization verified:", isAuthorized ? "PASS" : "FAIL\n");

  // 9. Final Verification
  console.log("=".repeat(60));
  console.log("9️⃣  Running Final Integration Checks...");
  console.log("=".repeat(60));
  
  const stakingInOracle = await aiScoreOracle.trustStakingContract();
  console.log("✓ TrustStaking in Oracle:", stakingInOracle === trustStakingAddr ? "✅ PASS" : "❌ FAIL");
  
  const neuroInStaking = await trustStaking.neuroToken();
  console.log("✓ NEURO token in TrustStaking:", neuroInStaking === neuroAddress ? "✅ PASS" : "❌ FAIL");
  
  const repInStaking = await trustStaking.reputationSystem();
  console.log("✓ ReputationSystem in TrustStaking:", repInStaking === repSystemAddr ? "✅ PASS" : "❌ FAIL\n");

  // Summary
  console.log("=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 CONTRACT ADDRESSES:\n");
  console.log("MockNEURO Token:       ", neuroAddress);
  console.log("ReputationSystem:      ", repSystemAddr);
  console.log("TrustStaking:          ", trustStakingAddr);
  console.log("AIScoreOracle:         ", aiOracleAddr);
  console.log("EscrowDispute:         ", escrowAddr);
  
  console.log("\n📝 INTEGRATION GUIDE FOR FRONTEND:\n");
  console.log("1. Use these contract addresses in your .env file");
  console.log("2. Import the ABIs from artifacts/contracts/");
  console.log("3. Manufacturer stake function signature:");
  console.log("   manufacturerStake(productId, amount, ual, jsonLDHash)");
  console.log("4. Get UAL from your teammate's DKG node API");
  console.log("5. Calculate jsonLDHash using ethers.keccak256(jsonLDData)\n");
  
  console.log("📚 NEXT STEPS:\n");
  console.log("1. Save these addresses to your .env file");
  console.log("2. Run tests: npx hardhat test");
  console.log("3. Verify on block explorer (if mainnet/testnet)");
  console.log("4. Coordinate with teammate for DKG integration");
  console.log("5. Start frontend integration\n");

  // Return addresses for potential scripting
  return {
    mockNEURO: neuroAddress,
    reputationSystem: repSystemAddr,
    trustStaking: trustStakingAddr,
    aiScoreOracle: aiOracleAddr,
    escrowDispute: escrowAddr
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });