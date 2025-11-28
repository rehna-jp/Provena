'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { Truck, Loader2, CheckCircle, AlertCircle, Search, Zap } from 'lucide-react';
import { CONTRACTS, TRUST_STAKING_ABI, ERC20_ABI } from '@/lib/contracts';

export default function DistributorDashboard() {
  const { address, isConnected } = useAccount();
  const [productId, setProductId] = useState('');
  const [stakeAmount, setStakeAmount] = useState('50');
  const [step, setStep] = useState<'form' | 'approving' | 'staking' | 'success'>('form');

  const { data: stakeholder } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'stakeholders',
    args: address ? [address] : undefined,
  });

  const { writeContract: registerStakeholder, isPending: isRegistering } = useWriteContract();
  const { writeContract: approveTokens, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: stakeProduct, data: stakeHash, isPending: isStaking } = useWriteContract();
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });

  const isRegistered = stakeholder?.[3];

  const handleRegister = async () => {
    try {
      registerStakeholder({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'registerStakeholder',
        args: [1],
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return alert('Please enter product ID');

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

  useEffect(() => {
    if (approveHash && !isApproveConfirming && !isApproving && step === 'approving') {
      setStep('staking');
      stakeProduct({
        address: CONTRACTS.TRUST_STAKING,
        abi: TRUST_STAKING_ABI,
        functionName: 'distributorStake',
        args: [productId, parseEther(stakeAmount)],
      });
    }
  }, [approveHash, isApproveConfirming, isApproving, step, productId, stakeAmount]);

  useEffect(() => {
    if (isStakeSuccess && step === 'staking') setStep('success');
  }, [isStakeSuccess, step]);

  // 💎 Card wrapper for consistent glassmorphism style
  const Card: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="glass-dark p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">{children}</div>
  );

  if (!isConnected)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card>
          <Truck className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Distributor Portal</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to register checkpoints
          </p>
        </Card>
      </div>
    );

  if (!isRegistered)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card>
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
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
            ) : 'Register Now'}
          </button>
        </Card>
      </div>
    );

  if (step === 'success')
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-bounce" />
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
              className="block text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View Product Verification →
            </a>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-8">
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Truck className="w-8 h-8 text-cyan-400" />
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
            <label className="block text-sm font-medium mb-2">Stake Amount (NEURO)</label>
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
            <p className="text-sm text-slate-400 mt-1">Minimum: 50 NEURO. Earn 10% bonus if trust score ≥ 90</p>
          </div>

          <button type="submit" disabled={step !== 'form'} className="btn-primary w-full">
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
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">💡 Distributor Guidelines:</h3>
        <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
          <li>Scan or enter the product ID when it arrives at your facility</li>
          <li>Stake NEURO tokens to verify you're handling the product</li>
          <li>AI agents will verify your checkpoint automatically</li>
          <li>Earn 10% bonus if the product maintains high trust score</li>
          <li>Build reputation for future transactions</li>
        </ol>
      </Card>
    </div>
  );
}
