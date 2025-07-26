'use client'

import { ReactNode } from 'react'
import { LeadInfoHeader } from './LeadInfoHeader'
import { CustomerTabs } from './CustomerTabs'
import { Card } from '@/components/ui/card'

interface CustomerLayoutProps {
  quoteId: number
  leadInfo: {
    name: string
    email: string
    phone: string
    status: string
    createdAt: string
  }
  children: ReactNode
}

export function CustomerLayout({ 
  quoteId, 
  leadInfo, 
  children 
}: CustomerLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <LeadInfoHeader 
        quoteId={quoteId}
        name={leadInfo.name}
        email={leadInfo.email}
        phone={leadInfo.phone}
        status={leadInfo.status}
        createdAt={leadInfo.createdAt}
      />
      
      <CustomerTabs quoteId={quoteId} />
      
      <Card className="p-6">
        {children}
      </Card>
    </div>
  )
}
