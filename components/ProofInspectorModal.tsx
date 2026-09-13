'use client';

import React from 'react';
import { ClaimedSeal, useWallet } from '@/lib/wallet';

interface Props {
  seal: ClaimedSeal | null;
  onClose: () => void;
}

export function ProofInspectorModal({ seal, onClose }: Props) {
  const { wallet, showToast } = useWallet();

  if (!seal) return null;

  const copyJSON = () => {
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1", "https://chaupal.org/contexts/v1"],
      "type": ["VerifiableCredential", "ChaupalSoulboundSeal"],
      "issuer": `did:polygon:${seal.merkleRoot.slice(0, 16)}`,
      "issuanceDate": seal.issueDate,
      "credentialSubject": {
        "id": `did:pkh:eip155:137:${wallet.address}`,
        "community": seal.name,
        "groupId": seal.groupId,
        "tokenId": seal.tokenId,
        "leafHash": seal.leafHash,
        "merkleRoot": seal.merkleRoot,
        "circuitProof": "OpenZeppelin StandardMerkleTree (Keccak256)"
      }
    };
    navigator.clipboard.writeText(JSON.stringify(vc, null, 2));
    showToast('Verifiable Credential JSON copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-modal border border-outline-variant/40 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <h3 className="font-display text-xl font-bold text-on-surface">{seal.name}</h3>
            <p className="font-body text-xs text-secondary font-medium">Merkle Inclusion Witness • OpenZeppelin Standard</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Merkle Authentication Path Visualizer */}
        <div className="bg-surface-container rounded-xl p-4 space-y-2">
          <h4 className="font-body text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Cryptographic Authentication Tree Path
          </h4>

          <div className="space-y-2 font-mono text-xs">
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-primary/40 flex items-center justify-between">
              <div>
                <span className="text-primary font-bold block text-[11px]">Leaf Preimage: keccak256(groupId, msg.sender)</span>
                <span className="text-on-surface break-all text-[11px]">{seal.leafHash}</span>
              </div>
              <span className="text-primary text-base">🔑</span>
            </div>

            <div className="text-center text-outline text-xs">↓ Merkle Proof Sibling Path Hash</div>

            {seal.proof.map((p, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 flex items-center justify-between">
                <div>
                  <span className="text-on-surface-variant font-bold block text-[10px]">Sibling Node #{idx + 1}</span>
                  <span className="text-on-surface-variant break-all text-[11px]">{p}</span>
                </div>
                <span className="text-outline text-xs">🌿</span>
              </div>
            ))}

            <div className="text-center text-outline text-xs">↓ On-Chain Settlement Match</div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-secondary/50 flex items-center justify-between">
              <div>
                <span className="text-secondary font-bold block text-[11px]">Verified Merkle Root (Storage Anchor)</span>
                <span className="text-on-surface break-all text-[11px]">{seal.merkleRoot}</span>
              </div>
              <span className="text-secondary text-base">🛡️</span>
            </div>
          </div>
        </div>

        {/* Verifiable Credential JSON */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              Verifiable Credential Object
            </span>
            <button onClick={copyJSON} className="text-xs text-primary font-semibold hover:underline">
              Copy JSON
            </button>
          </div>
          <pre className="bg-surface-container-highest p-3 rounded-lg font-mono text-[11px] text-on-surface overflow-x-auto max-h-36">
{JSON.stringify({
  "@context": ["https://www.w3.org/2018/credentials/v1", "https://chaupal.org/contexts/v1"],
  "type": ["VerifiableCredential", "ChaupalSoulboundSeal"],
  "issuer": `did:polygon:${seal.merkleRoot.slice(0, 16)}`,
  "issuanceDate": seal.issueDate,
  "credentialSubject": {
    "id": `did:pkh:eip155:137:${wallet.address}`,
    "community": seal.name,
    "groupId": seal.groupId,
    "tokenId": seal.tokenId,
    "leafHash": seal.leafHash,
    "merkleRoot": seal.merkleRoot,
    "circuitProof": "OpenZeppelin StandardMerkleTree"
  }
}, null, 2)}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
