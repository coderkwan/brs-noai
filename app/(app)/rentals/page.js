// app/rentals/page.js — Active rentals
'use client'
import { useEffect, useState } from 'react'

export default function RentalsPage() {
  const [rentals, setRentals] = useState([])

  useEffect(() => {
    fetch('/api/rentals').then(r => r.json()).then(setRentals)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-forest-600 uppercase tracking-widest mb-1">Active rentals</p>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Active rentals</h1>
        <p className="text-ink-400 text-sm mt-1">Books currently checked out to students.</p>
      </div>

      <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-50 bg-ink-50 flex items-center justify-between">
          <p className="text-xs font-medium text-ink-600 uppercase tracking-widest">Currently out</p>
          <p className="text-xs text-ink-400">{rentals.length} active</p>
        </div>
        {rentals.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-12">No active rentals.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-50">
                {['Student', 'Book', 'Checkout', 'Due', 'Overdue'].map(h => (
                  <th key={h} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {rentals.map(r => (
                <tr key={r.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink-950">{r.student?.name}</p>
                    <p className="text-xs text-ink-400">{r.student?.id}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-ink-950">{r.book?.title}</p>
                    <p className="text-xs font-mono text-ink-400">{r.copyCode}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-400 text-xs">{r.checkoutDate}</td>
                  <td className="px-5 py-3 text-ink-400 text-xs">{r.dueDate}</td>
                  <td className="px-5 py-3">
                    {r.overdueDays > 0
                      ? <span className="text-rose-600 font-medium">{r.overdueDays}d</span>
                      : <span className="text-ink-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
