// app/inventory/page.js
'use client'
import { useEffect, useState } from 'react'

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor']

const EMPTY_FORM = { isbn: '', title: '', author: '', edition: '', condition: 'Good', startCode: '', quantity: '1' }

export default function InventoryPage() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchBooks(q = '') {
    const url = q ? `/api/inventory?q=${encodeURIComponent(q)}` : '/api/inventory'
    const data = await fetch(url).then(r => r.json())
    setBooks(data)
  }

  useEffect(() => { fetchBooks() }, [])

  async function handleSearch(e) {
    e.preventDefault()
    fetchBooks(search)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) {
      const copies = `${data.added} ${data.added === 1 ? 'copy' : 'copies'}`
      setMsg({ type: 'success', text: data.created ? `"${data.book.title}" added with ${copies}.` : `Added ${copies} — ${data.book.available} now available.` })
      setForm(EMPTY_FORM)
      fetchBooks()
    } else {
      setMsg({ type: 'error', text: data.error })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Inventory</h1>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-8 items-start">
        {/* Book list + search */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ISBN, title, or author…"
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-ink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent placeholder:text-ink-300"
            />
            <button type="submit" className="px-4 py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 transition-colors">Search</button>
            {search && <button type="button" onClick={() => { setSearch(''); fetchBooks() }} className="px-4 py-2.5 border border-ink-100 text-sm rounded-xl hover:bg-ink-50 transition-colors">Clear</button>}
          </form>

          <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-50 bg-ink-50 flex items-center justify-between">
              <p className="text-xs font-medium text-ink-600 uppercase tracking-widest">Books</p>
              <p className="text-xs text-ink-400">{books.length} result{books.length !== 1 ? 's' : ''}</p>
            </div>
            {books.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-12">No books found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-50">
                    {['Title', 'Author', 'ISBN', 'Available'].map(h => (
                      <th key={h} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {books.map(b => (
                    <tr key={b.id}>
                      <td className="px-5 py-3 font-medium text-ink-950">{b.title}</td>
                      <td className="px-5 py-3 text-ink-600">{b.author}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-400">{b.isbn}</td>
                      <td className="px-5 py-3">
                        <span className={`font-medium ${b.available === 0 ? 'text-rose-600' : 'text-forest-600'}`}>
                          {b.available}/{b.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add book form */}
        <div className="bg-white border border-ink-100 rounded-2xl p-5">
          <p className="font-medium text-sm text-ink-950 mb-4">Add a book</p>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-forest-50 text-forest-700' : 'bg-rose-50 text-rose-700'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-3">
            {[
              { name: 'isbn', label: 'ISBN-13', placeholder: '9780134685991' },
              { name: 'title', label: 'Title', placeholder: 'Effective Java' },
              { name: 'author', label: 'Author', placeholder: 'Joshua Bloch' },
              { name: 'edition', label: 'Edition', placeholder: '3rd' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs text-ink-400 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.name]}
                  onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  required
                  className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 placeholder:text-ink-300"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-ink-400 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1">QR code (first copy)</label>
                <input
                  type="text"
                  value={form.startCode}
                  onChange={e => setForm(p => ({ ...p, startCode: e.target.value }))}
                  placeholder="EJ-01"
                  required
                  className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 font-mono placeholder:text-ink-300 placeholder:font-sans"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
            </div>
            <p className="text-xs text-ink-400 -mt-2">
              Scan the first copy — the rest are numbered automatically (e.g. EJ-01, EJ-02, EJ-03…).
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Adding…' : 'Add to inventory'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
