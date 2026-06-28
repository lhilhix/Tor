/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryItem } from '../types';
import { motion } from 'motion/react';

interface CrashHistoryProps {
  history: HistoryItem[];
}

export default function CrashHistory({ history }: CrashHistoryProps) {
  return (
    <div id="crash-history-container" className="w-full flex items-center justify-between px-1 py-2 bg-zinc-950/40 rounded-lg border border-zinc-900 overflow-hidden select-none">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono pl-2">
        History
      </div>
      <div id="crash-history-list" className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-1 max-w-[80%]">
        {history.length === 0 ? (
          <div className="text-[10px] text-zinc-600 font-mono italic pr-2">
            No games played yet
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0.8, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                item.isMega
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
              }`}
              title={item.timestamp}
            >
              {item.multiplier.toFixed(2)}x
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
