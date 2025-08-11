'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface EnhancedLeadsPageTabsProps {
  defaultTab: string
  actionButton: ReactNode
  unclaimedContent: ReactNode
  myLeadsContent: ReactNode
  unclaimedCount?: number
  myLeadsCount?: number
}

export default function EnhancedLeadsPageTabs({
  defaultTab,
  actionButton,
  unclaimedContent,
  myLeadsContent,
  unclaimedCount,
  myLeadsCount
}: EnhancedLeadsPageTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    params.set('page', '1') // Reset to first page when switching tabs
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={defaultTab} onValueChange={handleTabChange} className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <TabsList className="grid w-auto grid-cols-2">
          <TabsTrigger value="unclaimed" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900">
            <span>Unclaimed Leads</span>
            {unclaimedCount !== undefined && unclaimedCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-orange-200 text-orange-800">
                {unclaimedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-leads" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
            <span>My Leads</span>
            {myLeadsCount !== undefined && (
              <Badge variant="secondary" className="ml-2 bg-blue-200 text-blue-800">
                {myLeadsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          {actionButton}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent value="unclaimed" className="h-full m-0 rounded-none border-0">
          {unclaimedContent}
        </TabsContent>
        
        <TabsContent value="my-leads" className="h-full m-0 rounded-none border-0">
          {myLeadsContent}
        </TabsContent>
      </div>
    </Tabs>
  )
}