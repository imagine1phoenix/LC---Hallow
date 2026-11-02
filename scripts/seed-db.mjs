import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'nevermore.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('🌱 Seeding Nevermore Academy event database...');

const seedRounds = [
  {
    id: 'round-1',
    number: 1,
    name: 'The Midnight Hour (Lore Crossword)',
    variant_seed: 'seed-crossword-lore-101',
    target_output: 'time',
    time_limit_minutes: 20,
  },
  {
    id: 'round-2',
    number: 2,
    name: 'The Encrypted Crypt (Cipher Decode)',
    variant_seed: 'seed-cipher-location-202',
    target_output: 'location',
    time_limit_minutes: 20,
  },
  {
    id: 'round-3',
    number: 3,
    name: 'The Nightshade Syndicate (Deduction Grid)',
    variant_seed: 'seed-deduction-murderer-303',
    target_output: 'murderer',
    time_limit_minutes: 25,
  },
  {
    id: 'round-tiebreaker',
    number: 4,
    name: 'The Poe Cryptic Riddle (Sudden Death)',
    variant_seed: 'seed-tiebreak-lore-404',
    target_output: 'tiebreaker',
    time_limit_minutes: 10,
  },
];

const seedAdmins = [
  { id: 'admin-headmaster', name: 'Principal Larissa Weems', role: 'headmaster', passcode: 'nevermore1891' },
  { id: 'admin-host', name: 'Edgar Allan Poe', role: 'host', passcode: 'raven1845' },
  { id: 'admin-volunteer-1', name: 'Thing (Volunteer Desk)', role: 'volunteer', passcode: 'claws123' },
];

const seedTeams = [
  { id: 'team-raven-1', name: 'The Black Dahlias', sigil: 'raven', join_code: 'RAVEN-772' },
  { id: 'team-werewolf-1', name: 'Feral Claw Pack', sigil: 'werewolf', join_code: 'WOLF-409' },
  { id: 'team-siren-1', name: 'Ophelia Wave Sirens', sigil: 'siren', join_code: 'SIREN-813' },
  { id: 'team-gorgon-1', name: 'Stone-Eyed Serpents', sigil: 'gorgon', join_code: 'GORG-256' },
  { id: 'team-hyde-1', name: 'Hyde Harbinger Coven', sigil: 'hyde', join_code: 'HYDE-901' },
  { id: 'team-vampire-1', name: 'Nightshade Aristocrats', sigil: 'vampire', join_code: 'VAMP-334' },
];

const seedSettings = [
  { key: 'scoreboard_visible', value: '0' },
  { key: 'active_round_number', value: '1' },
  { key: 'event_title', value: 'The Nevermore Murders: 2026 Invitational' },
];

const insertRound = db.prepare(`
  INSERT INTO rounds (id, number, name, variant_seed, target_output, time_limit_minutes)
  VALUES (@id, @number, @name, @variant_seed, @target_output, @time_limit_minutes)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    target_output = excluded.target_output,
    time_limit_minutes = excluded.time_limit_minutes
`);

const insertAdmin = db.prepare(`
  INSERT INTO admins (id, name, role, passcode)
  VALUES (@id, @name, @role, @passcode)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    role = excluded.role,
    passcode = excluded.passcode
`);

const insertTeam = db.prepare(`
  INSERT INTO teams (id, name, sigil, join_code)
  VALUES (@id, @name, @sigil, @join_code)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    sigil = excluded.sigil,
    join_code = excluded.join_code
`);

const insertSetting = db.prepare(`
  INSERT INTO settings (key, value)
  VALUES (@key, @value)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value
`);

const seedTransaction = db.transaction(() => {
  for (const r of seedRounds) insertRound.run(r);
  for (const a of seedAdmins) insertAdmin.run(a);
  for (const t of seedTeams) insertTeam.run(t);
  for (const s of seedSettings) insertSetting.run(s);
});

seedTransaction();

console.log(`✅ Seeded ${seedRounds.length} rounds.`);
console.log(`✅ Seeded ${seedAdmins.length} admins.`);
console.log(`✅ Seeded ${seedTeams.length} Academy teams.`);
console.log(`✅ Seeded ${seedSettings.length} default settings.`);

db.close();

