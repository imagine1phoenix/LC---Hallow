import { cookies } from 'next/headers';
import { query, queryOne, execute } from './db';
import { Team, DeviceSession, Round, IntegrityFlag, ScoreAdjustment, Submission, FinalAnswer } from './types';
import { computeLeaderboard } from './scoring';

export async function getCurrentTeamSession(): Promise<{ team: Team; session: DeviceSession } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('nevermore_session_id')?.value;
  const teamId = cookieStore.get('nevermore_team_id')?.value;

  if (!sessionId || !teamId) return null;

  const session = await queryOne<DeviceSession>(
    'SELECT * FROM sessions WHERE id = ? AND team_id = ? AND revoked_at IS NULL',
    [sessionId, teamId]
  );

  if (!session) return null;

  const team = await queryOne<Team>('SELECT * FROM teams WHERE id = ?', [teamId]);
  if (!team) return null;

  return { team, session };
}

export async function getFullLeaderboardData() {
  const [
    teams,
    rounds,
    rawSubmissions,
    rawAdjustments,
    rawFinalAnswers,
    flags,
    activeSessions,
    settingsRows,
  ] = await Promise.all([
    query<Team>('SELECT * FROM teams ORDER BY name ASC'),
    query<Round>('SELECT * FROM rounds ORDER BY number ASC'),
    query<Submission>('SELECT * FROM submissions'),
    query<ScoreAdjustment>('SELECT * FROM score_adjustments ORDER BY created_at DESC'),
    query<FinalAnswer>('SELECT * FROM final_answers'),
    query<IntegrityFlag>('SELECT * FROM integrity_flags ORDER BY occurred_at DESC'),
    query<DeviceSession>('SELECT * FROM sessions WHERE revoked_at IS NULL'),
    query<{ key: string; value: string }>('SELECT key, value FROM settings'),
  ]);

  // Normalize numeric fields safely for calculation
  const submissions: Submission[] = rawSubmissions.map((s) => ({
    ...s,
    points: Number(s.points) || 0,
    speed_bonus: Number(s.speed_bonus) || 0,
    hints_used: Number(s.hints_used) || 0,
    is_correct: Number(s.is_correct) || 0,
    is_motive_correct: Number(s.is_motive_correct) || 0,
  }));

  const adjustments: ScoreAdjustment[] = rawAdjustments.map((a) => ({
    ...a,
    delta: Number(a.delta) || 0,
  }));

  const finalAnswers: FinalAnswer[] = rawFinalAnswers.map((f) => ({
    ...f,
    judge_score: f.judge_score !== null && f.judge_score !== undefined ? Number(f.judge_score) : null,
  }));

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

export async function verifyAdminSession(): Promise<{ valid: boolean; admin: { id: string; name: string; role: string } | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('nevermore_admin_auth')?.value;

  if (!token) return { valid: false, admin: null };

  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (data && data.name && data.role) {
      return { valid: true, admin: data };
    }
    return { valid: false, admin: null };
  } catch {
    return { valid: false, admin: null };
  }
}

export async function logAdminAction(actor: string, action: string, details: string) {
  const id = 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  await execute('INSERT INTO audit_logs (id, actor, action, details) VALUES (?, ?, ?, ?)', [
    id,
    actor,
    action,
    details,
  ]);
}
