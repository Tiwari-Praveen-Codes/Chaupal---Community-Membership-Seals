'use client';

import React from 'react';
import { ClaimedSeal, useWallet } from '@/lib/wallet';

interface Props {
  seal: ClaimedSeal | null;
  onClose: () => void;
}

export function CertificateModal({ seal, onClose }: Props) {
  const { wallet } = useWallet();

  if (!seal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-modal border border-outline-variant/40 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Printable Lithic Certificate */}
        <div className="bg-[#FAF8F5] p-8 rounded-2xl border-4 border-double border-[#9F3C16] text-center shadow-md relative overflow-hidden">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary text-2xl font-bold shadow-xs mb-2">
              📜
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              SOVEREIGN ZERO-KNOWLEDGE CIVIC SEAL
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#221A13] mt-1">{seal.name}</h2>
            <p className="font-body text-sm text-secondary font-semibold">{seal.region}</p>
          </div>

          <p className="font-body text-xs text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed italic">
            "This Soulbound credential certifies that the holder of Ethereum address{' '}
            <span className="font-mono font-semibold text-primary">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
            </span>{' '}
            has proven inclusion in the sovereign Chaupal membership roster without disclosing personal identity records."
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container p-3 rounded-xl text-left font-mono text-[11px] mb-4">
            <div>
              <span className="text-on-surface-variant block text-[10px]">Issue Date</span>
              <span className="text-on-surface font-semibold">{seal.issueDate}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px]">Settlement</span>
              <span className="text-on-surface font-semibold">{seal.block}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px]">Token ID</span>
              <span className="text-secondary font-semibold">#{seal.tokenId}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px]">Standard</span>
              <span className="text-primary font-semibold">ERC-5484</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-left text-xs">
            <div>
              <span className="font-mono text-[10px] text-on-surface-variant block">Merkle Root Anchor</span>
              <span className="font-mono text-[10px] text-primary font-semibold truncate max-w-[240px] block">
                {seal.merkleRoot}
              </span>
            </div>
            <div className="text-right">
              <span className="font-serif italic text-xs text-primary font-bold block">Chaupal Civic Council</span>
              <span className="font-mono text-[9px] text-outline">Autonomous ZK Consensus</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>Print Offline Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
