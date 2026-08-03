import { NextResponse } from 'next/server'
import { signSession, safeEqual } from '@/lib/auth'

const SESSION_MAX_AGE = 12 * 60 * 60 // 12 hours, in seconds

export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}))

  const okUser = safeEqual(username || '', process.env.AUTH_USERNAME || '')
  const okPass = safeEqual(password || '', process.env.AUTH_PASSWORD || '')
  if (!okUser || !okPass) {
    return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 })
  }

  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const token = await signSession({ u: username, exp }, process.env.AUTH_SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('brs_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
