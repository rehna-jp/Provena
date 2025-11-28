'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Shield, Package, Truck, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass-dark border-custom sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full animate-pulse"></div>
              <Shield className="w-8 h-8 text-cyan-400 relative" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Provena
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="nav-link flex items-center gap-2 text-sm font-medium"
            >
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Manufacturer</span>
            </Link>
            <Link 
              href="/distributor" 
              className="nav-link flex items-center gap-2 text-sm font-medium"
            >
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Distributor</span>
            </Link>
            <Link 
              href="/verify/demo" 
              className="nav-link flex items-center gap-2 text-sm font-medium"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Verify</span>
            </Link>
          </div>

          {/* Connect Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
              accountStatus="address"
            />
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className={`w-5 h-5`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-slate-700/50">
            <Link 
              href="/" 
              className="nav-link flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors block"
              onClick={() => setMobileOpen(false)}
            >
              <Package className="w-4 h-4" />
              <span>Manufacturer</span>
            </Link>
            <Link 
              href="/distributor" 
              className="nav-link flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors block"
              onClick={() => setMobileOpen(false)}
            >
              <Truck className="w-4 h-4" />
              <span>Distributor</span>
            </Link>
            <Link 
              href="/verify/demo" 
              className="nav-link flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors block"
              onClick={() => setMobileOpen(false)}
            >
              <Shield className="w-4 h-4" />
              <span>Verify</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
