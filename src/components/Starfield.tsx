/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameStage } from '../types';

interface StarfieldProps {
  stage: GameStage;
  multiplier?: number;
}

export default function Starfield({ stage, multiplier = 1.0 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Track resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Stars definition
    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      color: string;
    }

    const stars: Star[] = [];
    const numStars = 100;

    // Initialize stars
    const colors = ['#ffffff', '#8be9fd', '#ff79c6', '#bd93f9', '#50fa7b'];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine speed modifier based on game stage
      let speedFactor = 1.0;
      if (stage === GameStage.FLYING) {
        // Star speed scales with multiplier
        speedFactor = 5.0 + Math.min(multiplier * 3.5, 25.0);
      } else if (stage === GameStage.SYSTEMS_CHECK) {
        speedFactor = 2.0;
      } else if (stage === GameStage.CRASHED) {
        speedFactor = 0.15; // Slow down nearly to a halt
      } else {
        // Betting / Waiting phase
        speedFactor = 0.6;
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move stars downward
        star.y += star.speed * speedFactor;

        // Reset star when it goes off bottom
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
          star.size = Math.random() * 2 + 0.5;
          star.speed = Math.random() * 0.8 + 0.2;
          star.opacity = Math.random() * 0.7 + 0.3;
        }

        // Draw star
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;

        if (stage === GameStage.FLYING && multiplier > 1.5) {
          // Draw streak lines to simulate fast warp/travel
          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.size;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x, star.y - (star.speed * speedFactor * 0.6));
          ctx.stroke();
        } else {
          // Regular circular dots
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [stage, multiplier]);

  return (
    <canvas
      id="starfield-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
