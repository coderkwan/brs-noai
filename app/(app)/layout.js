import Sidebar from '@/components/Sidebar'
import { requireSession } from '@/lib/guard'

// Sidebar + auth guard for every app page. Anything in this route group
// requires a valid brs_session cookie; otherwise the user is sent to /login.
export default async function AppLayout({ children }) {
  await requireSession()
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-6xl">{children}</main>
    </div>
  )
}
