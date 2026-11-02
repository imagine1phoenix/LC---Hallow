import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nevermore.db');

// Global singleton pattern to prevent multiple open connections during Next.js hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __nevermore_db: Database.Database | undefined;
}

function configurePragmas(dbInstance: Database.Database) {
  // Enable WAL mode for high concurrent performance (40+ simultaneous teams)
  dbInstance.pragma('journal_mode = WAL');
  // Enforce foreign key constraints
  dbInstance.pragma('foreign_keys = ON');
  // Wait up to 5 seconds if database is busy during concurrent writes
  dbInstance.pragma('busy_timeout = 5000');
  // Optimal durability / speed balance for WAL mode
  dbInstance.pragma('synchronous = NORMAL');
  // 64MB memory cache for instant query responses
  dbInstance.pragma('cache_size = -64000');
}

function getDatabase(): Database.Database {
  if (process.env.NODE_ENV === 'production') {
    const dbInstance = new Database(dbPath);
    configurePragmas(dbInstance);
    return dbInstance;
  }

  if (!global.__nevermore_db) {
    global.__nevermore_db = new Database(dbPath);
    configurePragmas(global.__nevermore_db);
  }
  return global.__nevermore_db;
}

const db = getDatabase();

/**
 * Initialize database schema, indexes, and views strictly matching PRD Section 6
 */
