'use client';

import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Shield, Package, CheckCircle, AlertTriangle, Clock, MapPin, User } from 'lucide-react';
import { CONTRACTS, TRUST_STAKING_ABI } from '@/lib/contracts';
import { TrustScore } from '@/components/TrustScore';
import { SupplyChainTimeline } from '@/components/SupplyChainTimeline';
import { BlockchainProof } from '@/components/BlockchainProof';

export default function VerifyProduct() {
  const params = useParams();
  const productId = params.productId as string;

  // Fetch product metadata
  const { data: productMeta, isLoading: isLoadingMeta } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'getProductMeta',
    args: [productId],
  });

  // Fetch DKG data
  const { data: dkgData, isLoading: isLoadingDKG } = useReadContract({
    address: CONTRACTS.TRUST_STAKING,
    abi: TRUST_STAKING_ABI,
    functionName: 'getDKGData',
    args: [productId],
  });

  // Fetch distributors
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
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying product...</p>
        </div>
      </div>
    );
  }

  if (!productMeta || !dkgData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="card text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
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

  const [manufacturer, manufacturerStake, trustScore, isActive, rewardsDistributed, createdAt] = productMeta;
  const [ual, knowledgeAssetHash, dkgVerified, dkgTimestamp] = dkgData;

  const trustScoreNum = Number(trustScore);
  const createdDate = new Date(Number(createdAt) * 1000);

  const getStatusBadge = () => {
    if (trustScoreNum >= 90) {
      return (
        <div className="inline-flex items-center space-x-2 bg-success-500/20 text-success-400 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="font-semibold">Verified Authentic</span>
        </div>
      );
    } else if (trustScoreNum >= 75) {
      return (
        <div className="inline-flex items-center space-x-2 bg-warning-500/20 text-warning-400 px-4 py-2 rounded-full">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">Proceed with Caution</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center space-x-2 bg-danger-500/20 text-danger-400 px-4 py-2 rounded-full">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">Low Trust - Investigate</span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary-500" />
              <div className="absolute inset-0 bg-primary-500/20 blur-xl"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Product Verification</h1>
              <p className="text-slate-400">ID: {productId}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <TrustScore score={trustScoreNum} />
          </div>

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
      </div>

      {/* Trust Score Details */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Shield className="w-6 h-6 text-primary-500 mr-2" />
          AI Verification Status
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">DKG Verification</p>
            <div className="flex items-center space-x-2">
              {dkgVerified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="font-semibold text-success-400">Verified</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  <span className="font-semibold text-warning-400">Pending</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Product Status</p>
            <div className="flex items-center space-x-2">
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

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Rewards Status</p>
            <div className="flex items-center space-x-2">
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
      </div>

      {/* Supply Chain Journey */}
      <SupplyChainTimeline 
        productId={productId}
        manufacturer={manufacturer}
        distributors={distributors as `0x${string}`[] || []}
        createdAt={Number(createdAt)}
      />

      {/* Blockchain Proof */}
      <BlockchainProof 
        productId={productId}
        ual={ual}
        knowledgeAssetHash={knowledgeAssetHash}
        dkgVerified={dkgVerified}
        dkgTimestamp={Number(dkgTimestamp)}
      />

      {/* What This Means */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">What This Means</h2>
        
        {trustScoreNum >= 90 && (
          <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-success-400 mb-2">✓ High Confidence - Safe to Purchase</h3>
            <p className="text-sm text-slate-300">
              This product has passed all AI verification checks with a trust score of {trustScoreNum}/100. 
              The supply chain journey has been verified at each checkpoint, and all participants have staked tokens 
              to guarantee authenticity. You can purchase with confidence.
            </p>
          </div>
        )}

        {trustScoreNum >= 75 && trustScoreNum < 90 && (
          <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-warning-400 mb-2">⚠ Medium Confidence - Exercise Caution</h3>
            <p className="text-sm text-slate-300">
              This product has a trust score of {trustScoreNum}/100. While it has passed basic verification, 
              some anomalies were detected in the supply chain. Review the journey timeline carefully and 
              consider additional verification before purchase.
            </p>
          </div>
        )}

        {trustScoreNum < 75 && (
          <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-danger-400 mb-2">⚠ Low Confidence - Do Not Purchase</h3>
            <p className="text-sm text-slate-300">
              This product has a low trust score of {trustScoreNum}/100. Significant anomalies or fraud indicators 
              were detected by AI agents. We strongly recommend against purchasing this product. Contact the 
              manufacturer for more information or file a dispute.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="font-semibold mb-3">How We Calculate Trust Score</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <span>AI agents verify each checkpoint for impossible transit times and location spoofing</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <span>Blockchain provides immutable proof of each transaction</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <span>Stakeholder reputation and history influence the final score</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <span>DKG knowledge graph ensures data consistency across the network</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="card text-center bg-gradient-to-r from-primary-900/30 to-blue-900/30 border-primary-500/30">
        <Package className="w-12 h-12 text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Are you a manufacturer?</h2>
        <p className="text-slate-400 mb-6">
          Start building trust with your customers using blockchain verification
        </p>
        <a href="/" className="btn-primary inline-block">
          Register Your Products
        </a>
      </div>
    </div>
  );
}