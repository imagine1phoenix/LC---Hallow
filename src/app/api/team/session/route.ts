import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTeamSession } from '@/lib/serverUtils';
import db from '@/lib/db';
import { Round, Submission, IntegrityFlag } from '@/lib/types';
import { PUZZLES } from '@/lib/puzzleData';

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { team, session } = auth;

    // Get all rounds
    const rounds = db.prepare('SELECT * FROM rounds ORDER BY number ASC').all() as Round[];

    // Get current team submissions
    const submissions = db
      .prepare('SELECT round_id, answer, submitted_at, hints_used, is_correct, points, speed_bonus FROM submissions WHERE team_id = ?')
      .all(team.id) as Submission[];

    // Get flag count
    const flagRow = db
      .prepare('SELECT count(*) as count FROM integrity_flags WHERE team_id = ?')
      .get(team.id) as { count: number };

    // Get settings
    const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
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
    const savedStateRow = db
      .prepare('SELECT state_json, updated_at FROM game_states WHERE team_id = ? AND round_id = ?')
      .get(team.id, activeRound.id) as { state_json: string; updated_at: string } | undefined;

    return NextResponse.json({
      authenticated: true,
      team,
      session,
      rounds,
      activeRound,
      clientPuzzle,
      submissions,
      flagCount: flagRow.count,
      scoreboardVisible: settings['scoreboard_visible'] === '1',
      savedState: savedStateRow ? JSON.parse(savedStateRow.state_json) : null,
    });
  } catch (err: unknown) {
    console.error('Error in /api/team/session:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

