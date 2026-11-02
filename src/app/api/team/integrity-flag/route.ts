import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTeamSession } from '@/lib/serverUtils';
import { execute, queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentTeamSession();
    if (!auth) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { team } = auth;
    const body = await req.json();
    const eventType = body.eventType || 'tab_switch';

    const validEvents = ['tab_switch', 'blur', 'context_menu', 'copy_attempt', 'device_conflict', 'inspect_attempt'];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'INVALID_EVENT' }, { status: 400 });
    }

    const id = 'flag-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    await execute('INSERT INTO integrity_flags (id, team_id, event_type, occurred_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [
      id,
      team.id,
      eventType,
    ]);

    const countRow = await queryOne<{ count: number | string }>(
      'SELECT count(*) as count FROM integrity_flags WHERE team_id = ?',
      [team.id]
    );

    return NextResponse.json({
      success: true,
      currentFlagCount: Number(countRow?.count) || 0,
    });
  } catch (err: unknown) {
    console.error('Error logging integrity flag:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
