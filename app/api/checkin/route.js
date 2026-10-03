import { checkApiSession } from '@/lib/guard'
import { checkinBook } from '@/lib/db'

export async function POST(request) {
  const { response } = await checkApiSession()
  if (response) return response
  const body = await request.json()
  const result = checkinBook(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
