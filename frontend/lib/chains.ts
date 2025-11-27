import { Chain } from 'wagmi/chains';

export const neurowebTestnet = {
  id: 20430,
  name: 'NeuroWeb Testnet',
  network: 'neuroweb-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NEURO',
    symbol: 'NEURO',
  },
  rpcUrls: {
    public: { http: ['https://lofar-testnet.origin-trail.network'] },
    default: { http: ['https://lofar-testnet.origin-trail.network'] },
  },
  blockExplorers: {
    default: { 
      name: 'Subscan', 
      url: 'https://neuroweb-testnet.subscan.io',
      apiUrl: 'https://neuroweb-testnet.api.subscan.io',
    },
  },
  testnet: true,
} as const satisfies Chain;

export const neurowebMainnet = {
  id: 2043, // Update with mainnet chain ID when available
  name: 'NeuroWeb',
  network: 'neuroweb',
  nativeCurrency: {
    decimals: 18,
    name: 'NEURO',
    symbol: 'NEURO',
  },
  rpcUrls: {
    public: { http: ['https://astrotrain.origintrail.network'] },
    default: { http: ['https://astrotrain.origintrail.network'] },
  },
  blockExplorers: {
    default: { 
      name: 'Subscan', 
      url: 'https://neuroweb.subscan.io',
      apiUrl: 'https://neuroweb.api.subscan.io',
    },
  },
  testnet: false,
} as const satisfies Chain;