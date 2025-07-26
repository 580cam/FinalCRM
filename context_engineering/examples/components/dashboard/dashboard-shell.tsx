import { ReactNode } from 'react'
import Sidebar from '@/components/dashboard/sidebar'

interface DashboardShellProps {
  children: ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
