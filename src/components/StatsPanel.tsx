/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, Trophy, Settings, TrendingUp, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { PlayerStats } from '../types';

interface StatsPanelProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onResetStats: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  simulationSpeed: 'normal' | 'fast';
  onToggleSpeed: () => void;
}

export default function StatsPanel({
  stats,
  isOpen,
  onClose,
  onResetStats,
  soundEnabled,
  onToggleSound,
  simulationSpeed,
  onToggleSpeed,
}: StatsPanelProps) {
  if (!isOpen) return null;

  const winRate = stats.totalRounds > 0 ? (stats.totalWins / stats.totalRounds) * 100 : 0;

  return (
    <div id="stats-panel-overlay" className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col p-5 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Settings className="w-5 h-5" />
          <span className="font-extrabold uppercase tracking-widest text-sm">Control Deck</span>
        </div>
        <button
          id="close-stats-btn"
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 no-scrollbar">
        {/* Section: Live Stats */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            Session History
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-900">
              <span className="text-zinc-500 block">ROUNDS</span>
              <span className="text-sm font-extrabold text-white">{stats.totalRounds}</span>
            </div>
            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-900">
              <span className="text-zinc-500 block">WINS / WIN RATE</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {stats.totalWins} <span className="text-[10px] text-zinc-400">({winRate.toFixed(0)}%)</span>
              </span>
            </div>
            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-900">
              <span className="text-zinc-500 block">NET PROFIT</span>
              <span className={`text-sm font-extrabold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)} ORO
              </span>
            </div>
            <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-900">
              <span className="text-zinc-500 block">BEST FLIGHT</span>
              <span className="text-sm font-extrabold text-amber-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5 inline" />
                {stats.highestMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
          <button
            id="reset-stats-btn"
            type="button"
            onClick={onResetStats}
            className="w-full h-8 text-[10px] uppercase font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition"
          >
            Clear Session Stats
          </button>
        </div>

        {/* Section: Options */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-3">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-1.5">
            System Preferences
          </div>
          <div className="space-y-2">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-lg border border-zinc-900/60">
              <span className="text-[11px] text-zinc-400">Synthesizer Sounds</span>
              <button
                id="toggle-sound-btn"
                type="button"
                onClick={onToggleSound}
                className={`px-3 py-1 text-[10px] font-bold rounded-md border flex items-center gap-1 transition ${
                  soundEnabled
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3 h-3" /> Enabled
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3" /> Muted
                  </>
                )}
              </button>
            </div>

            {/* Launch Speed Modifier */}
            <div className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-lg border border-zinc-900/60">
              <span className="text-[11px] text-zinc-400">Simulation Velocity</span>
              <button
                id="toggle-speed-btn"
                type="button"
                onClick={onToggleSpeed}
                className={`px-3 py-1 text-[10px] font-bold rounded-md border transition ${
                  simulationSpeed === 'fast'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                {simulationSpeed === 'fast' ? 'Hyper (2x)' : 'Standard (1x)'}
              </button>
            </div>
          </div>
        </div>

        {/* Section: How to Play */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            How To Play Rocket Crash
          </div>
          <div className="text-[10px] text-zinc-400 leading-relaxed space-y-2">
            <p>
              1. <span className="text-zinc-200 font-bold">Place a Bet:</span> Choose your ORO bet amount using preset squares or entering a custom amount in your token selector drawer.
            </p>
            <p>
              2. <span className="text-zinc-200 font-bold">Auto-Cashout:</span> Configure your target multiplier. The system automatically secures your winnings when the rocket hits this scale.
            </p>
            <p>
              3. <span className="text-zinc-200 font-bold">Watch & Cashout:</span> Once launch systems complete check, the rocket climbs! Hit the golden <span className="text-amber-400 font-bold">CASH OUT</span> button at any time before the crash to win.
            </p>
            <p>
              4. <span className="text-rose-400 font-bold">Beware of Crash:</span> The rocket explodes at a completely random multiplier. If you haven't cashed out before the bang, your bet goes up in smoke!
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-[9px] text-zinc-600 mt-4 pt-2 border-t border-zinc-900 uppercase">
        Rocket Crash Engine v1.0.4 • Off-chain sandbox
      </div>
    </div>
  );
}
