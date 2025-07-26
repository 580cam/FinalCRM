'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReactNode, useEffect, useState, useTransition } from 'react'
import { Loader2 } from "lucide-react"

interface LeadsPageTabsProps {
  unclaimedContent: ReactNode
  myLeadsContent: ReactNode
  defaultTab?: string
  actionButton?: ReactNode
}

export default function LeadsPageTabs({ 
  unclaimedContent, 
  myLeadsContent, 
  defaultTab = 'unclaimed',
  actionButton
}: LeadsPageTabsProps) {
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
    setActiveTab(tabFromUrl)
  }, [searchParams, defaultTab])
  
  const handleTabChange = (value: string) => {
    // Update local state immediately for fast UI response
    setActiveTab(value)
    
    // Use startTransition to indicate loading state
    startTransition(() => {
      // Create a new URLSearchParams instance to preserve other parameters
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', value)
      // Reset to page 1 when changing tabs
      params.set('page', '1')
      
      // Update URL while preserving other parameters
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center justify-between border-b pb-4">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="unclaimed">Unclaimed Leads</TabsTrigger>
          <TabsTrigger value="my-leads">My Leads</TabsTrigger>
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
        
        <TabsContent value="unclaimed" className="flex-1 mt-4">
          {unclaimedContent}
        </TabsContent>
        
        <TabsContent value="my-leads" className="flex-1 mt-4">
          {myLeadsContent}
        </TabsContent>
      </div>
    </Tabs>
  )
}
