'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { COMMUNITIES, Community } from '@/lib/communities';

export default function CommunitiesPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const filtered = COMMUNITIES.filter(comm => {
    const matchesSearch =
      !search ||
      comm.name.toLowerCase().includes(search.toLowerCase()) ||
      comm.description.toLowerCase().includes(search.toLowerCase()) ||
      comm.region.toLowerCase().includes(search.toLowerCase()) ||
      comm.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesRegion = regionFilter === 'all' || comm.regionKey === regionFilter;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface">Community Directory</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Showing {filtered.length} of {COMMUNITIES.length} sovereign Indian community groups
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities, crafts, states..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Region Filter Buttons */}
      <div className="mb-8 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-wrap gap-2 text-xs">
        <span className="font-bold text-on-surface-variant py-1 px-2">Filter Region:</span>
        {['all', 'north', 'south', 'east', 'west'].map(r => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize ${
              regionFilter === r
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {r === 'all' ? 'All India' : r}
          </button>
        ))}
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(comm => (
          <div
            key={comm.id}
            className="bg-surface-container-low rounded-2xl p-6 shadow-subtle hover:shadow-floating transition-all border border-outline-variant/30 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {comm.name}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant font-medium">
                    {comm.region} • {comm.hindiName}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
                  {comm.quorum} Quorum
                </span>
              </div>

              <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
                {comm.description}
              </p>

              {/* Cryptographic Parameters */}
              <div className="bg-surface-container rounded-xl p-3 space-y-1 font-mono text-[11px] mb-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Merkle Root:</span>
                  <span className="text-primary font-semibold truncate max-w-[140px]" title={comm.initialRoot}>
                    {comm.initialRoot.slice(0, 8)}...{comm.initialRoot.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Steward:</span>
                  <span className="text-on-surface truncate max-w-[140px]">{comm.stewardName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Group ID:</span>
                  <span className="text-outline truncate max-w-[140px]">{comm.groupId.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {comm.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
              <button
                onClick={() => setSelectedCommunity(comm)}
                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Specs & Rules
              </button>
              <Link
                href={`/member/claim?group=${comm.id}`}
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                <span>Claim Seal</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Community Detail Modal */}
      {selectedCommunity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-modal border border-outline-variant/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <h3 className="font-display text-xl font-bold text-on-surface">{selectedCommunity.name}</h3>
                <p className="font-body text-xs text-secondary font-medium">
                  {selectedCommunity.region} • {selectedCommunity.hindiName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCommunity(null)}
                className="w-7 h-7 rounded-full bg-surface-container text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-body text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">
                Charter & Description
              </h4>
              <p className="font-body text-xs text-on-surface leading-relaxed">{selectedCommunity.description}</p>
            </div>

            <div className="bg-surface-container rounded-xl p-4 font-mono text-xs space-y-1.5">
              <h4 className="font-body text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                Smart Contract Parameters
              </h4>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Group ID (bytes32):</span>
                <span className="text-primary font-semibold break-all text-[11px]">{selectedCommunity.groupId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Steward Address:</span>
                <span className="text-on-surface break-all text-[11px]">{selectedCommunity.steward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">On-Chain Root:</span>
                <span className="text-on-surface break-all text-[11px]">{selectedCommunity.initialRoot}</span>
              </div>
            </div>

            <div>
              <h4 className="font-body text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">
                Membership Eligibility Rules
              </h4>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface">
                {selectedCommunity.eligibility}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCommunity(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href={`/member/claim?group=${selectedCommunity.id}`}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs"
              >
                Proceed to Claim Seal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
