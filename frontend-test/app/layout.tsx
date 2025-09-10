import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Auth Test Frontend',
  description: 'Testing OAuth2 with Supabase/Auth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
