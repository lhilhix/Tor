/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Send,
  Coins,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Award,
  DollarSign,
  ChevronDown
} from 'lucide-react';

import { GameStage, PlayerStats, ActiveBet, HistoryItem } from './types';
import RocketLogo from './components/RocketLogo';
import Starfield from './components/Starfield';
import CrashHistory from './components/CrashHistory';
import MultiplierSelector from './components/MultiplierSelector';
import PresetBetSelector from './components/PresetBetSelector';
import StatsPanel from './components/StatsPanel';

import {
  playBeep,
  playTick,
  playStartupBleep,
  playSuccessCashout,
  playExplosion,
  setVolume
} from './utils/audio';

// Pre-fill history with some realistic previous flight crash multipliers
const INITIAL_HISTORY: HistoryItem[] = [
  { id: '1', multiplier: 1.45, timestamp: '11:32:10 AM', isMega: false },
  { id: '2', multiplier: 4.82, timestamp: '11:33:14 AM', isMega: true },
  { id: '3', multiplier: 1.05, timestamp: '11:34:02 AM', isMega: false },
  { id: '4', multiplier: 2.10, timestamp: '11:34:45 AM', isMega: true },
  { id: '5', multiplier: 1.18, timestamp: '11:35:12 AM', isMega: false },
  { id: '6', multiplier: 12.55, timestamp: '11:36:20 AM', isMega: true },
];

