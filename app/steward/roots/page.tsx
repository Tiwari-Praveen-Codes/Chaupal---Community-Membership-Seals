'use client';

import React from 'react';
import Link from 'next/link';
import { COMMUNITIES } from '@/lib/communities';
import { useWallet } from '@/lib/wallet';

export default function StewardRootsPage() {
  const { activeStewardGroup } = useWallet();

  const historyLogs = [
    {
      version: 'v2.4 (Current)',
      root: activeStewardGroup.initialRoot,
      block: '#58,492,103',
      timestamp: '2 hours ago',
      leaves: activeStewardGroup.membersCount,
      txHash: '0x9f8b73a210fcbe11985daec4a1239857102938475610293847561029384756102',
      steward: activeStewardGroup.steward
    },
    {
      version: 'v2.3',
      root: '0x71ad5e4da0e56d5850187da3f534891a357023cfc54dd5070c3c4cd83ae7d528',
      block: '#58,471,002',
      timestamp: '14 days ago',
      leaves: activeStewardGroup.membersCount - 12,
      txHash: '0x3b67501029384756102938475610293847561029384756102938475610293847',
      steward: activeStewardGroup.steward
    },
    {
      version: 'v2.2 (Genesis)',
      root: '0x12a9bc45de891047fa67b901283c4d5e71829014ab56cd78ef901234567890ab',
      block: '#58,410,204',
      timestamp: '45 days ago',
      leaves: activeStewardGroup.membersCount - 50,
      txHash: '0x4c810de456819213efba9012a647bc5190234e628172901fabcd9018451920c8',
      steward: activeStewardGroup.steward
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
            Immutable Audit Trail
          </span>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mt-1">
            Merkle Root History & Rollup Log
          </h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Historical root commitments published on Polygon PoS for {activeStewardGroup.name}.
          </p>
        </div>

        <Link
          href="/steward"
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface border border-outline-variant/30"
        >
          ← Back to Steward Console
        </Link>
      </div>

      {/* History Table */}
      <div className="bg-surface-container-low rounded-2xl p-6 shadow-subtle border border-outline-variant/30 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4">Merkle Root Hash</th>
              <th className="py-3 px-4">Block Height</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Member Leaves</th>
              <th className="py-3 px-4 text-right">Polygonscan</th>
            </tr>
          </thead>
          <tbody>
            {historyLogs.map(log => (
              <tr key={log.version} className="border-b border-outline-variant/20 hover:bg-surface-container/50">
                <td className="py-3 px-4 font-bold text-primary">{log.version}</td>
                <td className="py-3 px-4 font-semibold text-on-surface break-all" title={log.root}>
                  {log.root.slice(0, 14)}...{log.root.slice(-8)}
                </td>
                <td className="py-3 px-4 text-on-surface-variant">{log.block}</td>
                <td className="py-3 px-4 text-on-surface-variant">{log.timestamp}</td>
                <td className="py-3 px-4 text-secondary font-bold">{log.leaves} Citizens</td>
                <td className="py-3 px-4 text-right">
                  <a
                    href="https://polygonscan.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-[11px]"
                  >
                    View Tx ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
