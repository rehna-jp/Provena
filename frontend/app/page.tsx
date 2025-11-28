'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { Package, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { CONTRACTS, TRUST_STAKING_ABI, ERC20_ABI } from '@/lib/contracts';
import { createDKGAsset } from '@/lib/utils';

export default function ManufacturerDashboard() {
  const { address, isConnected } = useAccount();
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [createdProductId, setCreatedProductId] = useState('');
  const [step, setStep] = useState<'form' | 'creating-dkg' | 'approving' | 'staking' | 'success'>('form');
  const [dkgError, setDkgError] = useState<string>('');
  const [dkgDataState, setDkgDataState] = useState<{ ual: string; jsonLDHash: string } | null>(null);

  const { data: stakeholder } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'stakeholders',
    args: address ? [address] : undefined,
  });

  const isRegistered = stakeholder?.[3]; // isRegistered field

  const { writeContract: registerStakeholder, isPending: isRegistering } = useWriteContract();
  const { writeContract: approveTokens, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
  const { writeContract: stakeProduct, data: stakeHash, isPending: isStaking } = useWriteContract();
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });

  // ---------- Handlers ----------
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
    if (!productId || !productName || !origin) return alert('Please fill all fields');

    try {
      setStep('creating-dkg');
      setDkgError('');
      const dkgData = await createDKGAsset({ productId, productName, origin });
      setDkgDataState(dkgData);

      setStep('approving');
      const amountWei = parseEther(stakeAmount);
      approveTokens({
        address: CONTRACTS.NEURO_TOKEN,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.TRUST_STAKING, amountWei],
      });
    } catch (error) {
      setDkgError(error instanceof Error ? error.message : 'Failed to create DKG asset');
      setStep('form');
    }
  };

  // Approve → Stake
  useEffect(() => {
    if (approveHash && !isApproveConfirming && !isApproving && step === 'approving' && dkgDataState) {
      setStep('staking');
      stakeProduct({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'manufacturerStake',
        args: [productId, parseEther(stakeAmount), dkgDataState.ual, dkgDataState.jsonLDHash],
      });
    }
  }, [approveHash, isApproveConfirming, isApproving, step, dkgDataState, productId, stakeAmount, stakeProduct]);

  // Stake → Success
  useEffect(() => {
    if (isStakeSuccess && step === 'staking') {
      setStep('success');
      setCreatedProductId(productId);
    }
  }, [isStakeSuccess, step, productId]);

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

  // ---------- UI ---------- //
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="card glass-dark max-w-md mx-auto p-8 rounded-xl shadow-xl text-center animate-fade-in">
          <Package className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Provena</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to start creating verified products
          </p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="card glass-dark max-w-md mx-auto p-8 rounded-xl shadow-xl text-center animate-fade-in">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Register as Manufacturer</h2>
          <p className="text-slate-400 mb-6">You need to register before creating products</p>
          <button onClick={handleRegister} disabled={isRegistering} className="btn-primary w-full">
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
      <div className="max-w-3xl mx-auto animate-fade-in px-4 py-12">
        <div className="card glass-dark p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Product Created Successfully!</h2>
          <p className="text-slate-400">
            Product ID: <span className="text-white font-mono">{createdProductId}</span>
          </p>

          <div className="bg-white p-6 rounded-xl inline-block">
            <QRCode id="qr-code" value={verifyUrl} size={220} level="H" />
          </div>

          <div className="space-y-4">
            <button onClick={downloadQR} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Download QR Code
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
              className="block text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View Verification Page →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-slide-up px-4 py-12 space-y-8">
      {/* Form Card */}
      <div className="card glass-dark p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Create Product</h1>
        </div>

        <form onSubmit={handleCreateProduct} className="space-y-6">
          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Product ID</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g., PROD-2024-001"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Unique identifier for your product</p>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Product Name</label>
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

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Origin Location</label>
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

          {/* Stake Amount */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Stake Amount (NEURO)</label>
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
            <p className="text-xs text-slate-400 mt-1">
              Minimum: 100 NEURO. You'll get 20% bonus if trust score ≥ 90
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={step !== 'form'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {step === 'form' && 'Create Product & Stake'}
            {step === 'creating-dkg' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating DKG Asset...
              </>
            )}
            {step === 'approving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Approving Tokens...
              </>
            )}
            {step === 'staking' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Product...
              </>
            )}
          </button>

          {dkgError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {dkgError}
              </p>
              <p className="text-red-300 text-xs mt-2">Check console for details or contact your teammate</p>
            </div>
          )}
        </form>
      </div>

      {/* How it works Card */}
      <div className="card glass-dark p-6 rounded-2xl shadow-xl space-y-4 hover:shadow-2xl transition-shadow">
        <h3 className="font-semibold text-white text-lg">💡 How it works:</h3>
        <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
          <li>Stake NEURO tokens to create a verified product</li>
          <li>Product gets registered on blockchain with DKG knowledge asset</li>
          <li>QR code generated for product packaging</li>
          <li>AI agents verify authenticity at each checkpoint</li>
          <li>Earn 20% bonus if trust score reaches 90+</li>
        </ol>
      </div>
    </div>
  );
}
