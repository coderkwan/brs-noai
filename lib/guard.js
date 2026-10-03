// Server-side session helpers. Used by the (app) route-group layout to guard
// pages, and by API route handlers to return 401s. Unlike the old middleware,
// this runs in the Node.js runtime, so lib/auth.js's Web Crypto works via
// Node's globals and nothing is nested inside an Edge sandbox.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'

// Returns the decoded session payload, or null when unauthenticated.
export async function getSession() {
  const store = await cookies()
  const token = store.get('brs_session')?.value
  return token ? verifySession(token, process.env.AUTH_SECRET) : null
}

// Page guard: redirect to /login when there's no valid session.
export async function requireSession() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

// API guard: returns the session, or a ready-to-return 401 Response.
export async function checkApiSession() {
  const session = await getSession()
  if (!session) {
    return { session: null, response: Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, response: null }
}
