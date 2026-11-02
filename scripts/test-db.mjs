import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'nevermore.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('🧪 Starting Nevermore Academy Database Verification Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    process.exitCode = 1;
  }
}

try {
  // Test 1: Verify Table Structure
  console.log('--- 1. Table & View Schema Verification ---');
  const requiredTables = [
    'teams',
    'sessions',
    'rounds',
    'submissions',
    'score_adjustments',
    'integrity_flags',
    'final_answers',
    'admins',
    'game_states',
    'settings',
    'audit_logs',
  ];

  const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  for (const t of requiredTables) {
    assert(existingTables.includes(t), `Table "${t}" exists`);
  }

  const existingViews = db.prepare("SELECT name FROM sqlite_master WHERE type='view'").all().map(r => r.name);
  assert(existingViews.includes('team_scores_view'), 'Computed SQL View "team_scores_view" exists');

  // Test 2: Unique Join Codes & Teams
  console.log('\n--- 2. Teams & Unique Join Codes ---');
  const testTeamId = 'test-team-' + Date.now();
  const testJoinCode = 'TEST-' + Math.floor(1000 + Math.random() * 9000);

  db.prepare('INSERT INTO teams (id, name, sigil, join_code) VALUES (?, ?, ?, ?)').run(
    testTeamId,
    'The Poe Society Testers',
    'raven',
    testJoinCode
  );

  const fetchedTeam = db.prepare('SELECT * FROM teams WHERE join_code = ?').get(testJoinCode);
  assert(fetchedTeam && fetchedTeam.name === 'The Poe Society Testers', 'Team created and queried by join code');

  let duplicateBlocked = false;
  try {
    db.prepare('INSERT INTO teams (id, name, sigil, join_code) VALUES (?, ?, ?, ?)').run(
      'dup-team-id',
      'Duplicate Code Team',
      'werewolf',
      testJoinCode
    );
  } catch (err) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 'Duplicate join_code rejected by UNIQUE constraint');

  // Test 3: Session Binding & Device Conflict
  console.log('\n--- 3. Device Session Binding & Integrity Rules ---');
  const sess1Id = 'sess-device-alpha-' + Date.now();
  const deviceAlpha = 'fp-macbook-safari-1234';

  db.prepare('INSERT INTO sessions (id, team_id, device_fingerprint) VALUES (?, ?, ?)').run(
    sess1Id,
    testTeamId,
    deviceAlpha
  );

  const activeSession = db.prepare('SELECT * FROM sessions WHERE team_id = ? AND revoked_at IS NULL').get(testTeamId);
  assert(activeSession && activeSession.device_fingerprint === deviceAlpha, 'Session bound to device fingerprint');

  // Unbind session with mandatory reason (PRD 4.4)
  db.prepare(`
    UPDATE sessions
    SET revoked_at = CURRENT_TIMESTAMP, revoked_by = 'Principal Weems', reason = 'Battery died, swapped at desk'
    WHERE id = ?
  `).run(sess1Id);

  const unbindCheck = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sess1Id);
  assert(unbindCheck.revoked_at !== null && unbindCheck.reason === 'Battery died, swapped at desk', 'Session revoked with mandatory audit reason');

  // Test 4: Single Submission Constraint
  console.log('\n--- 4. Single Submission Per Round Rule ---');
  const round1 = db.prepare('SELECT id FROM rounds WHERE number = 1').get();
  assert(round1 && round1.id, 'Round 1 exists in database');

  const subId1 = 'sub-test-' + Date.now();
  db.prepare(`
    INSERT INTO submissions (id, team_id, round_id, answer, points, speed_bonus, is_correct)
    VALUES (?, ?, ?, '03:15 AM', 85, 30, 1)
  `).run(subId1, testTeamId, round1.id);

  let secondSubBlocked = false;
  try {
    db.prepare(`
      INSERT INTO submissions (id, team_id, round_id, answer, points, speed_bonus, is_correct)
      VALUES ('sub-second', ?, ?, '04:00 AM', 100, 0, 1)
    `).run(testTeamId, round1.id);
  } catch (err) {
    secondSubBlocked = true;
  }
  assert(secondSubBlocked, 'Second submission for same round blocked by UNIQUE(team_id, round_id)');

  // Test 5: Integrity Flag Logging
  console.log('\n--- 5. Integrity Flag Logging ---');
  const flagId = 'flag-test-' + Date.now();
  db.prepare('INSERT INTO integrity_flags (id, team_id, event_type) VALUES (?, ?, ?)').run(
    flagId,
    testTeamId,
    'tab_switch'
  );

  const flagRow = db.prepare('SELECT count(*) as count FROM integrity_flags WHERE team_id = ?').get(testTeamId);
  assert(flagRow.count >= 1, 'Tab-switch integrity flag successfully logged');

  // Test 6: Score Adjustments & Auditing
  console.log('\n--- 6. Score Adjustments & Audit Trail ---');
  const adjId = 'adj-test-' + Date.now();
  db.prepare(`
    INSERT INTO score_adjustments (id, team_id, round_id, delta, reason, admin_id)
    VALUES (?, ?, ?, 15, 'Bonus for Latin quote interpretation', 'admin-headmaster')
  `).run(adjId, testTeamId, round1.id);

  const adjCount = db.prepare('SELECT sum(delta) as total FROM score_adjustments WHERE team_id = ?').get(testTeamId);
  assert(adjCount.total === 15, 'Score adjustment correctly recorded');

  // Test 7: Section 6 Computed Score View
  console.log('\n--- 7. Computed Scores View Verification ---');
  // Team score formula: round points (85) + speed bonus (30) + final question (0) + adjustments (15) = 130
  const viewScore = db.prepare('SELECT * FROM team_scores_view WHERE team_id = ?').get(testTeamId);
  assert(viewScore !== undefined, 'Team appears in team_scores_view');
  assert(viewScore.round_points === 85, 'round_points computed accurately', `Expected 85, got ${viewScore?.round_points}`);
  assert(viewScore.speed_bonus === 30, 'speed_bonus computed accurately', `Expected 30, got ${viewScore?.speed_bonus}`);
  assert(viewScore.manual_adjustments === 15, 'manual_adjustments computed accurately', `Expected 15, got ${viewScore?.manual_adjustments}`);
  assert(viewScore.total_score === 130, 'total_score formula (points + speed + adj) matches 130', `Expected 130, got ${viewScore?.total_score}`);

  // Cleanup test team
  db.prepare('DELETE FROM teams WHERE id = ?').run(testTeamId);
  console.log('\n--- Verification Cleanup Complete ---');

} catch (err) {
  console.error('\n❌ Unexpected error during test:', err);
  process.exitCode = 1;
} finally {
  db.close();
}

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests}/${totalTests} Passed (${passedTests === totalTests ? '100% SUCCESS' : 'FAILURES DETECTED'})`);
console.log(`========================================\n`);

