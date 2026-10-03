// app/login/page.js
'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) {
      const from = params.get('from') || '/'
      router.push(from)
      router.refresh()
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Image src="/logo.png" alt="Manzini Central High School logo" width={40} height={40} className="rounded-md" priority />
          <span className="font-semibold text-lg tracking-tight text-ink-950">Manzini Central High School</span>
        </div>

        <div className="bg-white border border-ink-100 rounded-2xl p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-ink-950 tracking-tight">Sign in</h1>
            <p className="text-sm text-ink-400 mt-0.5">Enter your staff credentials to continue.</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm bg-rose-50 text-rose-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-ink-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
