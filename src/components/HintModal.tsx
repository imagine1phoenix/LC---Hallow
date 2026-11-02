'use client';

import React, { useState } from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintsUsed: number;
  totalAvailableHints?: number;
  unlockedHints: { number: number; text: string }[];
  onConfirmUnlock: (hintNum: number) => Promise<void>;
  isLoading?: boolean;
}

export default function HintModal({
  isOpen,
  onClose,
  hintsUsed,
  totalAvailableHints = 2,
  unlockedHints,
  onConfirmUnlock,
  isLoading = false,
}: HintModalProps) {
  const [confirmingNext, setConfirmingNext] = useState(false);

  if (!isOpen) return null;

  const nextHintNumber = hintsUsed + 1;
  const canUnlockMore = hintsUsed < totalAvailableHints;

  const handleUnlock = async () => {
    await onConfirmUnlock(nextHintNumber);
    setConfirmingNext(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md parchment-card p-6 rounded-2xl border border-nevermore-border shadow-candle">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nevermore-border/60 mb-4">
          <div className="flex items-center gap-2 text-nevermore-candle">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-gothic text-lg font-bold text-nevermore-parchment">Oracles of Nevermore</h3>
          </div>
          <button
            onClick={onClose}
            className="text-nevermore-muted hover:text-nevermore-parchment text-lg px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>

        {/* Unlocked Hints List */}
        <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
          {unlockedHints.length === 0 && !confirmingNext && (
            <p className="text-xs text-nevermore-muted italic text-center py-4">
              No clues have been whispered yet. Outcasts who consult the shadows sacrifice 15 points per whisper.
            </p>
          )}

          {unlockedHints.map((hint) => (
            <div
              key={hint.number}
              className="p-3.5 rounded-xl bg-nevermore-surface border border-nevermore-border/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-nevermore-candle font-semibold">
                <span>Whisper #{hint.number} (Applied: -15 pts)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-nevermore-parchment leading-relaxed">{hint.text}</p>
            </div>
          ))}
        </div>

        {/* Penalty Warning / Confirmation Box */}
        {confirmingNext ? (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 mb-4 space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2.5 text-rose-200 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-100 uppercase tracking-wide">Sacrifice Warning</p>
                <p className="mt-1 leading-relaxed">
                  Consulting Whisper #{nextHintNumber} will permanently deduct{' '}
                  <strong className="text-amber-300 font-mono">-15 points</strong> from your team’s final score for
                  this round.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isLoading}
                onClick={handleUnlock}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition shadow-crimson"
              >
                {isLoading ? 'Summoning...' : 'Yes, Deduct 15 Points'}
              </button>
              <button
                onClick={() => setConfirmingNext(false)}
                className="py-2 px-3 rounded-lg bg-nevermore-surface hover:bg-nevermore-card border border-nevermore-border text-nevermore-parchment text-xs font-semibold"
              >
                Never mind
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {canUnlockMore ? (
              <button
                onClick={() => setConfirmingNext(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-nevermore-card hover:bg-nevermore-surface border border-amber-500/40 text-nevermore-candle hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 shadow-candle"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Whisper #{nextHintNumber} (−15 pts penalty)</span>
              </button>
            ) : (
              <p className="text-center text-xs text-nevermore-muted py-2">
                All available whispers for this round have been consulted.
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg text-xs text-nevermore-muted hover:text-nevermore-parchment"
            >
              Return to Puzzle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

