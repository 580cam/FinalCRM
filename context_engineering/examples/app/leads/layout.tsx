'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface LeadsLayoutProps {
  children: ReactNode
}

export default function LeadsLayout({ children }: LeadsLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
