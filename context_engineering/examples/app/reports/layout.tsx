'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface ReportsLayoutProps {
  children: ReactNode
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
