import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'nevermore.db');

const isHardReset = process.argv.includes('--hard');
const db = new Database(dbPath);

console.log(`🧹 Running ${isHardReset ? 'FULL HARD RESET' : 'LIVE EVENT DATA CLEAR'}...`);

if (isHardReset) {
  // Drop all tables and views
  db.exec(`
    DROP VIEW IF EXISTS team_scores_view;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS game_states;
    DROP TABLE IF EXISTS admins;
    DROP TABLE IF EXISTS final_answers;
    DROP TABLE IF EXISTS integrity_flags;
    DROP TABLE IF EXISTS score_adjustments;
    DROP TABLE IF EXISTS submissions;
    DROP TABLE IF EXISTS rounds;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS teams;
  `);
  console.log('💥 All tables and views dropped.');
} else {
  // Clear live event state while keeping teams, admins, and rounds intact
  db.exec(`
    DELETE FROM sessions;
    DELETE FROM submissions;
    DELETE FROM score_adjustments;
    DELETE FROM integrity_flags;
    DELETE FROM final_answers;
    DELETE FROM game_states;
    DELETE FROM audit_logs;

    -- Reset round release/lock timestamps
    UPDATE rounds SET released_at = NULL, locked_at = NULL;
    
    -- Reset scoreboard visibility to hidden
    UPDATE settings SET value = '0' WHERE key = 'scoreboard_visible';
  `);
  console.log('✨ Live event sessions, submissions, flags, and adjustments cleared.');
  console.log('✨ Rounds reset to sealed state.');
}

db.close();

