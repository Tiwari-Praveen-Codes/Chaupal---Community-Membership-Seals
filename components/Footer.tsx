import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low py-10 mt-16 border-t border-outline-variant/30 shadow-subtle no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 items-start border-b border-outline-variant/20">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-secondary text-lg">🛡️</span>
              <h4 className="font-display font-bold text-sm text-on-surface">Privacy Guarantee</h4>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Identity credentials and membership rosters are held purely off-chain within the citizen's browser. Only 32-byte rolling Merkle state roots are anchored on-chain.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-primary text-lg">📜</span>
              <h4 className="font-display font-bold text-sm text-on-surface">Open Verifier</h4>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Independent smart contracts and OpenZeppelin StandardMerkleTree verification keys are published on Polygon PoS.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-secondary text-lg">⚡</span>
              <h4 className="font-display font-bold text-sm text-on-surface">Cryptographic Invariant</h4>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Double-hashed leaf preimage <code className="font-mono text-[10px] bg-surface-container px-1 py-0.5 rounded">keccak256(groupId, msg.sender)</code> eliminates cross-group relay attacks.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <span>© 2025 Chaupal Platform • Indigenous Zero-Knowledge Governance Commons</span>
          <div className="flex items-center gap-4">
            <span className="text-secondary flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Polygon PoS Synced
            </span>
            <span className="font-mono">Block #61984210</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
