import { listBooks, searchBooks, addBook } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const books = query ? searchBooks({ query }) : listBooks()
  return Response.json(books)
}

export async function POST(request) {
  const body = await request.json()
  const result = addBook(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
