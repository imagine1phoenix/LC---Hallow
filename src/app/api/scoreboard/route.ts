import { NextRequest, NextResponse } from 'next/server';
import { getFullLeaderboardData } from '@/lib/serverUtils';

export async function GET(req: NextRequest) {
  try {
    const { leaderboard, settings, rounds } = await getFullLeaderboardData();
    const isVisible = settings['scoreboard_visible'] === '1';

    // Check if query param includes admin bypass (if admin is viewing scoreboard)
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    if (!isVisible && !isAdmin) {
      return NextResponse.json({
        visible: false,
        message: 'The Grand Scoreboard is sealed in darkness. Scores will be unveiled between rounds.',
      });
    }

    return NextResponse.json({
      visible: true,
      rounds: rounds.map((r) => ({ id: r.id, number: r.number, name: r.name })),
      leaderboard: leaderboard.map((item) => ({
        rank: item.rank,
        teamId: item.team.id,
        teamName: item.team.name,
        sigil: item.team.sigil,
        totalScore: item.totalScore,
        correctAnswers: item.correctAnswerCount,
        hintsUsed: item.totalHintsUsed,
        totalTimeSeconds: item.totalTimeSeconds,
        roundScores: item.roundScores,
        finalScore: item.finalQuestionScore,
        adjustments: item.manualAdjustments,
      })),
    });
  } catch (err: unknown) {
    console.error('Scoreboard API error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
