'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Shield, Package, Truck } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="glass-dark border-custom sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-500 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl transition-all group-hover:bg-blue-500/30 rounded-full"></div>
            </div>
            <span className="logo-text">
             Provena
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="nav-link flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Manufacturer</span>
            </Link>
            <Link 
              href="/distributor" 
              className="nav-link flex items-center space-x-2"
            >
              <Truck className="w-4 h-4" />
              <span>Distributor</span>
            </Link>
            <Link 
              href="/verify/demo" 
              className="nav-link flex items-center space-x-2"
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
