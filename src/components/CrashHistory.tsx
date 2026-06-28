/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CrashHistoryProps {
  history: HistoryItem[];
}

export default function CrashHistory({ history }: CrashHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div 
      id="crash-history-container" 
      className="relative w-full flex items-center justify-between px-1 py-2 bg-zinc-950/40 rounded-lg border border-zinc-900 select-none z-30"
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono pl-2">
        History
      </div>
      <div 
        id="crash-history-list" 
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-1 max-w-[80%] relative"
      >
        {history.length === 0 ? (
          <div className="text-[10px] text-zinc-600 font-mono italic pr-2">
            No games played yet
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border cursor-pointer transition-all duration-150 hover:brightness-125 ${
                  item.isMega
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                }`}
              >
                {item.multiplier.toFixed(2)}x
              </motion.div>

              <AnimatePresence>
                {hoveredId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-32 bg-zinc-950 border border-zinc-800 rounded-md p-2 shadow-[0_10px_25px_rgba(0,0,0,0.85)] z-50 pointer-events-none text-center font-mono"
                  >
                    <div className="text-zinc-500 text-[8px] uppercase tracking-wider mb-1">
                      Flight Info
                    </div>
                    <div className={`text-xs font-extrabold mb-1 ${item.isMega ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {item.multiplier.toFixed(2)}x
                    </div>
                    <div className="text-zinc-400 text-[9px] leading-tight">
                      Time: {item.timestamp}
                    </div>
                    <div className="mt-1 text-[8px] font-semibold uppercase tracking-widest">
                      {item.isMega ? (
                        <span className="text-emerald-400 animate-pulse">🚀 MEGA HIT!</span>
                      ) : (
                        <span className="text-zinc-500">Standard Hit</span>
                      )}
                    </div>
                    {/* Small arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] border-4 border-transparent border-t-zinc-800 -z-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
