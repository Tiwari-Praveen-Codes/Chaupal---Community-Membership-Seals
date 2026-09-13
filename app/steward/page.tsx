'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { COMMUNITIES, Community } from '@/lib/communities';
import { useWallet } from '@/lib/wallet';
import { ChaupalMerkle } from '@/lib/merkle';

export default function StewardDashboardPage() {
  const { wallet, activeStewardGroup, setActiveStewardGroup, updateStewardRoot, showToast } = useWallet();

  const [memberInput, setMemberInput] = useState<string>(
    `0x71C8349219b258E2958045F207D67BaAc68C49b2\n0x88F932810C1A957209384B2958045F207D67BAAC\n0x38B744C190283475610293847561029384756102\n0x1111111111111111111111111111111111111111`
  );

  const [calculatedTree, setCalculatedTree] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Parse and calculate tree locally in browser
  const handleCalculateTree = () => {
    try {
      const lines = memberInput.split('\n');
      const treeResult = ChaupalMerkle.buildTree(activeStewardGroup.groupId, lines);
      setCalculatedTree(treeResult);
      setPublishSuccess(null);
      showToast(`Calculated local Merkle tree with ${treeResult.count} valid leaves!`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to build Merkle tree', 'error');
    }
  };

  const handlePublishRoot = async () => {
    if (!calculatedTree) return;

    setPublishing(true);
    setPublishSuccess(null);

    await new Promise(r => setTimeout(r, 1400));

    try {
      await updateStewardRoot(activeStewardGroup.groupId, calculatedTree.root);
      setPublishSuccess(calculatedTree.root);
    } catch (e: any) {
      showToast(e.message || 'Root publishing failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setMemberInput(content);
      showToast('Loaded roster file into local memory', 'info');
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Top Banner */}
      <div className="p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
            Autonomous Steward Authority Plinth
          </span>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mt-1">
            Steward Merkle Root Publisher
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Build and update your community's Merkle tree locally. No private member lists are uploaded to any server.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/steward/roots"
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface border border-outline-variant/30 transition-all"
          >
            Root History Log →
          </Link>
        </div>
      </div>

      {/* Community Steward Scope Selector */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle space-y-4">
        <div>
          <label className="font-body text-xs font-bold text-on-surface block mb-1">Active Community Group (Steward Scope)</label>
          <select
            value={activeStewardGroup.id}
            onChange={e => {
              const comm = COMMUNITIES.find(c => c.id === e.target.value) || COMMUNITIES[0];
              setActiveStewardGroup(comm);
              setCalculatedTree(null);
              setPublishSuccess(null);
            }}
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface font-semibold"
          >
            {COMMUNITIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (Steward: {c.stewardName} - {c.region})
              </option>
            ))}
          </select>
        </div>

        {/* Current State Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30">
            <span className="text-on-surface-variant block text-[10px]">Current On-Chain Root:</span>
            <span className="text-primary font-bold truncate block" title={activeStewardGroup.initialRoot}>
              {activeStewardGroup.initialRoot.slice(0, 10)}...{activeStewardGroup.initialRoot.slice(-6)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30">
            <span className="text-on-surface-variant block text-[10px]">Steward Address:</span>
            <span className="text-on-surface font-bold truncate block" title={activeStewardGroup.steward}>
              {activeStewardGroup.steward.slice(0, 10)}...{activeStewardGroup.steward.slice(-6)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30">
            <span className="text-on-surface-variant block text-[10px]">Settlement Quorum:</span>
            <span className="text-secondary font-bold block">{activeStewardGroup.quorum} Verified</span>
          </div>
        </div>
      </div>

      {/* Roster & Offline Tree Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Private Roster Input */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-on-surface">1. Private Roster (Local Only)</h3>
            <label className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold cursor-pointer border border-outline-variant/30">
              <span>Import CSV/Text</span>
              <input type="file" accept=".txt,.csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <p className="font-body text-xs text-on-surface-variant">
            Enter one Ethereum address per line. The browser parses and deduplicates addresses locally.
          </p>

          <textarea
            rows={8}
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            placeholder="0x71C8349219b258E2958045F207D67BaAc68C49b2..."
            className="w-full p-3 rounded-xl bg-surface-container border border-outline-variant/40 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
          />

          <button
            onClick={handleCalculateTree}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-sm transition-all"
          >
            Calculate OpenZeppelin Merkle Root Locally
          </button>
        </div>

        {/* Right: Calculated Merkle Tree Diff & Publish */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-subtle space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-on-surface">2. Root Comparison & Publishing</h3>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3 font-mono text-xs">
              <div>
                <span className="text-on-surface-variant block text-[10px]">1. Current On-Chain Root:</span>
                <span className="text-on-surface break-all text-[11px]">{activeStewardGroup.initialRoot}</span>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-on-surface-variant block text-[10px]">2. Proposed New Merkle Root:</span>
                <span className="text-secondary font-bold break-all text-[11px]">
                  {calculatedTree ? calculatedTree.root : 'Click "Calculate..." to derive new root'}
                </span>
              </div>

              {calculatedTree && (
                <div className="pt-2 border-t border-outline-variant/20 flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Validated Member Leaves:</span>
                  <span className="text-primary font-bold">{calculatedTree.count} Members</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface-variant flex items-center gap-2">
              <span>🔒</span>
              <span>"Only the Merkle root is published on-chain. Your member list remains private."</span>
            </div>

            {publishSuccess && (
              <div className="p-3 rounded-xl bg-secondary-container/50 border border-secondary/40 text-secondary text-xs font-bold">
                ✔ New Merkle Root Published to Polygon PoS Contract!
              </div>
            )}
          </div>

          <button
            onClick={handlePublishRoot}
            disabled={!calculatedTree || publishing}
            className={`w-full py-3 rounded-xl text-xs font-bold shadow-md transition-all ${
              !calculatedTree
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-on-primary'
            }`}
          >
            {publishing ? 'Publishing Root to Polygon PoS...' : 'Sign & Publish Merkle Root On-Chain'}
          </button>
        </div>
      </div>
    </div>
  );
}
