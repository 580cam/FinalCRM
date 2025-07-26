'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LeadsRealTimeSubscription } from './LeadsRealTimeSubscription'

interface LeadsPageClientWrapperProps {
  children: React.ReactNode
}

/**
 * Client-side wrapper component for the Leads page.
 * Adds real-time updates functionality to refresh the page when leads are updated.
 */
export default function LeadsPageClientWrapper({ children }: LeadsPageClientWrapperProps) {
  const router = useRouter()
  
  // Handler for when leads are updated
  const handleLeadUpdate = useCallback(() => {
    // Use router.refresh() to tell Next.js to refetch data from the server component
    router.refresh()
  }, [router])
  
  return (
    <>
      {/* Real-time subscription component */}
      <LeadsRealTimeSubscription onLeadUpdate={handleLeadUpdate} />
      
      {/* Render the original content */}
      {children}
    </>
  )
}
