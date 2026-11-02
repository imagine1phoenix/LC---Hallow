import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTeamSession } from '@/lib/serverUtils';
import { queryOne, execute } from '@/lib/db';
import { Round, Submission } from '@/lib/types';
import { PUZZLES } from '@/lib/puzzleData';
import { calculateRoundPoints, calculateSpeedBonus } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { team } = auth;
    const { roundId, answer, motive, hintsUsed = 0 } = await req.json();

    if (!roundId || answer === undefined) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    // 1. Fetch round details
    const round = await queryOne<Round>('SELECT * FROM rounds WHERE id = ?', [roundId]);
    if (!round) {
      return NextResponse.json({ error: 'ROUND_NOT_FOUND' }, { status: 404 });
    }

    // 2. Validate round is active
    if (!round.released_at) {
      return NextResponse.json(
        { error: 'ROUND_NOT_RELEASED', message: 'This round has not been released by the Headmaster yet.' },
        { status: 403 }
      );
    }
    if (round.locked_at) {
      return NextResponse.json(
        { error: 'ROUND_LOCKED', message: 'Submissions for this round have been locked.' },
        { status: 403 }
      );
    }

    // 3. Enforce single submission per round rule
    const existingSubmission = await queryOne<Submission>(
      'SELECT id FROM submissions WHERE team_id = ? AND round_id = ?',
      [team.id, round.id]
    );

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'ALREADY_SUBMITTED', message: 'Your team has already sealed a final submission for this round.' },
        { status: 409 }
      );
    }

    // 4. Calculate authoritative server-side elapsed time
    const releasedAtTime = new Date(round.released_at).getTime();
    const nowTime = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((nowTime - releasedAtTime) / 1000));

    // 5. Server-side answer validation
    const puzzle = PUZZLES[round.id];
    if (!puzzle) {
      return NextResponse.json({ error: 'PUZZLE_DEFINITION_MISSING' }, { status: 500 });
    }

    const validationResult = puzzle.validateAnswer(answer, motive);
    const isCorrect = validationResult.isCorrect;
    const isMotiveCorrect = validationResult.isMotiveCorrect ?? false;

    // 6. Compute points and speed bonus
    const points = calculateRoundPoints(round.number, isCorrect, hintsUsed, isMotiveCorrect);
    const speedBonus = calculateSpeedBonus(elapsedSeconds, isCorrect);

    // 7. Insert submission atomically
    const subId = 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    await execute(`
      INSERT INTO submissions (
        id, team_id, round_id, answer, motive, submitted_at,
        hints_used, is_correct, is_motive_correct, points, speed_bonus
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
    `, [
      subId,
      team.id,
      round.id,
      answer.trim(),
      motive ? motive.trim() : null,
      hintsUsed,
      isCorrect ? 1 : 0,
      isMotiveCorrect ? 1 : 0,
      points,
      speedBonus,
    ]);

    return NextResponse.json({
      success: true,
      submission: {
        id: subId,
        isCorrect,
        isMotiveCorrect,
        points,
        speedBonus,
        elapsedSeconds,
        feedback: validationResult.feedback,
      },
    });
  } catch (err: unknown) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
