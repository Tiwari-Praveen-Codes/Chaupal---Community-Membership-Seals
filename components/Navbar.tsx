'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet';

export function Navbar() {
  const pathname = usePathname();
  const { wallet, openWalletModal } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Communities', href: '/communities' },
    { label: 'Member Verify', href: '/member/verify' },
    { label: 'Claim Seal', href: '/member/claim' },
    { label: 'My Seals', href: '/seals' },
    { label: 'Steward Console', href: '/steward', badge: 'Admin' },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-subtle">
        {/* Top Privacy Banner */}
        <div className="bg-surface-container-low px-4 py-1 text-center border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 text-xs">
            <span className="text-secondary font-bold">🔒 Privacy Principle:</span>
            <span className="text-on-surface-variant">Member lists are strictly local. Only cryptographic Merkle roots exist on-chain.</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/40 shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-xl text-primary">चौ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl tracking-tight text-primary font-extrabold leading-none">Chaupal</span>
              <span className="font-body text-[10px] text-on-surface-variant leading-tight mt-0.5">Sovereign Civic Membership</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-outline-variant/30 shadow-xs">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-surface-container text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-tertiary-fixed text-primary px-1.5 py-0.2 rounded-full font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Network & Wallet Connect */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>{wallet.network}</span>
            </div>

            <button
              onClick={openWalletModal}
              className="flex items-center bg-surface-container-low pl-3 pr-1.5 py-1 rounded-full gap-2 border border-outline-variant/30 shadow-subtle hover:bg-surface-container transition-all"
            >
              <span className="font-mono text-xs text-on-surface font-semibold hidden md:inline">
                {wallet.connected ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Connect'}
              </span>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs text-xs font-bold">
                {wallet.connected ? '0x' : '+'}
              </div>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm xl:hidden flex justify-end">
          <div className="w-72 bg-surface p-6 h-full shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
                <span className="font-display font-bold text-lg text-primary">Chaupal</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded bg-surface-container text-xs">
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="p-2.5 rounded-xl hover:bg-surface-container font-semibold text-xs"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setMobileOpen(false);
                openWalletModal();
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm"
            >
              Wallet Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
