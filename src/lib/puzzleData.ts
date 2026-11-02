export interface CrosswordClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  clue: string;
  length: number;
  row: number;
  col: number;
  // Note: answer is kept on server or sanitized before client receive
  answer?: string;
  isKeyClue?: boolean;
}

export interface PuzzleDefinition {
  roundId: string;
  roundNumber: number;
  title: string;
  subtitle: string;
  targetQuestion: string;
  targetFieldLabel: string;
  targetPlaceholder: string;
  hints: {
    number: number;
    text: string;
    pointPenalty: number;
  }[];
  // Client payload (NO secret answers!)
  clientContent: Record<string, unknown>;
  // Server-only validation
  validateAnswer: (teamAnswer: string, motiveAnswer?: string) => {
    isCorrect: boolean;
    isMotiveCorrect?: boolean;
    feedback: string;
  };
}

export const PUZZLES: Record<string, PuzzleDefinition> = {
  'round-1': {
    roundId: 'round-1',
    roundNumber: 1,
    title: 'The Midnight Hour',
    subtitle: 'Academy Lore & Mythology Crossword',
    targetQuestion: 'At what exact hour did the bell toll during the murder?',
    targetFieldLabel: 'Murder Timestamp (e.g. 03:15 AM)',
    targetPlaceholder: '03:15 AM',
    hints: [
      {
        number: 1,
        text: 'The golden highlighted cells across 4-Down and 7-Across spell the Roman hour.',
        pointPenalty: 15,
      },
      {
        number: 2,
        text: 'The academy belltower pendulum froze when lightning struck III-XV on the clock face.',
        pointPenalty: 15,
      },
    ],
    clientContent: {
      gridSize: 11,
      clues: [
        { id: '1a', number: 1, direction: 'across', clue: 'Secret society meeting beneath Edgar Allan Poe statue (10)', length: 10, row: 0, col: 0 },
        { id: '4a', number: 4, direction: 'across', clue: 'Wednesday’s loyal hand and confidant (5)', length: 5, row: 2, col: 2 },
        { id: '7a', number: 7, direction: 'across', clue: 'Poisonous purple flower lethal to normies and outcasts alike (10)', length: 10, row: 4, col: 0 },
        { id: '9a', number: 9, direction: 'across', clue: 'The siren captain of the Ophelia Hall canoe team (6)', length: 6, row: 6, col: 1 },
        { id: '11a', number: 11, direction: 'across', clue: 'The belltower minute hand stopped at this quarter (7)', length: 7, row: 8, col: 2 },
        { id: '2d', number: 2, direction: 'down', clue: 'Creature cursed with petrifying serpent gaze (6)', length: 6, row: 0, col: 3 },
        { id: '3d', number: 3, direction: 'down', clue: 'Pilgrim founder whose ghost haunts Jericho (10)', length: 10, row: 0, col: 7 },
        { id: '5d', number: 5, direction: 'down', clue: 'The witching hour of the murder (5)', length: 5, row: 2, col: 5 },
        { id: '8d', number: 8, direction: 'down', clue: 'Wednesday’s werewolf roommate with rainbow claws (4)', length: 4, row: 4, col: 9 },
      ],
      goldenCells: [
        { row: 2, col: 5, charIndex: 0 },
        { row: 8, col: 2, charIndex: 1 },
        { row: 8, col: 4, charIndex: 2 },
      ],
    },
    validateAnswer: (answer: string) => {
      const clean = answer.trim().toUpperCase().replace(/\s+/g, '');
      const valid = ['03:15AM', '3:15AM', '03:15', '3:15', 'THREEFIFTEENAM', 'THREEFIFTEEN'];
      const isCorrect = valid.includes(clean);

      // Honeypot check
      if (clean.includes('11:45') || clean.includes('1145') || clean.includes('MIDNIGHT')) {
        return {
          isCorrect: false,
          feedback: 'The hands of the tower clock stand rigid at another hour. You were misled by decoy shadows.',
        };
      }

      return {
        isCorrect,
        feedback: isCorrect
          ? 'The pendulum matches the frozen hands of the clock tower.'
          : 'The timestamp does not align with the broken clock mechanism.',
      };
    },
  },

  'round-2': {
    roundId: 'round-2',
    roundNumber: 2,
    title: 'The Encrypted Crypt',
    subtitle: 'Alchemical Cipher & Witness Decryption',
    targetQuestion: 'Where did the fatal encounter take place?',
    targetFieldLabel: 'Murder Location',
    targetPlaceholder: 'e.g. CRACKSTONE CRYPT',
    hints: [
      {
        number: 1,
        text: 'The alchemical cipher uses a Caesar shift equal to the number of ravens on the gate (Shift: 7).',
        pointPenalty: 15,
      },
      {
        number: 2,
        text: 'The decrypted scroll reveals the subterranean burial chamber beneath the weeping gargoyle.',
        pointPenalty: 15,
      },
    ],
    clientContent: {
      cipherText: 'JYHJRFZVUL JYFWA',
      cipherType: 'Raven Shift Cipher (Rot-7)',
      scrollExcerpt: `
        "The candles flickered out in the catacombs. 
        Through the damp stone arches, muddy bootprints led from the Quad directly downward. 
        Only one chamber bore the seal of the pilgrim."
      `,
      witnessTestimonies: [
        { witness: 'Eugene Otinger (Beekeeper)', quote: 'The bees went wild near the woods, but the bell rang hollow from beneath the earth.' },
        { witness: 'Enid Sinclair', quote: 'I smelled damp brimstone and antique iron coming from the ancient cemetery gates.' },
        { witness: 'Xavier Thorpe', quote: 'My charcoal sketches showed the weeping angel statute bleeding black ink.' },
      ],
    },
    validateAnswer: (answer: string) => {
      const clean = answer.trim().toUpperCase().replace(/[^A-Z]/g, '');
      const valid = ['CRACKSTONECRYPT', 'CRACKSTONESCRYPT', 'THECRACKSTONECRYPT', 'OLDCRACKSTONECRYPT'];
      const isCorrect = valid.includes(clean);

      // Honeypot check
      if (clean.includes('GREENHOUSE') || clean.includes('NIGHTSHADEGREENHOUSE')) {
        return {
          isCorrect: false,
          feedback: 'The conservatory glass remains untouched. Forensic soot proves this location was a staged decoy.',
        };
      }

      return {
        isCorrect,
        feedback: isCorrect
          ? 'The heavy stone crypt slab yielded, revealing the tragic scene.'
          : 'The shadows whisper that this location is untouched.',
      };
    },
  },

  'round-3': {
    roundId: 'round-3',
    roundNumber: 3,
    title: 'The Nightshade Syndicate',
    subtitle: 'Logic Grid & Suspect Interrogation',
    targetQuestion: 'Who committed the murder, and what was their hidden motive?',
    targetFieldLabel: 'Murderer Name',
    targetPlaceholder: 'e.g. MARILYN THORNHILL',
    hints: [
      {
        number: 1,
        text: 'Check the botanical greenhouse registry: only one person signed out the Belladonna distillation apparatus.',
        pointPenalty: 15,
      },
      {
        number: 2,
        text: 'The normie botanical teacher bears an ancestral lineage tied directly to Joseph Crackstone.',
        pointPenalty: 15,
      },
    ],
    clientContent: {
      suspects: [
        { name: 'Marilyn Thornhill', title: 'Botanical Sciences Professor', status: 'Normie Dorm Mom' },
        { name: 'Rowan Laszlo', title: 'Telekinetic Outcast', status: 'Student' },
        { name: 'Sheriff Donovan Galpin', title: 'Town Sheriff', status: 'Jericho Police' },
        { name: 'Dr. Valerie Kinbott', title: 'Therapist', status: 'Town Practitioner' },
      ],
      weapons: ['Nightshade Poison', 'Silver Dagger', 'Wolfbane Tincture', 'Hyde Claws'],
      clues: [
        '1. Dr. Kinbott was verified at the town diner until 3:30 AM by sheriff deputies (airtight alibi).',
        '2. Rowan Laszlo was found unconscious in the Quad clutching the Wolfbane Tincture.',
        '3. The autopsy confirmed the victim died of acute Belladonna alkaloids (Nightshade Poison), NOT physical lacerations.',
        '4. Sheriff Galpin was in the police precinct monitoring dispatch reports.',
        '5. The murderer possessed greenhouse keys and an antique ring bearing the Gates family crest.',
      ],
      motivesList: [
        'Ancestral Blood Vengeance (Crackstone Resurrection)',
        'Extortion over stolen student grades',
        'Feral instinct under full moon',
        'Accidental laboratory explosion',
      ],
    },
    validateAnswer: (murderer: string, motive?: string) => {
      const cleanName = murderer.trim().toUpperCase().replace(/[^A-Z]/g, '');
      const validNames = ['MARILYNTHORNHILL', 'THORNHILL', 'LAURELGATES', 'PROFESSORTHORNHILL', 'MARILYN'];
      const isCorrect = validNames.includes(cleanName);

      // Honeypot check
      if (cleanName.includes('KINBOTT') || cleanName.includes('VALERIE')) {
        return {
          isCorrect: false,
          isMotiveCorrect: false,
          feedback: 'Dr. Kinbott was verified at the town diner during the murder. This suspect was a planted decoy.',
        };
      }

      let isMotiveCorrect = false;
      if (motive) {
        const cleanMotive = motive.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const validMotives = [
          'ANCESTRALBLOODVENGEANCE',
          'CRACKSTONE',
          'CRACKSTONERESURRECTION',
          'ANCESTRALVENGEANCE',
          'BLOODVENGEANCE',
          'VENGEANCE',
          'REVENGE',
        ];
        isMotiveCorrect = validMotives.some((vm) => cleanMotive.includes(vm));
      }

      return {
        isCorrect,
        isMotiveCorrect,
        feedback: isCorrect
          ? `The truth is unveiled! Professor Thornhill was unmasked.`
          : 'Your accusation fails to withstand scrutiny.',
      };
    },
  },

  'round-tiebreaker': {
    roundId: 'round-tiebreaker',
    roundNumber: 4,
    title: 'The Poe Cryptic Riddle',
    subtitle: 'Sudden Death Tiebreaker',
    targetQuestion: 'Solve the riddle of the Nevermore founders.',
    targetFieldLabel: 'Riddle Solution',
    targetPlaceholder: 'Enter secret passphrase',
    hints: [],
    clientContent: {
      riddle: `
        "I was never born, yet I weep in the quad. 
        I watch over the raven and gargoyle alike. 
        Say my name to shatter the petrified silence."
      `,
    },
    validateAnswer: (answer: string) => {
      const clean = answer.trim().toUpperCase().replace(/[^A-Z]/g, '');

      // Honeypot check
      if (clean.includes('CRACKSTONE')) {
        return {
          isCorrect: false,
          feedback: 'Crackstone’s effigy weeps in darkness, but it does not answer the founder’s riddle.',
        };
      }

      const isCorrect = clean.includes('OPHELIA') || clean.includes('RAVEN') || clean.includes('EDGARALLANPOE');
      return {
        isCorrect,
        feedback: isCorrect ? 'The riddle echoes true!' : 'The raven remains silent.',
      };
    },
  },
};

