/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameStage } from '../types';

interface RocketLogoProps {
  stage: GameStage;
  currentMultiplier?: number;
  className?: string;
}

export default function RocketLogo({ stage, currentMultiplier = 1.0, className = '' }: RocketLogoProps) {
  const [flicker, setFlicker] = useState(1);

  // Animate flame flicker
  useEffect(() => {
    if (stage === GameStage.FLYING || stage === GameStage.SYSTEMS_CHECK) {
      const interval = setInterval(() => {
        setFlicker(0.9 + Math.random() * 0.25);
      }, 70);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Adjust flame sizing based on flight progress
  const flameScaleY = stage === GameStage.FLYING ? flicker * (1 + Math.min((currentMultiplier - 1) * 0.08, 0.6)) : stage === GameStage.SYSTEMS_CHECK ? flicker * 0.5 : 0;
  const flameScaleX = stage === GameStage.FLYING ? flicker * (1 + Math.min((currentMultiplier - 1) * 0.03, 0.2)) : stage === GameStage.SYSTEMS_CHECK ? flicker * 0.8 : 0;

  // Shaking intensity during engine startup or fast flight
  const getShakeProps = () => {
    if (stage === GameStage.SYSTEMS_CHECK) {
      return {
        animate: {
          x: [-1, 1, -1, 1, 0],
          y: [-1, 1.5, -0.5, 0.5, 0],
        },
        transition: {
          repeat: Infinity,
          duration: 0.1,
        }
      };
    }
    if (stage === GameStage.FLYING) {
      const intensity = Math.min((currentMultiplier - 1) * 0.5, 3.5);
      return {
        animate: {
          x: [-intensity, intensity, -intensity, intensity, 0],
          y: [-intensity * 0.8, intensity * 1.2, -intensity * 0.5, 0],
        },
        transition: {
          repeat: Infinity,
          duration: 0.08,
        }
      };
    }
    return {
      animate: { y: [0, -6, 0] },
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      }
    };
  };

  return (
    <div id="rocket-logo-container" className={`relative flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        {stage === GameStage.CRASHED ? (
          <motion.div
            key="explosion"
            id="explosion-gfx"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Custom SVG Explosion */}
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {/* Core Blast */}
              <motion.circle
                cx="100"
                cy="100"
                r="35"
                fill="#ff4a00"
                initial={{ r: 10, opacity: 1 }}
                animate={{ r: 65, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="20"
                fill="#ffd200"
                initial={{ r: 5, opacity: 1 }}
                animate={{ r: 45, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="10"
                fill="#ffffff"
                initial={{ r: 2, opacity: 1 }}
                animate={{ r: 25, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />

              {/* Shrapnel / Sparks */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 360) / 12;
                const distance = 60 + Math.random() * 30;
                const rad = (angle * Math.PI) / 180;
                const targetX = 100 + Math.cos(rad) * distance;
                const targetY = 100 + Math.sin(rad) * distance;

                return (
                  <motion.circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={3 + Math.random() * 4}
                    fill={i % 3 === 0 ? "#ffd200" : i % 3 === 1 ? "#ff4a00" : "#ff0055"}
                    initial={{ cx: 100, cy: 100, opacity: 1 }}
                    animate={{ cx: targetX, cy: targetY, opacity: 0, scale: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                );
              })}

              {/* Smoke Clouds */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 360) / 6;
                const rad = (angle * Math.PI) / 180;
                const targetX = 100 + Math.cos(rad) * 35;
                const targetY = 100 + Math.sin(rad) * 35;

                return (
                  <motion.circle
                    key={`smoke-${i}`}
                    cx="100"
                    cy="100"
                    r="15"
                    fill="#3a3a3c"
                    initial={{ cx: 100, cy: 100, opacity: 0.8 }}
                    animate={{ cx: targetX, cy: targetY, r: 28, opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  />
                );
              })}
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="rocket"
            {...getShakeProps()}
            className="relative"
          >
            {/* Rocket Outer Container */}
            <svg
              id="rocket-svg"
              viewBox="0 0 160 220"
              className="w-44 h-60 drop-shadow-[0_10px_30px_rgba(0,180,255,0.25)] select-none"
            >
              <g id="rocket-group">
                {/* 1. FLAME AND JET EXHAUST */}
                {(stage === GameStage.FLYING || stage === GameStage.SYSTEMS_CHECK) && (
                  <g id="exhaust-flames" className="origin-top" style={{ transform: `scale(${flameScaleX}, ${flameScaleY})`, transformOrigin: '80px 172px' }}>
                    {/* Outer Red Flame */}
                    <path
                      d="M65,172 Q80,250 80,240 Q80,250 95,172 Z"
                      fill="url(#red-flame)"
                      opacity="0.85"
                    />
                    {/* Mid Orange Flame */}
                    <path
                      d="M70,172 Q80,225 80,220 Q80,225 90,172 Z"
                      fill="url(#orange-flame)"
                      opacity="0.95"
                    />
                    {/* Inner Yellow/White Flame */}
                    <path
                      d="M74,172 Q80,200 80,195 Q80,200 86,172 Z"
                      fill="url(#yellow-flame)"
                    />
                    {/* Glow Sparkles */}
                    <circle cx="80" cy="205" r="4" fill="#ffffff" opacity="0.8" />
                    <circle cx="76" cy="225" r="2.5" fill="#ffd200" opacity="0.6" />
                    <circle cx="84" cy="215" r="3" fill="#ff4a00" opacity="0.6" />
                  </g>
                )}

                {/* 2. BLUE BACK WING / FIN (Center stabilizer behind) */}
                <path
                  d="M75,150 L80,185 L85,150 Z"
                  fill="#1b4d8f"
                />

                {/* 3. BLUE SIDE FINS (Left & Right) */}
                {/* Left Fin */}
                <path
                  d="M55,120 C35,135 40,180 32,185 C42,185 60,170 60,140 Z"
                  fill="#1d90f3"
                  stroke="#105b9b"
                  strokeWidth="1.5"
                />
                {/* Right Fin */}
                <path
                  d="M105,120 C125,135 120,180 128,185 C118,185 100,170 100,140 Z"
                  fill="#1d90f3"
                  stroke="#105b9b"
                  strokeWidth="1.5"
                />

                {/* 4. ROCKET MAIN BODY (Egg shape / rounded fuselage) */}
                <path
                  d="M80,35 C115,55 115,145 105,170 C85,175 75,175 55,170 C45,145 45,55 80,35 Z"
                  fill="#fdfdfd"
                  stroke="#b3c2d4"
                  strokeWidth="2"
                />

                {/* Body Highlight Shading (Left Side light, Right side shadow) */}
                <path
                  d="M80,35 C45,55 45,145 55,170 C65,172 73,173 80,173 C80,173 80,35 80,35 Z"
                  fill="#ffffff"
                  opacity="0.9"
                />
                <path
                  d="M80,35 C80,35 80,173 80,173 C87,173 95,172 105,170 C115,145 115,55 80,35 Z"
                  fill="#eceff4"
                />

                {/* Rivets and Panel lines */}
                <line x1="80" y1="35" x2="80" y2="52" stroke="#ccd5e2" strokeWidth="1.5" />
                <path d="M52,100 C62,102 98,102 108,100" fill="none" stroke="#ccd5e2" strokeWidth="1.5" />
                <path d="M50,135 C60,137 100,137 110,135" fill="none" stroke="#ccd5e2" strokeWidth="1.5" />

                {/* Tiny Rivet Circles */}
                <circle cx="56" cy="103" r="1.5" fill="#9daabf" />
                <circle cx="104" cy="103" r="1.5" fill="#9daabf" />
                <circle cx="54" cy="138" r="1.5" fill="#9daabf" />
                <circle cx="106" cy="138" r="1.5" fill="#9daabf" />

                {/* 5. BLUE NOSE CONE */}
                <path
                  d="M80,35 C95,45 103,58 106,75 C98,78 62,78 54,75 C57,58 65,45 80,35 Z"
                  fill="#1d90f3"
                  stroke="#105b9b"
                  strokeWidth="1.5"
                />
                {/* Nose Cone Highlight */}
                <path
                  d="M80,35 C70,42 63,55 54,75 C60,77 75,77 80,77 Z"
                  fill="#47abff"
                />

                {/* 6. ENGINES NOZZLE (At bottom base) */}
                <path
                  d="M68,170 L92,170 L94,180 L66,180 Z"
                  fill="#4a5a70"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <rect x="71" y="180" width="18" height="3" rx="1" fill="#334155" />

                {/* 7. GLASS WINDSHIELD & PORTOLE RING */}
                <circle
                  cx="80"
                  cy="115"
                  r="24"
                  fill="#ccd5e2"
                  stroke="#8f9eb3"
                  strokeWidth="2"
                />
                <circle
                  cx="80"
                  cy="115"
                  r="20"
                  fill="#131e2d"
                />

                {/* 8. ANGRY BIRD PILOT (SVG) */}
                <g id="angry-bird-pilot" clipPath="url(#porthole-clip)">
                  {/* Body / Head - Turquoise/Blue Feathered Bird */}
                  <circle cx="80" cy="124" r="18" fill="#15abbb" />
                  
                  {/* Chest / Belly - Pale Yellow-White */}
                  <ellipse cx="80" cy="135" r="13" rx="11" ry="8" fill="#eaf7f5" />

                  {/* Cheeks highlight */}
                  <circle cx="68" cy="124" r="4" fill="#0d93a1" opacity="0.5" />
                  <circle cx="92" cy="124" r="4" fill="#0d93a1" opacity="0.5" />

                  {/* Big Angry Eyebrows - Black and slanted */}
                  {/* Left Eyebrow */}
                  <path
                    d="M62,112 L78,118 L76,122 L62,115 Z"
                    fill="#18181b"
                  />
                  {/* Right Eyebrow */}
                  <path
                    d="M98,112 L82,118 L84,122 L98,115 Z"
                    fill="#18181b"
                  />

                  {/* Circular Eyes */}
                  {/* Left Eye */}
                  <circle cx="70" cy="122" r="5" fill="#ffffff" />
                  <circle cx="71" cy="122" r="2.5" fill="#000000" />
                  <circle cx="72" cy="121" r="1" fill="#ffffff" /> {/* reflection */}

                  {/* Right Eye */}
                  <circle cx="90" cy="122" r="5" fill="#ffffff" />
                  <circle cx="89" cy="122" r="2.5" fill="#000000" />
                  <circle cx="88" cy="121" r="1" fill="#ffffff" /> {/* reflection */}

                  {/* Angry Yellow Beak */}
                  <path
                    d="M74,124 Q80,121 86,124 L80,133 Z"
                    fill="#f5a623"
                    stroke="#d58603"
                    strokeWidth="1"
                  />
                  {/* Beak Inner Line */}
                  <line x1="75" y1="125" x2="85" y2="125" stroke="#be7200" strokeWidth="1" />
                </g>

                {/* Glass Reflection on Porthole */}
                <path
                  d="M62,103 C68,97 78,95 85,96 C74,99 66,108 63,118 C62,113 62,106 62,103 Z"
                  fill="#ffffff"
                  opacity="0.25"
                />
              </g>

              {/* Definitions for Gradients and Clipping Paths */}
              <defs>
                {/* Porthole Clip so Angry Bird doesn't spill out of the glass */}
                <clipPath id="porthole-clip">
                  <circle cx="80" cy="115" r="20" />
                </clipPath>

                {/* Flames Gradients */}
                <linearGradient id="red-flame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff1100" />
                  <stop offset="60%" stopColor="#ff5e00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="orange-flame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5100" />
                  <stop offset="70%" stopColor="#ffb300" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffd000" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="yellow-flame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd000" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
