/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { playLiftoffRumble } from '../utils/audio';

interface LaunchOverlayProps {
  onComplete: () => void;
  soundEnabled: boolean;
}

export default function LaunchOverlay({ onComplete, soundEnabled }: LaunchOverlayProps) {
  const [telemetry, setTelemetry] = useState({
    thrust: 0,
    velocity: 0,
    altitude: 0,
    temp: 290
  });

  // Start sound & trigger step progress
  useEffect(() => {
    if (soundEnabled) {
      playLiftoffRumble();
    }

    // Telemetry updates
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000; // in seconds
      const ratio = Math.min(elapsed / 3.2, 1);

      setTelemetry({
        thrust: Math.round(ratio * 100),
        velocity: Math.round(ratio * 12500),
        altitude: Math.round(ratio * 4200),
        temp: Math.round(290 + ratio * 1480)
      });
    }, 50);

    const timer = setTimeout(() => {
      onComplete();
    }, 3200); // 3.2s slower epic sequence

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete, soundEnabled]);

  // Shake sequence configurations for engine rumble
  const shakeAnimation = {
    x: [0, -4, 4, -3, 3, -4, 4, -2, 2, 0],
    y: [0, 3, -3, 4, -4, 2, -2, 3, -3, 0],
    transition: {
      duration: 0.18,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div
      id="launch-overlay-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950/95 overflow-hidden font-sans select-none"
    >
      {/* 1. FLASHING BORDER DANGER STRIPES */}
      <div className="absolute inset-0 border-[10px] border-amber-500/20 pointer-events-none z-10 animate-pulse" />
      
      {/* Decorative vertical hazard lines */}
      <div className="absolute top-0 bottom-0 left-4 w-1 bg-gradient-to-b from-amber-500 via-transparent to-amber-500 opacity-30" />
      <div className="absolute top-0 bottom-0 right-4 w-1 bg-gradient-to-b from-amber-500 via-transparent to-amber-500 opacity-30" />

      {/* 2. TOP TELEMETRY BAR & ALERT BANNER */}
      <div className="w-full pt-8 px-6 text-center z-20">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-500/30 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-rose-400 font-mono text-xs font-semibold tracking-widest uppercase">
            WARNING: PROPULSION INITIATED
          </span>
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-4 uppercase">
          Liftoff Sequence
        </h2>
        <p className="text-zinc-400 font-mono text-xs mt-1">
          COORDINATES BOUND FOR INTERSTELLAR ORBIT
        </p>
      </div>

      {/* 3. CENTER GRAPHIC: RISING ROCKET & BOOSTER EXPLOSION OF PARTICLES */}
      <motion.div 
        animate={shakeAnimation}
        className="relative w-full flex-1 flex items-center justify-center"
      >
        {/* Particle / ember particles background drift */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              backgroundColor: i % 2 === 0 ? '#f43f5e' : '#f59e0b',
              left: `${20 + Math.random() * 60}%`,
              bottom: '10%',
            }}
            animate={{
              y: -500,
              x: Math.sin(i) * 50,
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.2]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Big fire plume behind the ascending rocket */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.6, 0.9, 0.6]
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="absolute bottom-20 w-32 h-64 bg-gradient-to-t from-transparent via-orange-500 to-rose-600 rounded-full blur-2xl opacity-60 mix-blend-screen"
        />

        {/* Animated Rocket climbing upward rapidly */}
        <motion.div
          initial={{ y: 240, scale: 0.85 }}
          animate={{ y: -340, scale: 1.2 }}
          transition={{ duration: 3.2, ease: "easeInOut" }}
          className="relative z-20 flex flex-col items-center"
        >
          {/* Custom SVG Rocket */}
          <svg className="w-36 h-36 drop-shadow-[0_0_35px_rgba(244,63,94,0.7)]" viewBox="0 0 100 100">
            {/* Rocket Body */}
            <path d="M50,15 C40,30 40,65 40,75 L60,75 C60,65 60,30 50,15 Z" fill="#f4f4f5" />
            
            {/* Nose Cone */}
            <path d="M50,15 C45,23 45,35 45,40 L55,40 C55,35 55,23 50,15 Z" fill="#10b981" />
            
            {/* Wings / Fins */}
            <path d="M40,60 C30,65 25,78 25,82 L40,75 Z" fill="#10b981" />
            <path d="M60,60 C70,65 75,78 75,82 L60,75 Z" fill="#10b981" />
            
            {/* Engine Nozzle */}
            <rect x="46" y="75" width="8" height="6" fill="#71717a" rx="1" />
            
            {/* Cabin Window with light inside */}
            <circle cx="50" cy="45" r="5" fill="#38bdf8" stroke="#18181b" strokeWidth="1.5" />
            <circle cx="48" cy="43" r="1.5" fill="#ffffff" />
            
            {/* Accent striping */}
            <path d="M40,55 L60,55" stroke="#e4e4e7" strokeWidth="2" />
            <path d="M41,65 L59,65" stroke="#e4e4e7" strokeWidth="2" />
          </svg>

          {/* Exhaust Flames directly under the engine */}
          <motion.div
            animate={{ 
              height: [30, 70, 30],
              scaleX: [0.9, 1.2, 0.9]
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
            className="w-7 bg-gradient-to-b from-yellow-300 via-orange-500 to-rose-600 rounded-b-full shadow-[0_0_20px_#f97316]"
          />
        </motion.div>
      </motion.div>

      {/* 4. LOWER TELEMETRY DATA PANEL */}
      <div className="w-full px-8 pb-8 z-20">
        <div className="grid grid-cols-4 gap-2 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl shadow-inner font-mono text-xs">
          <div className="flex flex-col items-center border-r border-zinc-800">
            <span className="text-zinc-500 tracking-wider">THRUST</span>
            <span className="text-amber-400 font-bold text-sm mt-0.5">{telemetry.thrust}%</span>
          </div>
          <div className="flex flex-col items-center border-r border-zinc-800">
            <span className="text-zinc-500 tracking-wider">VELOCITY</span>
            <span className="text-emerald-400 font-bold text-sm mt-0.5">{telemetry.velocity} km/h</span>
          </div>
          <div className="flex flex-col items-center border-r border-zinc-800">
            <span className="text-zinc-500 tracking-wider">ALTITUDE</span>
            <span className="text-sky-400 font-bold text-sm mt-0.5">{telemetry.altitude}m</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 tracking-wider">CHAMBER</span>
            <span className="text-rose-400 font-bold text-sm mt-0.5">{telemetry.temp}°C</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 text-zinc-600 font-mono text-[10px]">
          <span>GRID STABILITY: OK</span>
          <span>AUTOPILOT: ARMED</span>
          <span>BOOST RATIO: 2.5X</span>
        </div>
      </div>
    </motion.div>
  );
}
