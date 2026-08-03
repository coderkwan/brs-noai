// lib/db.js
// Data lives in memory and is saved to a local JSON file (data.json) so it
// survives server restarts. This is a stand-in until we move to Turso —
// swap load()/save() for real DB calls then.

import { v4 as uuid } from 'uuid'
import fs from 'fs'
import path from 'path'

// ── Seed data ────────────────────────────────────────────────────────────────

// A book is the catalogue entry (one per title). ISBN is reference only.
const BOOKS = [
  { id: 'b-001', isbn: '9780134685991', title: 'Effective Java',  author: 'Joshua Bloch',     edition: '3rd', rentalPrice: 20.00 },
  { id: 'b-002', isbn: '9780201633610', title: 'Design Patterns', author: 'Gang of Four',      edition: '1st', rentalPrice: 20.00 },
  { id: 'b-003', isbn: '9780132350884', title: 'Clean Code',      author: 'Robert C. Martin',  edition: '1st', rentalPrice: 20.00 },
]

// A copy is one physical book with its own QR code. status: 'available' | 'out'
const COPIES = [
  { code: 'EJ-01', bookId: 'b-001', condition: 'Good', status: 'available' },
  { code: 'EJ-02', bookId: 'b-001', condition: 'Good', status: 'available' },
  { code: 'DP-01', bookId: 'b-002', condition: 'Fair', status: 'available' },
  { code: 'CC-01', bookId: 'b-003', condition: 'New',  status: 'available' },
  { code: 'CC-02', bookId: 'b-003', condition: 'New',  status: 'available' },
]

const STUDENTS = [
  { id: 'S-1001', name: 'Alice Dube',   grade: '11' },
  { id: 'S-1002', name: 'Bongani Nkosi', grade: '12' },
  { id: 'S-1003', name: 'Chidi Okafor',  grade: '10' },
]

// Rentals: { id, copyCode, bookId, studentId, checkoutDate, dueDate,
//            checkoutCondition, returnDate|null, returnCondition|null,
//            damageFee, lateFee, status }
const RENTALS = []

// Rental rules (all money is in ZAR — R)
const RENTAL_PRICE = 20.00       // standard price to rent any book
const RENTAL_DAYS = 14           // books are due 2 weeks after checkout
const OVERDUE_FEE_PER_WEEK = 10  // R10 for each week overdue (part-week rounds up)

// Damage fee matrix (checkout condition → return condition → fee)
const DAMAGE_MATRIX = {
  New:  { New: 0,  Good: 15, Fair: 40, Poor: 80 },
  Good: { New: 0,  Good: 0,  Fair: 20, Poor: 55 },
  Fair: { New: 0,  Good: 0,  Fair: 0,  Poor: 30 },
  Poor: { New: 0,  Good: 0,  Fair: 0,  Poor: 0  },
}

// ── Persistence ─────────────────────────────────────────────────────────────
// Read on startup, write after every change. Arrays are updated in place so
// all the functions below keep working against the same references.

const DATA_FILE = path.join(process.cwd(), 'data.json')

function save() {
  const data = { books: BOOKS, copies: COPIES, students: STUDENTS, rentals: RENTALS }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    save() // first run — write the seed data out
    return
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  BOOKS.length = 0; BOOKS.push(...data.books)
  COPIES.length = 0; COPIES.push(...data.copies)
  STUDENTS.length = 0; STUDENTS.push(...data.students)
  RENTALS.length = 0; RENTALS.push(...data.rentals)
}

load()

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86_400_000))
}

// Add days to a YYYY-MM-DD date and return YYYY-MM-DD.
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Overdue fine: R10 for each week (or part of a week) past the due date.
function overdueFee(overdueDays) {
  return Math.ceil(overdueDays / 7) * OVERDUE_FEE_PER_WEEK
}

