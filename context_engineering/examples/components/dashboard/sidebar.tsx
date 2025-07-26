'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCheck,
  Truck,
  HeadphonesIcon,
  TrendingUp,
  BarChart3,
  Settings,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Customers', href: '/customers', icon: UserCheck },
  { name: 'Dispatch', href: '/dispatch', icon: Truck },
  { name: 'Customer Service', href: '/customer-service', icon: HeadphonesIcon },
  { name: 'Marketing', href: '/marketing', icon: TrendingUp },
  { name: 'Accounting', href: '/accounting', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
] as const

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="flex flex-col h-full">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-2',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-gray-900' : 'text-gray-400'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
