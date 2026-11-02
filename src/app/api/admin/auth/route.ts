import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { Admin } from '@/lib/types';

const ADMIN_COOKIE_NAME = 'nevermore_admin_auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    return NextResponse.json({
      authenticated: true,
      admin: {
        name: sessionData.name,
        role: sessionData.role,
        id: sessionData.id,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: 'Passcode is required.' }, { status: 400 });
    }

    const cleanPass = passcode.trim();

    // 1. Check custom master override from environment
    const masterPass = process.env.ADMIN_SECRET_PASSCODE || 'nevermore1891';
    let matchedAdmin: { id: string; name: string; role: string } | null = null;

    if (cleanPass === masterPass) {
      matchedAdmin = {
        id: 'admin-headmaster',
        name: 'Principal Larissa Weems',
        role: 'headmaster',
      };
    } else {
      // 2. Query admins table in database
      const row = db
        .prepare('SELECT id, name, role FROM admins WHERE passcode = ?')
        .get(cleanPass) as Admin | undefined;

      if (row) {
        matchedAdmin = {
          id: row.id,
          name: row.name,
          role: row.role,
        };
      }
    }

    if (!matchedAdmin) {
      return NextResponse.json(
        {
          error: 'ACCESS_DENIED',
          message: 'Incorrect Academy clearance passcode. This incident has been noted.',
        },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: matchedAdmin.id,
      name: matchedAdmin.name,
      role: matchedAdmin.role,
      authenticatedAt: Date.now(),
    };

    const token = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    const response = NextResponse.json({
      success: true,
      admin: matchedAdmin,
      message: `Welcome back, ${matchedAdmin.name}. Access granted.`,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours clearance
    });

    return response;
  } catch (err: unknown) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Admin session terminated.' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