export default function App() {
  // --- Game Loop States ---
  const [stage, setStage] = useState<GameStage>(GameStage.BETTING);
  const [countdown, setCountdown] = useState<number>(5.0);
  const [systemsCheckProgress, setSystemsCheckProgress] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.0);

  // --- Currency & Stats ---
  const [oroBalance, setOroBalance] = useState<number>(10.45); // matching screenshot balance ORO - 10.45
  const [usdcBalance, setUsdcBalance] = useState<number>(100.00);
  const [stats, setStats] = useState<PlayerStats>({
    usdcBalance: 100.00,
    oroBalance: 10.45,
    totalRounds: 0,
    totalWins: 0,
    highestMultiplier: 0,
    netProfit: 0,
  });

  // --- Betting configuration ---
  const [currentBetAmount, setCurrentBetAmount] = useState<number>(2); // Default to preset option 2 ORO
  const [autoCashout, setAutoCashout] = useState<number>(1.2); // Default to target 1.2x as seen in screenshot
  const [hasBetNextRound, setHasBetNextRound] = useState<boolean>(false);
  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);

  // --- Log / Notifications / UI ---
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);
  const [activeGameMode, setActiveGameMode] = useState<'classic' | 'high-stakes' | 'speed-run'>('classic');
  const [statsPanelOpen, setStatsPanelOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('normal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [systemsCheckText, setSystemsCheckText] = useState<string>('Systems check...');

  // --- References for continuous rendering loop ---
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastTickMultiplierRef = useRef<number>(1.0);

  // --- Persistence ---
  useEffect(() => {
    // Load local storage values if they exist
    const savedOro = localStorage.getItem('rc_oro_balance');
    const savedUsdc = localStorage.getItem('rc_usdc_balance');
    const savedStats = localStorage.getItem('rc_player_stats');
    const savedSound = localStorage.getItem('rc_sound_enabled');

    if (savedOro) setOroBalance(parseFloat(savedOro));
    if (savedUsdc) setUsdcBalance(parseFloat(savedUsdc));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedSound) {
      const isSound = savedSound === 'true';
      setSoundEnabled(isSound);
      setVolume(isSound ? 0.3 : 0);
    }
  }, []);

  const saveBalances = (oro: number, usdc: number) => {
    localStorage.setItem('rc_oro_balance', oro.toString());
    localStorage.setItem('rc_usdc_balance', usdc.toString());
  };

  const saveStats = (newStats: PlayerStats) => {
    localStorage.setItem('rc_player_stats', JSON.stringify(newStats));
  };

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // --- SOUND TOGGLE ---
  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    setVolume(newVal ? 0.3 : 0);
    localStorage.setItem('rc_sound_enabled', newVal ? 'true' : 'false');
    triggerToast(newVal ? 'Synthesizer Audio Enabled' : 'Audio Muted');
  };

  // --- EXCHANGE & RESET UTILITIES ---
  const handleExchange = (usdcToExchange: number) => {
    if (usdcBalance >= usdcToExchange) {
      const newUsdc = usdcBalance - usdcToExchange;
      const newOro = oroBalance + usdcToExchange;
      setUsdcBalance(newUsdc);
      setOroBalance(newOro);
      saveBalances(newOro, newUsdc);
      triggerToast(`Swapped $${usdcToExchange} USDC for +${usdcToExchange} ORO!`);
    }
  };

  const handleResetBalances = () => {
    const newOro = 10.45;
    const newUsdc = 100.00;
    setOroBalance(newOro);
    setUsdcBalance(newUsdc);
    saveBalances(newOro, newUsdc);
    triggerToast('Balances reset to sandbox defaults!');
  };

  const handleResetStats = () => {
    const newStats = {
      usdcBalance: 100.00,
      oroBalance: 10.45,
      totalRounds: 0,
      totalWins: 0,
      highestMultiplier: 0,
      netProfit: 0,
    };
    setStats(newStats);
    saveStats(newStats);
    triggerToast('Session statistics cleared!');
  };

  // --- STAGE: BETTING COUNTDOWN ---
  useEffect(() => {
    if (stage !== GameStage.BETTING) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          startSystemsCheck();
          return 0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage, hasBetNextRound, currentBetAmount, oroBalance]);

  const startSystemsCheck = () => {
    // Determine active bet
    if (hasBetNextRound) {
      if (oroBalance >= currentBetAmount) {
        const newOro = oroBalance - currentBetAmount;
        setOroBalance(newOro);
        saveBalances(newOro, usdcBalance);

        setActiveBet({
          amount: currentBetAmount,
          autoCashout: autoCashout,
          cashedOut: false,
        });

        setStats((prev) => {
          const next = {
            ...prev,
            totalRounds: prev.totalRounds + 1,
          };
          saveStats(next);
          return next;
        });

        if (soundEnabled) {
          playBeep(220, 0.2, 'sawtooth');
        }
      } else {
        triggerToast('Error: Insufficient ORO balance!');
        setActiveBet(null);
        setHasBetNextRound(false);
      }
    } else {
      setActiveBet(null);
    }

    setStage(GameStage.SYSTEMS_CHECK);
    setSystemsCheckProgress(0);
    setSystemsCheckText('Systems check...');
  };

  // --- STAGE: SYSTEMS CHECK ---
  useEffect(() => {
    if (stage !== GameStage.SYSTEMS_CHECK) return;

    const checkInterval = setInterval(() => {
      setSystemsCheckProgress((prev) => {
        const step = simulationSpeed === 'fast' ? 14 : 7;
        const next = prev + step;

        // Interactive status texts based on percentage
        if (next < 25) setSystemsCheckText('Systems check...');
        else if (next < 50) setSystemsCheckText('Preheating booster engines...');
        else if (next < 75) setSystemsCheckText('Oxygen pressure OK...');
        else if (next < 95) setSystemsCheckText('Angry bird pilot ready...');
        else setSystemsCheckText('LIFTOFF!');

        if (soundEnabled && next % 14 < 7) {
          playStartupBleep(next);
        }

        if (next >= 100) {
          clearInterval(checkInterval);
          launchFlight();
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(checkInterval);
  }, [stage, simulationSpeed, soundEnabled]);

  const launchFlight = () => {
    // Generate crash multiplier
    let crashPoint = 1.0;
    const rng = Math.random();

    // Game Mode modifiers
    if (activeGameMode === 'high-stakes') {
      // High Stakes: higher risk of early crash, but higher payout probability
      if (rng < 0.15) {
        crashPoint = 1.00 + Math.random() * 0.05; // 15% instant crash
      } else if (rng < 0.6) {
        crashPoint = 1.05 + Math.random() * 1.5;
      } else if (rng < 0.9) {
        crashPoint = 2.5 + Math.random() * 8.0;
      } else {
        crashPoint = 10.5 + Math.random() * 60.0;
      }
    } else if (activeGameMode === 'speed-run') {
      // Speed Run: smaller range but fast pacing
      if (rng < 0.05) {
        crashPoint = 1.01 + Math.random() * 0.04;
      } else if (rng < 0.7) {
        crashPoint = 1.05 + Math.random() * 1.2;
      } else {
        crashPoint = 2.2 + Math.random() * 5.0;
      }
    } else {
      // Classic Mode
      if (rng < 0.06) {
        crashPoint = 1.00 + Math.random() * 0.04; // 6% chance of near-instant crash
      } else if (rng < 0.55) {
        crashPoint = 1.04 + Math.random() * 0.96; // 49% chance 1.04x - 2.0x
      } else if (rng < 0.85) {
        crashPoint = 2.00 + Math.random() * 3.0;  // 30% chance 2.0x - 5.0x
      } else if (rng < 0.97) {
        crashPoint = 5.00 + Math.random() * 15.0; // 12% chance 5.0x - 20.0x
      } else {
        crashPoint = 20.00 + Math.random() * 80.0; // 3% chance 20.0x - 100.0x
      }
    }

    setCrashMultiplier(Math.round(crashPoint * 100) / 100);
    setCurrentMultiplier(1.00);
    setStage(GameStage.FLYING);

    lastTimeRef.current = performance.now();
    lastTickMultiplierRef.current = 1.00;
  };

  // --- STAGE: FLIGHT FLYING ANIMATION (rAF) ---
  useEffect(() => {
    if (stage !== GameStage.FLYING) return;

    const animateFlight = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setCurrentMultiplier((prevMultiplier) => {
        // Multiplier climbs non-linearly. Speed up as flight climbs!
        const speedCoefficient = simulationSpeed === 'fast' ? 0.22 : 0.10;
        const speedMultiplier = activeGameMode === 'speed-run' ? 1.6 : 1.0;
        const increment = deltaTime * speedCoefficient * speedMultiplier * (1 + prevMultiplier * 0.06);
        const nextMultiplier = prevMultiplier + increment;

        // Sound tick triggers on every 0.10x step
        if (soundEnabled && nextMultiplier - lastTickMultiplierRef.current >= 0.1) {
          playTick(nextMultiplier);
          lastTickMultiplierRef.current = Math.floor(nextMultiplier * 10) / 10;
        }

        // --- CRASH TRIGGER ---
        if (nextMultiplier >= crashMultiplier) {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          handleCrash();
          return crashMultiplier;
        }

        return nextMultiplier;
      });

      requestRef.current = requestAnimationFrame(animateFlight);
    };

    requestRef.current = requestAnimationFrame(animateFlight);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [stage, crashMultiplier, simulationSpeed, soundEnabled, activeGameMode]);

  const handleCrash = () => {
    if (soundEnabled) {
      playExplosion();
    }

    // Process lost bet
    if (activeBet && !activeBet.cashedOut) {
      setStats((prev) => {
        const next = {
          ...prev,
          netProfit: prev.netProfit - activeBet.amount,
        };
        saveStats(next);
        return next;
      });
    }

    // Add to history
    const isMega = crashMultiplier >= 2.0;
    const flightTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory((prev) => {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const updated = [{ id: uniqueId, multiplier: crashMultiplier, timestamp: flightTime, isMega }, ...prev];
      return updated.slice(0, 8); // Keep last 8
    });

    setStage(GameStage.CRASHED);

    // After 3.5 seconds, start the next betting round
    setTimeout(() => {
      setCountdown(5.0);
      setHasBetNextRound(false);
      setActiveBet(null);
      setStage(GameStage.BETTING);
    }, 3500);
  };

  // --- MANUAL CASH OUT TRIGGER ---
  const handleManualCashout = () => {
    if (stage !== GameStage.FLYING || !activeBet || activeBet.cashedOut) return;

    const cashoutPoint = Math.round(currentMultiplier * 100) / 100;
    const winnings = activeBet.amount * cashoutPoint;
    const netProfitGained = winnings - activeBet.amount;

    const newOro = oroBalance + winnings;
    setOroBalance(newOro);
    saveBalances(newOro, usdcBalance);

    if (soundEnabled) {
      playSuccessCashout();
    }

    setActiveBet((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cashedOut: true,
        cashoutMultiplier: cashoutPoint,
        winAmount: winnings,
      };
    });

    setStats((prev) => {
      const next = {
        ...prev,
        totalWins: prev.totalWins + 1,
        netProfit: prev.netProfit + netProfitGained,
        highestMultiplier: Math.max(prev.highestMultiplier, cashoutPoint),
      };
      saveStats(next);
      return next;
    });

    triggerToast(`CASHED OUT! Secured +${winnings.toFixed(2)} ORO`);
  };

  // --- BET ENQUEUE / CANCEL ---
  const handleBetToggle = () => {
    if (stage !== GameStage.BETTING) return;

    if (hasBetNextRound) {
      setHasBetNextRound(false);
      triggerToast('Bet cancelled!');
    } else {
      if (oroBalance >= currentBetAmount) {
        setHasBetNextRound(true);
        triggerToast(`Bet queued: ${currentBetAmount} ORO at ${autoCashout.toFixed(1)}x`);
      } else {
        triggerToast('Error: Insufficient ORO balance!');
      }
    }
  };

  // Share utility
  const handleShareClick = () => {
    const inviteLink = window.location.href;
    navigator.clipboard.writeText(inviteLink).then(() => {
      triggerToast('Invite link copied to clipboard!');
    }).catch(() => {
      triggerToast('Failed to copy. Share game: Rocket Crash!');
    });
  };

  return (
    <div
      id="main-viewport-container"
      className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center py-0 sm:py-8 text-white relative font-sans overflow-x-hidden select-none"
    >
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Interactive Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="toast-alert"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-14 bg-zinc-900 border border-emerald-500/55 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-full z-50 flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Container: Max width 420px mimicking smartphone viewport exactly, expanding fluidly on small screens */}
      <div
        id="app-mobile-frame"
        className="w-full max-w-[420px] h-[100dvh] sm:h-[860px] bg-black sm:rounded-[40px] sm:border-8 sm:border-zinc-800 flex flex-col justify-between overflow-hidden shadow-2xl relative z-10"
      >
        {/* App Top Notch / Native Header (Visible on Desktop Frame) */}
        <div className="hidden sm:flex h-7 w-full bg-zinc-900 items-center justify-between px-8 text-[11px] font-mono text-zinc-500 border-b border-zinc-950">
          <span>11:37 AM</span>
          <div className="w-24 h-4.5 bg-black rounded-full border border-zinc-800" />
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-zinc-600 rounded-sm p-0.5 flex items-center">
              <div className="w-3.5 h-full bg-zinc-400" />
            </div>
          </div>
        </div>

        {/* --- APP HEADER BAR --- */}
        <header
          id="app-header-navigation"
          className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/40 bg-zinc-950/60 backdrop-blur relative z-30"
        >
          {/* Close / Action Menu */}
          <button
            id="header-close-btn"
            type="button"
            onClick={() => {
              handleResetBalances();
              triggerToast('Game reloaded!');
            }}
            className="text-zinc-400 hover:text-white p-1 rounded-full transition hover:bg-zinc-900"
            title="Reset Game Console"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Game Dropdown Title selector */}
          <div className="relative">
            <button
              id="game-mode-toggle-btn"
              type="button"
              onClick={() => setGameModeMenuOpen(!gameModeMenuOpen)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-extrabold text-zinc-100 hover:text-emerald-400 font-display px-2 py-1 rounded transition"
            >
              🚀 Rocket Crash
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Sub-modes dropdown list */}
            {gameModeMenuOpen && (
              <div
                id="game-modes-menu"
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 shadow-2xl z-50 font-mono"
              >
                <div className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1.5 px-2">
                  Select Game Engine
                </div>
                {(['classic', 'high-stakes', 'speed-run'] as const).map((mode) => (
                  <button
                    id={`mode-select-${mode}`}
                    key={mode}
                    type="button"
                    onClick={() => {
                      setActiveGameMode(mode);
                      setGameModeMenuOpen(false);
                      triggerToast(`Switched to ${mode.replace('-', ' ')} mode!`);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs uppercase font-bold flex items-center justify-between ${
                      activeGameMode === mode
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span>{mode.replace('-', ' ')}</span>
                    {activeGameMode === mode && <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Top Right USDC Balance Pill and Share */}
          <div className="flex items-center gap-2">
            <div
              id="usdc-balance-badge"
              className="px-2.5 py-1 bg-zinc-950 border border-emerald-500/25 rounded-md flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-400"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>USDC {usdcBalance.toFixed(2)}</span>
            </div>
            <button
              id="share-game-btn"
              type="button"
              onClick={handleShareClick}
              className="text-zinc-400 hover:text-white p-1 rounded-full transition hover:bg-zinc-900"
              title="Copy Invite Link"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* --- MAIN GAME SCREEN AREA (FLIGHT DECK) --- */}
        <main
          id="flight-deck-deck"
          className="flex-1 bg-black flex flex-col justify-between p-4 relative overflow-hidden border-b border-zinc-900"
        >
          {/* Falling Space Dust Canvas Background */}
          <Starfield stage={stage} multiplier={currentMultiplier} />

          {/* Top Panel: Recent crash points history */}
          <div className="w-full z-10">
            <CrashHistory history={history} />
          </div>

          {/* Centered Rocket Illustration and flight numbers display */}
          <div id="flight-stage-container" className="flex-1 flex flex-col items-center justify-center relative my-4 min-h-[220px]">
            {/* Real-time Status Overlay or Flight Numbers */}
            <div className="absolute top-0 flex flex-col items-center justify-center w-full text-center z-10 pointer-events-none">
              <AnimatePresence mode="wait">
                {stage === GameStage.BETTING && (
                  <motion.div
                    key="betting-tag"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-mono font-bold flex items-center gap-1.5 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      Accepting Bets
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-1">
                      Next launch in {countdown.toFixed(1)}s
                    </span>
                  </motion.div>
                )}

                {stage === GameStage.FLYING && (
                  <motion.div
                    key="flying-tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[11px] uppercase tracking-widest text-amber-400 font-mono font-extrabold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                      Rocket Climbing
                    </span>
                  </motion.div>
                )}

                {stage === GameStage.CRASHED && (
                  <motion.div
                    key="crashed-tag"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0.9, 1.1, 1], scale: 1 }}
                    className="flex flex-col items-center bg-rose-950/30 px-4 py-2 rounded-xl border border-rose-500/30"
                  >
                    <span className="text-[12px] uppercase tracking-widest text-rose-500 font-mono font-extrabold">
                      Engine Meltdown
                    </span>
                    <span className="text-xl font-mono font-black text-rose-400 mt-0.5">
                      CRASHED AT {crashMultiplier.toFixed(2)}x
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rocket Canvas Render */}
            <RocketLogo
              stage={stage}
              currentMultiplier={currentMultiplier}
              className="z-10 mt-6"
            />

            {/* Interactive Dynamic Neon Progress Box (0% Loading Bar in screenshot) */}
            <div id="dynamic-neon-status-pill" className="w-full max-w-[320px] mt-6 z-10">
              <AnimatePresence mode="wait">
                {stage === GameStage.SYSTEMS_CHECK ? (
                  <motion.div
                    key="status-checking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {/* Status Text Label */}
                    <div className="flex items-center justify-center gap-2 mb-1.5 text-xs text-rose-500 font-mono font-extrabold uppercase tracking-widest">
                      <div className="w-2.5 h-2.5 border-2 border-dotted border-rose-500 rounded-full animate-spin" />
                      {systemsCheckText}
                    </div>

                    {/* Green Outline Progress Capsule Capsule */}
                    <div className="w-full h-16 bg-black border-[3px] border-emerald-500 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {/* Interactive Progress Fill */}
                      <div
                        id="checking-fill-bar"
                        style={{ width: `${systemsCheckProgress}%` }}
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-100"
                      />
                      <span className="text-white font-mono text-[34px] font-black tracking-wide relative z-10 select-all">
                        {systemsCheckProgress}%
                      </span>
                    </div>
                  </motion.div>
                ) : stage === GameStage.FLYING ? (
                  <motion.div
                    key="status-flying"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {/* Flying Multiplier Capsule Capsule */}
                    <div className="w-full h-20 bg-black border-[3px] border-emerald-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.4)] relative">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider absolute top-1.5">
                        Current Multiplier
                      </span>
                      <span className="text-white font-mono text-[42px] font-black tracking-widest animate-pulse leading-none mt-2">
                        {currentMultiplier.toFixed(2)}x
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-20" /> // spacer to keep layouts identical between transitions
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* --- BOTTOM SECTION: CONTROLS & BET DECK --- */}
        <section
          id="betting-control-deck"
          className="bg-zinc-950 p-4 border-t border-zinc-900 flex flex-col gap-4 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Module 1: Select Multiplier incrementers */}
          <MultiplierSelector
            value={autoCashout}
            onChange={setAutoCashout}
            disabled={stage !== GameStage.BETTING}
          />

          {/* Module 2: Token Selector & Presets Grid */}
          <PresetBetSelector
            currentBet={currentBetAmount}
            onBetChange={setCurrentBetAmount}
            oroBalance={oroBalance}
            usdcBalance={usdcBalance}
            onExchange={handleExchange}
            onResetBalances={handleResetBalances}
            disabled={stage !== GameStage.BETTING}
          />

          {/* Module 3: Major Action Launch Button */}
          <div className="w-full">
            {stage === GameStage.BETTING ? (
              <button
                id="main-action-bet-btn"
                type="button"
                onClick={handleBetToggle}
                className={`w-full h-16 rounded-xl font-display font-extrabold text-[16px] tracking-widest uppercase transition-all duration-150 active:scale-98 shadow-md flex flex-col items-center justify-center ${
                  hasBetNextRound
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                <span>{hasBetNextRound ? 'CANCEL BET' : 'BET FOR NEXT ROUND'}</span>
                <span className="text-[11px] font-mono opacity-80 mt-0.5 tracking-wide font-bold">
                  {currentBetAmount} ORO at {autoCashout.toFixed(1)}x
                </span>
              </button>
            ) : stage === GameStage.FLYING && activeBet && !activeBet.cashedOut ? (
              <button
                id="main-action-cashout-btn"
                type="button"
                onClick={handleManualCashout}
                className="w-full h-16 bg-[#e6b412] hover:bg-yellow-400 text-black rounded-xl font-display font-black text-[18px] tracking-wider uppercase transition-all duration-100 hover:shadow-[0_0_20px_rgba(230,180,18,0.6)] animate-pulse flex flex-col items-center justify-center active:scale-95"
              >
                <span>CASH OUT</span>
                <span className="text-[11px] font-mono font-bold tracking-wide mt-0.5">
                  Secure +{(activeBet.amount * currentMultiplier).toFixed(2)} ORO
                </span>
              </button>
            ) : stage === GameStage.FLYING && activeBet?.cashedOut ? (
              <div className="w-full h-16 bg-emerald-950/60 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center select-none shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="text-emerald-400 font-display font-black text-sm tracking-widest uppercase">
                  CASHED OUT
                </span>
                <span className="text-[10px] font-mono text-emerald-500 mt-0.5 font-bold">
                  Received +{activeBet.winAmount?.toFixed(2)} ORO ({activeBet.cashoutMultiplier?.toFixed(2)}x)
                </span>
              </div>
            ) : (
              <button
                id="main-action-disabled-btn"
                disabled
                type="button"
                className="w-full h-16 bg-yellow-950/20 border border-yellow-950/60 text-yellow-600/40 rounded-xl font-display font-bold text-[15px] tracking-widest uppercase flex items-center justify-center cursor-not-allowed select-none"
              >
                WAIT FOR ROCKET...
              </button>
            )}
          </div>
        </section>

        {/* --- NATIVE FOOTER AREA & CONTROL DECK GEAR --- */}
        <footer
          id="app-footer-bar"
          className="flex items-center justify-between px-6 py-3 bg-zinc-950/80 border-t border-zinc-900/30 text-zinc-500 text-[10px] font-mono relative z-20"
        >
          <span>PROTOTYPE ENGINE v1.4</span>
          
          {/* Small gear button opens the stats deck */}
          <button
            id="control-deck-open-btn"
            type="button"
            onClick={() => setStatsPanelOpen(true)}
            className="text-zinc-400 hover:text-white p-1.5 rounded bg-zinc-900 border border-zinc-800 transition active:scale-95 flex items-center gap-1 font-bold"
          >
            <Settings className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>STATS & RULES</span>
          </button>
        </footer>

        {/* Stats Panel drawer component */}
        <StatsPanel
          stats={stats}
          isOpen={statsPanelOpen}
          onClose={() => setStatsPanelOpen(false)}
          onResetStats={handleResetStats}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          simulationSpeed={simulationSpeed}
          onToggleSpeed={() => {
            const nextSpeed = simulationSpeed === 'normal' ? 'fast' : 'normal';
            setSimulationSpeed(nextSpeed);
            triggerToast(`Flight Speed: ${nextSpeed === 'fast' ? 'Hyper Speed (2x)' : 'Standard (1x)'}`);
          }}
        />
      </div>
    </div>
  );
}
