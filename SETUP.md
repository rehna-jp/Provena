# 🚀 Provena - Complete Setup & Deployment Guide

> **Last Updated:** November 2024  
> **Status:** Production-Ready with fixes applied  
> **Network:** NeuroWeb Testnet (Chain ID: 20430)

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [1. Smart Contract Deployment](#1-smart-contract-deployment)
- [2. Frontend Setup](#2-frontend-setup)
- [3. Backend Integration (DKG)](#3-backend-integration-dkg)
- [4. Testing & Verification](#4-testing--verification)
- [5. Troubleshooting](#5-troubleshooting)

---

## ⚡ Quick Start

For experienced developers, here's the fast path:

```bash
# Smart Contracts
cd SmartContracts
npm install
cp .env.example .env
# Edit .env with your PRIVATE_KEY
npx hardhat run scripts/deploy.js --network neuroweb_testnet

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with contract addresses and wallet project ID
npm run dev

# Backend (your teammate's responsibility)
# Should implement DKG API endpoints at the URL in .env.local
```

---

## ✅ Prerequisites

### System Requirements
- **Node.js**: v18+ (test with `node --version`)
- **npm**: v9+ (comes with Node.js)
- **Git**: Any recent version
- **Disk Space**: ~2GB for dependencies

### Accounts & Tokens
1. **MetaMask or Web3 Wallet**
   - Create a new wallet or use existing one
   - Save your private key securely

2. **NeuroWeb Testnet Tokens** - Free from faucet
   - Get NEURO tokens: https://neuroweb.ai/faucet
   - You need ~10 NEURO for deployment gas + testing

3. **WalletConnect Project ID** - For wallet connectivity
   - Create at: https://cloud.walletconnect.com
   - Free account required

4. **Subscan API Key** (Optional - for verification)
   - Create at: https://neuroweb-testnet.subscan.io
   - Useful for verifying contracts on explorer

---

## 1. Smart Contract Deployment

### Step 1a: Install Dependencies

```bash
cd SmartContracts
npm install
```

**Expected output:**
```
added 450 packages, and audited 451 packages in 15s
```

### Step 1b: Configure Environment

```bash
cp .env.example .env
```

**Edit `.env`:**
```bash
nano .env  # or use your editor
```

Required fields:
```
PRIVATE_KEY=your_64_character_hex_string_no_0x_prefix
# Leave other fields as-is (API key is optional)
```

**How to get your private key:**

Option A - Export from MetaMask:
1. Open MetaMask → Settings → Security & Privacy
2. Scroll down to "Export private key"
3. Enter your password
4. Copy the hex string (without `0x`)

Option B - Generate new key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ NEVER commit `.env` file to git!** It's already in `.gitignore`

### Step 1c: Verify Setup

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 6 Solidity files successfully
```

Contracts compiled:
- ✅ MockNEURO.sol
- ✅ ReputationSystem.sol
- ✅ TrustStaking.sol
- ✅ AIScoreOracle.sol
- ✅ EscrowDispute.sol
- ✅ Lock.js (example)

### Step 1d: Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network neuroweb_testnet
```

**Expected output (condensed):**
```
🚀 Starting TrustChain deployment...
📍 Deployer address: 0x...
💰 Deployer balance: 5.234 NEURO

1️⃣  Deploying MockNEURO Token...
✅ MockNEURO deployed at: 0x...

2️⃣  Deploying ReputationSystem (UUPS Proxy)...
✅ ReputationSystem deployed at: 0x...

...

🎉 DEPLOYMENT COMPLETE!

📋 CONTRACT ADDRESSES:

MockNEURO Token:       0x0000000000000000000000000000000000000001
ReputationSystem:      0x0000000000000000000000000000000000000002
TrustStaking:          0x0000000000000000000000000000000000000003
AIScoreOracle:         0x0000000000000000000000000000000000000004
EscrowDispute:         0x0000000000000000000000000000000000000005
```

**⚠️ IMPORTANT: Save all 5 contract addresses!** You need them for frontend configuration.

### Step 1e: Verify Contracts (Optional)

```bash
npx hardhat verify --network neuroweb_testnet DEPLOYED_ADDRESS
```

This allows viewing source code on Subscan explorer.

---

## 2. Frontend Setup

### Step 2a: Install Dependencies

```bash
cd ../frontend
npm install
```

**Expected output:**
```
added 180 packages, audited 182 packages in 8s
```

### Step 2b: Create Environment File

```bash
cp .env.example .env.local
```

**Edit `.env.local`:**
```bash
nano .env.local
```

Required fields to update:

```env
# From WalletConnect Project
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# From SmartContracts deployment (REQUIRED!)
NEXT_PUBLIC_NEURO_TOKEN=0x0000000000000000000000000000000000000001
NEXT_PUBLIC_TRUST_STAKING=0x0000000000000000000000000000000000000003
NEXT_PUBLIC_REPUTATION_SYSTEM=0x0000000000000000000000000000000000000002
NEXT_PUBLIC_AI_ORACLE=0x0000000000000000000000000000000000000004
NEXT_PUBLIC_ESCROW_DISPUTE=0x0000000000000000000000000000000000000005

# Backend DKG API (from your teammate)
NEXT_PUBLIC_DKG_API_URL=http://localhost:8000
# Or: https://your-backend-domain.com (production)
```

### Step 2c: Run Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 16.0.4
  - Local:        http://localhost:3000

 ✓ Ready in 2.3s
```

### Step 2d: Test Frontend

1. Open browser: http://localhost:3000
2. You should see the Provena landing page
3. Click "Connect Wallet" (top right)
4. Select your wallet (MetaMask, etc.)
5. Switch network to **NeuroWeb Testnet** (Chain ID: 20430)

**Troubleshooting wallet connection:**
- Make sure MetaMask is installed
- Verify chain ID is 20430
- Check WalletConnect Project ID is set correctly

---

## 3. Backend Integration (DKG)

Your teammate's backend API provides all the endpoints needed. Here are the complete specifications:

### Product Endpoints

#### 1. Register Product
```
POST /product/register
Request: {
  product_id: "PROD-2024-001",
  name: "Coffee Beans",
  origin: "Ethiopia"
}
Response: { success: true, ...metadata }
```

#### 2. Get Product Details
```
GET /product/{product_id}
Response: { product_id, name, origin, ...details }
```

#### 3. Get Product Timeline
```
GET /product/{product_id}/timeline
Response: { events: [...], timeline: [...] }
```

### Checkpoint/Event Endpoints

#### 4. Submit Single Checkpoint
```
POST /checkpoint/submit
Request: {
  product_id: "PROD-2024-001",
  location: "Distribution Center A",
  handler: "0x...",
  timestamp: "2024-11-28T..."
}
Response: { success: true, ...event_data }
```

#### 5. Submit Multiple Checkpoints (Batch)
```
POST /checkpoint/batch
Request: {
  checkpoints: [
    { product_id, location, handler, timestamp },
    { product_id, location, handler, timestamp }
  ]
}
Response: { success: true, results: [...] }
```

### Consumer Scan Endpoints

#### 6. Get Product & AI Results
```
GET /scan/{product_id}
Response: {
  product: {...},
  ai_results: {...},
  trust_score: 85,
  ...full_data
}
```

#### 7. Get Trust Score & Breakdown
```
GET /scan/{product_id}/trust
Response: {
  trust_score: 85,
  breakdown: {
    location_verified: 90,
    timing_valid: 80,
    reputation: 85,
    ...
  }
}
```

### AI/ML Endpoints

#### 8. Validate Product Data (TensorFlow)
```
POST /ai/validate
Request: { product_data }
Response: { is_valid: true, confidence: 0.95, ...details }
```

#### 9. Anomaly Detection
```
POST /ai/analyze
Request: { product_data, timeline }
Response: { anomalies: [...], severity: "low" | "medium" | "high" }
```

#### 10. Compute Trust Score
```
POST /ai/trustscore
Request: { product_data, checkpoints, manufacturer_reputation }
Response: { score: 85, factors: {...} }
```

#### 11. Fraud Detection
```
POST /ai/fraud
Request: { product_data, checkpoints, similar_products }
Response: {
  is_fraud: false,
  fraud_score: 0.05,
  indicators: [...]
}
```

### DKG Endpoints

#### 12. Publish to DKG
```
POST /dkg/publish
Request: {
  product_id: "PROD-2024-001",
  product_name: "Coffee Beans",
  origin: "Ethiopia"
}
Response: {
  ual: "did:dkg:neuroweb:2043/...",
  knowledge_asset_hash: "QmXxxx..."
}
```

#### 13. Append Event to DKG Asset
```
POST /dkg/append
Request: {
  ual: "did:dkg:neuroweb:2043/...",
  event: {...},
  timestamp: "2024-11-28T..."
}
Response: { success: true, updated_ual: "..." }
```

#### 14. Query DKG Asset
```
POST /dkg/query
Request: { ual: "did:dkg:neuroweb:2043/..." }
Response: { asset_data: {...}, verified: true }
```

#### 15. Search DKG Assets
```
POST /dkg/search
Request: {
  product_id?: "PROD-2024-001",
  manufacturer?: "Coffee Co",
  origin?: "Ethiopia",
  tags?: ["organic", "fair-trade"]
}
Response: { results: [...], total: 5 }
```

### Backend Tech Stack (Recommended)

```
Node.js + Express
  ↓
@origintrail/dkg-client (OriginTrail SDK)
  ↓
TensorFlow.js or Python FastAPI (AI/ML)
  ↓
DKG Edge Node (http://localhost:8000)
  ↓
OriginTrail Network
```

### Example Backend Code

```javascript
// backend/routes/product.js
const express = require('express');
const { DKGClient } = require('@origintrail/dkg-client');
const router = express.Router();

const dkg = new DKGClient({
  environment: 'testnet',
  endpoint: process.env.DKG_ENDPOINT // http://localhost:8000
});

// POST /product/register
router.post('/register', async (req, res) => {
  const { product_id, name, origin } = req.body;

  try {
    // Store in database
    const product = await Product.create({
      product_id,
      name,
      origin,
      created_at: new Date()
    });

    res.json({
      success: true,
      product_id: product.product_id,
      ...product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /dkg/publish
router.post('/dkg/publish', async (req, res) => {
  const { product_id, product_name, origin } = req.body;

  try {
    const result = await dkg.asset.create({
      '@context': 'https://www.w3.org/2019/did/v1',
      '@type': 'Product',
      productId: product_id,
      name: product_name,
      origin: origin,
      createdAt: new Date().toISOString(),
    });

    res.json({
      ual: result.ual,
      knowledge_asset_hash: result.publicAssertionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /scan/:product_id
router.get('/scan/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // Get product data
    const product = await Product.findOne({ product_id: productId });
    
    // Get checkpoints/timeline
    const timeline = await Checkpoint.find({ product_id: productId });
    
    // Run AI analysis
    const aiResults = await runAIAnalysis(product, timeline);
    
    // Get trust score
    const trustScore = await calculateTrustScore(product, timeline, aiResults);

    res.json({
      product,
      timeline,
      ai_results: aiResults,
      trust_score: trustScore,
      verified: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Frontend Integration

The frontend now has helper functions for all backend endpoints in `lib/utils.ts`:

**Product Functions:**
- `createDKGAsset()` - Create and publish product
- `getProductDetails()` - Fetch product data
- `getProductTimeline()` - Get timeline events

**Checkpoint Functions:**
- `submitCheckpoint()` - Submit single event
- `submitCheckpointBatch()` - Submit multiple events

**Consumer Functions:**
- `scanProduct()` - Get full product data
- `getTrustScore()` - Get trust score

**AI Functions:**
- `validateProductData()` - Validate with TensorFlow
- `analyzeAnomalies()` - Detect anomalies
- `computeTrustScore()` - Calculate AI trust score
- `detectFraud()` - Run fraud detection

**DKG Functions:**
- `queryDKGAsset()` - Query by UAL
- `appendToDKG()` - Add event to DKG
- `searchDKG()` - Search assets

All functions handle errors properly and work with the provided environment variable `NEXT_PUBLIC_DKG_API_URL`.

---

## 4. Testing & Verification

### 4a: Test Smart Contracts

```bash
cd SmartContracts
npx hardhat test
```

**Expected output:**
```
  ReputationSystem
    ✓ should initialize stakeholder reputation
    ✓ should update reputation on success
    ✓ should calculate trust level correctly

  TrustStaking
    ✓ should register stakeholders
    ✓ should stake products
    ✓ should distribute rewards

9 passing (2s)
```

### 4b: Test Manufacturer Flow

1. Go to http://localhost:3000
2. Connect wallet (must have NEURO tokens from faucet)
3. Register as Manufacturer
4. Fill in product details:
   - Product ID: `PROD-TEST-001`
   - Product Name: `Test Coffee`
   - Origin: `Ethiopia`
   - Stake: `100`
5. Click "Create Product & Stake"
6. Approve tokens when prompted
7. Wait for transaction confirmation
8. Download QR code
9. Share verification link with others

### 4c: Test Verification Page

After creating a product:
1. Click "View Verification Page" button
2. See product details loaded from blockchain
3. Verify trust score displays correctly
4. Check supply chain timeline loads

### 4d: Test Distributor Flow

1. Open second browser with different wallet
2. Go to `/distributor` route
3. Register as Distributor
4. Enter same product ID
5. Click "Add Checkpoint & Stake"
6. Confirm transaction

---

## 5. Troubleshooting

### "Insufficient Balance" Error

**Problem:** Deployment fails with "insufficient balance"

**Solution:**
```bash
# 1. Get more testnet NEURO
# Visit: https://neuroweb.ai/faucet

# 2. Verify balance
npx hardhat run -c "
  const signer = await ethers.getSigner();
  const balance = await ethers.provider.getBalance(signer.address);
  console.log('Balance:', ethers.formatEther(balance), 'NEURO');
"

# 3. Check gas estimation
npx hardhat run scripts/deploy.js --network neuroweb_testnet (add --dry-run)
```

### "Invalid Network" Error

**Problem:** `Error: Hardhat network doesn't exist`

**Solution:**
```bash
# Make sure network name matches hardhat.config.js
npx hardhat run scripts/deploy.js --network neuroweb_testnet
# NOT --network neuroweb (missing _testnet)
```

### Wallet Won't Connect

**Problem:** MetaMask not recognizing chain

**Solution:**
```
1. Open MetaMask
2. Networks → Add Network Manually
3. Network Name: NeuroWeb Testnet
4. RPC URL: https://lofar-testnet.origin-trail.network
5. Chain ID: 20430
6. Currency: NEURO
7. Save
```

### Frontend Shows "DKG API not configured"

**Problem:** Missing `NEXT_PUBLIC_DKG_API_URL` in `.env.local`

**Solution:**
```bash
# Edit .env.local and add:
NEXT_PUBLIC_DKG_API_URL=http://localhost:3001

# Then restart dev server:
npm run dev
```

### Contract Address Type Error

**Problem:** `Error: Address is not a valid hex string`

**Solution:**
```javascript
// Make sure you have "0x" prefix in .env.local:
NEXT_PUBLIC_TRUST_STAKING=0x1234...
// NOT: 1234... (missing 0x)
```

### Hardhat Compile Fails

**Problem:** `Error: Plugin @nomicloudation/hardhat-toolbox not found`

**Solution:**
```bash
cd SmartContracts
npm install --save-dev @nomicfoundation/hardhat-toolbox
npx hardhat compile
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                  │
│    - Manufacturer Dashboard                 │
│    - Distributor Portal                     │
│    - Product Verification Page              │
│    - RainbowKit Wallet Integration          │
└──────────────────┬──────────────────────────┘
                   │
        (Wagmi + Viem)
                   │
                   ▼
┌─────────────────────────────────────────────┐
│   Smart Contracts (NeuroWeb Testnet)        │
│    - TrustStaking.sol (Main contract)       │
│    - ReputationSystem.sol (Upgradeable)     │
│    - AIScoreOracle.sol (Upgradeable)        │
│    - EscrowDispute.sol (Upgradeable)        │
│    - MockNEURO.sol (Test token)             │
└──────────────────┬──────────────────────────┘
                   │
        (Web3 Calls)
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Backend API (Your Teammate's Part)      │
│    - Product Registration                   │
│    - DKG Publishing                         │
│    - Checkpoint Submission                  │
│    - Trust Score Calculation                │
└──────────────────┬──────────────────────────┘
                   │
           (REST API Calls)
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  OriginTrail DKG (Knowledge Graph)          │
│    - Stores all product provenance          │
│    - Immutable supply chain records         │
│    - DKG Edge Node (http://localhost:8000)  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. **Deploy Smart Contracts** (Section 1)
2. **Setup Frontend** (Section 2)
3. **Backend Team**: Implement DKG API (Section 3)
4. **Run Tests** (Section 4)
5. **Deploy to Production**
   - Mainnet deployment requires NeuroWeb mainnet tokens
   - Use production DKG node URLs
   - Update smart contract verification scripts

---

## 📞 Support

### Common Issues Checklist

- [ ] Node.js v18+ installed? `node --version`
- [ ] npm v9+ installed? `npm --version`
- [ ] Private key set in `.env`? (Smart Contracts only)
- [ ] WalletConnect Project ID in `.env.local`? (Frontend only)
- [ ] Contract addresses pasted in `.env.local`? (Frontend only)
- [ ] DKG API URL configured? (Frontend only)
- [ ] MetaMask switched to NeuroWeb Testnet?
- [ ] Have testnet NEURO tokens? (from faucet)
- [ ] Dev servers running? (`npm run dev`)

### Debug Commands

```bash
# Check wallet balance
npx hardhat run scripts/check-balance.js --network neuroweb_testnet

# Test contract calls
npx hardhat run scripts/test-contracts.js --network neuroweb_testnet

# View contract state
npx hardhat console --network neuroweb_testnet

# View transaction details
# https://neuroweb-testnet.subscan.io/extrinsic/0x...
```

---

## 📚 Additional Resources

- **NeuroWeb Docs**: https://neuroweb.ai/docs
- **OriginTrail DKG**: https://docs.origintrail.io
- **Hardhat Docs**: https://hardhat.org/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Wagmi Docs**: https://wagmi.sh/docs

---

**Built with ❤️ for trusted commerce**
