'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from 'sonner'
import {
  EnhancedCustomer,
  CustomerRealtimePayload,
  QuoteRealtimePayload,
  CustomerActivity
} from '@/types/customers'

interface PipelineRealTimeSubscriptionProps {
  onCustomerUpdate?: (payload: CustomerRealtimePayload) => void
  onQuoteUpdate?: (payload: QuoteRealtimePayload) => void
  onActivityUpdate?: (payload: { customer_id: number; activity: CustomerActivity }) => void
  onInventoryUpdate?: (payload: { customer_id: number; inventory_changed: boolean }) => void
  customerId?: number // If provided, only listen for updates to this customer
  showNotifications?: boolean
}

export default function PipelineRealTimeSubscription({
  onCustomerUpdate,
  onQuoteUpdate,
  onActivityUpdate,
  onInventoryUpdate,
  customerId,
  showNotifications = true
}: PipelineRealTimeSubscriptionProps) {
  const supabase = createClient()
  const subscriptionsRef = useRef<any[]>([])

  const handleCustomerChange = useCallback((
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // Filter by customer ID if specified
    if (customerId && newRecord?.lead_id !== customerId && oldRecord?.lead_id !== customerId) {
      return
    }

    const customerPayload: CustomerRealtimePayload = {
      eventType: eventType as 'INSERT' | 'UPDATE' | 'DELETE',
      new: newRecord ? transformToEnhancedCustomer(newRecord) : undefined,
      old: oldRecord ? transformToEnhancedCustomer(oldRecord) : undefined,
      changes: eventType === 'UPDATE' ? getChangedFields(oldRecord, newRecord) : undefined
    }

    onCustomerUpdate?.(customerPayload)

    // Show notifications for significant changes
    if (showNotifications) {
      switch (eventType) {
        case 'INSERT':
          toast.success(`New customer added: ${newRecord.name || 'Unknown'}`)
          break
        case 'UPDATE':
          if (oldRecord.status !== newRecord.status) {
            toast.info(`Customer ${newRecord.name || 'Unknown'} moved to ${newRecord.status}`)
          }
          break
        case 'DELETE':
          toast.info(`Customer removed: ${oldRecord.name || 'Unknown'}`)
          break
      }
    }
  }, [customerId, onCustomerUpdate, showNotifications])

  const handleQuoteChange = useCallback((
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // Filter by customer ID if specified
    if (customerId && newRecord?.lead_id !== customerId && oldRecord?.lead_id !== customerId) {
      return
    }

    const quotePayload: QuoteRealtimePayload = {
      eventType: eventType as 'INSERT' | 'UPDATE' | 'DELETE',
      new: newRecord ? transformToEnhancedQuote(newRecord) : undefined,
      old: oldRecord ? transformToEnhancedQuote(oldRecord) : undefined,
      customer_id: newRecord?.lead_id || oldRecord?.lead_id
    }

    onQuoteUpdate?.(quotePayload)

    // Show notifications for quote changes
    if (showNotifications) {
      switch (eventType) {
        case 'INSERT':
          toast.success(`New quote created for customer`)
          break
        case 'UPDATE':
          if (oldRecord.status !== newRecord.status) {
            const statusMessages = {
              'sent': 'Quote sent to customer',
              'viewed': 'Customer viewed quote',
              'accepted': 'Quote accepted by customer!',
              'expired': 'Quote has expired',
              'lost': 'Quote was lost'
            }
            toast.info(statusMessages[newRecord.status as keyof typeof statusMessages] || `Quote status updated to ${newRecord.status}`)
          }
          break
        case 'DELETE':
          toast.info(`Quote removed`)
          break
      }
    }
  }, [customerId, onQuoteUpdate, showNotifications])

  const handleActivityChange = useCallback((
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    const { eventType, new: newRecord } = payload
    
    if (eventType !== 'INSERT' || !newRecord) return

    // Extract customer ID from metadata or record
    const customer_id = newRecord.metadata?.customer_id || newRecord.customer_id
    
    // Filter by customer ID if specified
    if (customerId && customer_id !== customerId) {
      return
    }

    if (customer_id) {
      onActivityUpdate?.({
        customer_id,
        activity: newRecord as CustomerActivity
      })

      if (showNotifications && newRecord.activity_category === 'communication') {
        toast.success(`New ${newRecord.communication_method || 'communication'} activity logged`)
      }
    }
  }, [customerId, onActivityUpdate, showNotifications])

  const handleInventoryChange = useCallback((
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    const customer_id = newRecord?.customer_id || oldRecord?.customer_id
    
    // Filter by customer ID if specified
    if (customerId && customer_id !== customerId) {
      return
    }

    if (customer_id) {
      onInventoryUpdate?.({
        customer_id,
        inventory_changed: true
      })

      if (showNotifications) {
        switch (eventType) {
          case 'INSERT':
            toast.success(`Inventory item added: ${newRecord.name}`)
            break
          case 'UPDATE':
            toast.info(`Inventory item updated: ${newRecord.name}`)
            break
          case 'DELETE':
            toast.info(`Inventory item removed: ${oldRecord.name}`)
            break
        }
      }
    }
  }, [customerId, onInventoryUpdate, showNotifications])

  useEffect(() => {
    const setupSubscriptions = async () => {
      try {
        // Subscribe to quote changes (which represent customer status changes)
        const quotesSubscription = supabase
          .channel('quotes_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'quotes',
              filter: customerId ? `lead_id=eq.${customerId}` : undefined
            },
            handleQuoteChange
          )
          .subscribe()

        subscriptionsRef.current.push(quotesSubscription)

        // Subscribe to activity logs for customer activities
        const activitiesSubscription = supabase
          .channel('activity_logs_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'activity_logs'
            },
            handleActivityChange
          )
          .subscribe()

        subscriptionsRef.current.push(activitiesSubscription)

        // Subscribe to inventory changes if handler provided
        if (onInventoryUpdate) {
          const inventorySubscription = supabase
            .channel('customer_inventory_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'customer_inventory',
                filter: customerId ? `customer_id=eq.${customerId}` : undefined
              },
              handleInventoryChange
            )
            .subscribe()

          subscriptionsRef.current.push(inventorySubscription)
        }

        // Subscribe to lead changes if handler provided
        if (onCustomerUpdate) {
          const leadsSubscription = supabase
            .channel('leads_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'leads',
                filter: customerId ? `id=eq.${customerId}` : undefined
              },
              (payload) => {
                // Transform lead changes to customer format
                const { eventType, new: newRecord, old: oldRecord } = payload
                
                const customerPayload: CustomerRealtimePayload = {
                  eventType: eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                  new: newRecord ? { ...newRecord, status: 'lead' } as any : undefined,
                  old: oldRecord ? { ...oldRecord, status: 'lead' } as any : undefined
                }

                handleCustomerChange({
                  ...payload,
                  new: customerPayload.new,
                  old: customerPayload.old
                } as any)
              }
            )
            .subscribe()

          subscriptionsRef.current.push(leadsSubscription)
        }

        console.log(`Set up ${subscriptionsRef.current.length} real-time subscriptions${customerId ? ` for customer ${customerId}` : ''}`)

      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error)
        if (showNotifications) {
          toast.error('Failed to connect to real-time updates')
        }
      }
    }

    setupSubscriptions()

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        try {
          supabase.removeChannel(subscription)
        } catch (error) {
          console.error('Error removing subscription:', error)
        }
      })
      subscriptionsRef.current = []
    }
  }, [customerId, handleQuoteChange, handleActivityChange, handleInventoryChange, handleCustomerChange, onInventoryUpdate, onCustomerUpdate, showNotifications, supabase])

  // This component doesn't render anything visible
  return null
}

