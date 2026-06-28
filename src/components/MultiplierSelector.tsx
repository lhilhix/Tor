/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface MultiplierSelectorProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function MultiplierSelector({ value, onChange, disabled = false }: MultiplierSelectorProps) {
  const minVal = 1.01;
  const maxVal = 100.0;

  const handleAdjust = (amount: number) => {
    if (disabled) return;
    const newVal = Math.max(minVal, Math.min(maxVal, Math.round((value + amount) * 100) / 100));
    onChange(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    let raw = e.target.value.replace(/x/gi, '').trim();
    if (raw === '') {
      onChange(minVal);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(Math.max(minVal, Math.min(maxVal, Math.round(parsed * 100) / 100)));
    }
  };

  return (
    <div id="multiplier-selector-wrapper" className="w-full flex flex-col items-center select-none">
      <span className="text-[13px] uppercase tracking-wider text-zinc-300 font-mono mb-2">
        Select Multiplier
      </span>

      <div className="w-full grid grid-cols-12 gap-2 items-center">
        {/* Left Adjusters Column */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Minus Button */}
          <button
            id="multiplier-minus-btn"
            type="button"
            disabled={disabled}
            onClick={() => handleAdjust(-0.1)}
            className="w-full h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700/50 hover:border-emerald-500 rounded-lg text-zinc-300 hover:text-emerald-400 font-bold active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            <Minus className="w-4 h-4" />
          </button>
          {/* Minus 10x Button */}
          <button
            id="multiplier-minus10-btn"
            type="button"
            disabled={disabled}
            onClick={() => handleAdjust(-1.0)}
            className="w-full h-8 flex items-center justify-center bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 rounded-lg text-xs font-mono font-medium text-zinc-400 hover:text-emerald-400 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            -10x
          </button>
        </div>

        {/* Central Display */}
        <div className="col-span-6 h-[76px] bg-black border-2 border-zinc-800 focus-within:border-emerald-500 rounded-xl flex items-center justify-center shadow-inner relative">
          <input
            id="multiplier-input"
            type="text"
            disabled={disabled}
            value={`${value.toFixed(1)}x`}
            onChange={handleInputChange}
            className="w-full h-full text-center bg-transparent text-white font-mono text-[30px] font-extrabold focus:outline-none tracking-wide select-all caret-emerald-500"
          />
        </div>

        {/* Right Adjusters Column */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Plus Button */}
          <button
            id="multiplier-plus-btn"
            type="button"
            disabled={disabled}
            onClick={() => handleAdjust(0.1)}
            className="w-full h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700/50 hover:border-emerald-500 rounded-lg text-zinc-300 hover:text-emerald-400 font-bold active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
          </button>
          {/* Plus 10x Button */}
          <button
            id="multiplier-plus10-btn"
            type="button"
            disabled={disabled}
            onClick={() => handleAdjust(1.0)}
            className="w-full h-8 flex items-center justify-center bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 rounded-lg text-xs font-mono font-medium text-zinc-400 hover:text-emerald-400 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            +10x
          </button>
        </div>
      </div>
    </div>
  );
}
