'use client';

import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Shield, Package, CheckCircle, AlertTriangle, Clock, User } from 'lucide-react';
import { CONTRACTS, TRUST_STAKING_ABI } from '@/lib/contracts';
import { TrustScore } from '@/components/Trustscore';
import { SupplyChainTimeline } from '@/components/SupplyChainTimeline';
import { BlockchainProof } from '@/components/BlockchainProof';

export default function VerifyProduct() {
  const params = useParams();
  const productId = params.productId as string;

  // Read product metadata
  const { data: productMeta, isLoading: isLoadingMeta } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'getProductMeta',
    args: [productId],
  });

  const { data: dkgData, isLoading: isLoadingDKG } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'getDKGData',
    args: [productId],
  });

  const { data: distributors } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'getDistributors',
    args: [productId],
  });

  const isLoading = isLoadingMeta || isLoadingDKG;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying product...</p>
        </div>
      </div>
    );
  }

  if (!productMeta || !dkgData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass-dark p-8 rounded-xl shadow-lg text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-slate-400 mb-6">
            No product found with ID: <span className="font-mono text-white">{productId}</span>
          </p>
          <a href="/" className="btn-primary inline-block">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Destructure product metadata
  const [manufacturer, manufacturerStake, trustScore, isActive, rewardsDistributed, createdAt] = productMeta;
  const [ual, knowledgeAssetHash, dkgVerified, dkgTimestamp] = dkgData;

  const trustScoreNum = Number(trustScore);
  const createdDate = new Date(Number(createdAt) * 1000);

  const StatusBadge = () => {
    if (trustScoreNum >= 90)
      return (
        <div className="inline-flex items-center space-x-2 bg-success-500/20 text-success-400 px-4 py-2 rounded-full animate-pulse">
          <CheckCircle className="w-4 h-4" />
          <span className="font-semibold">Verified Authentic</span>
        </div>
      );
    if (trustScoreNum >= 75)
      return (
        <div className="inline-flex items-center space-x-2 bg-warning-500/20 text-warning-400 px-4 py-2 rounded-full animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">Proceed with Caution</span>
        </div>
      );
    return (
      <div className="inline-flex items-center space-x-2 bg-danger-500/20 text-danger-400 px-4 py-2 rounded-full animate-pulse">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-semibold">Low Trust - Investigate</span>
      </div>
    );
  };

  // Simple reusable card wrapper
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`glass-dark p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-12 h-12 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Product Verification</h1>
              <p className="text-slate-400">ID: {productId}</p>
            </div>
          </div>
          <StatusBadge />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <TrustScore score={trustScoreNum} />
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="font-medium">{createdDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">Manufacturer</p>
                <p className="font-mono text-sm">{manufacturer.slice(0, 10)}...{manufacturer.slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">Stake Amount</p>
                <p className="font-medium">{formatEther(manufacturerStake)} NEURO</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Verification */}
      <Card>
        <h2 className="text-xl font-bold mb-4 flex items-center"><Shield className="w-6 h-6 text-cyan-400 mr-2" /> AI Verification Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* DKG */}
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-400 mb-1">DKG Verification</p>
            <div className="flex items-center justify-center space-x-2">
              {dkgVerified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success-400" />
                  <span className="font-semibold text-success-400">Verified</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-warning-400" />
                  <span className="font-semibold text-warning-400">Pending</span>
                </>
              )}
            </div>
          </div>

          {/* Product Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-400 mb-1">Product Status</p>
            <div className="flex items-center justify-center space-x-2">
              {isActive ? (
                <>
                  <Clock className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold text-primary-400">In Transit</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="font-semibold text-success-400">Delivered</span>
                </>
              )}
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-400 mb-1">Rewards Status</p>
            <div className="flex items-center justify-center space-x-2">
              {rewardsDistributed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="font-semibold text-success-400">Distributed</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span className="font-semibold text-slate-400">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Supply Chain & Blockchain Proof */}
      <SupplyChainTimeline
        productId={productId}
        manufacturer={manufacturer}
        distributors={distributors as `0x${string}`[] || []}
        createdAt={Number(createdAt)}
      />
      <BlockchainProof
        productId={productId}
        ual={ual}
        knowledgeAssetHash={knowledgeAssetHash}
        dkgVerified={dkgVerified}
        dkgTimestamp={Number(dkgTimestamp)}
      />

      {/* CTA */}
      <Card className="text-center bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
        <Package className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Are you a manufacturer?</h2>
        <p className="text-slate-400 mb-6">Start building trust with blockchain-verified products.</p>
        <a href="/" className="btn-primary inline-block">Register Your Products</a>
      </Card>
    </div>
  );
}
