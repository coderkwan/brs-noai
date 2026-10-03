// app/page.js — Dashboard
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Top row figures. `tone` colours the value. `href` + `hint` turn a figure
// into a link.
function StatCard({ label, value, tone = 'neutral', href, hint }) {
  const num = { neutral: 'text-ink-950', good: 'text-forest-600', bad: 'text-rose-600', warn: 'text-amber-600' }[tone]
  const inner = (
    <>
      <p className="text-xs text-ink-400 uppercase tracking-widest mb-4">{label}</p>
      <p className={`text-3xl font-semibold tracking-tight ${num}`}>{value}</p>
      {hint && (
        <p className="text-xs text-forest-600 font-medium mt-3 flex items-center gap-1">
          {hint} <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </p>
      )}
    </>
  )
  const base = 'bg-white border border-ink-100 p-5'
  if (href) {
    return <Link href={href} className={`group block ${base} hover:bg-ink-50 transition-colors`}>{inner}</Link>
  }
  return <div className={base}>{inner}</div>
}

const NAV = [
  { href: '/inventory', title: 'Inventory', desc: 'Add books and search stock', icon: '📚' },
  { href: '/checkout', title: 'Checkout', desc: 'Rent a book to a student', icon: '🛍️' },
  { href: '/returns', title: 'Returns', desc: 'Check in books and fines', icon: '↩️' },
  { href: '/students', title: 'Students', desc: 'Add, edit, and remove students', icon: '👥' },
]

export default function Dashboard() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    fetch('/api/report').then(r => r.json()).then(setReport)
  }, [])

  return (
    <div className="space-y-10">
      {/* Masthead */}
      <div>
        <h1 className="text-4xl font-semibold text-ink-950 tracking-tight">Dashboard</h1>
        <p className="text-sm text-ink-400 mt-2">Overview of your bookshop rental system</p>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total books" value={report ? report.totalBooks : '—'} />
        <StatCard label="Available now" value={report ? report.totalAvailable : '—'} tone="good" />
        <StatCard label="Active rentals" value={report ? report.activeRentals : '—'} href="/rentals" hint="View list" />
        <StatCard label="Overdue" value={report ? report.overdueCount : '—'} tone={report?.overdueCount > 0 ? 'bad' : 'neutral'} />
        <StatCard label="Fines collected" value={report ? `R${report.totalFinesCollected.toFixed(2)}` : '—'} />
        <StatCard label="Fines outstanding" value={report ? `R${report.totalFinesOutstanding.toFixed(2)}` : '—'} tone={report?.totalFinesOutstanding > 0 ? 'warn' : 'neutral'} />
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-ink-100 p-6">
        <p className="font-semibold text-ink-950 mb-4">Quick Actions</p>
        <div className="grid grid-cols-4 gap-4">
          {NAV.map(card => (
            <Link key={card.href} href={card.href}
              className="group border border-dashed border-ink-200 p-6 flex flex-col items-center text-center gap-2 hover:border-forest-400 hover:bg-forest-50 transition-colors">
              <span className="text-2xl">{card.icon}</span>
              <p className="font-medium text-sm text-ink-950">{card.title}</p>
              <p className="text-xs text-ink-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Overdue list */}
      {report && report.overdueRentals.length > 0 && (
        <div className="bg-white border border-rose-100 overflow-hidden">
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-100">
            <p className="text-sm font-medium text-rose-600">Overdue books ({report.overdueRentals.length})</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-50">
                {['Student', 'Book', 'Due date', 'Days overdue', 'Fine accrued'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {report.overdueRentals.map(r => (
                <tr key={r.id}>
                  <td className="px-5 py-3 text-ink-950">{r.student?.name}</td>
                  <td className="px-5 py-3 text-ink-600">{r.book?.title}</td>
                  <td className="px-5 py-3 text-ink-400">{r.dueDate}</td>
                  <td className="px-5 py-3 text-rose-600 font-medium">{r.overdueDays}d</td>
                  <td className="px-5 py-3 text-rose-600 font-medium">R{r.fineAccrued.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
