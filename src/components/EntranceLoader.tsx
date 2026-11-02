'use client';

import React, { useState, useEffect } from 'react';
import Crest from '@/components/Crest';

export default function EntranceLoader() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    // Hold the atmospheric crest for 850ms, then initiate smooth fade out
    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 850);

    // Complete fade-out and unmount from DOM after 1450ms
    const unmountTimer = setTimeout(() => {
      setPhase('hidden');
    }, 1450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <aside
      aria-label="Nevermore Academy Loading"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0810] transition-all duration-700 ease-in-out ${
        phase === 'fading'
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E"),
          radial-gradient(circle at 50% 45%, rgba(124, 58, 237, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(214, 166, 60, 0.08) 0%, transparent 50%)
        `,
      }}
    >
      <div className="flex flex-col items-center text-center space-y-6 px-4">
        {/* Academy Crest with radial glow and subtle float */}
        <div className="relative">
          {/* Radial purple glow */}
          <div className="absolute -inset-8 rounded-full bg-purple-600/30 blur-2xl animate-pulse pointer-events-none" />
          <div className="relative animate-float">
            <Crest size="lg" showSubtitle={false} />
          </div>
        </div>

        {/* Text presentation */}
        <div className="space-y-2">
          <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-nevermore-gold uppercase font-bold block animate-pulse">
            Ink in Quills Presents
          </span>
          <h1 className="font-gothic text-2xl sm:text-4xl font-extrabold tracking-widest text-nevermore-parchment uppercase drop-shadow-md">
            Nevermore Academy
          </h1>
          <p className="font-mono text-[11px] tracking-widest text-nevermore-muted uppercase">
            Unsealing Ophelia Hall Archives...
          </p>
        </div>

        {/* Golden gothic progress filament */}
        <div className="w-52 sm:w-72 h-[2px] bg-nevermore-border/70 rounded-full overflow-hidden mt-2 relative">
          <div className="h-full bg-gradient-to-r from-transparent via-nevermore-gold to-transparent w-full animate-shimmer" />
        </div>
      </div>
    </aside>
  );
}

