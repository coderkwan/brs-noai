import './globals.css'
import AppHeader from '@/components/AppHeader'

export const metadata = {
  title: 'BRS — Bookshop Rental System',
  description: 'School textbook rental management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink-50 text-ink-950 min-h-screen font-sans antialiased">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
