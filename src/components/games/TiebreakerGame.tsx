'use client';

import React, { useState } from 'react';
import { Skull, Sparkles, Feather, HelpCircle, ArrowRight } from 'lucide-react';

interface TiebreakerGameProps {
  onStateChange: (state: Record<string, unknown>) => void;
  savedState?: Record<string, unknown> | null;
  onAnswerChange: (answer: string) => void;
  currentAnswer: string;
}

export default function TiebreakerGame({
  onStateChange,
  savedState,
  onAnswerChange,
  currentAnswer,
}: TiebreakerGameProps) {
  const [selectedWord, setSelectedWord] = useState<string>(
    typeof savedState?.selectedWord === 'string' ? savedState.selectedWord : ''
  );

  const riddleStanza = [
    '"I was never born in flesh, yet I weep in stone quad."',
    '"I watch over the raven and gargoyle beneath the ancient fog."',
    '"Whisper my name to shatter the petrified silence."',
  ];

  const candidateAnswers = [
    { label: 'Ophelia Hall Weeping Angel', value: 'OPHELIA' },
    { label: 'The Raven of Edgar Allan Poe', value: 'RAVEN' },
    { label: 'Joseph Crackstone Effigy', value: 'CRACKSTONE' },
    { label: 'Goody Addams Shadow', value: 'GOODY ADDAMS' },
  ];

  const handleSelectOption = (val: string) => {
    setSelectedWord(val);
    onAnswerChange(val);
    onStateChange({ selectedWord: val });
  };

  return (
    <div className="space-y-6">
      {/* Ancient Stanza Tablet */}
      <div className="p-6 sm:p-8 rounded-2xl parchment-card border-2 border-amber-500/40 shadow-candle text-center space-y-4 animate-fadeInScale">
        <div className="w-12 h-12 rounded-full mx-auto bg-black/60 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-candle">
          <Feather className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-nevermore-candle">
            Sudden-Death Riddle
          </span>
          <h3 className="font-gothic text-xl sm:text-2xl font-bold text-nevermore-parchment">
            The Cryptic Riddle of Nevermore Founders
          </h3>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-black/60 border border-nevermore-border/70 max-w-lg mx-auto space-y-2 font-serif italic text-amber-100 text-sm sm:text-base leading-relaxed">
          {riddleStanza.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        <p className="text-xs text-nevermore-muted max-w-md mx-auto">
          Under sudden-death rules, ties are broken by the fastest correct answer to this ancient inscription.
        </p>
      </div>

      {/* Candidate Clues / Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {candidateAnswers.map((opt) => {
          const isSelected = currentAnswer.toUpperCase().includes(opt.value);
          return (
            <div
              key={opt.value}
              onClick={() => handleSelectOption(opt.value)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400 text-amber-100 shadow-candle'
                  : 'bg-nevermore-card border-nevermore-border hover:border-nevermore-candle/50 text-nevermore-parchment'
              }`}
            >
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="font-mono text-xs text-nevermore-candle font-bold">
                {opt.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Answer Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-nevermore-card via-nevermore-surface to-nevermore-card border-2 border-nevermore-candle/40 shadow-candle space-y-3">
        <label className="font-gothic text-sm font-bold text-nevermore-parchment flex items-center justify-between">
          <span>Sudden-Death Final Secret Word</span>
          <span className="text-[10px] font-mono text-nevermore-candle uppercase tracking-wider">
            e.g. OPHELIA
          </span>
        </label>

        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => onAnswerChange(e.target.value.toUpperCase())}
          placeholder="ENTER SECRET RIDDLE ANSWER"
          className="w-full py-3.5 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono text-center tracking-widest text-lg uppercase outline-none focus:ring-2 focus:ring-nevermore-candle/30 placeholder:text-nevermore-muted/50"
        />
      </div>
    </div>
  );
}

