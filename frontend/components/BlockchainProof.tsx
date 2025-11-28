'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, Database, Shield, Link2 } from 'lucide-react';

interface BlockchainProofProps {
  productId: string;
  ual: string;
  knowledgeAssetHash: string;
  dkgVerified: boolean;
  dkgTimestamp: number;
}

export function BlockchainProof({ 
  productId, 
  ual, 
  knowledgeAssetHash, 
  dkgVerified,
  dkgTimestamp 
}: BlockchainProofProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const explorerUrl = 'https://neuroweb-testnet.subscan.io';
  const dkgExplorerUrl = `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(ual)}`;

  return (
    <div className="card animate-fade-in space-y-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Database className="w-6 h-6 text-primary-500 mr-2" />
        Blockchain Proof
      </h2>

      <div className="space-y-4">
        {/* DKG UAL */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-primary-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-primary-400" />
              <span className="font-semibold">DKG Universal Asset Locator</span>
            </div>
            {dkgVerified && (
              <span className="text-xs bg-success-500/20 text-success-400 px-2 py-1 rounded-full flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 font-mono text-sm">
            <span className="text-slate-300 truncate flex-1">{ual}</span>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => copyToClipboard(ual, 'ual')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy UAL"
              >
                {copiedField === 'ual' ? (
                  <Check className="w-4 h-4 text-success-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={dkgExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-primary-400 transition-colors"
                title="View in DKG Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            Unique identifier for this product in the OriginTrail Decentralized Knowledge Graph
          </p>
        </div>

        {/* Knowledge Asset Hash */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-primary-500 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Knowledge Asset Hash</span>
          </div>
          
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 font-mono text-sm">
            <span className="text-slate-300 truncate flex-1">{knowledgeAssetHash}</span>
            <button
              onClick={() => copyToClipboard(knowledgeAssetHash, 'hash')}
              className="text-slate-400 hover:text-white transition-colors ml-4"
              title="Copy Hash"
            >
              {copiedField === 'hash' ? (
                <Check className="w-4 h-4 text-success-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            Cryptographic hash of the product's knowledge graph data (JSON-LD format)
          </p>
        </div>

        {/* Product ID */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-primary-500 transition-all">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">Product ID</span>
          </div>
          
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 font-mono text-sm">
            <span className="text-slate-300">{productId}</span>
            <button
              onClick={() => copyToClipboard(productId, 'productId')}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy Product ID"
            >
              {copiedField === 'productId' ? (
                <Check className="w-4 h-4 text-success-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            Unique identifier used across all systems
          </p>
        </div>

        {/* DKG Timestamp */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-primary-500 transition-all">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">DKG Registration Time</p>
              <p className="font-mono text-sm text-slate-200">{formatTimestamp(dkgTimestamp)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Blockchain Network</p>
              <p className="font-medium text-sm text-slate-200 flex items-center">
                NeuroWeb Testnet
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary-400 hover:text-primary-300"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-primary-400 mb-2 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          What is Blockchain Proof?
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          All product data is stored on <strong>NeuroWeb blockchain</strong> using the{' '}
          <strong>OriginTrail Decentralized Knowledge Graph (DKG)</strong>. This creates an 
          immutable, tamper-proof record that can be independently verified by anyone. The UAL 
          serves as a permanent link to this data, ensuring transparency and authenticity 
          throughout the supply chain.
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://docs.origintrail.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors inline-flex items-center"
          >
            Learn about DKG
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
          <a
            href="https://neuroweb.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors inline-flex items-center"
          >
            About NeuroWeb
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
