// middleware.js
// Guards every route. Unauthenticated page requests are redirected to /login;
// unauthenticated API requests get a 401. Runs on the Edge runtime, so it uses
// the Web Crypto-based helpers in lib/auth.js.

import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

function isPublic(pathname) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const token = request.cookies.get('brs_session')?.value
  const session = token ? await verifySession(token, process.env.AUTH_SECRET) : null
  if (session) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
