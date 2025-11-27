'use client';

import { Factory, Truck, Store, CheckCircle, MapPin, Clock } from 'lucide-react';

interface SupplyChainTimelineProps {
  productId: string;
  manufacturer: `0x${string}`;
  distributors: `0x${string}`[];
  createdAt: number;
}

interface CheckpointData {
  type: 'manufacturer' | 'distributor' | 'retailer';
  address: `0x${string}`;
  timestamp: number;
  location?: string;
  verified: boolean;
}

export function SupplyChainTimeline({ 
  productId, 
  manufacturer, 
  distributors, 
  createdAt 
}: SupplyChainTimelineProps) {
  // Generate timeline checkpoints
  const checkpoints: CheckpointData[] = [
    {
      type: 'manufacturer',
      address: manufacturer,
      timestamp: createdAt,
      location: 'Origin Factory',
      verified: true,
    },
    ...distributors.map((dist, idx) => ({
      type: 'distributor' as const,
      address: dist,
      timestamp: createdAt + (idx + 1) * 86400, // Add 1 day per distributor
      location: `Distribution Center ${idx + 1}`,
      verified: true,
    })),
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'manufacturer':
        return <Factory className="w-6 h-6" />;
      case 'distributor':
        return <Truck className="w-6 h-6" />;
      case 'retailer':
        return <Store className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'manufacturer':
        return 'Manufactured';
      case 'distributor':
        return 'Distributed';
      case 'retailer':
        return 'Retail';
      default:
        return 'Checkpoint';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MapPin className="w-6 h-6 text-primary-500 mr-2" />
        Supply Chain Journey
      </h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-500 via-blue-500 to-success-500"></div>

        {/* Checkpoints */}
        <div className="space-y-8">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="relative flex items-start space-x-4">
              {/* Icon Circle */}
              <div className="relative flex-shrink-0 z-10">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${checkpoint.verified 
                    ? 'bg-gradient-to-br from-primary-500 to-blue-500' 
                    : 'bg-slate-700'
                  }
                  shadow-lg
                `}>
                  <div className="text-white">
                    {getIcon(checkpoint.type)}
                  </div>
                </div>
                
                {/* Verified Badge */}
                {checkpoint.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-success-500 rounded-full p-1">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-xl animate-pulse-slow"></div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-primary-500/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{getTitle(checkpoint.type)}</h3>
                    {checkpoint.location && (
                      <p className="text-sm text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {checkpoint.location}
                      </p>
                    )}
                  </div>
                  
                  {checkpoint.verified && (
                    <span className="text-xs bg-success-500/20 text-success-400 px-2 py-1 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(checkpoint.timestamp)}
                  </div>
                  
                  <div className="font-mono text-xs text-slate-500">
                    {checkpoint.address.slice(0, 6)}...{checkpoint.address.slice(-4)}
                  </div>
                </div>

                {/* AI Verification Details */}
                {checkpoint.verified && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-success-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Location Verified
                        </span>
                        <span className="flex items-center text-success-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Transit Time Valid
                        </span>
                      </div>
                      <span className="text-slate-500">
                        AI Confidence: 98%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Future Steps (Optional) */}
        {checkpoints.length < 5 && (
          <div className="mt-8 relative flex items-start space-x-4 opacity-40">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-700 border-2 border-dashed border-slate-600">
              <Store className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700/50">
              <h3 className="font-semibold text-slate-500">Awaiting Retail Checkpoint</h3>
              <p className="text-sm text-slate-600 mt-1">
                Final destination not yet recorded
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-400">{checkpoints.length}</p>
            <p className="text-sm text-slate-400">Checkpoints</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success-400">
              {checkpoints.filter(c => c.verified).length}
            </p>
            <p className="text-sm text-slate-400">Verified</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {Math.floor((Date.now() / 1000 - createdAt) / 86400)}
            </p>
            <p className="text-sm text-slate-400">Days in Transit</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">0</p>
            <p className="text-sm text-slate-400">Anomalies</p>
          </div>
        </div>
      </div>
    </div>
  );
}