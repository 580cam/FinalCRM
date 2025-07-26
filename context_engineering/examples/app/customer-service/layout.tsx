'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface CustomerServiceLayoutProps {
  children: ReactNode
}

export default function CustomerServiceLayout({ children }: CustomerServiceLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
