import './globals.css'

export const metadata = {
  title: 'Manzini Central High School — Bookshop Rental System',
  description: 'School textbook rental management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink-50 text-ink-950 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
