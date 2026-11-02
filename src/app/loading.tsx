import React from 'react';
import Crest from '@/components/Crest';

export default function Loading() {
  return (
    <div
      aria-label="Loading Page"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0B0810]/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center text-center space-y-6 px-4 animate-fadeIn">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-purple-600/30 blur-2xl animate-pulse pointer-events-none" />
          <div className="relative animate-float">
            <Crest size="lg" showSubtitle={false} />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-gothic text-xl sm:text-2xl font-bold tracking-widest text-nevermore-parchment uppercase">
            Nevermore Academy
          </h2>
          <p className="font-mono text-[11px] tracking-widest text-nevermore-gold uppercase animate-pulse">
            Loading Archives...
          </p>
        </div>

        <div className="w-48 sm:w-60 h-[2px] bg-nevermore-border/70 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-transparent via-nevermore-gold to-transparent w-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

