import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'High Quality Moving CRM',
  description: 'CRM system for High Quality Moving company',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right" 
          theme="light"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontSize: '0.95rem',
              fontWeight: 500,
              padding: '16px',
            },
          }}
        />
      </body>
    </html>
  )
}
