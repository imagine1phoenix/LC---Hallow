import React from 'react';
import { SigilId } from '@/lib/types';
import { CREATURE_SIGILS } from '@/lib/sigils';
import { Feather, Flame, Waves, Eye, Skull, Moon } from 'lucide-react';

interface WaxSealProps {
  sigilId: SigilId;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  showName?: boolean;
}

const SIGIL_THEMES: Record<
  SigilId,
  {
    gradient: string;
    border: string;
    selectedBorder: string;
    ring: string;
    text: string;
    glow: string;
  }
> = {
  raven: {
    gradient: 'from-purple-900 via-purple-950 to-black',
    border: 'border-purple-600/40 hover:border-purple-400',
    selectedBorder: 'border-purple-400',
    ring: 'ring-purple-500/40',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
  },
  werewolf: {
    gradient: 'from-amber-800 via-orange-950 to-black',
    border: 'border-orange-600/40 hover:border-orange-400',
    selectedBorder: 'border-orange-400',
    ring: 'ring-orange-500/40',
    text: 'text-orange-300',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
  },
  siren: {
    gradient: 'from-cyan-900 via-teal-950 to-black',
    border: 'border-cyan-600/40 hover:border-cyan-400',
    selectedBorder: 'border-cyan-400',
    ring: 'ring-cyan-500/40',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
  },
  gorgon: {
    gradient: 'from-emerald-900 via-emerald-950 to-black',
    border: 'border-emerald-600/40 hover:border-emerald-400',
    selectedBorder: 'border-emerald-400',
    ring: 'ring-emerald-500/40',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
  },
  hyde: {
    gradient: 'from-red-900 via-rose-950 to-black',
    border: 'border-red-600/40 hover:border-red-400',
    selectedBorder: 'border-red-400',
    ring: 'ring-red-500/40',
    text: 'text-red-300',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
  },
  vampire: {
    gradient: 'from-rose-900 via-crimson-950 to-black',
    border: 'border-rose-600/40 hover:border-rose-400',
    selectedBorder: 'border-rose-400',
    ring: 'ring-rose-500/40',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_20px_rgba(225,29,72,0.35)]',
  },
};

export default function WaxSeal({
  sigilId,
  size = 'md',
  selected = false,
  onClick,
  showName = false,
}: WaxSealProps) {
  const sigil = CREATURE_SIGILS[sigilId] || CREATURE_SIGILS.raven;
  const theme = SIGIL_THEMES[sigilId] || SIGIL_THEMES.raven;

  const getIcon = () => {
    const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    switch (sigil.iconName) {
      case 'Feather':
        return <Feather className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Waves':
        return <Waves className={iconClass} />;
      case 'Eye':
        return <Eye className={iconClass} />;
      case 'Skull':
        return <Skull className={iconClass} />;
      case 'Moon':
        return <Moon className={iconClass} />;
      default:
        return <Feather className={iconClass} />;
    }
  };

  const dim = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      <div
        className={`relative ${dim} rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradient} border-2 transition-all duration-200 ${
          selected
            ? `${theme.selectedBorder} ring-4 ${theme.ring} ${theme.glow} scale-105`
            : `${theme.border} group-hover:scale-105 group-hover:border-white/40`
        }`}
        style={{
          boxShadow: selected
            ? undefined
            : 'inset 0 2px 4px rgba(255, 255, 255, 0.15), inset 0 -3px 6px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Embossed inner circle */}
        <div
          className={`absolute inset-1 rounded-full border border-black/50 bg-black/20 flex items-center justify-center transition-colors ${
            selected ? 'text-amber-200' : 'text-amber-100/80 group-hover:text-white'
          }`}
        >
          {getIcon()}
        </div>
      </div>

      {showName && (
        <div className="text-center transition-colors">
          <p
            className={`text-xs font-semibold leading-tight ${
              selected ? theme.text : 'text-nevermore-parchment group-hover:text-amber-200'
            }`}
          >
            {sigil.name}
          </p>
          <p className="text-[10px] italic text-nevermore-muted font-mono">{sigil.latinName}</p>
        </div>
      )}
    </div>
  );
}
