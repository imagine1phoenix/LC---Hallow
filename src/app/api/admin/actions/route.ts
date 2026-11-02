import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { logAdminAction, verifyAdminSession } from '@/lib/serverUtils';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminSession();
    if (!auth.valid || !auth.admin) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Nevermore Headmaster clearance required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const actor = auth.admin.name || 'Principal Larissa Weems';
    const { action } = body;

    switch (action) {
      // 1. Device Unbind / Unlock (Mandatory reason + audit trail)
      case 'UNBIND_DEVICE': {
        const { teamId, reason } = body;
        if (!teamId || !reason || !reason.trim()) {
          return NextResponse.json({ error: 'A valid reason is required to unbind device.' }, { status: 400 });
        }

        await execute(`
          UPDATE sessions
          SET revoked_at = CURRENT_TIMESTAMP, revoked_by = ?, reason = ?
          WHERE team_id = ? AND revoked_at IS NULL
        `, [actor, reason.trim(), teamId]);

        await logAdminAction(actor, 'UNBIND_DEVICE', `Unbound active session for team ${teamId}. Reason: ${reason.trim()}`);
        return NextResponse.json({ success: true, message: 'Device unlocked. Team can now bind a new device.' });
      }

      // 2. Round Control: Release Round
      case 'RELEASE_ROUND': {
        const { roundId } = body;
        if (!roundId) return NextResponse.json({ error: 'roundId required' }, { status: 400 });

        await execute(`
          UPDATE rounds
          SET released_at = CURRENT_TIMESTAMP, locked_at = NULL
          WHERE id = ?
        `, [roundId]);

        await logAdminAction(actor, 'RELEASE_ROUND', `Released round ${roundId} to all teams.`);
        return NextResponse.json({ success: true, message: `Round ${roundId} released.` });
      }

      // 3. Round Control: Lock Round
      case 'LOCK_ROUND': {
        const { roundId } = body;
        if (!roundId) return NextResponse.json({ error: 'roundId required' }, { status: 400 });

        await execute(`
          UPDATE rounds
          SET locked_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [roundId]);

        await logAdminAction(actor, 'LOCK_ROUND', `Locked submissions for round ${roundId}.`);
        return NextResponse.json({ success: true, message: `Round ${roundId} locked.` });
      }

      // 4. Score Editing: Add / Cut points (Mandatory reason + audit trail)
      case 'ADJUST_SCORE': {
        const { teamId, roundId, delta, reason } = body;
        if (!teamId || delta === undefined || !reason || !reason.trim()) {
          return NextResponse.json({ error: 'teamId, delta, and a mandatory reason are required.' }, { status: 400 });
        }

        const adjId = 'adj-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        await execute(`
          INSERT INTO score_adjustments (id, team_id, round_id, delta, reason, admin_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [adjId, teamId, roundId || null, Number(delta), reason.trim(), actor]);

        await logAdminAction(
          actor,
          'ADJUST_SCORE',
          `Adjusted team ${teamId} score by ${delta > 0 ? '+' : ''}${delta} pts. Reason: ${reason.trim()}`
        );

        return NextResponse.json({ success: true, message: 'Score adjustment recorded in audit trail.' });
      }

      // 5. Scoreboard Visibility Toggle
      case 'TOGGLE_SCOREBOARD': {
        const { visible } = body;
        const val = visible ? '1' : '0';
        await execute(
          "INSERT INTO settings (key, value) VALUES ('scoreboard_visible', ?) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value",
          [val]
        );

        await logAdminAction(actor, 'TOGGLE_SCOREBOARD', `Scoreboard visibility set to ${visible ? 'PUBLIC' : 'HIDDEN'}`);
        return NextResponse.json({ success: true, scoreboardVisible: visible });
      }

      // 6. Create Team
      case 'CREATE_TEAM': {
        const { name, sigil = 'raven' } = body;
        if (!name || !name.trim()) return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });

        const id = 'team-' + Date.now().toString(36);
        const joinCode = 'NM-' + Math.floor(100 + Math.random() * 900);

        await execute('INSERT INTO teams (id, name, sigil, join_code) VALUES (?, ?, ?, ?)', [
          id,
          name.trim(),
          sigil,
          joinCode,
        ]);

        await logAdminAction(actor, 'CREATE_TEAM', `Created team "${name.trim()}" with code ${joinCode}`);
        return NextResponse.json({ success: true, team: { id, name: name.trim(), sigil, joinCode } });
      }

      // 7. Regenerate Join Code
      case 'REGENERATE_CODE': {
        const { teamId } = body;
        const newCode = 'NM-' + Math.floor(100 + Math.random() * 900);
        await execute('UPDATE teams SET join_code = ? WHERE id = ?', [newCode, teamId]);

        await logAdminAction(actor, 'REGENERATE_CODE', `Regenerated join code for team ${teamId}: ${newCode}`);
        return NextResponse.json({ success: true, newCode });
      }

      // 8. Grade Final Question
      case 'JUDGE_FINAL_QUESTION': {
        const { teamId, score, notes = '' } = body;
        if (!teamId || score === undefined) return NextResponse.json({ error: 'teamId and score required' }, { status: 400 });

        const scoreNum = Math.min(30, Math.max(0, Number(score)));
        const id = 'final-' + teamId;

        await execute(`
          INSERT INTO final_answers (id, team_id, text, judge_score, judged_at, judged_by)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
          ON CONFLICT(team_id) DO UPDATE SET
            judge_score = EXCLUDED.judge_score,
            judged_at = CURRENT_TIMESTAMP,
            judged_by = EXCLUDED.judged_by
        `, [id, teamId, notes, scoreNum, actor]);

        await logAdminAction(actor, 'JUDGE_FINAL_QUESTION', `Graded final question for team ${teamId}: ${scoreNum}/30 pts`);
        return NextResponse.json({ success: true, score: scoreNum });
      }

      default:
        return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error('Admin action error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