// Attach copy counts to a catalogue book for display.
function bookWithCounts(book) {
  const copies = COPIES.filter(c => c.bookId === book.id)
  return {
    ...book,
    quantity: copies.length,
    available: copies.filter(c => c.status === 'available').length,
  }
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export function listBooks() {
  return BOOKS.map(bookWithCounts)
}

export function searchBooks({ query }) {
  const q = query.toLowerCase()
  return BOOKS
    .filter(b => b.isbn.includes(q) || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    .map(bookWithCounts)
}

// Add a book and its physical copies. `codes` is one QR code per copy.
// All copies in this batch share the given starting condition.
export function addBook({ isbn, title, author, edition, condition, codes }) {
  const list = (codes || []).map(c => c.trim()).filter(Boolean)
  if (list.length === 0) return { ok: false, error: 'Enter at least one QR code' }

  // No duplicates inside the batch, and no codes already in use.
  const seen = new Set()
  for (const code of list) {
    if (seen.has(code)) return { ok: false, error: `Duplicate QR code in the list: ${code}` }
    seen.add(code)
    if (COPIES.find(c => c.code === code)) return { ok: false, error: `QR code already in use: ${code}` }
  }

  // Find the catalogue entry by ISBN, or create it.
  let book = BOOKS.find(b => b.isbn === isbn)
  const created = !book
  if (!book) {
    book = { id: 'b-' + uuid().slice(0, 6), isbn, title, author, edition, rentalPrice: RENTAL_PRICE }
    BOOKS.push(book)
  }

  // One copy per QR code.
  for (const code of list) {
    COPIES.push({ code, bookId: book.id, condition, status: 'available' })
  }

  save()
  return { ok: true, book: bookWithCounts(book), created, added: list.length }
}

// ── Students ──────────────────────────────────────────────────────────────────

export function getStudent(studentId) {
  return STUDENTS.find(s => s.id === studentId) || null
}

export function listStudents() {
  return STUDENTS
}

// Add a new student. `id` is the 13-digit birth-certificate number.
export function addStudent({ id, name }) {
  id = (id || '').trim()
  name = (name || '').trim()

  if (!name) return { ok: false, error: 'Full name is required' }
  if (!id) return { ok: false, error: 'ID number is required' }
  if (!/^\d+$/.test(id)) return { ok: false, error: 'ID number must contain digits only' }
  if (getStudent(id)) return { ok: false, error: `Student ${id} already exists` }

  const student = { id, name }
  STUDENTS.push(student)
  save()
  return { ok: true, student }
}

// Edit a student's name and/or ID. `originalId` finds the existing record.
export function updateStudent({ originalId, id, name }) {
  const student = getStudent(originalId)
  if (!student) return { ok: false, error: 'Student not found' }

  id = (id || '').trim()
  name = (name || '').trim()

  if (!name) return { ok: false, error: 'Full name is required' }
  if (!id) return { ok: false, error: 'ID number is required' }
  if (!/^\d+$/.test(id)) return { ok: false, error: 'ID number must contain digits only' }
  if (id !== originalId && getStudent(id)) return { ok: false, error: `Student ${id} already exists` }

  // If the ID changed, keep any rental history pointing at the new ID
  if (id !== originalId) {
    RENTALS.filter(r => r.studentId === originalId).forEach(r => { r.studentId = id })
  }

  student.id = id
  student.name = name
  save()
  return { ok: true, student }
}

// Remove a student. Blocked if they still have books checked out.
export function deleteStudent(id) {
  const student = getStudent(id)
  if (!student) return { ok: false, error: 'Student not found' }

  const hasActive = RENTALS.some(r => r.studentId === id && r.status === 'active')
  if (hasActive) return { ok: false, error: `Cannot remove ${student.name} — they have active rentals` }

  const index = STUDENTS.findIndex(s => s.id === id)
  STUDENTS.splice(index, 1)
  save()
  return { ok: true }
}

export function studentHistory(studentId) {
  const student = getStudent(studentId)
  if (!student) return { ok: false, error: 'Student not found' }
  const rentals = RENTALS.filter(r => r.studentId === studentId).map(r => ({
    ...r,
    book: BOOKS.find(b => b.id === r.bookId),
  }))
  const outstanding = rentals
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.lateFee, 0)
  return { ok: true, student, rentals, outstandingFines: outstanding }
}

// ── Checkout ──────────────────────────────────────────────────────────────────

// Check out one copy, identified by its scanned QR code.
export function checkoutBook({ studentId, code }) {
  const student = getStudent(studentId)
  if (!student) return { ok: false, error: `Student ${studentId} not found` }

  const copy = COPIES.find(c => c.code === code)
  if (!copy) return { ok: false, error: `No book found for QR code ${code}` }
  if (copy.status !== 'available') return { ok: false, error: `Copy ${code} is already checked out` }

  const book = BOOKS.find(b => b.id === copy.bookId)

  // Don't let a student hold two copies of the same title at once.
  const already = RENTALS.find(
    r => r.studentId === studentId && r.bookId === book.id && r.status === 'active'
  )
  if (already) return { ok: false, error: `${student.name} already has "${book.title}" checked out` }

  const checkoutDate = today()
  const dueDate = addDays(checkoutDate, RENTAL_DAYS)
  const rental = {
    id: 'r-' + uuid().slice(0, 8),
    copyCode: copy.code,
    bookId: book.id,
    studentId,
    checkoutDate,
    dueDate,
    checkoutCondition: copy.condition,
    returnDate: null,
    returnCondition: null,
    damageFee: 0,
    lateFee: 0,
    status: 'active',
  }
  RENTALS.push(rental)
  copy.status = 'out'
  save()
  return { ok: true, rental, book: bookWithCounts(book), student, dueDate }
}

// ── Check-in ──────────────────────────────────────────────────────────────────

// Check in one copy, identified by its scanned QR code.
export function checkinBook({ code, returnCondition }) {
  const copy = COPIES.find(c => c.code === code)
  if (!copy) return { ok: false, error: `No book found for QR code ${code}` }

  const rental = RENTALS.find(r => r.copyCode === code && r.status === 'active')
  if (!rental) return { ok: false, error: `Copy ${code} is not checked out` }

  const book = BOOKS.find(b => b.id === rental.bookId)
  const student = getStudent(rental.studentId)

  const returnDate = today()
  const overdueDays = daysBetween(rental.dueDate, returnDate)
  const lateFee = overdueFee(overdueDays)
  const damageFee = DAMAGE_MATRIX[rental.checkoutCondition]?.[returnCondition] ?? 0

  rental.returnDate = returnDate
  rental.returnCondition = returnCondition
  rental.lateFee = lateFee
  rental.damageFee = damageFee
  rental.status = 'returned'

  copy.status = 'available'
  copy.condition = returnCondition // this copy now carries its returned condition

  save()
  return {
    ok: true, rental, book: bookWithCounts(book), student,
    overdueDays, lateFee, damageFee,
    totalFee: lateFee + damageFee,
  }
}

// ── Active rentals ────────────────────────────────────────────────────────────

export function activeRentals() {
  return RENTALS.filter(r => r.status === 'active').map(r => ({
    ...r,
    book: BOOKS.find(b => b.id === r.bookId),
    student: getStudent(r.studentId),
    overdueDays: daysBetween(r.dueDate, today()),
  }))
}

export function allRentals() {
  return RENTALS.map(r => ({
    ...r,
    book: BOOKS.find(b => b.id === r.bookId),
    student: getStudent(r.studentId),
  }))
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function generateReport() {
  const active = RENTALS.filter(r => r.status === 'active')
  const returned = RENTALS.filter(r => r.status === 'returned')
  const overdueList = active.filter(r => daysBetween(r.dueDate, today()) > 0)
  const totalFinesCollected = returned.reduce((s, r) => s + r.lateFee + r.damageFee, 0)
  const totalFinesOutstanding = active.reduce((s, r) => s + overdueFee(daysBetween(r.dueDate, today())), 0)

  return {
    totalBooks: COPIES.length,
    totalAvailable: COPIES.filter(c => c.status === 'available').length,
    activeRentals: active.length,
    returnedRentals: returned.length,
    overdueCount: overdueList.length,
    totalFinesCollected,
    totalFinesOutstanding,
    inventory: BOOKS.map(bookWithCounts),
    overdueRentals: overdueList.map(r => ({
      ...r,
      book: BOOKS.find(b => b.id === r.bookId),
      student: getStudent(r.studentId),
      overdueDays: daysBetween(r.dueDate, today()),
      fineAccrued: overdueFee(daysBetween(r.dueDate, today())),
    })),
  }
}
