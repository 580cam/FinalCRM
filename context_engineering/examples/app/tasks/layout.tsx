'use client'

import AppShell from '@/components/layout/AppShell'
import { ReactNode } from 'react'

interface TasksLayoutProps {
  children: ReactNode
}

export default function TasksLayout({ children }: TasksLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
