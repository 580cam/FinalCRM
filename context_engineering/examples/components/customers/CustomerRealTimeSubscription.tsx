'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CustomerRealTimeSubscriptionProps {
  onCustomerUpdate?: () => void
  onUpdate?: () => Promise<any>
}

/**
 * Component that subscribes to real-time updates for customers, quotes, and job addresses
 * and triggers a callback when changes occur
 */
export function CustomerRealTimeSubscription({ onCustomerUpdate, onUpdate }: CustomerRealTimeSubscriptionProps) {
  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to any changes in the quotes table
    const quotesChannel = supabase
      .channel('customer-quotes-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quotes'
        }, 
        (payload) => {
          console.log('Quotes change detected:', payload.eventType)
          // Call the provided callback to refresh the list
          if (onCustomerUpdate) onCustomerUpdate();
          if (onUpdate) onUpdate();
        })
      .subscribe((status) => {
        console.log('Quotes subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to quotes changes')
        }
      })

    // Subscribe to any changes in the jobs table
    const jobsChannel = supabase
      .channel('customer-jobs-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs'
        }, 
        (payload) => {
          console.log('Jobs change detected:', payload.eventType)
          if (onCustomerUpdate) onCustomerUpdate();
          if (onUpdate) onUpdate();
        })
      .subscribe((status) => {
        console.log('Jobs subscription status:', status)
      })

    // Subscribe to any changes in the job_addresses table
    const addressesChannel = supabase
      .channel('customer-addresses-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_addresses'
        }, 
        (payload) => {
          console.log('Job addresses change detected:', payload.eventType)
          if (onCustomerUpdate) onCustomerUpdate();
          if (onUpdate) onUpdate();
        })
      .subscribe((status) => {
        console.log('Job addresses subscription status:', status)
      })

    // Clean up subscriptions
    return () => {
      console.log('Cleaning up realtime subscriptions')
      supabase.removeChannel(quotesChannel)
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(addressesChannel)
    }
  }, [onCustomerUpdate, onUpdate])

  // This component doesn't render anything
  return null
}
