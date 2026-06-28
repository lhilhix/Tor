/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, Landmark, Coins } from 'lucide-react';

interface PresetBetSelectorProps {
  currentBet: number;
  onBetChange: (amount: number) => void;
  oroBalance: number;
  usdcBalance: number;
  onExchange: (usdcToExchange: number) => void;
  onResetBalances: () => void;
  disabled?: boolean;
}

export default function PresetBetSelector({
  currentBet,
  onBetChange,
  oroBalance,
  usdcBalance,
  onExchange,
  onResetBalances,
  disabled = false,
}: PresetBetSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState<number>(10);

  const presets = [2, 4, 10, 20, 40, 100, 200, 500];

  const handlePresetClick = (amount: number) => {
    if (disabled) return;
    onBetChange(amount);
  };

  const handleCustomBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onBetChange(Math.max(0.1, Math.min(oroBalance, val)));
    }
  };

  const handleSwap = () => {
    if (usdcBalance >= exchangeAmount && exchangeAmount > 0) {
      onExchange(exchangeAmount);
      setDropdownOpen(false);
    }
  };

  return (
    <div id="bet-presets-panel" className="w-full flex flex-col gap-3 select-none relative z-10">
      {/* Balance Dropdown & Currency Selector */}
      <div className="relative">
        <button
          id="currency-selector-btn"
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-10 bg-black border border-zinc-800 rounded-lg flex items-center justify-between px-4 text-xs font-mono font-bold text-white tracking-wider active:bg-zinc-950 transition"
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <Coins className="w-4 h-4 animate-pulse" />
            <span>ORO - {oroBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-[10px] text-zinc-500 font-sans font-normal uppercase">Token Wallet</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Currency Dropdown / Quick Exchange Panel */}
        {dropdownOpen && (
          <div
            id="token-exchange-dropdown"
            className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 shadow-2xl z-20"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" /> Token Exchange
              </span>
              <button
                id="reset-balance-btn"
                type="button"
                onClick={onResetBalances}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Funds
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-1.5 mb-2.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>USDC Wallet: ${usdcBalance.toFixed(2)}</span>
                <span>Rate: 1 USDC = 1 ORO</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="exchange-amount-input"
                    type="number"
                    min="1"
                    max={usdcBalance}
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-1.5 text-[9px] text-zinc-500 font-mono">USDC</span>
                </div>
                <button
                  id="execute-exchange-btn"
                  type="button"
                  onClick={handleSwap}
                  disabled={usdcBalance < exchangeAmount}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-bold text-xs px-3 rounded transition flex items-center gap-1"
                >
                  Swap
                </button>
              </div>
            </div>

            {/* Set Custom Bet Input */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Custom Bet Size</span>
              <div className="relative">
                <input
                  id="custom-bet-input"
                  type="number"
                  disabled={disabled}
                  min="0.1"
                  max={oroBalance}
                  step="0.1"
                  value={currentBet}
                  onChange={handleCustomBetChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-2 top-1.5 text-[9px] text-emerald-400 font-mono font-bold">ORO</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2x4 Presets Grid */}
      <div id="presets-grid" className="grid grid-cols-4 gap-2">
        {presets.map((amount) => {
          const isSelected = currentBet === amount;
          return (
            <button
              id={`preset-bet-${amount}`}
              key={amount}
              type="button"
              disabled={disabled}
              onClick={() => handlePresetClick(amount)}
              className={`h-11 flex flex-col items-center justify-center rounded-lg border font-mono transition duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-950 hover:bg-zinc-900 border-emerald-500/35 hover:border-emerald-500 text-emerald-400 font-bold'
              }`}
            >
              <span className="text-xs leading-none">{amount}</span>
              <span className="text-[9px] mt-0.5 opacity-80 leading-none">ORO</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
