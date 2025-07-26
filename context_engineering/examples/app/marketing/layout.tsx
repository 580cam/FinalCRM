'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
