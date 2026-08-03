// app/students/page.js — Manage students (add, edit, remove)
'use client'
import { useEffect, useState } from 'react'

const EMPTY_FORM = { name: '', id: '' }

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null) // original ID when editing, null when adding
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchStudents() {
    const data = await fetch('/api/students').then(r => r.json())
    setStudents(data)
  }

  useEffect(() => { fetchStudents() }, [])

  // Switch the form back to "add" mode
  function startAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMsg(null)
  }

  // Load a student into the form for editing
  function startEdit(student) {
    setEditingId(student.id)
    setForm({ name: student.name, id: student.id })
    setMsg(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const isEdit = editingId !== null
    const res = await fetch('/api/students', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? { originalId: editingId, ...form } : form),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) {
      setMsg({ type: 'success', text: isEdit ? `${data.student.name} updated.` : `${data.student.name} added.` })
      startAdd()
      fetchStudents()
    } else {
      setMsg({ type: 'error', text: data.error })
    }
  }

  async function handleRemove(student) {
    if (!confirm(`Remove ${student.name}?`)) return
    const res = await fetch(`/api/students?id=${encodeURIComponent(student.id)}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.ok) {
      setMsg({ type: 'success', text: `${student.name} removed.` })
      if (editingId === student.id) startAdd()
      fetchStudents()
    } else {
      setMsg({ type: 'error', text: data.error })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-forest-600 uppercase tracking-widest mb-1">Students</p>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Students</h1>
        <p className="text-ink-400 text-sm mt-1">Add, edit, and remove students.</p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-8 items-start">
        {/* Student list */}
        <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-50 bg-ink-50 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-600 uppercase tracking-widest">Students</p>
            <p className="text-xs text-ink-400">{students.length} total</p>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-12">No students yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-50">
                  {['Name', 'ID', ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-2 text-xs text-ink-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {students.map(s => (
                  <tr key={s.id} className={editingId === s.id ? 'bg-forest-50' : ''}>
                    <td className="px-5 py-3 font-medium text-ink-950">{s.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-400">{s.id}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-xs font-medium text-forest-600 hover:text-forest-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(s)}
                        className="ml-3 text-xs font-medium text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add / edit form */}
        <div className="bg-white border border-ink-100 rounded-2xl p-5">
          <p className="font-medium text-sm text-ink-950 mb-4">{editingId ? 'Edit student' : 'Add a student'}</p>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-forest-50 text-forest-700' : 'bg-rose-50 text-rose-700'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-ink-400 mb-1">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Alice Dube"
                required
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 placeholder:text-ink-300"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">ID number (digits only)</label>
              <input
                type="text"
                value={form.id}
                onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
                placeholder="1234567890123"
                required
                className="w-full px-3 py-2 text-sm bg-ink-50 border border-ink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 placeholder:text-ink-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving…' : editingId ? 'Save changes' : 'Add student'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={startAdd}
                className="w-full py-2 border border-ink-100 text-sm rounded-xl hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
