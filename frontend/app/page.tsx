'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Package, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { CONTRACTS, TRUST_STAKING_ABI, ERC20_ABI } from '@/lib/contracts';

export default function ManufacturerDashboard() {
  const { address, isConnected } = useAccount();
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [createdProductId, setCreatedProductId] = useState('');
  const [step, setStep] = useState<'form' | 'approving' | 'staking' | 'success'>('form');

  // Read stakeholder info
  const { data: stakeholder } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'stakeholders',
    args: address ? [address] : undefined,
  });

  // Register stakeholder
  const { writeContract: registerStakeholder, isPending: isRegistering } = useWriteContract();

  // Approve NEURO tokens
  const { 
    writeContract: approveTokens, 
    data: approveHash,
    isPending: isApproving 
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Stake product
  const { 
    writeContract: stakeProduct, 
    data: stakeHash,
    isPending: isStaking 
  } = useWriteContract();

  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  const isRegistered = stakeholder?.[3]; // isRegistered field

  const handleRegister = async () => {
    try {
      registerStakeholder({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'registerStakeholder',
        args: [0], // 0 = MANUFACTURER
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !productName || !origin) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Step 1: Approve tokens
      setStep('approving');
      const amountWei = parseEther(stakeAmount);
      
      approveTokens({
        address: CONTRACTS.NEURO_TOKEN,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.TRUST_STAKING, amountWei],
      });

    } catch (error) {
      console.error('Error:', error);
      setStep('form');
    }
  };

  // Watch for approval confirmation and then stake
  useState(() => {
    if (approveHash && !isApproveConfirming && !isApproving && step === 'approving') {
      setStep('staking');
      
      // TODO: Get UAL and jsonLDHash from your teammate's DKG API
      // For now, using mock data
      const mockUAL = `did:dkg:neuroweb:2043/${productId}`;
      const mockHash = `QmHash${Date.now()}`;

      stakeProduct({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'manufacturerStake',
        args: [productId, parseEther(stakeAmount), mockUAL, mockHash],
      });
    }
  });

  // Handle success
  useState(() => {
    if (isStakeSuccess && step === 'staking') {
      setStep('success');
      setCreatedProductId(productId);
    }
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `trustchain-${productId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="card text-center max-w-md">
          <Package className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to TrustChain</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to start creating verified products
          </p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="card text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Register as Manufacturer</h2>
          <p className="text-slate-400 mb-6">
            You need to register before creating products
          </p>
          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className="btn-primary w-full"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Registering...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    const verifyUrl = `${window.location.origin}/verify/${createdProductId}`;
    
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <CheckCircle className="w-20 h-20 text-success-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Product Created Successfully!</h2>
          <p className="text-slate-400 mb-8">
            Product ID: <span className="text-white font-mono">{createdProductId}</span>
          </p>

          <div className="bg-white p-8 rounded-xl mb-6 inline-block">
            <QRCode
              id="qr-code"
              value={verifyUrl}
              size={256}
              level="H"
            />
          </div>

          <div className="space-y-4">
            <button onClick={downloadQR} className="btn-primary w-full">
              <Download className="w-4 h-4 inline mr-2" />
              Download QR Code
            </button>
            
            <button 
              onClick={() => {
                setStep('form');
                setProductId('');
                setProductName('');
                setOrigin('');
                setCreatedProductId('');
              }}
              className="btn-secondary w-full"
            >
              Create Another Product
            </button>

            <a 
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary-400 hover:text-primary-300 transition-colors"
            >
              View Verification Page →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Package className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold">Create Product</h1>
        </div>

        <form onSubmit={handleCreateProduct} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product ID</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g., PROD-2024-001"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
            <p className="text-sm text-slate-400 mt-1">Unique identifier for your product</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Organic Coffee Beans"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Origin Location</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Factory A, Shanghai, China"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stake Amount (NEURO)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="100"
              min="100"
              step="1"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
            <p className="text-sm text-slate-400 mt-1">
              Minimum: 100 NEURO. You'll get 20% bonus if trust score ≥ 90
            </p>
          </div>

          <button
            type="submit"
            disabled={step !== 'form'}
            className="btn-primary w-full"
          >
            {step === 'form' && 'Create Product & Stake'}
            {step === 'approving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Approving Tokens...
              </>
            )}
            {step === 'staking' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Creating Product...
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="font-semibold mb-2">💡 How it works:</h3>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li>Stake NEURO tokens to create a verified product</li>
            <li>Product gets registered on blockchain with DKG knowledge asset</li>
            <li>QR code generated for product packaging</li>
            <li>AI agents verify authenticity at each checkpoint</li>
            <li>Earn 20% bonus if trust score reaches 90+</li>
          </ol>
        </div>
      </div>
    </div>
  );
}