import { ReactNode } from 'react'
import AppShell from '@/components/layout/AppShell'

interface CustomersLayoutProps {
  children: ReactNode
}

export default function CustomersLayout({ children }: CustomersLayoutProps) {
  return <AppShell>{children}</AppShell>
}
