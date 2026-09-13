'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet, ClaimedSeal } from '@/lib/wallet';
import { SealCard } from '@/components/SealCard';
import { ProofInspectorModal } from '@/components/ProofInspectorModal';
import { CertificateModal } from '@/components/CertificateModal';

export default function MySealsPage() {
  const { wallet, claimedSeals } = useWallet();
  const [inspectSeal, setInspectSeal] = useState<ClaimedSeal | null>(null);
  const [certSeal, setCertSeal] = useState<ClaimedSeal | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Masthead */}
      <div className="p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
            Citizen Credential Vault
          </span>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mt-1">
            My Soulbound Seals
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Cryptographic non-transferable seals bound to{' '}
            <span className="font-mono font-semibold text-primary">{wallet.address}</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/member/claim"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-sm transition-all"
          >
            + Claim Another Seal
          </Link>
        </div>
      </div>

      {/* Grid of Seals */}
      {claimedSeals.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant space-y-3">
          <span className="text-4xl">🏅</span>
          <h3 className="font-display text-lg font-bold text-on-surface">No Soulbound Seals Claimed Yet</h3>
          <p className="font-body text-xs text-on-surface-variant max-w-sm mx-auto">
            Verify your membership in any of the 12 sovereign Chaupals and claim your soulbound seal.
          </p>
          <Link
            href="/communities"
            className="inline-block px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm"
          >
            Explore Directory →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claimedSeals.map(seal => (
            <SealCard
              key={seal.id}
              seal={seal}
              onInspect={s => setInspectSeal(s)}
              onCertificate={s => setCertSeal(s)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProofInspectorModal seal={inspectSeal} onClose={() => setInspectSeal(null)} />
      <CertificateModal seal={certSeal} onClose={() => setCertSeal(null)} />
    </div>
  );
}
