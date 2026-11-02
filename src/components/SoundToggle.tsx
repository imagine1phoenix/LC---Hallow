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
      className="p-1.5 rounded-lg bg-black/40 hover:bg-nevermore-surface border border-nevermore-border/60 text-nevermore-candle transition"
    >
      {muted ? <VolumeX className="w-4 h-4 text-nevermore-muted" /> : <Volume2 className="w-4 h-4 text-nevermore-candle" />}
    </button>
  );
}

