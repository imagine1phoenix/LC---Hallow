import React from 'react';

interface CrestProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function Crest({ size = 'md', showSubtitle = true }: CrestProps) {
  const dim = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${dim} flex items-center justify-center shrink-0 animate-crestEntrance`}>
        {/* Subtle radial purple glow behind the academy crest */}
        <div className="absolute -inset-2.5 rounded-full bg-purple-600/25 blur-lg pointer-events-none -z-10" />

        {/* Crest Ring */}
        <div className="absolute inset-0 rounded-full border border-nevermore-gold/50 shadow-candle animate-pulseGlow" />

        {/* Raven / Quill Symbol */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-nevermore-gold fill-current p-1.5 drop-shadow">
          <circle cx="50" cy="50" r="46" fill="#151020" stroke="#D6A63C" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#D6A63C" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.7" />
          {/* Gothic Raven Wings */}
          <path
            d="M50 20 C42 32, 25 38, 20 54 C30 52, 38 56, 45 68 C47 55, 42 42, 50 32 C58 42, 53 55, 55 68 C62 56, 70 52, 80 54 C75 38, 58 32, 50 20 Z"
            fill="#D6A63C"
          />
          {/* Central Quill & Key */}
          <polygon points="50,26 53,40 50,78 47,40" fill="#F2EBDD" />
          {/* Star at crown */}
          <polygon points="50,14 52,18 56,18 53,21 54,25 50,23 46,25 47,21 44,18 48,18" fill="#e11d48" />
        </svg>
      </div>

      {showSubtitle && (
        <div className="flex flex-col animate-titleEntrance">
          <span className="font-gothic text-base sm:text-lg font-bold tracking-wider text-nevermore-parchment leading-tight">
            NEVERMORE ACADEMY
          </span>
          <span className="text-[10px] uppercase tracking-widest text-nevermore-gold font-mono font-semibold">
            EST. 1891 · MURDER MYSTERY
          </span>
        </div>
      )}
    </div>
  );
}
