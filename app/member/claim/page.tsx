'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { COMMUNITIES, Community } from '@/lib/communities';
import { useWallet, ClaimedSeal } from '@/lib/wallet';

function ClaimSealForm() {
  const searchParams = useSearchParams();
  const initialGroup = searchParams.get('group') || COMMUNITIES[0].id;

  const { wallet, claimedSeals, claimSeal, openWalletModal, showToast } = useWallet();
  const [selectedGroupSlug, setSelectedGroupSlug] = useState(initialGroup);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<ClaimedSeal | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('group')) {
      setSelectedGroupSlug(searchParams.get('group')!);
    }
  }, [searchParams]);

  const selectedComm = COMMUNITIES.find(c => c.id === selectedGroupSlug) || COMMUNITIES[0];
  const alreadyClaimed = claimedSeals.some(s => s.groupId === selectedComm.groupId);

  const handleClaim = async () => {
    if (!wallet.connected) {
      openWalletModal();
      return;
    }

    setClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);

    await new Promise(r => setTimeout(r, 1200));

    try {
      // Sample proof for the selected group
      const sampleProof: `0x${string}`[] = [
        '0x7a81092837465102938475610293847561029384756102938475610293847561',
        '0x3b67501029384756102938475610293847561029384756102938475610293847'
      ];

      const newSeal = await claimSeal(selectedComm.id, sampleProof);
      setClaimSuccess(newSeal);
    } catch (e: any) {
      setClaimError(e.message || 'Transaction failed');
      showToast(e.message || 'Claim failed', 'error');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
          Smart Contract Claim Flow
        </span>
        <h1 className="font-display text-3xl font-extrabold text-on-surface mt-1">
          Claim Soulbound Membership Seal
        </h1>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          The smart contract derives your identity from <code className="font-mono text-[10px]">msg.sender</code> and checks your proof against the group's storage root.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle space-y-6">
        {/* Community Selection */}
        <div>
          <label className="font-body text-xs font-bold text-on-surface block mb-1">Target Community</label>
          <select
            value={selectedGroupSlug}
            onChange={e => {
              setSelectedGroupSlug(e.target.value);
              setClaimSuccess(null);
              setClaimError(null);
            }}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface font-semibold"
          >
            {COMMUNITIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.region})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Community Details */}
        <div className="bg-surface-container rounded-xl p-4 font-mono text-xs space-y-2 border border-outline-variant/30">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Group ID (bytes32):</span>
            <span className="text-primary font-bold">{selectedComm.groupId.slice(0, 10)}...{selectedComm.groupId.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Stored On-Chain Root:</span>
            <span className="text-on-surface font-semibold truncate max-w-[200px]">{selectedComm.initialRoot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Claiming Wallet (msg.sender):</span>
            <span className="text-primary font-semibold">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Token Standard:</span>
            <span className="text-secondary font-bold">ERC-5484 (Soulbound Non-Transferable)</span>
          </div>
        </div>

        {/* Invariant Note */}
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
          <span>🔒</span>
          <p>
            <strong className="text-on-surface">Security Guarantee:</strong> The frontend does NOT pass your address or Merkle root as claim parameters. The contract obtains your address directly from <code className="font-mono text-primary font-bold">msg.sender</code> and root from contract storage.
          </p>
        </div>

        {/* Error Notification */}
        {claimError && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
            <span>❌</span>
            <span>{claimError}</span>
          </div>
        )}

        {/* Success Card */}
        {claimSuccess && (
          <div className="p-5 rounded-xl bg-secondary-container/40 border border-secondary/40 space-y-3">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span>✔</span>
              <span>Soulbound Seal Successfully Minted on Polygon PoS!</span>
            </div>
            <p className="font-body text-xs text-on-surface-variant">
              Token ID <strong>#{claimSuccess.tokenId}</strong> is now permanently bound to wallet{' '}
              <span className="font-mono font-semibold text-primary">{wallet.address}</span>.
            </p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/seals"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm"
              >
                View in My Seals →
              </Link>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!claimSuccess && (
          <button
            onClick={handleClaim}
            disabled={claiming || alreadyClaimed}
            className={`w-full py-3 rounded-xl font-body text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
              alreadyClaimed
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-on-primary'
            }`}
          >
            {alreadyClaimed
              ? 'Already Claimed for this Community'
              : claiming
              ? 'Executing On-Chain Claim Transaction...'
              : `Claim ${selectedComm.name} Seal`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClaimSealPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-on-surface-variant">Loading claim flow...</div>}>
      <ClaimSealForm />
    </Suspense>
  );
}
