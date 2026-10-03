import { checkApiSession } from '@/lib/guard'
import {generateReport} from '@/lib/db'

export async function GET() {
  const { response } = await checkApiSession()
  if (response) return response
    return Response.json(generateReport())
}
