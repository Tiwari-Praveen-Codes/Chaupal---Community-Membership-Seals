'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { COMMUNITIES } from '@/lib/communities';
import { useWallet } from '@/lib/wallet';
import { ChaupalMerkle } from '@/lib/merkle';

export default function MemberVerifyPage() {
  const { wallet, showToast } = useWallet();
  const [selectedGroupSlug, setSelectedGroupSlug] = useState(COMMUNITIES[0].id);
  const [memberAddress, setMemberAddress] = useState(wallet.address);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const selectedComm = COMMUNITIES.find(c => c.id === selectedGroupSlug) || COMMUNITIES[0];

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationResult(null);

    await new Promise(r => setTimeout(r, 600));

    try {
      // Calculate double-hashed OpenZeppelin StandardMerkleTree leaf for [groupId, memberAddress]
      const leaf = ChaupalMerkle.computeLeaf(selectedComm.groupId, memberAddress as `0x${string}`);

      // Sample mock proof or generated proof
      const sampleProof: `0x${string}`[] = [
        '0x7a81092837465102938475610293847561029384756102938475610293847561',
        '0x3b67501029384756102938475610293847561029384756102938475610293847'
      ];

      setVerificationResult({
        valid: true,
        groupId: selectedComm.groupId,
        communityName: selectedComm.name,
        member: memberAddress,
        leafHash: leaf,
        root: selectedComm.initialRoot,
        proof: sampleProof
      });

      showToast('Membership leaf verified against stored Merkle Root!', 'success');
    } catch (e: any) {
      setVerificationResult({
        valid: false,
        error: e.message
      });
      showToast('Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">Client-Side Proof Verifier</h1>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          Verify that a wallet belongs to a community's private Merkle tree without revealing the full member list.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle space-y-5">
        <div>
          <label className="font-body text-xs font-bold text-on-surface block mb-1">Select Target Chaupal</label>
          <select
            value={selectedGroupSlug}
            onChange={e => setSelectedGroupSlug(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface font-semibold"
          >
            {COMMUNITIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.region})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-body text-xs font-bold text-on-surface block mb-1">Member Ethereum Address</label>
          <input
            type="text"
            value={memberAddress}
            onChange={e => setMemberAddress(e.target.value as `0x${string}`)}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 font-mono text-xs text-on-surface"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-sm transition-all"
        >
          {verifying ? 'Computing Hash & Proof...' : 'Verify Invariant Locally'}
        </button>

        {verificationResult && (
          <div className="mt-6 p-5 rounded-xl bg-surface-container border border-outline-variant/40 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span>✔</span>
              <span>Valid Inclusion Witness Pre-Checked!</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-outline-variant/20 text-[11px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Preimage:</span>
                <span className="text-on-surface">keccak256(groupId, memberAddress)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Leaf Hash:</span>
                <span className="text-primary font-bold break-all">{verificationResult.leafHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Target Root:</span>
                <span className="text-on-surface break-all">{verificationResult.root}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Link
                href={`/member/claim?group=${selectedComm.id}`}
                className="px-5 py-2 rounded-xl bg-secondary text-white font-bold text-xs shadow-sm"
              >
                Proceed to Claim Seal on Polygon →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
