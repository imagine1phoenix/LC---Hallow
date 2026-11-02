import { CreatureSigil, SigilId } from './types';

export const CREATURE_SIGILS: Record<SigilId, CreatureSigil> = {
  raven: {
    id: 'raven',
    name: 'Order of the Raven',
    latinName: 'Corvus Noctis',
    description: 'Masters of prophetic visions, dark omens, and sharp intellect.',
    color: '#a855f7',
    badgeBg: 'bg-purple-950/60 border-purple-600/40 text-purple-200',
    iconName: 'Feather',
  },
  werewolf: {
    id: 'werewolf',
    name: 'Lycan Brotherhood',
    latinName: 'Lupus Furor',
    description: 'Bound by fiercely loyal pack instincts and feral heightened senses.',
    color: '#f97316',
    badgeBg: 'bg-orange-950/60 border-orange-600/40 text-orange-200',
    iconName: 'Flame',
  },
  siren: {
    id: 'siren',
    name: 'Abyssal Sirens',
    latinName: 'Sirena Profunda',
    description: 'Enchanters of the Ophelia Hall tide, mesmerizing minds and unmasking deceit.',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-950/60 border-cyan-600/40 text-cyan-200',
    iconName: 'Waves',
  },
  gorgon: {
    id: 'gorgon',
    name: 'Gorgon Enclave',
    latinName: 'Gorgona Lapidea',
    description: 'Petrifying glance, stoic patience, and hidden serpent venom.',
    color: '#10b981',
    badgeBg: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-200',
    iconName: 'Eye',
  },
  hyde: {
    id: 'hyde',
    name: 'The Hyde Coven',
    latinName: 'Monstrum Occultum',
    description: 'Unleashed primal fury lurking beneath refined aristocratic facades.',
    color: '#ef4444',
    badgeBg: 'bg-rose-950/60 border-rose-600/40 text-rose-200',
    iconName: 'Skull',
  },
  vampire: {
    id: 'vampire',
    name: 'Nightshade Vampires',
    latinName: 'Sanguis Antiquus',
    description: 'Aristocrats of the crypt, immortal memory, and venomous refinement.',
    color: '#e11d48',
    badgeBg: 'bg-red-950/60 border-red-600/40 text-red-200',
    iconName: 'Moon',
  },
};

export const SIGIL_LIST = Object.values(CREATURE_SIGILS);

