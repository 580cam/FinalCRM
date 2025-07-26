'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReactNode, useEffect, useState, useTransition } from 'react'
import { Loader2 } from "lucide-react"

interface CustomerServiceTabsProps {
  reviewsContent: ReactNode
  claimsContent: ReactNode
  defaultTab?: string
}

export default function CustomerServiceTabs({
  reviewsContent,
  claimsContent,
  defaultTab = 'reviews'
}: CustomerServiceTabsProps) {
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
      // Update URL with just the tab param
      const params = new URLSearchParams(searchParams)
      params.set('tab', value)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center justify-between bg-white rounded-t-md p-4 pb-3 border-b">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
            Request Review
          </button>
        </div>
      </div>
      
      <div className="flex flex-col h-full relative">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}
        
        <TabsContent value="reviews" className="mt-0 p-0">
          {reviewsContent}
        </TabsContent>
        
        <TabsContent value="claims" className="mt-0 p-0">
          {claimsContent}
        </TabsContent>
      </div>
    </Tabs>
  )
}
