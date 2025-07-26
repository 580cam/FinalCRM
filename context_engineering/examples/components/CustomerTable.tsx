'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatDistance } from 'date-fns'
import { MoreHorizontal, ArrowUpDown, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AssignOpportunityDialog } from '@/components/AssignOpportunityDialog'
import Link from 'next/link'
import { useTransition } from 'react'
import PaginationControl from '@/components/PaginationControl'

// Type definitions to match database schema
interface Job {
  id: number
  job_type: string | null
  move_date: string | null
  total_price: number | null
  job_status: string | null
}

interface Quote {
  id: number
  created_at: string
  user_id: number | null
  status: string | null
  service_type: string | null
  referral_source: string | null
  total: number | null
  jobs?: Job[]
}

interface Lead {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  quotes?: Quote[]
}

interface JobAddress {
  id: number
  job_id: number | null
  address: string | null
  type: string | null
}

interface Customer {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  age_days: number
  quotes: Quote[]
  addresses?: {
    origin: string | null
    destination: string | null
  }
  status: string
  source: string | null
  estimated_revenue: number | null
  move_type: string | null
  assigned_to?: {
    id: number
    name: string
  }
}

interface User {
  id: number
  name: string
}

interface CustomerTableProps {
  customers: Customer[]
  isAdmin: boolean
  currentUserId: number
  users: User[]
  tableType: 'opportunities' | 'all-customers'
  isLoading?: boolean
  pageSize?: number
  currentPage?: number
  totalItems?: number
}

export default function CustomerTable({ 
  customers,
  isAdmin,
  currentUserId,
  users,
  tableType,
  isLoading = false,
  pageSize = 25,
  currentPage = 1,
  totalItems = 0
}: CustomerTableProps) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const selectedUserId = searchParams.get('userId') || 'all'
  
  // State for assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  
  // Filter customers based on tableType and selectedUserId
  const filteredCustomers = customers.filter(customer => {
    if (tableType === 'opportunities') {
      const isOpportunity = ['OPPORTUNITY', 'BOOKED', 'CONFIRMED'].includes(customer.status.toUpperCase())
      
      if (!isAdmin && isOpportunity) {
        return customer.quotes.some(quote => quote.user_id === currentUserId)
      }
      
      if (isAdmin && selectedUserId !== 'all' && isOpportunity) {
        const filterUserId = parseInt(selectedUserId)
        return customer.quotes.some(quote => quote.user_id === filterUserId)
      }
      
      return isOpportunity
    } else {
      // All customers except leads
      const notLead = !['LEAD', 'HOT LEAD'].includes(customer.status.toUpperCase())
      
      if (!isAdmin && notLead) {
        return customer.quotes.some(quote => quote.user_id === currentUserId)
      }
      
      if (isAdmin && selectedUserId !== 'all' && notLead) {
        const filterUserId = parseInt(selectedUserId)
        return customer.quotes.some(quote => quote.user_id === filterUserId)
      }
      
      return notLead
    }
  })
  
  // Helper function to format status to uppercase
  const formatStatus = (status: string): string => {
    return status.toUpperCase();
  }
  
  // Helper function to get status color classes
  const getStatusColor = (status: string): string => {
    const statusUpper = status.toUpperCase()
    
    if (statusUpper === 'OPPORTUNITY') return 'bg-blue-100 text-blue-800'
    if (statusUpper === 'BOOKED') return 'bg-yellow-100 text-yellow-800'
    if (statusUpper === 'CONFIRMED') return 'bg-green-100 text-green-800'
    if (statusUpper === 'IN PROGRESS') return 'bg-purple-100 text-purple-800'
    if (statusUpper === 'COMPLETED') return 'bg-indigo-100 text-indigo-800'
    if (statusUpper === 'CLOSED') return 'bg-gray-100 text-gray-800'
    if (statusUpper === 'CLAIMS') return 'bg-red-100 text-red-800'
    if (statusUpper === 'LOST') return 'bg-pink-100 text-pink-800'
    if (statusUpper === 'REVIEWED') return 'bg-teal-100 text-teal-800'
    
    // Default
    return 'bg-gray-100 text-gray-800'
  }
  
  // Format date function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not set'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }
  
  // Handle assigning a user to a customer
  const handleAssignUser = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setAssignDialogOpen(true)
  }
  
  if (isLoading || isPending) {
    return (
      <div className="mt-4 flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }
  
  // If no customers are available after filtering
  if (filteredCustomers.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500">
        No customers found. {isAdmin && selectedUserId !== 'all' && 'Try selecting a different user or clear the filter.'}
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      <div className="overflow-auto flex-1 rounded-md border">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b">
              <th className="h-12 pl-6 pr-3 text-left align-middle font-medium text-muted-foreground">Customer</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Addresses</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Service Date</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Source</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Est. Revenue</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Move Type</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Age</th>
              {isAdmin && (
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Assigned To</th>
              )}
              <th className="h-12 pl-3 pr-6 text-right align-middle font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              // Find the assigned user name
              const assignedUser = users.find(user => 
                customer.quotes.some(quote => quote.user_id === user.id)
              )
              
              // Find first job of first quote for move type and date
              const firstQuote = customer.quotes[0]
              const firstJob = firstQuote?.jobs?.[0]
              const quoteId = firstQuote?.id
              
              // Remove debug log in production
              // console.log('Customer:', customer.id, 'Quote:', quoteId)
              
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      {customer.email && <span className="text-xs text-gray-500">{customer.email}</span>}
                      {customer.phone && <span className="text-xs text-gray-500">{customer.phone}</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {formatStatus(customer.status)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col space-y-2 max-w-[280px]">
                      {customer.addresses?.origin && (
                        <div className="flex flex-col">
                          <span className="font-medium text-xs text-gray-700">From:</span>
                          <span className="text-xs">{customer.addresses.origin}</span>
                        </div>
                      )}
                      {customer.addresses?.destination && (
                        <div className="flex flex-col">
                          <span className="font-medium text-xs text-gray-700">To:</span>
                          <span className="text-xs">{customer.addresses.destination}</span>
                        </div>
                      )}
                      {!customer.addresses?.origin && !customer.addresses?.destination && (
                        <div className="text-xs text-gray-400">No addresses found</div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(firstJob?.move_date)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.source || 'Unknown'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${customer.estimated_revenue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.move_type || 'Unknown'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {customer.age_days} day{customer.age_days !== 1 ? 's' : ''}
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">
                          {assignedUser ? assignedUser.name : 'Unassigned'}
                        </span>
                        <button
                          onClick={() => handleAssignUser(customer.id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    {quoteId ? (
                      <Link 
                        href={`/customers/${quoteId}/quotes`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 rounded-md px-3 py-2"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">No quotes available</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <PaginationControl 
        currentPage={currentPage} 
        pageSize={pageSize} 
        totalItems={totalItems} 
      />
      
      {/* Assign Dialog */}
      <AssignOpportunityDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        users={users}
        customerId={selectedCustomerId}
        onSuccess={() => {
          setAssignDialogOpen(false)
          toast.success('Customer assigned successfully')
        }}
      />
    </div>
  )
}
