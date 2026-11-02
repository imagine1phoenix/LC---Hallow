'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import WaxSeal from '@/components/WaxSeal';
import Crest from '@/components/Crest';
import { Trophy, Sparkles, Skull, Clock, MapPin, Award, ArrowRight } from 'lucide-react';

export default function HostRevealPage() {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/scoreboard?admin=true')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#e11d48', '#a855f7', '#f5ede0'],
    });
  };

  const handleNextStep = () => {
    const next = step + 1;
    setStep(next);
    if (next === 4) {
      triggerConfetti();
    }
  };

  const winner = data?.leaderboard?.[0];

  return (
    <div className="max-w-3xl mx-auto py-8 text-center space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex justify-center">
          <Crest size="lg" showSubtitle={false} />
        </div>
        <h1 className="font-gothic text-3xl sm:text-5xl font-extrabold text-nevermore-parchment">
          The Grand Unmasking
        </h1>
        <p className="text-xs sm:text-sm text-nevermore-muted font-mono">
          Host Narrative Beats · Stage Progression
        </p>
      </div>

      {/* Narrative Reveal Stages */}
      <div className="parchment-card p-8 sm:p-12 rounded-3xl border border-nevermore-border shadow-candle min-h-[380px] flex flex-col items-center justify-center space-y-6">
        {step === 0 && (
          <div className="space-y-4 animate-fadeIn">
            <Skull className="w-16 h-16 mx-auto text-nevermore-candle animate-pulse" />
            <h2 className="font-gothic text-2xl font-bold text-nevermore-parchment">
              The Hour of Reckoning
            </h2>
            <p className="text-xs text-nevermore-muted max-w-md mx-auto leading-relaxed">
              All three investigations have closed. The shadows of Ophelia Hall must now surrender their secrets.
            </p>
            <button
              onClick={handleNextStep}
              className="py-3 px-8 rounded-xl bg-nevermore-candle text-black font-gothic text-sm font-bold shadow-candle hover:scale-105 active:scale-95 transition"
            >
              Reveal 1: The Timestamp
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <Clock className="w-14 h-14 mx-auto text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-nevermore-candle">
              Round 1 Truth Unveiled
            </span>
            <h2 className="font-mono text-4xl sm:text-5xl font-black text-amber-300">
              03:15 AM
            </h2>
            <p className="text-xs text-nevermore-bone max-w-md mx-auto">
              When lightning struck the academy belltower, the hands froze at 3:15 AM during the witching hour.
            </p>
            <button
              onClick={handleNextStep}
              className="py-3 px-8 rounded-xl bg-nevermore-candle text-black font-gothic text-sm font-bold shadow-candle hover:scale-105 transition"
            >
              Reveal 2: The Location
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <MapPin className="w-14 h-14 mx-auto text-rose-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-rose-300">
              Round 2 Truth Unveiled
            </span>
            <h2 className="font-gothic text-3xl sm:text-4xl font-extrabold text-rose-200">
              CRACKSTONE CRYPT
            </h2>
            <p className="text-xs text-nevermore-bone max-w-md mx-auto">
              Beneath the weeping gargoyle and stone slabs, the ancient pilgrim burial vault was breached.
            </p>
            <button
              onClick={handleNextStep}
              className="py-3 px-8 rounded-xl bg-nevermore-candle text-black font-gothic text-sm font-bold shadow-candle hover:scale-105 transition"
            >
              Reveal 3: The Culprit & Motive
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <Skull className="w-14 h-14 mx-auto text-red-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400">
              Round 3 Unmasking
            </span>
            <h2 className="font-gothic text-2xl sm:text-3xl font-extrabold text-white">
              Professor Marilyn Thornhill (Laurel Gates)
            </h2>
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-mono inline-block">
              Motive: Ancestral Blood Vengeance · Joseph Crackstone Resurrection
            </div>
            <p className="text-xs text-nevermore-bone max-w-md mx-auto">
              Using Belladonna harvested from the botanical greenhouse, Laurel Gates sought to cleanse Nevermore forever.
            </p>
            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-amber-600 via-nevermore-candle to-amber-700 text-black font-gothic text-sm font-bold shadow-candle hover:scale-105 transition"
              >
                ★ Crown Event Champions ★
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <Trophy className="w-20 h-20 mx-auto text-nevermore-gold animate-bounce" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
              Nevermore Murders Champions
            </span>
            {winner && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <WaxSeal sigilId={winner.sigil} size="lg" />
                </div>
                <h2 className="font-gothic text-3xl sm:text-4xl font-black text-amber-400">
                  {winner.teamName}
                </h2>
                <p className="font-mono text-2xl font-bold text-nevermore-parchment">
                  {winner.totalScore} Points
                </p>
                <p className="text-xs text-nevermore-muted font-mono">
                  Solved {winner.correctAnswers} of 3 Rounds · {winner.hintsUsed} Whispers Consulted
                </p>
              </div>
            )}
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={triggerConfetti}
                className="py-2.5 px-6 rounded-xl bg-amber-600 text-black text-xs font-bold shadow-candle hover:bg-amber-500 transition"
              >
                Trigger Confetti 🎊
              </button>
              <button
                onClick={() => setStep(0)}
                className="py-2.5 px-4 rounded-xl bg-nevermore-surface text-nevermore-muted hover:text-white text-xs"
              >
                Replay Reveal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

