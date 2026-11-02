import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const dataDir = path.join(projectRoot, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nevermore.db');
console.log('🔮 Initializing Nevermore Academy SQLite Database at:', dbPath);

const db = new Database(dbPath);

// Performance Pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');

// Schema Definition strictly matching PRD Section 6
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sigil TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE TABLE IF NOT EXISTS integrity_flags (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS final_answers (
    id TEXT PRIMARY KEY,
    team_id TEXT UNIQUE NOT NULL,
    text TEXT NOT NULL,
    judge_score INTEGER,
    judged_at DATETIME,
    judged_by TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    passcode TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_states (
    team_id TEXT NOT NULL,
    round_id TEXT NOT NULL,
    state_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, round_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Performance Indexes
  CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON sessions(team_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(team_id, revoked_at);
  CREATE INDEX IF NOT EXISTS idx_submissions_team_round ON submissions(team_id, round_id);
  CREATE INDEX IF NOT EXISTS idx_score_adj_team ON score_adjustments(team_id);
  CREATE INDEX IF NOT EXISTS idx_flags_team ON integrity_flags(team_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

  -- PRD Section 6: Computed Scores View
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

// Print table overview
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('✅ Tables created/verified:', tables.map(t => t.name).join(', '));

const views = db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all();
console.log('✅ Views created/verified:', views.map(v => v.name).join(', '));

const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
console.log('✅ Custom indexes verified:', indexes.map(i => i.name).join(', '));

db.close();
console.log('🏛️  Nevermore Academy Database setup complete.');

