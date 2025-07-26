'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface LeadsRealTimeSubscriptionProps {
  onLeadUpdate: () => void
}

/**
 * Component that subscribes to real-time updates for leads/quotes
 * and triggers a callback when changes occur
 */
export function LeadsRealTimeSubscription({ onLeadUpdate }: LeadsRealTimeSubscriptionProps) {
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    // Subscribe to any changes in the quotes table (lead claims/assignments)
    const channel = supabase
      .channel('leads-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quotes'
        }, 
        () => {
          // Call the provided callback to refresh the list
          onLeadUpdate()
        })
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onLeadUpdate])

  // This component doesn't render anything
  return null
}
