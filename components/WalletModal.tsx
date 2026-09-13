'use client';

import React from 'react';
import { useWallet } from '@/lib/wallet';

export function WalletModal() {
  const { wallet, isWalletModalOpen, closeWalletModal, connect, disconnect } = useWallet();

  if (!isWalletModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-modal border border-outline-variant/40">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
          <h3 className="font-display text-lg font-bold text-on-surface">Connect Civic Wallet</h3>
          <button
            onClick={closeWalletModal}
            className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs"
          >
            ✕
          </button>
        </div>

        {wallet.connected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-medium">Status:</span>
                <span className="text-secondary font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Connected ({wallet.provider})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-on-surface-variant">Address:</span>
                <span className="text-primary font-semibold truncate max-w-[200px]" title={wallet.address}>
                  {wallet.address}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Network:</span>
                <span className="text-on-surface font-semibold">{wallet.network} (ID: {wallet.chainId})</span>
              </div>
            </div>

            <button
              onClick={disconnect}
              className="w-full py-2.5 rounded-xl bg-error/10 hover:bg-error/20 text-error text-xs font-bold border border-error/30 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={() => connect('MetaMask')}
              className="w-full p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-left transition-colors border border-outline-variant/30"
            >
              <div>
                <p className="font-body text-xs font-bold text-on-surface">MetaMask</p>
                <p className="font-body text-[11px] text-on-surface-variant">Browser Extension & Mobile</p>
              </div>
              <span className="text-outline text-xs">→</span>
            </button>

            <button
              onClick={() => connect('WalletConnect')}
              className="w-full p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-left transition-colors border border-outline-variant/30"
            >
              <div>
                <p className="font-body text-xs font-bold text-on-surface">WalletConnect</p>
                <p className="font-body text-[11px] text-on-surface-variant">Rainbow, Trust, Zerion, etc.</p>
              </div>
              <span className="text-outline text-xs">→</span>
            </button>

            <button
              onClick={() => connect('Demo Anonymous')}
              className="w-full p-3.5 rounded-xl bg-secondary-container/40 hover:bg-secondary-container/60 flex items-center justify-between text-left transition-colors border border-secondary/30"
            >
              <div>
                <p className="font-body text-xs font-bold text-on-surface">Instant Demo Key (No extension needed)</p>
                <p className="font-body text-[11px] text-on-surface-variant">Simulated private anonymous key</p>
              </div>
              <span className="text-secondary font-bold text-xs">→</span>
            </button>
          </div>
        )}

        <div className="mt-4 p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2 text-[11px] text-on-surface-variant border border-outline-variant/20">
          <span>🔒</span>
          <span>Chaupal will never request access to your private key or seed phrase.</span>
        </div>
      </div>
    </div>
  );
}
