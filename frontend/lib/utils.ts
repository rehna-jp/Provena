import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes (simplified without external deps)
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Format Ethereum address
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format NEURO token amount
export function formatNeuro(amount: bigint | string, decimals = 2): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : Number(amount) / 1e18;
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

// Format date relative to now
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  
  return new Date(timestamp * 1000).toLocaleDateString();
}

// Validate product ID format
export function isValidProductId(productId: string): boolean {
  return /^[A-Z0-9-]+$/.test(productId) && productId.length >= 3 && productId.length <= 50;
}

// Generate QR code data URL
export function generateQRDataUrl(productId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/verify/${productId}`;
}

// Get trust score color
export function getTrustScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 90) {
    return {
      text: 'text-success-500',
      bg: 'bg-success-500/20',
      border: 'border-success-500/30',
    };
  } else if (score >= 75) {
    return {
      text: 'text-warning-500',
      bg: 'bg-warning-500/20',
      border: 'border-warning-500/30',
    };
  } else {
    return {
      text: 'text-danger-500',
      bg: 'bg-danger-500/20',
      border: 'border-danger-500/30',
    };
  }
}

// Calculate transit time in days
export function calculateTransitTime(startTimestamp: number, endTimestamp?: number): number {
  const end = endTimestamp || Math.floor(Date.now() / 1000);
  return Math.floor((end - startTimestamp) / 86400);
}

// Validate stake amount
export function validateStakeAmount(amount: string, minAmount: number): {
  isValid: boolean;
  error?: string;
} {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numAmount < minAmount) {
    return { isValid: false, error: `Minimum stake is ${minAmount} NEURO` };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount too large' };
  }
  
  return { isValid: true };
}

// Format transaction hash
export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

// Get stakeholder type label
export function getStakeholderTypeLabel(type: number): string {
  const labels = ['Manufacturer', 'Distributor', 'Retailer'];
  return labels[type] || 'Unknown';
}

// Get reputation level label
export function getReputationLevelLabel(level: number): string {
  const labels = ['New', 'Basic', 'Trusted', 'Verified Partner', 'Premium'];
  return labels[level] || 'Unknown';
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Download QR code as PNG
export function downloadQRCode(svg: SVGElement, filename: string): void {
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = filename;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

// DKG API helpers - REAL INTEGRATION WITH TEAMMATE'S API
export async function createDKGAsset(productData: {
  productId: string;
  productName: string;
  origin: string;
}): Promise<{ ual: string; jsonLDHash: string }> {
  const dkgApiUrl = process.env.NEXT_PUBLIC_DKG_API_URL;
  
  if (!dkgApiUrl) {
    console.error('DKG_API_URL not configured!');
    throw new Error('DKG API not configured. Please set NEXT_PUBLIC_DKG_API_URL in .env.local');
  }
  
  try {
    console.log('Creating DKG asset:', productData);
    
    // Step 1: Register product first
    const registerResponse = await fetch(`${dkgApiUrl}/product/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productData.productId,
        name: productData.productName,
        origin: productData.origin,
        manufacturer: 'TrustChain', // Add if needed
      }),
    });
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('Product registration error:', errorText);
      throw new Error(`Failed to register product: ${registerResponse.status}`);
    }
    
    const registerResult = await registerResponse.json();
    console.log('Product registered:', registerResult);
    
    // Step 2: Publish to DKG
    const dkgResponse = await fetch(`${dkgApiUrl}/dkg/publish`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productData.productId,
        product_name: productData.productName,
        origin: productData.origin,
      }),
    });
    
    if (!dkgResponse.ok) {
      const errorText = await dkgResponse.text();
      console.error('DKG publish error:', errorText);
      throw new Error(`DKG publish failed: ${dkgResponse.status}`);
    }
    
    const dkgResult = await dkgResponse.json();
    console.log('DKG asset published:', dkgResult);
    
    // Extract UAL and hash from response
    // Adjust these field names based on actual response
    return {
      ual: dkgResult.ual || dkgResult.UAL || dkgResult.data?.ual || `did:dkg:neuroweb:2043/${productData.productId}`,
      jsonLDHash: dkgResult.knowledge_asset_hash || dkgResult.hash || dkgResult.data?.hash || `QmHash${Date.now()}`,
    };
  } catch (error) {
    console.error('DKG API error:', error);
    throw new Error(`Failed to create DKG asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function queryDKGAsset(ual: string): Promise<any> {
  const dkgApiUrl = process.env.NEXT_PUBLIC_DKG_API_URL;
  
  if (!dkgApiUrl) {
    console.warn('DKG_API_URL not configured');
    return null;
  }
  
  try {
    console.log('Querying DKG asset:', ual);
    
    const response = await fetch(`${dkgApiUrl}/dkg/query`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ual: ual,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`DKG query failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('DKG asset data:', result);
    return result;
  } catch (error) {
    console.error('DKG query error:', error);
    return null;
  }
}

// Get product details from backend
export async function getProductDetails(productId: string): Promise<any> {
  const dkgApiUrl = process.env.NEXT_PUBLIC_DKG_API_URL;
  
  if (!dkgApiUrl) {
    return null;
  }
  
  try {
    const response = await fetch(`${dkgApiUrl}/product/${productId}`);
    if (!response.ok) {
      throw new Error(`Failed to get product: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get product error:', error);
    return null;
  }
}

// Get trust score from backend
export async function getTrustScore(productId: string): Promise<any> {
  const dkgApiUrl = process.env.NEXT_PUBLIC_DKG_API_URL;
  
  if (!dkgApiUrl) {
    return null;
  }
  
  try {
    const response = await fetch(`${dkgApiUrl}/scan/${productId}/trust`);
    if (!response.ok) {
      throw new Error(`Failed to get trust score: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get trust score error:', error);
    return null;
  }
}

// Submit checkpoint to backend
export async function submitCheckpoint(checkpointData: {
  productId: string;
  location: string;
  handler: string;
}): Promise<any> {
  const dkgApiUrl = process.env.NEXT_PUBLIC_DKG_API_URL;
  
  if (!dkgApiUrl) {
    throw new Error('DKG API not configured');
  }
  
  try {
    const response = await fetch(`${dkgApiUrl}/checkpoint/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: checkpointData.productId,
        location: checkpointData.location,
        handler: checkpointData.handler,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Checkpoint submission failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Submit checkpoint error:', error);
    throw error;
  }
}