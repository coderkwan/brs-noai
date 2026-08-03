import { checkoutBook } from '@/lib/db'

export async function POST(request) {
  const body = await request.json()
  const result = checkoutBook(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
