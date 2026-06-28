/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface ExplodingStatusPillProps {
  crashMultiplier: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
  gravity?: number;
}

export default function ExplodingStatusPill({ crashMultiplier }: ExplodingStatusPillProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    // Hide text slightly after impact to simulate the text "shattering" or "exploding"
    const textTimer = setTimeout(() => {
      setShowText(false);
    }, 120);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling for crisp rendering on mobile & retina
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Define colors for the engine explosion
    const colors = [
      '#ef4444', // Red-500
      '#f97316', // Orange-500
      '#f59e0b', // Amber-500
      '#facc15', // Yellow-400
      '#ffffff', // White-hot core
      '#ec4899', // Pink-500 for variety
    ];

    const particles: Particle[] = [];

    // Spawn initial blast particles (concentrated in the center where the text is)
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Core explosion rings & fragments (high energy)
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.5;
      particles.push({
        x: centerX + (Math.random() * 60 - 30),
        y: centerY + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // slightly upward bias
        size: 1.5 + Math.random() * 4.5,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: 0.015 + Math.random() * 0.025,
        gravity: 0.04
      });
    }

    // 2. High-speed sparks / shrapnel
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5.0 + Math.random() * 6.0;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.0 + Math.random() * 1.5,
        alpha: 1.0,
        color: '#fef08a', // vibrant pale yellow sparks
        decay: 0.03 + Math.random() * 0.04,
        gravity: 0.08
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render each particle with custom composite operations for a premium neon glow
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply velocities and physics
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) {
          p.vy += p.gravity;
        }

        // Apply decay
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with gorgeous glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Neon composite operation
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Keep spawning minor lingering background ash during the countdown phase
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(textTimer);
    };
  }, [crashMultiplier]);

  return (
    <div className="relative w-full h-20 flex items-center justify-center overflow-visible">
      {/* 1. Neon Glowing Border Capsule */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: [
            '0 0 10px rgba(239, 68, 68, 0.2), inset 0 0 5px rgba(239, 68, 68, 0.1)',
            '0 0 25px rgba(249, 115, 22, 0.6), inset 0 0 12px rgba(249, 115, 22, 0.3)',
            '0 0 12px rgba(239, 68, 68, 0.3), inset 0 0 6px rgba(239, 68, 68, 0.15)',
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        className="w-full h-20 bg-black/90 rounded-full flex flex-col items-center justify-center relative overflow-hidden border-[3px] border-transparent bg-clip-padding"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.95), rgba(0,0,0,0.95)), linear-gradient(135deg, #ef4444, #f97316, #ec4899)',
        }}
      >
        {/* Real-time Explosive Scatter Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Text Area (with text shattering transition) */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {showText ? (
            <motion.div
              initial={{ scale: 0.7, filter: 'blur(4px)' }}
              animate={{ scale: [1.1, 1], filter: 'blur(0px)' }}
              exit={{ scale: 1.4, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.12 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-[10px] text-rose-400 font-mono font-bold uppercase tracking-widest">
                System Overload
              </span>
              <span className="text-white font-mono text-[34px] font-black tracking-wider leading-none mt-1">
                {crashMultiplier.toFixed(2)}x
              </span>
            </motion.div>
          ) : (
            // Residual visual state after the text explodes
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest animate-pulse">
                💥 MELTDOWN DETECTED
              </span>
              <span className="text-rose-500 font-mono text-[22px] font-bold tracking-widest leading-none mt-1">
                CRASHED
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