// Helper functions to transform database records to enhanced types
function transformToEnhancedCustomer(record: any): EnhancedCustomer {
  return {
    id: record.id || record.lead_id,
    lead_id: record.lead_id || record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    created_at: record.created_at,
    updated_at: record.updated_at || record.created_at,
    status: (record.status || 'opportunity').toLowerCase().replace(' ', '_'),
    status_changed_at: record.updated_at || record.created_at,
    addresses: {
      origin: null,
      destination: null,
      additional_stops: []
    },
    estimated_revenue: record.total || 0,
    total_quoted_amount: record.total || 0,
    service_type: record.service_type,
    source: record.referral_source,
    quotes: [],
    jobs: [],
    activities: [],
    inventory: [],
    tags: [],
    age_days: Math.floor((new Date().getTime() - new Date(record.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    conversion_probability: 0.7,
    customer_score: 75,
    total_interactions: 0
  }
}

function transformToEnhancedQuote(record: any): any {
  return {
    id: record.id,
    created_at: record.created_at,
    updated_at: record.updated_at,
    status: record.status || 'pending',
    version: record.version || 1,
    is_current: record.status !== 'expired' && record.status !== 'lost',
    service_type: record.service_type,
    move_date: record.move_date,
    total_amount: record.total || 0,
    base_cost: record.total || 0,
    estimated_hours: record.estimated_hours || 4,
    crew_size: record.crew_size || 3,
    packing_services: record.packing_services || false,
    unpacking_services: record.unpacking_services || false,
    notes: record.notes,
    expires_at: record.expires_at,
    sent_at: record.sent_at,
    viewed_at: record.viewed_at,
    accepted_at: record.accepted_at
  }
}

function getChangedFields(oldRecord: any, newRecord: any): Partial<EnhancedCustomer> {
  const changes: Partial<EnhancedCustomer> = {}
  
  const fieldsToCheck = ['status', 'name', 'email', 'phone', 'service_type', 'total']
  
  fieldsToCheck.forEach(field => {
    if (oldRecord[field] !== newRecord[field]) {
      (changes as any)[field] = newRecord[field]
    }
  })
  
  return changes
}

// Export individual subscription hooks for specific use cases
export function useCustomerSubscription(
  customerId: number,
  onUpdate: (payload: CustomerRealtimePayload) => void
) {
  return (
    <PipelineRealTimeSubscription
      customerId={customerId}
      onCustomerUpdate={onUpdate}
      showNotifications={false}
    />
  )
}

export function useQuoteSubscription(
  customerId: number,
  onUpdate: (payload: QuoteRealtimePayload) => void
) {
  return (
    <PipelineRealTimeSubscription
      customerId={customerId}
      onQuoteUpdate={onUpdate}
      showNotifications={true}
    />
  )
}

export function usePipelineSubscription(
  onCustomerUpdate: (payload: CustomerRealtimePayload) => void,
  onQuoteUpdate: (payload: QuoteRealtimePayload) => void
) {
  return (
    <PipelineRealTimeSubscription
      onCustomerUpdate={onCustomerUpdate}
      onQuoteUpdate={onQuoteUpdate}
      showNotifications={true}
    />
  )
}