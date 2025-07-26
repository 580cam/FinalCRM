'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReactNode, useEffect, useState, useTransition } from 'react'
import { Loader2 } from "lucide-react"

interface CustomersPageTabsProps {
  opportunitiesContent: ReactNode
  allCustomersContent: ReactNode
  defaultTab?: 'opportunities' | 'all-customers'
  actionButton?: ReactNode
}

export default function CustomersPageTabs({ 
  opportunitiesContent, 
  allCustomersContent, 
  defaultTab = 'opportunities',
  actionButton
}: CustomersPageTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Use React useTransition hook for loading state
  const [isPending, startTransition] = useTransition()
  
  // Use local state to track tab for immediate response
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Sync with URL if tab changes from outside
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || defaultTab
    setActiveTab(tabFromUrl as 'opportunities' | 'all-customers')
  }, [searchParams, defaultTab])
  
  const handleTabChange = (value: string) => {
    // Update local state immediately for fast UI response
    setActiveTab(value as 'opportunities' | 'all-customers')
    
    // Use startTransition to indicate loading state
    startTransition(() => {
      // Update URL with the tab param while preserving other params
      const params = new URLSearchParams(searchParams)
      params.set('tab', value)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex flex-col bg-white rounded-md">
        <div className="flex items-center justify-between p-4 pb-3 border-b">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="all-customers">All Customers</TabsTrigger>
          </TabsList>
          
          {actionButton && (
            <div className="flex items-center">
              {actionButton}
            </div>
          )}
        </div>
      
        <div className="flex flex-col h-full relative">
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          
          <TabsContent value="opportunities" className="flex-1 m-0 p-0">
            {opportunitiesContent}
          </TabsContent>
          
          <TabsContent value="all-customers" className="flex-1 m-0 p-0">
            {allCustomersContent}
          </TabsContent>
        </div>
      </div>
    </Tabs>
  )
}
