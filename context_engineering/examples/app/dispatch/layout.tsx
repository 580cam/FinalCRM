'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface DispatchLayoutProps {
  children: ReactNode
}

export default function DispatchLayout({ children }: DispatchLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
