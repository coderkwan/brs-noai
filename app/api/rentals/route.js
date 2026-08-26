import { activeRentals, allRentals } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rentals = searchParams.get('all') ? allRentals() : activeRentals()
  return Response.json(rentals)
}
