'use client';

import React from 'react';
import Link from 'next/link';
import { COMMUNITIES } from '@/lib/communities';
import { useWallet } from '@/lib/wallet';

export default function HomePage() {
  const { openWalletModal } = useWallet();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high shadow-xs mb-6 border border-outline-variant/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-body text-on-surface font-semibold tracking-wide uppercase">
              Zero-Knowledge & Merkle Verified Civic Membership
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface max-w-4xl tracking-tight leading-tight">
            A Seal of Belonging <br className="hidden sm:inline" />
            <span className="text-primary italic font-serif">for Every Chaupal.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-2xl mt-4 leading-relaxed">
            Chaupal connects 12 independent Indian community groups. Each community maintains its own private membership list off-chain, publishing only a Merkle root. Members claim soulbound seals without exposing personal records.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/communities"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-body text-sm font-semibold transition-all duration-200 shadow-md flex items-center gap-2 group"
            >
              <span>Explore 12 Communities</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/member/claim"
              className="px-6 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-body text-sm font-semibold transition-all duration-200 shadow-xs border border-outline-variant/40 flex items-center gap-2"
            >
              <span>Claim Your Seal</span>
            </Link>
            <Link
              href="/steward"
              className="px-6 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-sm font-semibold transition-all duration-200 shadow-xs border border-outline-variant/40 flex items-center gap-2"
            >
              <span>Steward Console</span>
            </Link>
          </div>

          {/* Live Cryptographic State Ticker */}
          <div className="mt-8 inline-flex items-center gap-4 px-5 py-2 rounded-full bg-surface-container-low shadow-xs border border-outline-variant/30 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-semibold text-secondary">Merkle Tree Height: 20</span>
            </div>
            <span className="text-outline-variant">•</span>
            <span className="font-mono text-on-surface-variant">1,048,576 Max Capacity</span>
            <span className="text-outline-variant">•</span>
            <span className="font-mono text-primary font-semibold">0 Gas for Offline Rostering</span>
          </div>

          {/* 4 Architectural Invariants Grid */}
          <div className="w-full mt-16 p-6 lg:p-8 rounded-2xl bg-surface-container-low shadow-subtle border border-outline-variant/30 text-left">
            <div className="mb-6 pb-4 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-on-surface">
                  Core Security & Privacy Architecture
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Structurally enforced in the smart contract and off-chain Merkle tools.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-mono font-bold">
                EIP-5484 & OpenZeppelin
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
                <span className="text-xl">🔒</span>
                <h4 className="font-display font-bold text-sm text-on-surface">Derived from msg.sender</h4>
                <p className="font-body text-xs text-on-surface-variant">
                  Claim function extracts member identity strictly from caller. Cannot claim for another address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
                <span className="text-xl">🌿</span>
                <h4 className="font-display font-bold text-sm text-on-surface">Group ID in Leaf</h4>
                <p className="font-body text-xs text-on-surface-variant">
                  Leaf preimage contains <code className="font-mono text-[10px]">keccak256(groupId, member)</code> to prevent cross-group replay.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
                <span className="text-xl">👑</span>
                <h4 className="font-display font-bold text-sm text-on-surface">Per-Group Stewards</h4>
                <p className="font-body text-xs text-on-surface-variant">
                  No global admin. Each steward can modify only their own community's Merkle root.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
                <span className="text-xl">🛡️</span>
                <h4 className="font-display font-bold text-sm text-on-surface">Soulbound Non-Transferable</h4>
                <p className="font-body text-xs text-on-surface-variant">
                  ERC-721 token transfers strictly revert at the smart contract level.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Communities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-body text-xs font-bold uppercase tracking-wider text-primary">Sovereign Directory</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">12 Autonomous Indian Chaupals</h2>
          </div>
          <Link
            href="/communities"
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-1 transition-all"
          >
            <span>View Full Directory</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITIES.slice(0, 6).map(comm => (
            <div
              key={comm.id}
              className="bg-surface-container-low rounded-2xl p-5 shadow-subtle hover:shadow-floating transition-all border border-outline-variant/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-on-surface">{comm.name}</h3>
                    <p className="font-body text-xs text-on-surface-variant font-medium">{comm.region}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
                    {comm.quorum} Quorum
                  </span>
                </div>
                <p className="font-body text-xs text-on-surface-variant line-clamp-2 mb-4">
                  {comm.description}
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface-variant">{comm.membersCount.toLocaleString()} Citizens</span>
                <Link
                  href={`/member/claim?group=${comm.id}`}
                  className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  Verify & Claim →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
