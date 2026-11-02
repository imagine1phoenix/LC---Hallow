import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load .env.local
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val;
    }
  }
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DIRECT_URL or DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔮 Connecting to Neon Serverless Postgres...');
const sql = neon(connectionString);

async function runMigration() {
  try {
    console.log('📦 Creating tables in Neon Postgres...');

    // 1. Teams
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sigil VARCHAR(64) NOT NULL,
        join_code VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Sessions
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        device_fingerprint VARCHAR(255) NOT NULL,
        bound_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMPTZ,
        revoked_by VARCHAR(255),
        reason TEXT
      );
    `;

    // 3. Rounds
    await sql`
      CREATE TABLE IF NOT EXISTS rounds (
        id VARCHAR(64) PRIMARY KEY,
        number INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        variant_seed VARCHAR(255) NOT NULL,
        target_output VARCHAR(64) NOT NULL,
        time_limit_minutes INTEGER DEFAULT 20,
        released_at TIMESTAMPTZ,
        locked_at TIMESTAMPTZ
      );
    `;

    // 4. Submissions
    await sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        round_id VARCHAR(64) NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
        answer TEXT NOT NULL,
        motive TEXT,
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        hints_used INTEGER DEFAULT 0,
        is_correct INTEGER NOT NULL,
        is_motive_correct INTEGER DEFAULT 0,
        points INTEGER NOT NULL,
        speed_bonus INTEGER DEFAULT 0,
        CONSTRAINT uq_team_round UNIQUE (team_id, round_id)
      );
    `;

    // 5. Score Adjustments
    await sql`
      CREATE TABLE IF NOT EXISTS score_adjustments (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        round_id VARCHAR(64),
        delta INTEGER NOT NULL,
        reason TEXT NOT NULL,
        admin_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Integrity Flags
    await sql`
      CREATE TABLE IF NOT EXISTS integrity_flags (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Final Answers
    await sql`
      CREATE TABLE IF NOT EXISTS final_answers (
        id VARCHAR(64) PRIMARY KEY,
        team_id VARCHAR(64) UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        judge_score INTEGER,
        judged_at TIMESTAMPTZ,
        judged_by VARCHAR(255)
      );
    `;

    // 8. Admins
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(64) NOT NULL,
        passcode VARCHAR(255) NOT NULL
      );
    `;

    // 9. Game States
    await sql`
      CREATE TABLE IF NOT EXISTS game_states (
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        round_id VARCHAR(64) NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
        state_json TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (team_id, round_id)
      );
    `;

    // 10. Settings
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(64) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    // 11. Audit Logs
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        actor VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Performance Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_sessions_team_id ON sessions(team_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_sessions_active ON sessions(team_id, revoked_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_submissions_team_round ON submissions(team_id, round_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_score_adj_team ON score_adjustments(team_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_flags_team ON integrity_flags(team_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_neon_audit_created ON audit_logs(created_at DESC);`;

    // Computed Scores View (PRD Section 6)
    await sql`
      CREATE OR REPLACE VIEW team_scores_view AS
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
    `;

    console.log('🌱 Seeding initial Academy rounds, admins, and teams into Neon...');

    // Seed default rounds
    await sql`
      INSERT INTO rounds (id, number, name, variant_seed, target_output, time_limit_minutes)
      VALUES 
        ('round-1', 1, 'The Midnight Hour (Lore Crossword)', 'seed-crossword-lore-101', 'time', 20),
        ('round-2', 2, 'The Encrypted Crypt (Cipher Decode)', 'seed-cipher-location-202', 'location', 20),
        ('round-3', 3, 'The Nightshade Syndicate (Deduction Grid)', 'seed-deduction-murderer-303', 'murderer', 25),
        ('round-tiebreaker', 4, 'The Poe Cryptic Riddle (Sudden Death)', 'seed-tiebreak-lore-404', 'tiebreaker', 10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        target_output = EXCLUDED.target_output;
    `;

    // Seed default admins
    await sql`
      INSERT INTO admins (id, name, role, passcode)
      VALUES
        ('admin-headmaster', 'Principal Larissa Weems', 'headmaster', 'nevermore1891'),
        ('admin-host', 'Edgar Allan Poe', 'host', 'raven1845'),
        ('admin-volunteer-1', 'Thing (Volunteer Desk)', 'volunteer', 'claws123')
      ON CONFLICT (id) DO UPDATE SET
        passcode = EXCLUDED.passcode;
    `;

    // Seed default settings
    await sql`
      INSERT INTO settings (key, value)
      VALUES
        ('scoreboard_visible', '0'),
        ('active_round_number', '1')
      ON CONFLICT (key) DO NOTHING;
    `;

    // Seed sample Academy teams
    await sql`
      INSERT INTO teams (id, name, sigil, join_code)
      VALUES
        ('team-raven-1', 'The Black Dahlias', 'raven', 'RAVEN-772'),
        ('team-werewolf-1', 'Feral Claw Pack', 'werewolf', 'WOLF-409'),
        ('team-siren-1', 'Ophelia Wave Sirens', 'siren', 'SIREN-813'),
        ('team-gorgon-1', 'Stone-Eyed Serpents', 'gorgon', 'GORG-256'),
        ('team-hyde-1', 'Hyde Harbinger Coven', 'hyde', 'HYDE-901'),
        ('team-vampire-1', 'Nightshade Aristocrats', 'vampire', 'VAMP-334')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        join_code = EXCLUDED.join_code;
    `;

    // Verify
    const versionRes = await sql`SELECT version();`;
    const tableList = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\n🎉 Neon Serverless Postgres is fully initialized & seeded!');
    console.log('Postgres Version:', versionRes[0]?.version?.split(' ')?.[1] || '18');
    console.log('Active Public Tables:', tableList.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

