import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { Team, DeviceSession } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { joinCode, name, sigil, deviceFingerprint } = await req.json();

    if (!joinCode || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Join code and device fingerprint are required.' },
        { status: 400 }
      );
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // 1. Find team by join code
    const team = await queryOne<Team>('SELECT * FROM teams WHERE UPPER(join_code) = ?', [cleanCode]);

    if (!team) {
      return NextResponse.json(
        { error: 'INVALID_CODE', message: 'Invalid or expired Nevermore Academy join code.' },
        { status: 404 }
      );
    }

    // 2. Check existing active sessions for this team
    const activeSession = await queryOne<DeviceSession>(
      'SELECT * FROM sessions WHERE team_id = ? AND revoked_at IS NULL',
      [team.id]
    );

    if (activeSession) {
      // If bound to a different device, reject immediately!
      if (activeSession.device_fingerprint !== deviceFingerprint) {
        // Log an integrity conflict flag
        const flagId = 'flag-' + Date.now();
        await execute(
          'INSERT INTO integrity_flags (id, team_id, event_type, occurred_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [flagId, team.id, 'device_conflict']
        );

        return NextResponse.json(
          {
            error: 'DEVICE_BOUND',
            message:
              'This team code is already bound to another device. Under Nevermore Academy rules, teams may only use one authorized device. Please request a device reset from a Volunteer at the Admin Desk.',
          },
          { status: 403 }
        );
      }
    }

    // 3. Update team details if provided and first onboarding
    if (name && sigil) {
      await execute('UPDATE teams SET name = ?, sigil = ? WHERE id = ?', [name.trim(), sigil, team.id]);
      team.name = name.trim();
      team.sigil = sigil;
    }

    // 4. Create or reuse session
    let sessionId = activeSession?.id;
    if (!sessionId) {
      sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      await execute(
        'INSERT INTO sessions (id, team_id, device_fingerprint, bound_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [sessionId, team.id, deviceFingerprint]
      );
    }

    const response = NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        sigil: team.sigil,
        join_code: team.join_code,
      },
      sessionId,
    });

    // Set secure session cookie
    response.cookies.set('nevermore_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set('nevermore_team_id', team.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err: unknown) {
    console.error('Error in /api/team/join:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Failed to join team.' }, { status: 500 });
  }
}
