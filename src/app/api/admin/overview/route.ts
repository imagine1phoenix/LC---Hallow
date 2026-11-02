import { NextRequest, NextResponse } from 'next/server';
import { getFullLeaderboardData } from '@/lib/serverUtils';
import db from '@/lib/db';
import { PUZZLES } from '@/lib/puzzleData';

export async function GET(req: NextRequest) {
  try {
    const data = getFullLeaderboardData();

    // Fetch audit logs
    const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();

    // Fetch answer key summary (Admin view only)
    const answerKeys = Object.values(PUZZLES).map((p) => ({
      roundId: p.roundId,
      roundNumber: p.roundNumber,
      title: p.title,
      targetQuestion: p.targetQuestion,
      hints: p.hints,
    }));

    return NextResponse.json({
      success: true,
      ...data,
      auditLogs,
      answerKeys,
    });
  } catch (err: unknown) {
    console.error('Admin overview API error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

