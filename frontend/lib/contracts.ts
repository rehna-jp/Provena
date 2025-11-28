// Contract addresses from environment variables
export const CONTRACTS = {
  NEURO_TOKEN: process.env.NEXT_PUBLIC_NEURO_TOKEN as `0x${string}`,
  TRUST_STAKING: process.env.NEXT_PUBLIC_TRUST_STAKING as `0x${string}`,
  REPUTATION_SYSTEM: process.env.NEXT_PUBLIC_REPUTATION_SYSTEM as `0x${string}`,
  AI_ORACLE: process.env.NEXT_PUBLIC_AI_ORACLE as `0x${string}`,
  ESCROW_DISPUTE: process.env.NEXT_PUBLIC_ESCROW_DISPUTE as `0x${string}`,
};

// Simplified ABIs - only the functions we need for the frontend
export const TRUST_STAKING_ABI = [
  {
    "inputs": [
      { "internalType": "uint8", "name": "_sType", "type": "uint8" }
    ],
    "name": "registerStakeholder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_productId", "type": "string" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "string", "name": "_ual", "type": "string" },
      { "internalType": "string", "name": "_jsonLDHash", "type": "string" }
    ],
    "name": "manufacturerStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_productId", "type": "string" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "distributorStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_productId", "type": "string" }
    ],
    "name": "getProductMeta",
    "outputs": [
      { "internalType": "address", "name": "manufacturer", "type": "address" },
      { "internalType": "uint256", "name": "manufacturerStake", "type": "uint256" },
      { "internalType": "uint256", "name": "trustScore", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "bool", "name": "rewardsDistributed", "type": "bool" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "bytes32", "name": "anomaliesHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "verificationHash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_productId", "type": "string" }
    ],
    "name": "getDKGData",
    "outputs": [
      { "internalType": "string", "name": "ual", "type": "string" },
      { "internalType": "string", "name": "knowledgeAssetHash", "type": "string" },
      { "internalType": "bool", "name": "verified", "type": "bool" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_productId", "type": "string" }
    ],
    "name": "getDistributors",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "stakeholders",
    "outputs": [
      { "internalType": "uint8", "name": "sType", "type": "uint8" },
      { "internalType": "uint256", "name": "totalStaked", "type": "uint256" },
      { "internalType": "uint256", "name": "totalRewards", "type": "uint256" },
      { "internalType": "bool", "name": "isRegistered", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "manufacturer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "ProductStaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "ual", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "jsonLDHash", "type": "string" }
    ],
    "name": "KnowledgeAssetCreated",
    "type": "event"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const REPUTATION_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_stakeholder", "type": "address" }
    ],
    "name": "getReputation",
    "outputs": [
      { "internalType": "uint256", "name": "score", "type": "uint256" },
      { "internalType": "uint8", "name": "level", "type": "uint8" },
      { "internalType": "uint256", "name": "successfulProducts", "type": "uint256" },
      { "internalType": "uint256", "name": "flaggedProducts", "type": "uint256" },
      { "internalType": "uint256", "name": "lastUpdated", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;