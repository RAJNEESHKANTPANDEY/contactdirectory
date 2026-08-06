import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = await createSessionToken('admin');
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
