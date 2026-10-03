// app/returns/page.js
'use client'
import { useEffect, useState } from 'react'

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor']

export default function ReturnsPage() {
  const [rentals, setRentals] = useState([])
  const [code, setCode] = useState('')
  const [returnCondition, setReturnCondition] = useState('Good')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchRentals() {
    const data = await fetch('/api/rentals').then(r => r.json())
    setRentals(data)
  }

  useEffect(() => { fetchRentals() }, [])

  async function handleCheckin(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, returnCondition }),
    })
    const data = await res.json()
    setLoading(false)
    setResult(data)
    if (data.ok) {
      setCode('')
      fetchRentals()
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Returns</h1>
        <p className="text-ink-400 text-sm mt-1">Check in books and calculate damage and late fees.</p>
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-8 items-start">
        {/* Check-in form */}
        <div className="space-y-4">
          <div className="bg-white border border-ink-100 rounded-2xl p-5 space-y-4">
            <p className="font-medium text-sm text-ink-950">Check in a book</p>

            {result && (
              <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${result.ok ? 'bg-forest-50 text-forest-700' : 'bg-rose-50 text-rose-700'}`}>
                {result.ok ? (
                  <>
                    <p className="font-medium">✓ "{result.book.title}" returned by {result.student.name}</p>
                    <p className="mt-1 text-xs">
                      {result.overdueDays > 0 && `Late ${result.overdueDays} day(s): R${result.lateFee.toFixed(2)}`}
                      {result.overdueDays > 0 && result.damageFee > 0 && ' · '}
                      {result.damageFee > 0 && `Damage fee: R${result.damageFee.toFixed(2)}`}
                      {result.totalFee === 0 && 'No fines — returned on time in good condition.'}
                      {result.totalFee > 0 && ` · Total: R${result.totalFee.toFixed(2)}`}
                    </p>
                  </>
                ) : result.error}
              </div>
            )}

            <form onSubmit={handleCheckin} className="space-y-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1">Book QR code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Scan or enter the book's QR code"
                  required
                  className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 font-mono placeholder:text-ink-300 placeholder:font-sans"
                />
                <p className="text-xs text-ink-400 mt-1">Scan the QR code, or click a row on the right.</p>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">Return condition</label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
                >
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || !code}
                className="w-full py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing…' : 'Check in book'}
              </button>
            </form>
          </div>

          {/* Fee reference */}
          <div className="bg-white border border-ink-100 rounded-2xl p-5">
            <p className="text-xs font-medium text-ink-600 uppercase tracking-widest mb-3">Late fee</p>
            <p className="text-sm text-ink-600">Books are due 2 weeks after checkout. R10.00 for each week overdue (part of a week counts as a full week).</p>
          </div>
        </div>

        {/* Active rentals table */}
        <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-50 bg-ink-50 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-600 uppercase tracking-widest">Active rentals</p>
            <p className="text-xs text-ink-400">{rentals.length} active</p>
          </div>
          {rentals.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-12">No active rentals.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-50">
                  {['Rental ID', 'QR code', 'Student', 'Book', 'Due', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {rentals.map(r => {
                  const overdue = r.overdueDays > 0
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setCode(r.copyCode)}
                      className={`cursor-pointer hover:bg-ink-50 transition-colors ${code === r.copyCode ? 'bg-forest-50' : ''}`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-ink-600">{r.id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-600">{r.copyCode}</td>
                      <td className="px-5 py-3 text-ink-950">{r.student?.name}</td>
                      <td className="px-5 py-3 text-ink-600">{r.book?.title}</td>
                      <td className="px-5 py-3 text-xs text-ink-400">{r.dueDate}</td>
                      <td className="px-5 py-3">
                        {overdue
                          ? <span className="text-xs font-medium bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{r.overdueDays}d overdue</span>
                          : <span className="text-xs font-medium bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full">On time</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <p className="text-xs text-ink-400 px-5 py-3 border-t border-ink-50">Click a row to fill in the QR code.</p>
        </div>
      </div>
    </div>
  )
}
