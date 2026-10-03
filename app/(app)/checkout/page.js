// app/checkout/page.js
'use client'
import { useEffect, useState } from 'react'

export default function CheckoutPage() {
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [query, setQuery] = useState('')
  const [code, setCode] = useState('')
  const [history, setHistory] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(setStudents)
  }, [])

  async function loadHistory(id) {
    if (!id) return setHistory(null)
    const data = await fetch(`/api/students?id=${id}`).then(r => r.json())
    setHistory(data.ok ? data : null)
  }

  async function handleCheckout(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, code }),
    })
    const data = await res.json()
    setLoading(false)
    setResult(data)
    if (data.ok) {
      setCode('')
      loadHistory(studentId)
    }
  }

  // Pick a student from the search results
  function selectStudent(student) {
    setStudentId(student.id)
    setQuery(student.name)
    loadHistory(student.id)
    setResult(null)
  }

  // Teacher edited the search box, so any previous selection is no longer valid
  function handleQueryChange(value) {
    setQuery(value)
    setStudentId('')
    setHistory(null)
  }

  // Filter the loaded students by name or ID (only while typing, max 8 shown)
  const q = query.trim().toLowerCase()
  const matches = (q && !studentId)
    ? students
        .filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
        .slice(0, 8)
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Checkout</h1>
        <p className="text-ink-400 text-sm mt-1">Rent a book to a student. Standard rental R20.00, due 2 weeks after checkout.</p>
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-8 items-start">
        {/* Checkout form */}
        <div className="bg-white border border-ink-100 rounded-2xl p-5 space-y-4">
          <p className="font-medium text-sm text-ink-950">New checkout</p>

          {result && (
            <div className={`px-4 py-3 rounded-xl text-sm ${result.ok ? 'bg-forest-50 text-forest-700' : 'bg-rose-50 text-rose-700'}`}>
              {result.ok
                ? `✓ Checked out "${result.book.title}" to ${result.student.name}. Due: ${result.dueDate}.`
                : result.error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-3">
            <div>
              <label className="block text-xs text-ink-400 mb-1">Student</label>
              <input
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search by name or ID…"
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 placeholder:text-ink-300"
              />

              {matches.length > 0 && (
                <ul className="mt-1 border border-ink-100 rounded-lg divide-y divide-ink-50 overflow-hidden">
                  {matches.map(s => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectStudent(s)}
                        className="w-full text-left px-3 py-2 text-sm text-ink-950 hover:bg-ink-50"
                      >
                        {s.name} <span className="text-ink-400">({s.id})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {q && !studentId && matches.length === 0 && (
                <p className="mt-1 text-xs text-ink-400">No students found.</p>
              )}
            </div>
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
            </div>
            <button
              type="submit"
              disabled={loading || !studentId || !code}
              className="w-full py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing…' : 'Check out book'}
            </button>
          </form>
        </div>

        {/* Student history panel */}
        <div>
          {!history && (
            <div className="bg-ink-50 border border-ink-100 rounded-2xl p-8 text-center">
              <p className="text-sm text-ink-400">Select a student to see their rental history.</p>
            </div>
          )}
          {history && (
            <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-950">{history.student.name}</p>
                  <p className="text-xs text-ink-400">{history.student.grade ? `Grade ${history.student.grade} · ` : ''}{history.student.id}</p>
                </div>
                {history.outstandingFines > 0 && (
                  <span className="text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full">
                    R{history.outstandingFines.toFixed(2)} outstanding
                  </span>
                )}
              </div>
              {history.rentals.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-8">No rental history.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-50">
                      {['Book', 'Checkout', 'Due', 'Status', 'Rental ID'].map(h => (
                        <th key={h} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {history.rentals.map(r => (
                      <tr key={r.id}>
                        <td className="px-5 py-3 font-medium text-ink-950">{r.book?.title}</td>
                        <td className="px-5 py-3 text-ink-400 text-xs">{r.checkoutDate}</td>
                        <td className="px-5 py-3 text-ink-400 text-xs">{r.dueDate}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.status === 'active' ? 'bg-forest-50 text-forest-700' : 'bg-ink-50 text-ink-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-ink-400">{r.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
