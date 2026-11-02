'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Scroll, Quote, Compass } from 'lucide-react';

interface CipherGameProps {
  onStateChange: (state: Record<string, unknown>) => void;
  savedState?: Record<string, unknown> | null;
  onAnswerChange: (answer: string) => void;
  currentAnswer: string;
}

export default function CipherGame({
  onStateChange,
  savedState,
  onAnswerChange,
  currentAnswer,
}: CipherGameProps) {
  const [shift, setShift] = useState<number>(
    typeof savedState?.shift === 'number' ? savedState.shift : 0
  );

  const cipherText = 'JYHJRFZVUL JYFWA';

  // Decode helper function
  const decodeCaesar = (str: string, shiftAmount: number) => {
    return str
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          // A-Z
          return String.fromCharCode(((code - 65 - shiftAmount + 26) % 26) + 65);
        }
        return char;
      })
      .join('');
  };

  const decodedPreview = decodeCaesar(cipherText, shift);

  const handleShiftChange = (newShift: number) => {
    setShift(newShift);
    const updated = { ...savedState, shift: newShift };
    onStateChange(updated);
  };

  const handleUseDecoded = () => {
    onAnswerChange(decodedPreview);
  };

  const witnessStatements = [
    {
      author: 'Eugene Otinger (Hive President)',
      statement:
        'The humming in the greenhouse stopped around midnight, but I saw muddy footprints descending into the forbidden cemetery crypt.',
    },
    {
      author: 'Enid Sinclair (Werewolf)',
      statement:
        'I caught the scent of sulfur, cracked stone, and antique pilgrim wax near the ancient catacomb entrance.',
    },
    {
      author: 'Xavier Thorpe (Artist)',
      statement:
        'My raven sketch kept drawing itself over the weeping angel monument of Joseph Crackstone.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ancient Parchment Cipher Box */}
      <div className="p-6 rounded-2xl parchment-card border border-nevermore-border shadow-candle relative overflow-hidden animate-fadeInUp">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Scroll className="w-24 h-24 text-nevermore-candle" />
        </div>

        <div className="flex items-center gap-2 text-nevermore-candle font-gothic text-sm font-bold mb-3">
          <KeyRound className="w-4 h-4" />
          <span>The Alchemical Raven Cipher</span>
        </div>

        <p className="text-xs text-nevermore-bone leading-relaxed mb-4">
          A scorched parchment retrieved from the headmaster’s library bears an alchemical substitution cipher. Shift the dial until the runes yield plain English:
        </p>

        {/* Encrypted Text vs Decrypted Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-xl bg-black/60 border border-nevermore-border/60 text-center">
            <span className="text-[10px] text-nevermore-muted uppercase tracking-wider block mb-1">
              Encoded Runes
            </span>
            <span className="font-mono text-lg font-bold tracking-widest text-rose-400">
              {cipherText}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-nevermore-surface border border-nevermore-candle/40 text-center">
            <span className="text-[10px] text-nevermore-candle uppercase tracking-wider block mb-1">
              Deciphered Preview (Shift: {shift})
            </span>
            <span className="font-mono text-lg font-bold tracking-widest text-nevermore-parchment">
              {decodedPreview}
            </span>
          </div>
        </div>

        {/* Interactive Caesar Shift Slider */}
        <div className="p-4 rounded-xl bg-black/40 border border-nevermore-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-nevermore-muted">Shift Dial (0 - 25):</span>
            <span className="text-nevermore-candle font-bold text-sm">
              Shift {shift} / 26
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            value={shift}
            onChange={(e) => handleShiftChange(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-nevermore-muted font-mono">
            <span>A=0</span>
            <span>Raven Key = 7</span>
            <span>Z=25</span>
          </div>
        </div>

        {/* Quick transfer button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleUseDecoded}
            className="text-xs px-3 py-1.5 rounded-lg bg-nevermore-highlight/50 hover:bg-nevermore-highlight text-nevermore-candle hover:text-amber-300 border border-nevermore-border flex items-center gap-1.5 transition"
          >
            <span>Insert Deciphered text into Answer</span>
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Witness Testimonies (Section 4.2 supports round answer) */}
      <div className="p-5 rounded-2xl parchment-card border border-nevermore-border space-y-3">
        <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-nevermore-candle flex items-center gap-2">
          <Quote className="w-3.5 h-3.5" />
          <span>Witness Statements Archive</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {witnessStatements.map((w, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-nevermore-surface/70 border border-nevermore-border/60 text-xs space-y-2"
            >
              <p className="font-semibold text-nevermore-candle text-[11px]">{w.author}</p>
              <p className="text-nevermore-bone leading-relaxed text-[11px] italic">
                &ldquo;{w.statement}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Output Extraction Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-nevermore-card via-nevermore-surface to-nevermore-card border-2 border-nevermore-candle/40 shadow-candle space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-gothic text-sm font-bold text-nevermore-parchment">
            Round 2 Target Verdict: Location of Murders
          </label>
          <span className="text-[11px] font-mono text-nevermore-candle uppercase tracking-wider">
            e.g. CRACKSTONE CRYPT
          </span>
        </div>

        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => onAnswerChange(e.target.value.toUpperCase())}
          placeholder="ENTER EXACT MURDER LOCATION"
          className="w-full py-3.5 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono text-center tracking-widest text-lg uppercase outline-none focus:ring-2 focus:ring-nevermore-candle/30 placeholder:text-nevermore-muted/50"
        />

        <p className="text-[11px] text-nevermore-muted text-center italic">
          Target: The name of the ancient stone chamber uncovered by the Raven Cipher.
        </p>
      </div>
    </div>
  );
}

