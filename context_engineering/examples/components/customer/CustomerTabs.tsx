'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CustomerTabsProps {
  quoteId: number
}

export function CustomerTabs({ quoteId }: CustomerTabsProps) {
  const pathname = usePathname()
  
  const tabs = [
    { label: 'Sales', href: `/customers/${quoteId}/sales` },
    { label: 'Estimates', href: `/customers/${quoteId}/quotes` },
    { label: 'Photos & Files', href: `/customers/${quoteId}/photos` },
    { label: 'Accounting', href: `/customers/${quoteId}/accounting` },
  ]

  return (
    <div className="border-b mb-6">
      <nav className="flex space-x-4 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "py-3 px-4 text-sm font-medium transition-colors",
                "border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
