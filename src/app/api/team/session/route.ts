import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTeamSession } from '@/lib/serverUtils';
import { query, queryOne } from '@/lib/db';
import { Round, Submission } from '@/lib/types';
import { PUZZLES } from '@/lib/puzzleData';

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { team, session } = auth;

    // Fetch initial state in parallel
    const [rounds, rawSubmissions, flagRow, settingsRows] = await Promise.all([
      query<Round>('SELECT * FROM rounds ORDER BY number ASC'),
      query<Submission>(
        'SELECT round_id, answer, submitted_at, hints_used, is_correct, points, speed_bonus FROM submissions WHERE team_id = ?',
        [team.id]
      ),
      queryOne<{ count: number | string }>('SELECT count(*) as count FROM integrity_flags WHERE team_id = ?', [team.id]),
      query<{ key: string; value: string }>('SELECT key, value FROM settings'),
    ]);

    const submissions = rawSubmissions.map((s) => ({
      ...s,
      points: Number(s.points) || 0,
      speed_bonus: Number(s.speed_bonus) || 0,
      hints_used: Number(s.hints_used) || 0,
      is_correct: Number(s.is_correct) || 0,
    }));

    const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));

    // Find currently active round (released and not locked)
    const activeRound = rounds.find((r) => r.released_at && !r.locked_at) || rounds[0];

    // Get client-safe puzzle content for active round
    const puzzle = PUZZLES[activeRound.id];
    const clientPuzzle = puzzle
      ? {
          roundId: puzzle.roundId,
          roundNumber: puzzle.roundNumber,
          title: puzzle.title,
          subtitle: puzzle.subtitle,
          targetQuestion: puzzle.targetQuestion,
          targetFieldLabel: puzzle.targetFieldLabel,
          targetPlaceholder: puzzle.targetPlaceholder,
          clientContent: puzzle.clientContent,
          hintsCount: puzzle.hints.length,
        }
      : null;

    // Get autosaved state for active round
    const savedStateRow = await queryOne<{ state_json: string; updated_at: string }>(
      'SELECT state_json, updated_at FROM game_states WHERE team_id = ? AND round_id = ?',
      [team.id, activeRound.id]
    );

    return NextResponse.json({
      authenticated: true,
      team,
      session,
      rounds,
      activeRound,
      clientPuzzle,
      submissions,
      flagCount: Number(flagRow?.count) || 0,
      scoreboardVisible: settings['scoreboard_visible'] === '1',
      savedState: savedStateRow ? JSON.parse(savedStateRow.state_json) : null,
    });
  } catch (err: unknown) {
    console.error('Error in /api/team/session:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
