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

export default function WaxSeal({
  sigilId,
  size = 'md',
  selected = false,
  onClick,
  showName = false,
}: WaxSealProps) {
  const sigil = CREATURE_SIGILS[sigilId] || CREATURE_SIGILS.raven;

  const getIcon = () => {
    const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
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
      className={`flex flex-col items-center gap-1.5 transition-all ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      }`}
    >
      <div
        className={`relative ${dim} rounded-full flex items-center justify-center wax-seal border-2 transition-all ${
          selected
            ? 'border-nevermore-candle ring-4 ring-nevermore-candle/30 shadow-crimson scale-105'
            : 'border-rose-900/40 hover:border-nevermore-gold/50'
        }`}
      >
        {/* Embossed inner circle */}
        <div className="absolute inset-1 rounded-full border border-black/40 bg-black/10 flex items-center justify-center text-amber-100">
          {getIcon()}
        </div>
      </div>

      {showName && (
        <div className="text-center">
          <p className="text-xs font-semibold text-nevermore-parchment leading-tight">{sigil.name}</p>
          <p className="text-[10px] italic text-nevermore-muted font-mono">{sigil.latinName}</p>
        </div>
      )}
    </div>
  );
}

