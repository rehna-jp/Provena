'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { Truck, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { CONTRACTS, TRUST_STAKING_ABI, ERC20_ABI } from '@/lib/contracts';

export default function DistributorDashboard() {
  const { address, isConnected } = useAccount();
  const [productId, setProductId] = useState('');
  const [stakeAmount, setStakeAmount] = useState('50');
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

  // Stake as distributor
  const { 
    writeContract: stakeProduct, 
    data: stakeHash,
    isPending: isStaking 
  } = useWriteContract();

  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  const isRegistered = stakeholder?.[3];

  const handleRegister = async () => {
    try {
      registerStakeholder({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'registerStakeholder',
        args: [1], // 1 = DISTRIBUTOR
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) {
      alert('Please enter product ID');
      return;
    }

    try {
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

  // Watch for approval and then stake
  useState(() => {
    if (approveHash && !isApproveConfirming && !isApproving && step === 'approving') {
      setStep('staking');
      
      stakeProduct({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'distributorStake',
        args: [productId, parseEther(stakeAmount)],
      });
    }
  });

  // Handle success
  useState(() => {
    if (isStakeSuccess && step === 'staking') {
      setStep('success');
    }
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="card text-center max-w-md">
          <Truck className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Distributor Portal</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to register checkpoints
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
          <h2 className="text-2xl font-bold mb-2">Register as Distributor</h2>
          <p className="text-slate-400 mb-6">
            You need to register before adding checkpoints
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
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <CheckCircle className="w-20 h-20 text-success-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Checkpoint Added!</h2>
          <p className="text-slate-400 mb-8">
            Successfully staked {stakeAmount} NEURO for product: <span className="text-white font-mono">{productId}</span>
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => {
                setStep('form');
                setProductId('');
              }}
              className="btn-primary w-full"
            >
              Add Another Checkpoint
            </button>

            <a 
              href={`/verify/${productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary-400 hover:text-primary-300 transition-colors"
            >
              View Product Verification →
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
          <Truck className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold">Add Checkpoint</h1>
        </div>

        <form onSubmit={handleStake} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product ID</label>
            <div className="relative">
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="e.g., PROD-2024-001"
                className="input-field pr-10"
                disabled={step !== 'form'}
                required
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 mt-1">Enter the product ID you're handling</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stake Amount (NEURO)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="50"
              min="50"
              step="1"
              className="input-field"
              disabled={step !== 'form'}
              required
            />
            <p className="text-sm text-slate-400 mt-1">
              Minimum: 50 NEURO. You'll get 10% bonus if trust score ≥ 90
            </p>
          </div>

          <button
            type="submit"
            disabled={step !== 'form'}
            className="btn-primary w-full"
          >
            {step === 'form' && 'Add Checkpoint & Stake'}
            {step === 'approving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Approving Tokens...
              </>
            )}
            {step === 'staking' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Adding Checkpoint...
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="font-semibold mb-2">💡 Distributor Guidelines:</h3>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li>Scan or enter the product ID when it arrives at your facility</li>
            <li>Stake NEURO tokens to verify you're handling the product</li>
            <li>AI agents will verify your checkpoint automatically</li>
            <li>Earn 10% bonus if the product maintains high trust score</li>
            <li>Build reputation for future transactions</li>
          </ol>
        </div>
      </div>
    </div>
  );
}