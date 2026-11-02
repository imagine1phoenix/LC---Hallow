'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Zap, AlertCircle } from 'lucide-react';

interface RoundTimerProps {
  releasedAt: string | null;
  lockedAt: string | null;
  timeLimitMinutes?: number;
}

export default function RoundTimer({ releasedAt, lockedAt, timeLimitMinutes = 20 }: RoundTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!releasedAt) return;

    const calculateElapsed = () => {
      const releaseTime = new Date(releasedAt).getTime();
      const endTime = lockedAt ? new Date(lockedAt).getTime() : Date.now();
      const diff = Math.max(0, Math.floor((endTime - releaseTime) / 1000));
      setElapsedSeconds(diff);
    };

    calculateElapsed();

    if (lockedAt) return; // Frozen if round locked

    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [releasedAt, lockedAt]);

  if (!releasedAt) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-nevermore-surface border border-nevermore-border text-nevermore-muted text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>Round not yet commenced</span>
      </div>
    );
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Speed bonus logic
  let speedBonus = 0;
  let bonusColor = 'text-nevermore-muted border-nevermore-border/40';
  let tierLabel = 'No Speed Bonus';

  if (elapsedSeconds < 300) {
    speedBonus = 30;
    bonusColor = 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    tierLabel = '< 5m: Max Speed';
  } else if (elapsedSeconds < 600) {
    speedBonus = 20;
    bonusColor = 'text-amber-300 border-amber-500/30 bg-amber-950/20';
    tierLabel = '5–10m: Fast Solve';
  } else if (elapsedSeconds < 900) {
    speedBonus = 10;
    bonusColor = 'text-stone-300 border-stone-600/40 bg-stone-900/30';
    tierLabel = '10–15m: Standard';
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Time Elapsed Clock */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nevermore-card border border-nevermore-border shadow-candle text-nevermore-parchment">
        <Clock className="w-4 h-4 text-nevermore-candle animate-pulse" />
        <span className="font-mono text-sm font-bold tracking-wider">{formattedTime}</span>
        {lockedAt && <span className="text-[10px] text-rose-400 font-bold uppercase">(Locked)</span>}
      </div>

      {/* Speed Bonus Tracker */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${bonusColor}`}
        title={`Current Speed Bonus: +${speedBonus} pts (${tierLabel})`}
      >
        <Zap className="w-3.5 h-3.5 shrink-0" />
        <span>+{speedBonus} pts</span>
      </div>
    </div>
  );
}

