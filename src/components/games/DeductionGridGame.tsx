'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Skull, BookOpen, Check, X, HelpCircle } from 'lucide-react';

interface DeductionGridProps {
  onStateChange: (state: Record<string, unknown>) => void;
  savedState?: Record<string, unknown> | null;
  onAnswerChange: (answer: string) => void;
  currentAnswer: string;
  onMotiveChange: (motive: string) => void;
  currentMotive: string;
}

export default function DeductionGridGame({
  onStateChange,
  savedState,
  onAnswerChange,
  currentAnswer,
  onMotiveChange,
  currentMotive,
}: DeductionGridProps) {
  // Grid matrix state: suspect vs weapon/role
  // values: '' (unknown), 'yes' (green tick), 'no' (red cross)
  const [matrix, setMatrix] = useState<Record<string, string>>(
    (savedState?.matrix as Record<string, string>) || {}
  );

  const suspects = [
    { id: 'thornhill', name: 'Marilyn Thornhill', role: 'Botanical Sciences Dorm Mom' },
    { id: 'rowan', name: 'Rowan Laszlo', role: 'Telekinetic Student' },
    { id: 'galpin', name: 'Sheriff Galpin', role: 'Jericho Police Chief' },
    { id: 'kinbott', name: 'Dr. Valerie Kinbott', role: 'Town Therapist' },
  ];

  const weapons = ['Nightshade Poison', 'Silver Dagger', 'Wolfbane Tincture', 'Hyde Claws'];

  const clues = [
    '1. Dr. Kinbott was verified at the town diner until 3:30 AM by multiple witnesses (Airtight Alibi).',
    '2. Rowan Laszlo was found unconscious in the quad clutching the Wolfbane Tincture.',
    '3. Forensic toxicology proved the victim died of acute Belladonna ingestion (Nightshade Poison), NOT physical lacerations.',
    '4. Sheriff Galpin was verified dispatching patrol units from the town office.',
    '5. Only the botanical faculty member possessed the conservatory greenhouse key and the antique Gates pilgrim ring.',
  ];

  const motives = [
    'Ancestral Blood Vengeance (Crackstone Resurrection)',
    'Extortion over stolen student grades',
    'Feral instinct under full moon',
    'Accidental laboratory explosion',
  ];

  const toggleCell = (suspectId: string, weapon: string) => {
    const key = `${suspectId}-${weapon}`;
    const current = matrix[key] || '';
    let next = '';
    if (current === '') next = 'no';
    else if (current === 'no') next = 'yes';
    else next = '';

    const newMatrix = { ...matrix, [key]: next };
    setMatrix(newMatrix);
    onStateChange({ ...savedState, matrix: newMatrix });
  };

  const handleSelectSuspect = (name: string) => {
    onAnswerChange(name);
  };

  return (
    <div className="space-y-6">
      {/* Alibi & Evidence Dossier */}
      <div className="p-5 rounded-2xl parchment-card border border-nevermore-border space-y-3 animate-fadeInUp">
        <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-nevermore-candle flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Nevermore Forensic Dossier</span>
        </h4>
        <div className="space-y-2 text-xs">
          {clues.map((clue, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-nevermore-surface/80 border border-nevermore-border/50 text-nevermore-bone leading-relaxed">
              {clue}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Deduction Matrix */}
      <div className="p-5 rounded-2xl parchment-card border border-nevermore-border space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between pb-2 border-b border-nevermore-border/40">
          <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-nevermore-candle">
            Suspect vs Weapon Matrix
          </h4>
          <span className="text-[10px] text-nevermore-muted italic">
            Tap cell to toggle: ✕ (Eliminated) → ✓ (Confirmed) → Empty
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-nevermore-border/60">
              <th className="p-2 text-nevermore-muted font-mono font-normal">Suspect</th>
              {weapons.map((w, idx) => (
                <th key={idx} className="p-2 text-center text-nevermore-parchment font-mono text-[11px]">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suspects.map((s) => (
              <tr key={s.id} className="border-b border-nevermore-border/30 hover:bg-nevermore-surface/40">
                <td className="p-2.5">
                  <span className="font-semibold text-nevermore-parchment block">{s.name}</span>
                  <span className="text-[10px] text-nevermore-muted">{s.role}</span>
                </td>
                {weapons.map((w, idx) => {
                  const key = `${s.id}-${w}`;
                  const val = matrix[key];
                  return (
                    <td key={idx} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleCell(s.id, w)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                          val === 'yes'
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : val === 'no'
                            ? 'bg-rose-950/80 border-rose-600/70 text-rose-300'
                            : 'bg-black/40 border-nevermore-border/50 hover:border-nevermore-candle/50 text-transparent'
                        }`}
                      >
                        {val === 'yes' && <Check className="w-4 h-4" />}
                        {val === 'no' && <X className="w-4 h-4" />}
                        {!val && '·'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suspect Quick Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {suspects.map((s) => {
          const isSelected = currentAnswer.toUpperCase().includes(s.name.toUpperCase().split(' ')[1] || s.name);
          return (
            <div
              key={s.id}
              onClick={() => handleSelectSuspect(s.name)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40 text-rose-100 shadow-crimson'
                  : 'bg-nevermore-card border-nevermore-border hover:border-nevermore-candle/40 text-nevermore-parchment'
              }`}
            >
              <div>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-[11px] text-nevermore-muted">{s.role}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-rose-400 bg-rose-600 text-white' : 'border-nevermore-border'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Output Extraction Box (Murderer + Motive Bonus) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-nevermore-card via-nevermore-surface to-nevermore-card border-2 border-rose-900/60 shadow-crimson space-y-4">
        {/* Murderer Input */}
        <div className="space-y-1.5">
          <label className="font-gothic text-xs font-bold text-nevermore-parchment flex items-center justify-between">
            <span>Identified Murderer (100 Points)</span>
            <span className="text-[10px] text-rose-400 font-mono">Core Accusation</span>
          </label>
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => onAnswerChange(e.target.value.toUpperCase())}
            placeholder="e.g. MARILYN THORNHILL"
            className="w-full py-3 px-4 rounded-xl bg-black/60 border border-nevermore-border focus:border-rose-500 text-nevermore-parchment font-mono text-center tracking-widest text-base uppercase outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </div>

        {/* Motive Selection (+20 Bonus Points) */}
        <div className="space-y-1.5">
          <label className="font-gothic text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>Hidden Motive (+20 Bonus Points)</span>
            <span className="text-[10px] text-amber-400 font-mono">Round 3 Bonus</span>
          </label>
          <select
            value={currentMotive}
            onChange={(e) => onMotiveChange(e.target.value)}
            className="w-full py-3 px-4 rounded-xl bg-black/80 border border-nevermore-border focus:border-nevermore-candle text-nevermore-parchment text-xs outline-none cursor-pointer"
          >
            <option value="">-- Select Accused Motive --</option>
            {motives.map((m, idx) => (
              <option key={idx} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

