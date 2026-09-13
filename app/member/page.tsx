'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet';
import { COMMUNITIES } from '@/lib/communities';

export default function MemberDashboardPage() {
  const { wallet, claimedSeals } = useWallet();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Banner */}
      <div className="p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
            Sovereign Member Dashboard
          </span>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mt-1">
            Citizen Credential Hub
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Hold cryptographic membership proofs locally. Claim non-transferable seals without leaking personal data.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 font-mono text-xs space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-on-surface-variant">Connected Address:</span>
            <span className="text-primary font-bold">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-on-surface-variant">Active Seals:</span>
            <span className="text-secondary font-bold">{claimedSeals.length} of 12</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/member/verify"
          className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 shadow-subtle space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            🔍
          </div>
          <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
            1. Verify Membership Proof
          </h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Verify off-chain that your wallet belongs to a community's private Merkle tree before sending a transaction.
          </p>
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            Launch Verifier →
          </span>
        </Link>

        <Link
          href="/member/claim"
          className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 shadow-subtle space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl font-bold">
            ✍️
          </div>
          <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
            2. Claim Soulbound Seal
          </h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Execute the on-chain claim function. The contract derives your identity from <code className="font-mono text-[10px]">msg.sender</code>.
          </p>
          <span className="text-xs font-bold text-secondary flex items-center gap-1">
            Claim On-Chain →
          </span>
        </Link>

        <Link
          href="/seals"
          className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/30 shadow-subtle space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center text-2xl font-bold">
            🏅
          </div>
          <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-tertiary transition-colors">
            3. View & Export Seals
          </h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Inspect your Soulbound tokens, inspect Merkle inclusion witnesses, and export offline printable certificates.
          </p>
          <span className="text-xs font-bold text-tertiary flex items-center gap-1">
            View My Seals →
          </span>
        </Link>
      </div>
    </div>
  );
}
