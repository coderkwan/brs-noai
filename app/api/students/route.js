import { listStudents, studentHistory, addStudent, updateStudent, deleteStudent } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const result = studentHistory(id)
    return Response.json(result, { status: result.ok ? 200 : 404 })
  }
  return Response.json(listStudents())
}

export async function POST(request) {
  const body = await request.json()
  const result = addStudent(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}

export async function PUT(request) {
  const body = await request.json()
  const result = updateStudent(body)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const result = deleteStudent(id)
  return Response.json(result, { status: result.ok ? 200 : 400 })
}
