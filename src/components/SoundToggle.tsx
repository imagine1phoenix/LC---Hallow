'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function SoundToggle() {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(sound.isMuted());
  }, []);

  const handleToggle = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={muted ? 'Unmute Gothic Atmosphere Sound' : 'Mute Sound'}
      className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
        muted
          ? 'bg-black/40 hover:bg-nevermore-surface border-nevermore-border/60 text-nevermore-muted hover:text-nevermore-parchment'
          : 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-candle'
      }`}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
    </button>
  );
}

