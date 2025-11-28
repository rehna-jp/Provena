import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { neurowebTestnet } from './chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'TrustChain - AI-Verified Supply Chain',
  projectId,
  chains: [neurowebTestnet],
  ssr: true,
});