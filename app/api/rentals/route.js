import { activeRentals } from '@/lib/db'

export async function GET() {
  return Response.json(activeRentals())
}
