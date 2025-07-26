'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface AccountingLayoutProps {
  children: ReactNode
}

export default function AccountingLayout({ children }: AccountingLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
