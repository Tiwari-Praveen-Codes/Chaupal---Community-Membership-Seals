'use client';

import React from 'react';
import { ClaimedSeal } from '@/lib/wallet';

interface Props {
  seal: ClaimedSeal;
  onInspect: (seal: ClaimedSeal) => void;
  onCertificate: (seal: ClaimedSeal) => void;
}

export function SealCard({ seal, onInspect, onCertificate }: Props) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5 shadow-subtle hover:shadow-floating transition-all flex flex-col justify-between group border border-outline-variant/30">
      <div>
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-mono text-xs text-secondary font-semibold">ERC-5484 Soulbound</span>
          </div>
          <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
            {seal.block}
          </span>
        </div>

        {/* Seal Badge Emblem & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-xs text-2xl font-bold border border-outline-variant/30">
            🏅
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-on-surface group-hover:text-primary transition-colors">
              {seal.name}
            </h3>
            <p className="font-body text-xs text-on-surface-variant font-medium">
              {seal.region} • {seal.role}
            </p>
          </div>
        </div>

        {/* Proof Summary Box */}
        <div className="bg-surface-container rounded-xl p-3 space-y-1 font-mono text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-on-surface-variant text-[11px]">Leaf Hash:</span>
            <span className="text-primary truncate max-w-[130px] font-semibold text-[11px]">
              {seal.leafHash.slice(0, 10)}...{seal.leafHash.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant text-[11px]">Merkle Root:</span>
            <span className="text-on-surface truncate max-w-[130px] text-[11px]">
              {seal.merkleRoot.slice(0, 10)}...{seal.merkleRoot.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant text-[11px]">Token ID:</span>
            <span className="text-secondary font-bold text-[11px]">#{seal.tokenId}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-2">
        <button
          onClick={() => onInspect(seal)}
          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1 transition-all"
        >
          <span>Inspect Witness</span>
        </button>
        <button
          onClick={() => onCertificate(seal)}
          className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
        >
          <span>Offline Seal</span>
        </button>
      </div>
    </div>
  );
}
