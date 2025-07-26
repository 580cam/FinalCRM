'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
