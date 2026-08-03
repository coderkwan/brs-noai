// components/AppHeader.js
'use client'
import { usePathname, useRouter } from 'next/navigation'

const LINKS = [
  ['/', 'Dashboard'],
  ['/inventory', 'Inventory'],
  ['/checkout', 'Checkout'],
  ['/returns', 'Returns'],
  ['/students', 'Students'],
]

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()

  // The login page has no nav/sign-out.
  if (pathname === '/login') return null

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-ink-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-forest-600 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-tight text-ink-950">BRS</span>
      </div>
      <nav className="flex items-center gap-1">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href}
            className="px-3 py-1.5 text-sm text-ink-600 hover:text-ink-950 hover:bg-ink-50 rounded-md transition-colors">
            {label}
          </a>
        ))}
        <button
          onClick={signOut}
          className="ml-2 px-3 py-1.5 text-sm text-ink-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
          Sign out
        </button>
      </nav>
    </header>
  )
}
