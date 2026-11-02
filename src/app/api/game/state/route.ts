import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTeamSession } from '@/lib/serverUtils';
import { execute } from '@/lib/db';
import { PUZZLES } from '@/lib/puzzleData';

// Autosave game state
export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { roundId, state } = await req.json();
    if (!roundId || !state) {
      return NextResponse.json({ error: 'MISSING_DATA' }, { status: 400 });
    }

    const stateJson = JSON.stringify(state);

    await execute(`
      INSERT INTO game_states (team_id, round_id, state_json, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(team_id, round_id) DO UPDATE SET
        state_json = EXCLUDED.state_json,
        updated_at = CURRENT_TIMESTAMP
    `, [auth.team.id, roundId, stateJson]);

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err: unknown) {
    console.error('Autosave error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

// Request hint endpoint
export async function PUT(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { roundId, hintNumber } = await req.json();
    const puzzle = PUZZLES[roundId];

    if (!puzzle) {
      return NextResponse.json({ error: 'PUZZLE_NOT_FOUND' }, { status: 404 });
    }

    const hint = puzzle.hints.find((h) => h.number === hintNumber);
    if (!hint) {
      return NextResponse.json({ error: 'HINT_NOT_FOUND' }, { status: 404 });
    }

    // Return hint text
    return NextResponse.json({
      success: true,
      hint: {
        number: hint.number,
        text: hint.text,
        penalty: hint.pointPenalty,
      },
    });
  } catch (err: unknown) {
    console.error('Hint error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
