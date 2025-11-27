'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Shield, Package, Truck } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="glass-dark border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary-500/20 blur-xl group-hover:bg-primary-500/30 transition-all"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              TrustChain
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Manufacturer</span>
            </Link>
            <Link 
              href="/distributor" 
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Distributor</span>
            </Link>
            <Link 
              href="/verify/demo" 
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Verify</span>
            </Link>
          </div>

          {/* Connect Button */}
          <ConnectButton 
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </nav>
  );
}