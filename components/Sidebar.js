// components/Sidebar.js
'use client'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

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
        <Image src="/logo.png" alt="Manzini Central High School logo" width={36} height={36} className="rounded-md shrink-0" priority />
        <div>
          <p className="font-semibold text-sm tracking-tight text-ink-950">Manzini Central High School</p>
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
