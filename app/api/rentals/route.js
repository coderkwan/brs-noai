import { checkApiSession } from '@/lib/guard'
import { activeRentals, allRentals } from '@/lib/db'

export async function GET(request) {
  const { response } = await checkApiSession()
  if (response) return response
  const { searchParams } = new URL(request.url)
  const rentals = searchParams.get('all') ? allRentals() : activeRentals()
  return Response.json(rentals)
}