export function initDb() {
  db.exec(`
    -- 1. Teams Table
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sigil TEXT NOT NULL,
      join_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Sessions Table (One device per team enforcement)
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      device_fingerprint TEXT NOT NULL,
      bound_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME,
      revoked_by TEXT,
      reason TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    -- 3. Rounds Table
    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      variant_seed TEXT NOT NULL,
      target_output TEXT NOT NULL,
      time_limit_minutes INTEGER DEFAULT 20,
      released_at DATETIME,
      locked_at DATETIME
    );

    -- 4. Submissions Table (Single submission per round per team)
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      round_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      motive TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      hints_used INTEGER DEFAULT 0,
      is_correct INTEGER NOT NULL,
      is_motive_correct INTEGER DEFAULT 0,
      points INTEGER NOT NULL,
      speed_bonus INTEGER DEFAULT 0,
      UNIQUE(team_id, round_id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );

    -- 5. Score Adjustments Table (Volunteer adjustments with mandatory reason)
    CREATE TABLE IF NOT EXISTS score_adjustments (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      round_id TEXT,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    -- 6. Integrity Flags Table (Tab switches, blurs, inspector events)
    CREATE TABLE IF NOT EXISTS integrity_flags (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    -- 7. Final Answers Table (Host judged question 0-30 pts)
    CREATE TABLE IF NOT EXISTS final_answers (
      id TEXT PRIMARY KEY,
      team_id TEXT UNIQUE NOT NULL,
      text TEXT NOT NULL,
      judge_score INTEGER,
      judged_at DATETIME,
      judged_by TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    -- 8. Admins Table
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      passcode TEXT NOT NULL
    );

    -- 9. Game States Table (Autosave input state surviving refresh)
    CREATE TABLE IF NOT EXISTS game_states (
      team_id TEXT NOT NULL,
      round_id TEXT NOT NULL,
      state_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (team_id, round_id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );

    -- 10. Settings Table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 11. Immutable Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Performance Indexes for 40+ concurrent teams
    CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON sessions(team_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(team_id, revoked_at);
    CREATE INDEX IF NOT EXISTS idx_submissions_team_round ON submissions(team_id, round_id);
    CREATE INDEX IF NOT EXISTS idx_score_adj_team ON score_adjustments(team_id);
    CREATE INDEX IF NOT EXISTS idx_flags_team ON integrity_flags(team_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

    -- PRD Section 6: Computed Scores View
    -- Scores is a computed view: round points + speed bonus + final question score + sum of manual adjustments.
    DROP VIEW IF EXISTS team_scores_view;
    CREATE VIEW team_scores_view AS
    SELECT 
      t.id AS team_id,
      t.name AS team_name,
      t.sigil AS team_sigil,
      t.join_code AS join_code,
      COALESCE(sub.sub_points, 0) AS round_points,
      COALESCE(sub.sub_speed, 0) AS speed_bonus,
      COALESCE(sub.sub_hints, 0) AS total_hints,
      COALESCE(sub.sub_correct, 0) AS correct_answers,
      COALESCE(fa.judge_score, 0) AS final_question_score,
      COALESCE(adj.total_adj, 0) AS manual_adjustments,
      (COALESCE(sub.sub_points, 0) + COALESCE(sub.sub_speed, 0) + COALESCE(fa.judge_score, 0) + COALESCE(adj.total_adj, 0)) AS total_score,
      COALESCE(flg.flag_count, 0) AS flag_count
    FROM teams t
    LEFT JOIN (
      SELECT 
        team_id,
        SUM(points) AS sub_points,
        SUM(speed_bonus) AS sub_speed,
        SUM(hints_used) AS sub_hints,
        SUM(is_correct) AS sub_correct
      FROM submissions
      GROUP BY team_id
    ) sub ON t.id = sub.team_id
    LEFT JOIN final_answers fa ON t.id = fa.team_id
    LEFT JOIN (
      SELECT team_id, SUM(delta) AS total_adj
      FROM score_adjustments
      GROUP BY team_id
    ) adj ON t.id = adj.team_id
    LEFT JOIN (
      SELECT team_id, COUNT(*) AS flag_count
      FROM integrity_flags
      GROUP BY team_id
    ) flg ON t.id = flg.team_id;
  `);

  // Seed default rounds if table is empty
  const roundCount = db.prepare('SELECT count(*) as count FROM rounds').get() as { count: number };
  if (roundCount.count === 0) {
    const insertRound = db.prepare(`
      INSERT INTO rounds (id, number, name, variant_seed, target_output, time_limit_minutes, released_at, locked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRound.run(
      'round-1',
      1,
      'The Midnight Hour (Lore Crossword)',
      'seed-crossword-lore-101',
      'time',
      20,
      null,
      null
    );
    insertRound.run(
      'round-2',
      2,
      'The Encrypted Crypt (Cipher Decode)',
      'seed-cipher-location-202',
      'location',
      20,
      null,
      null
    );
    insertRound.run(
      'round-3',
      3,
      'The Nightshade Syndicate (Deduction Grid)',
      'seed-deduction-murderer-303',
      'murderer',
      25,
      null,
      null
    );
    insertRound.run(
      'round-tiebreaker',
      4,
      'The Poe Cryptic Riddle (Sudden Death)',
      'seed-tiebreak-lore-404',
      'tiebreaker',
      10,
      null,
      null
    );
  }

  // Seed default admins if empty
  const adminCount = db.prepare('SELECT count(*) as count FROM admins').get() as { count: number };
  if (adminCount.count === 0) {
    const insertAdmin = db.prepare('INSERT INTO admins (id, name, role, passcode) VALUES (?, ?, ?, ?)');
    insertAdmin.run('admin-headmaster', 'Principal Weems', 'headmaster', 'nevermore1891');
    insertAdmin.run('admin-host', 'Edgar Allan Poe', 'host', 'raven1845');
    insertAdmin.run('admin-volunteer-1', 'Thing (Volunteer Desk)', 'volunteer', 'claws123');
  }

  // Seed default settings if empty
  const settingCheck = db.prepare("SELECT value FROM settings WHERE key = 'scoreboard_visible'").get();
  if (!settingCheck) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('scoreboard_visible', '0')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('active_round_number', '1')").run();
  }

  // Seed demo teams representing each Outcast Order if empty
  const teamCount = db.prepare('SELECT count(*) as count FROM teams').get() as { count: number };
  if (teamCount.count === 0) {
    const insertTeam = db.prepare('INSERT INTO teams (id, name, sigil, join_code) VALUES (?, ?, ?, ?)');
    insertTeam.run('team-raven-1', 'The Black Dahlias', 'raven', 'RAVEN-772');
    insertTeam.run('team-werewolf-1', 'Feral Claw Pack', 'werewolf', 'WOLF-409');
    insertTeam.run('team-siren-1', 'Ophelia Wave Sirens', 'siren', 'SIREN-813');
    insertTeam.run('team-gorgon-1', 'Stone-Eyed Serpents', 'gorgon', 'GORG-256');
    insertTeam.run('team-hyde-1', 'Hyde Harbinger Coven', 'hyde', 'HYDE-901');
    insertTeam.run('team-vampire-1', 'Nightshade Aristocrats', 'vampire', 'VAMP-334');
  }
}

// Ensure tables, indexes, and views exist on boot
initDb();

export default db;
