// app/reports/page.js
'use client'
import { useState } from 'react'

// Turns a header row + data rows into a CSV file and triggers a download.
function downloadCSV(filename, columns, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [columns, ...rows].map(row => row.map(escape).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Opens a printable table in a new tab and triggers the browser's print
// dialog, where the user picks "Save as PDF". No PDF library needed.
function downloadPDF(title, columns, rows) {
  const escape = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const headerRow = columns.map(c => `<th>${escape(c)}</th>`).join('')
  const bodyRows = rows.map(row => `<tr>${row.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')
  const win = window.open('', '_blank')
  win.document.write(`
    <html>
      <head>
        <title>${escape(title)}</title>
        <style>
          body { font-family: sans-serif; padding: 32px; color: #0f0f0f; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { color: #636366; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d1d6; padding: 6px 10px; text-align: left; font-size: 12px; }
          th { background: #f2f2f7; }
        </style>
      </head>
      <body>
        <h1>${escape(title)}</h1>
        <p>Generated ${new Date().toLocaleDateString()}</p>
        <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
      </body>
    </html>
  `)
  win.document.close()
  win.onload = () => win.print()
}

const REPORTS = [
  {
    id: 'inventory',
    title: 'Inventory',
    desc: 'All books and current stock levels',
    columns: ['ISBN', 'Title', 'Author', 'Edition', 'Quantity', 'Available'],
    async rows() {
      const books = await fetch('/api/inventory').then(r => r.json())
      return books.map(b => [b.isbn, b.title, b.author, b.edition, b.quantity, b.available])
    },
  },
  {
    id: 'students',
    title: 'Students',
    desc: 'Registered students',
    columns: ['ID', 'Name', 'Grade'],
    async rows() {
      const students = await fetch('/api/students').then(r => r.json())
      return students.map(s => [s.id, s.name, s.grade || ''])
    },
  },
  {
    id: 'rentals',
    title: 'Rentals',
    desc: 'Every checkout, on loan or returned',
    columns: ['Student', 'Book', 'Checkout date', 'Due date', 'Return date', 'Status', 'Late fee', 'Damage fee'],
    async rows() {
      const rentals = await fetch('/api/rentals?all=1').then(r => r.json())
      return rentals.map(r => [
        r.student?.name, r.book?.title, r.checkoutDate, r.dueDate,
        r.returnDate || '', r.status, r.lateFee.toFixed(2), r.damageFee.toFixed(2),
      ])
    },
  },
  {
    id: 'overdue',
    title: 'Overdue',
    desc: 'Books currently overdue',
    columns: ['Student', 'Book', 'Due date', 'Days overdue', 'Fine accrued'],
    async rows() {
      const report = await fetch('/api/report').then(r => r.json())
      return report.overdueRentals.map(r => [
        r.student?.name, r.book?.title, r.dueDate, r.overdueDays, r.fineAccrued.toFixed(2),
      ])
    },
  },
]

export default function ReportsPage() {
  const [generatingId, setGeneratingId] = useState(null)

  async function handleGenerate(report, format) {
    setGeneratingId(report.id)
    const rows = await report.rows()
    if (format === 'csv') {
      downloadCSV(`${report.id}-${new Date().toISOString().slice(0, 10)}.csv`, report.columns, rows)
    } else {
      downloadPDF(report.title, report.columns, rows)
    }
    setGeneratingId(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-950 tracking-tight">Reports</h1>
        <p className="text-ink-400 text-sm mt-1">Generate a report and download it as a CSV or PDF file.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map(report => (
          <div key={report.id} className="bg-white border border-ink-100 p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-ink-950">{report.title}</p>
              <p className="text-xs text-ink-400 mt-0.5">{report.desc}</p>
            </div>
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => handleGenerate(report, 'csv')}
                disabled={generatingId === report.id}
                className="px-4 py-2 bg-forest-600 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => handleGenerate(report, 'pdf')}
                disabled={generatingId === report.id}
                className="px-4 py-2 border border-ink-100 text-ink-950 text-sm font-medium hover:bg-ink-50 disabled:opacity-50 transition-colors"
              >
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
