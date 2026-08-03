import { checkinBook } from '@/lib/db'

export async function POST(request) {
  const body = await request.json()
  const result = checkinBook(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
