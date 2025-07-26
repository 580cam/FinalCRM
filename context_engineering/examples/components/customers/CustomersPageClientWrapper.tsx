'use client'

import { useState, useCallback } from 'react'
import CustomerTable from '@/components/CustomerTable'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { CustomerRealTimeSubscription } from './CustomerRealTimeSubscription'

interface User {
  id: number
  name: string
}

interface CustomersPageClientWrapperProps {
  initialCustomers: any[]
  currentUserId: number
  allUsers: User[]
  isAdmin: boolean
  tableType: 'opportunities' | 'all-customers'
  refreshCustomers: () => Promise<any[]>
}

export function CustomersPageClientWrapper({ 
  initialCustomers, 
  currentUserId, 
  allUsers, 
  isAdmin,
  tableType,
  refreshCustomers
}: CustomersPageClientWrapperProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Callback for real-time updates
  const handleCustomerUpdate = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const updatedCustomers = await refreshCustomers()
      setCustomers(updatedCustomers)
      toast.success('Customer data updated')
    } catch (error) {
      console.error('Error refreshing customers:', error)
      toast.error('Failed to update customer data')
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshCustomers])

  return (
    <div>
      <CustomerTable 
        customers={customers} 
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        users={allUsers}
        tableType={tableType}
        isLoading={isRefreshing}
      />

      <CustomerRealTimeSubscription onCustomerUpdate={handleCustomerUpdate} />
    </div>
  )
}
