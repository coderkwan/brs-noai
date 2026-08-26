// components/Sidebar.js
'use client'
import { usePathname, useRouter } from 'next/navigation'

const LINKS = [
  ['/', 'Dashboard'],
  ['/inventory', 'Inventory'],
  ['/checkout', 'Checkout'],
  ['/returns', 'Returns'],
  ['/students', 'Students'],
  ['/reports', 'Reports'],
]

export default function Sidebar() {
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
    <aside className="w-64 shrink-0 bg-white border-r border-ink-100 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink-100">
        <div className="w-9 h-9 bg-forest-600 rounded flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm tracking-tight text-ink-950">BRS</p>
          <p className="text-xs text-ink-400">Bookshop Rental System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.map(([href, label]) => {
          const active = pathname === href
          return (
            <a key={href} href={href}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                active ? 'bg-forest-50 text-forest-700 font-medium' : 'text-ink-600 hover:text-ink-950 hover:bg-ink-50'
              }`}>
              {label}
            </a>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-100">
        <button
          onClick={signOut}
          className="w-full text-left px-3 py-2 text-sm text-ink-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  )
}
