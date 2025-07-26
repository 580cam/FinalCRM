'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ActivityRealTimeSubscriptionProps {
  onActivityUpdate: () => void
}

/**
 * Component that subscribes to real-time updates for activity logs
 * and triggers a callback when changes occur
 */
export function ActivityRealTimeSubscription({ onActivityUpdate }: ActivityRealTimeSubscriptionProps) {
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    // Subscribe to any changes in the activity_logs table
    const channel = supabase
      .channel('activity-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activity_logs'
        }, 
        () => {
          // Call the provided callback to refresh the activity feed
          onActivityUpdate()
        })
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onActivityUpdate])

  // This component doesn't render anything
  return null
}
