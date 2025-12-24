
import React, { useState, useEffect, useRef } from 'react';
import { Slot } from '../types';
import { sounds } from '../services/audioService';

interface GameBoardProps {
  isDropping: boolean;
  targetSlotIndex: number | null;
  slots: Slot[];
}

const GameBoard: React.FC<GameBoardProps> = ({ isDropping, targetSlotIndex, slots }) => {
  const [coinPos, setCoinPos] = useState<{ x: number; y: number; rotate: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropping && targetSlotIndex !== null) {
      setCoinPos({ x: 50, y: 5, rotate: 0 });

      const duration = 3000;
      const startTime = Date.now();
      
      const slotWidth = 100 / slots.length;
      const targetX = (targetSlotIndex * slotWidth) + (slotWidth / 2);
      
      const numBounces = 12; // Increased for more chaotic path
      const bouncePoints: {x: number, y: number, r: number}[] = [];
      
      bouncePoints.push({ x: 50, y: 5, r: 0 });
      
      for (let i = 1; i < numBounces; i++) {
        const rowY = (i / numBounces) * 88 + 5;
        // More drastic randomness in the middle of the board
        const randomnessScale = Math.sin((i / numBounces) * Math.PI) * 45;
        const randomXOffset = (Math.random() - 0.5) * randomnessScale;
        
        // Dynamic pull factor
        const pull = Math.pow(i / numBounces, 1.5);
        const currentTargetX = 50 + (targetX - 50) * pull;
        
        bouncePoints.push({ 
          x: Math.max(5, Math.min(95, currentTargetX + randomXOffset)), 
          y: rowY,
          r: (Math.random() - 0.5) * 720
        });
      }
      
      bouncePoints.push({ x: targetX, y: 100, r: (Math.random() - 0.5) * 1080 });

      let lastBounceIdx = -1;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const segmentCount = bouncePoints.length - 1;
        const segmentIdx = Math.floor(progress * segmentCount);
        const segmentProgress = (progress * segmentCount) % 1;
        
        const start = bouncePoints[segmentIdx];
        const end = bouncePoints[segmentIdx + 1] || start;

        // Quadratic Ease for Y within segment to simulate gravity/bounce
        const t = segmentProgress;
        const easeT = t * t * (3 - 2 * t); // Smoothstep

        const currentX = start.x + (end.x - start.x) * easeT;
        const currentY = start.y + (end.y - start.y) * segmentProgress;
        const currentR = start.r + (end.r - start.r) * segmentProgress;

        setCoinPos({ x: currentX, y: currentY, rotate: currentR });

        if (segmentIdx > lastBounceIdx && segmentIdx < bouncePoints.length - 1) {
          sounds.tick();
          lastBounceIdx = segmentIdx;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setCoinPos(null);
    }
  }, [isDropping, targetSlotIndex, slots.length]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-slate-950">
      {/* Peg Grid with Glow */}
      <div className="absolute inset-0 grid grid-cols-7 grid-rows-12 p-8 gap-x-8 gap-y-12 pointer-events-none opacity-40">
        {Array.from({ length: 84 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none"></div>

      {/* Falling Coin */}
      {coinPos && (
        <div
          className="absolute w-14 h-14 -ml-7 -mt-7 z-20 pointer-events-none transition-transform duration-75"
          style={{
            left: `${coinPos.x}%`,
            top: `${coinPos.y}%`,
            transform: `rotate(${coinPos.rotate}deg)`
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 rounded-full border-[4px] border-amber-100/30 shadow-[0_0_40px_rgba(251,191,36,0.9)] flex items-center justify-center">
            <span className="text-slate-950 font-black text-xl drop-shadow-lg">$</span>
          </div>
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse"></div>
        </div>
      )}

      {/* Industrial Slots */}
      <div className="mt-auto h-32 w-full flex border-t-[8px] border-slate-900 bg-slate-950 relative z-30">
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`flex-1 h-full flex flex-col items-center justify-between py-4 border-x border-slate-900/40 transition-all duration-500 relative overflow-hidden ${
              isDropping && targetSlotIndex === i ? 'brightness-125 scale-y-105 origin-bottom' : 'brightness-50 grayscale-[0.2]'
            } ${slot.color}`}
          >
            <div className={`w-4 h-2 rounded-full mb-1 transition-all duration-300 ${isDropping && targetSlotIndex === i ? 'bg-white shadow-[0_0_20px_white]' : 'bg-black/50'}`}></div>
            
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-white text-center leading-none uppercase tracking-tighter drop-shadow-md">
                {slot.label.split(' ')[0]}
              </span>
              <span className="text-[11px] font-black text-white/90 text-center leading-none uppercase mt-1">
                {slot.label.split(' ')[1] || ''}
              </span>
            </div>

            <div className="w-full h-1 bg-black/10 mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
