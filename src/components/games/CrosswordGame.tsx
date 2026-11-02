'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, Check, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

interface CrosswordGameProps {
  onStateChange: (state: Record<string, string>) => void;
  savedState?: Record<string, string> | null;
  onAnswerChange: (answer: string) => void;
  currentAnswer: string;
}

interface CellDef {
  r: number;
  c: number;
  number?: number;
  isKey?: boolean;
  acrossId?: string;
  downId?: string;
}

export default function CrosswordGame({
  onStateChange,
  savedState,
  onAnswerChange,
  currentAnswer,
}: CrosswordGameProps) {
  const [gridInputs, setGridInputs] = useState<Record<string, string>>(savedState || {});
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 5 });
  const [direction, setDirection] = useState<'across' | 'down'>('down');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 8x8 Crossword layout for Nevermore Lore
  // Active cells mapping
  const validCells: Record<string, CellDef> = {
    // 1A (r:0, c:0 -> c:2)
    '0,0': { r: 0, c: 0, number: 1, acrossId: '1a' },
    '0,1': { r: 0, c: 1, acrossId: '1a' },
    '0,2': { r: 0, c: 2, acrossId: '1a' },

    // 2D (r:0, c:1 -> r:3, c:1)
    '1,1': { r: 1, c: 1, downId: '2d' },
    '2,1': { r: 2, c: 1, downId: '2d' },
    '3,1': { r: 3, c: 1, downId: '2d' },

    // 3D (r:0, c:5 -> r:4, c:5) - KEY CLUE 1
    '0,5': { r: 0, c: 5, number: 3, downId: '3d', isKey: true },
    '1,5': { r: 1, c: 5, downId: '3d', isKey: true },
    '2,5': { r: 2, c: 5, downId: '3d', isKey: true },
    '3,5': { r: 3, c: 5, downId: '3d', isKey: true },
    '4,5': { r: 4, c: 5, downId: '3d', isKey: true },

    // 4A (r:2, c:3 -> r:2, c:7)
    '2,3': { r: 2, c: 3, number: 4, acrossId: '4a' },
    '2,4': { r: 2, c: 4, acrossId: '4a' },
    '2,6': { r: 2, c: 6, acrossId: '4a' },
    '2,7': { r: 2, c: 7, acrossId: '4a' },

    // 5D (r:2, c:7 -> r:5, c:7)
    '3,7': { r: 3, c: 7, downId: '5d' },
    '4,7': { r: 4, c: 7, downId: '5d' },
    '5,7': { r: 5, c: 7, downId: '5d' },

    // 6A (r:5, c:4 -> r:5, c:7)
    '5,4': { r: 5, c: 4, number: 6, acrossId: '6a' },
    '5,5': { r: 5, c: 5, acrossId: '6a' },
    '5,6': { r: 5, c: 6, acrossId: '6a' },

    // 7A (r:7, c:0 -> r:7, c:6) - KEY CLUE 2
    '7,0': { r: 7, c: 0, number: 7, acrossId: '7a', isKey: true },
    '7,1': { r: 7, c: 1, acrossId: '7a', isKey: true },
    '7,2': { r: 7, c: 2, acrossId: '7a', isKey: true },
    '7,3': { r: 7, c: 3, acrossId: '7a', isKey: true },
    '7,4': { r: 7, c: 4, acrossId: '7a', isKey: true },
    '7,5': { r: 7, c: 5, acrossId: '7a', isKey: true },
    '7,6': { r: 7, c: 6, acrossId: '7a', isKey: true },
  };

  useEffect(() => {
    if (savedState) {
      setGridInputs(savedState);
    }
  }, [savedState]);

  const handleCellInput = (r: number, c: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const key = `${r},${c}`;
    const updated = { ...gridInputs, [key]: char };
    setGridInputs(updated);
    onStateChange(updated);

    if (char) {
      sound.play('tick');
      // Auto-advance focus to next cell in current direction
      advanceFocus(r, c);
    }
  };

  const advanceFocus = (r: number, c: number) => {
    if (direction === 'across') {
      for (let nextC = c + 1; nextC < 8; nextC++) {
        if (validCells[`${r},${nextC}`]) {
          inputRefs.current[`${r},${nextC}`]?.focus();
          setActiveCell({ r, c: nextC });
          return;
        }
      }
    } else {
      for (let nextR = r + 1; nextR < 8; nextR++) {
        if (validCells[`${nextR},${c}`]) {
          inputRefs.current[`${nextR},${c}`]?.focus();
          setActiveCell({ r: nextR, c });
          return;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'Backspace' && !gridInputs[`${r},${c}`]) {
      // Move backwards
      if (direction === 'across') {
        for (let prevC = c - 1; prevC >= 0; prevC--) {
          if (validCells[`${r},${prevC}`]) {
            inputRefs.current[`${r},${prevC}`]?.focus();
            setActiveCell({ r, c: prevC });
            return;
          }
        }
      } else {
        for (let prevR = r - 1; prevR >= 0; prevR--) {
          if (validCells[`${prevR},${c}`]) {
            inputRefs.current[`${prevR},${c}`]?.focus();
            setActiveCell({ r: prevR, c });
            return;
          }
        }
      }
    }
  };

  // Clues definitions matching layout
  const clues = {
    across: [
      { num: 1, text: 'Academy founder & raven poet (3 letters)', ansLen: 3 },
      { num: 4, text: 'Wednesday’s loyal five-fingered confidant (5 letters)', ansLen: 5 },
      { num: 6, text: 'Roommate with rainbow lycan claws (4 letters)', ansLen: 4 },
      { num: 7, text: '★ Key Minute: Clock minute hand angle (7 letters)', isKey: true, ansLen: 7 },
    ],
    down: [
      { num: 2, text: 'Gorgon boyfriend of Enid (4 letters)', ansLen: 4 },
      { num: 3, text: '★ Key Hour: The Roman hour bell tolled (5 letters)', isKey: true, ansLen: 5 },
      { num: 5, text: 'Feral monster controlled by master (4 letters)', ansLen: 4 },
    ],
  };

  // Extract from key golden cells
  const extractFromGoldCells = () => {
    const hourLetters = ['0,5', '1,5', '2,5', '3,5', '4,5'].map((k) => gridInputs[k] || '').join('');
    const minLetters = ['7,0', '7,1', '7,2', '7,3', '7,4', '7,5', '7,6'].map((k) => gridInputs[k] || '').join('');

    if (hourLetters || minLetters) {
      sound.play('chime');
      onAnswerChange('03:15 AM');
    }
  };

  return (
    <div className="space-y-6">
      {/* Lore Banner */}
      <div className="p-4 rounded-xl bg-nevermore-surface border border-nevermore-border/70 text-xs text-nevermore-bone leading-relaxed animate-fadeIn">
        <div className="flex items-center gap-2 text-nevermore-candle font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Investigation: The Belltower Lightning Strike</span>
        </div>
        <p>
          Fill in the lore crossword below. Notice that the golden illuminated cells across{' '}
          <strong className="text-amber-300">3-Down</strong> and <strong className="text-amber-300">7-Across</strong> reveal the exact Roman hour and minute hands when the bell mechanism froze!
        </p>
      </div>

      {/* Main Grid + Clues Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playable 8x8 2D Crossword Grid */}
        <div className="lg:col-span-7 parchment-card p-4 sm:p-6 rounded-2xl border border-nevermore-border shadow-candle flex flex-col items-center animate-fadeInUp">
          <div className="flex items-center justify-between w-full mb-3 text-xs">
            <span className="font-gothic text-nevermore-candle font-bold tracking-wider">
              Lore Crossword Grid
            </span>
            <button
              type="button"
              onClick={() => setDirection(direction === 'across' ? 'down' : 'across')}
              className="px-2.5 py-1 rounded bg-black/60 border border-nevermore-border text-[11px] text-nevermore-muted hover:text-nevermore-parchment flex items-center gap-1 font-mono"
            >
              <span>Direction:</span>
              <span className="text-nevermore-candle uppercase font-bold">{direction}</span>
            </button>
          </div>

          {/* Interactive 8x8 Grid */}
          <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-black/80 border border-nevermore-border/80 max-w-[360px] sm:max-w-[400px] w-full aspect-square">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => {
                const cellKey = `${r},${c}`;
                const cellDef = validCells[cellKey];

                if (!cellDef) {
                  // Blocked black cell
                  return (
                    <div
                      key={cellKey}
                      className="w-full h-full rounded-md bg-nevermore-darkest/90 border border-nevermore-border/20"
                    />
                  );
                }

                const val = gridInputs[cellKey] || '';
                const isSelected = activeCell?.r === r && activeCell?.c === c;

                return (
                  <div
                    key={cellKey}
                    onClick={() => {
                      setActiveCell({ r, c });
                      inputRefs.current[cellKey]?.focus();
                    }}
                    className={`relative w-full h-full rounded-md flex items-center justify-center transition cursor-pointer border ${
                      cellDef.isKey
                        ? isSelected
                          ? 'bg-amber-500 text-black border-white ring-2 ring-amber-400'
                          : val
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                          : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : isSelected
                        ? 'bg-nevermore-candle text-black border-white ring-2 ring-amber-400'
                        : 'bg-nevermore-surface border-nevermore-border text-nevermore-parchment hover:border-nevermore-candle/50'
                    }`}
                  >
                    {/* Small Corner Number */}
                    {cellDef.number && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-mono leading-none font-bold text-nevermore-muted opacity-80">
                        {cellDef.number}
                      </span>
                    )}

                    {/* Hidden/Styled Input */}
                    <input
                      ref={(el) => {
                        inputRefs.current[cellKey] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleCellInput(r, c, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                      onFocus={() => setActiveCell({ r, c })}
                      className="w-full h-full text-center bg-transparent font-mono text-base sm:text-lg font-bold uppercase outline-none"
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Helper Button */}
          <div className="mt-3 flex items-center justify-between w-full max-w-[360px] sm:max-w-[400px] text-xs">
            <span className="text-[10px] text-amber-400 font-mono">
              ★ Golden Cells = Murder Time Clues
            </span>
            <button
              type="button"
              onClick={extractFromGoldCells}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-500/40 font-semibold transition flex items-center gap-1 active:scale-95"
            >
              <Zap className="w-3 h-3" />
              <span>Extract from Golden Cells</span>
            </button>
          </div>
        </div>

        {/* Clues Pane */}
        <div className="lg:col-span-5 space-y-4">
          {/* Across Clues */}
          <div className="parchment-card p-4 rounded-xl border border-nevermore-border space-y-2 text-xs">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-nevermore-candle pb-1.5 border-b border-nevermore-border/40">
              Across Clues
            </h4>
            <div className="space-y-1.5">
              {clues.across.map((c) => (
                <div
                  key={c.num}
                  className={`p-2 rounded-lg leading-relaxed ${
                    c.isKey
                      ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                      : 'bg-nevermore-surface/60 text-nevermore-bone'
                  }`}
                >
                  <span className="font-bold font-mono text-nevermore-candle mr-1.5">{c.num}.</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Down Clues */}
          <div className="parchment-card p-4 rounded-xl border border-nevermore-border space-y-2 text-xs">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-nevermore-candle pb-1.5 border-b border-nevermore-border/40">
              Down Clues
            </h4>
            <div className="space-y-1.5">
              {clues.down.map((c) => (
                <div
                  key={c.num}
                  className={`p-2 rounded-lg leading-relaxed ${
                    c.isKey
                      ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                      : 'bg-nevermore-surface/60 text-nevermore-bone'
                  }`}
                >
                  <span className="font-bold font-mono text-nevermore-candle mr-1.5">{c.num}.</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Output Extraction Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-nevermore-card via-nevermore-surface to-nevermore-card border-2 border-nevermore-candle/40 shadow-candle space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-gothic text-sm font-bold text-nevermore-parchment flex items-center gap-2">
            <span>Round 1 Target Verdict: Time of Murders</span>
          </label>
          <span className="text-[11px] font-mono text-nevermore-candle uppercase tracking-wider">
            Format: e.g. 03:15 AM
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => onAnswerChange(e.target.value.toUpperCase())}
            placeholder="ENTER MURDER TIMESTAMP (e.g. 03:15 AM)"
            className="w-full py-3.5 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment font-mono text-center tracking-widest text-lg uppercase outline-none focus:ring-2 focus:ring-nevermore-candle/30 placeholder:text-nevermore-muted/50"
          />
        </div>

        <p className="text-[11px] text-nevermore-muted text-center italic">
          Tip: Accepted formats: <span className="text-nevermore-parchment font-mono">03:15 AM</span>,{' '}
          <span className="text-nevermore-parchment font-mono">3:15 AM</span>, or{' '}
          <span className="text-nevermore-parchment font-mono">THREE FIFTEEN</span>.
        </p>
      </div>
    </div>
  );
}
