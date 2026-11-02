import { cookies } from 'next/headers';
import db from './db';
import { Team, DeviceSession, Round, IntegrityFlag, ScoreAdjustment, Submission, FinalAnswer } from './types';
import { computeLeaderboard } from './scoring';

export async function getCurrentTeamSession(): Promise<{ team: Team; session: DeviceSession } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('nevermore_session_id')?.value;
  const teamId = cookieStore.get('nevermore_team_id')?.value;

  if (!sessionId || !teamId) return null;

  const session = db
    .prepare('SELECT * FROM sessions WHERE id = ? AND team_id = ? AND revoked_at IS NULL')
    .get(sessionId, teamId) as DeviceSession | undefined;

  if (!session) return null;

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as Team | undefined;
  if (!team) return null;

  return { team, session };
}

export function getFullLeaderboardData() {
  const teams = db.prepare('SELECT * FROM teams ORDER BY name ASC').all() as Team[];
  const rounds = db.prepare('SELECT * FROM rounds ORDER BY number ASC').all() as Round[];
  const submissions = db.prepare('SELECT * FROM submissions').all() as Submission[];
  const adjustments = db.prepare('SELECT * FROM score_adjustments ORDER BY created_at DESC').all() as ScoreAdjustment[];
  const finalAnswers = db.prepare('SELECT * FROM final_answers').all() as FinalAnswer[];
  const flags = db.prepare('SELECT * FROM integrity_flags ORDER BY occurred_at DESC').all() as IntegrityFlag[];
  const activeSessions = db.prepare('SELECT * FROM sessions WHERE revoked_at IS NULL').all() as DeviceSession[];

  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));

  const leaderboard = computeLeaderboard(
    teams,
    rounds,
    submissions,
    adjustments,
    finalAnswers,
    flags,
    activeSessions
  );

  return {
    teams,
    rounds,
    submissions,
    adjustments,
    finalAnswers,
    flags,
    settings,
    leaderboard,
  };
}

export function logAdminAction(actor: string, action: string, details: string) {
  const id = 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  db.prepare('INSERT INTO audit_logs (id, actor, action, details) VALUES (?, ?, ?, ?)').run(
    id,
    actor,
    action,
    details
  );
}

