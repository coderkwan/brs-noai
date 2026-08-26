import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'BRS — Bookshop Rental System',
  description: 'School textbook rental management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink-50 text-ink-950 min-h-screen font-sans antialiased">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 px-8 py-8 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  )
}
