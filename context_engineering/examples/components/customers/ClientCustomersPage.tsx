'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import CustomerTable from '@/components/CustomerTable'
import { CustomerRealTimeSubscription } from './CustomerRealTimeSubscription'
import StatusFilterDropdown from '@/components/StatusFilterDropdown'
import UserFilterDropdown from '@/components/UserFilterDropdown'
import SearchBar from '@/components/SearchBar'

interface ClientUser {
  id: number
  name: string
}

interface ClientCustomer {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  age_days: number
  quotes: any[]
  addresses: {
    origin: string | null
    destination: string | null
  }
  status: string
  source: string | null
  estimated_revenue: number
  move_type: string | null
}

interface ClientCustomersPageProps {
  initialCustomers: ClientCustomer[]
  currentUserId: number
  allUsers: ClientUser[]
  isAdmin: boolean
  allStatusOptions: string[]
  opportunityStatusOptions: string[]
  tableType?: 'opportunities' | 'all-customers'
  pageSize?: number
  currentPage?: number
  totalCustomers?: number
}

export function ClientCustomersPage({
  initialCustomers,
  currentUserId,
  allUsers,
  isAdmin,
  allStatusOptions,
  opportunityStatusOptions,
  tableType,
  pageSize = 25,
  currentPage = 1,
  totalCustomers = 0
}: ClientCustomersPageProps) {
  const [customers, setCustomers] = useState<ClientCustomer[]>(initialCustomers)
  const searchParams = useSearchParams()
  const currentTab = tableType || searchParams.get('tab') || 'opportunities'
  
  // Get filter values from URL params
  const statusParam = searchParams.get('status') || 'all'
  const userIdParam = searchParams.get('userId') || 'all'
  const searchQuery = searchParams.get('query') || ''
  
  // Get pagination params from URL
  const pageParam = searchParams.get('page')
  const sizeParam = searchParams.get('size')
  
  // Use URL pagination values if provided
  const currentPageFromUrl = pageParam ? parseInt(pageParam) : currentPage
  const pageSizeFromUrl = sizeParam ? parseInt(sizeParam) : pageSize
  
  // Dynamic status options based on current tab
  const statusOptions = currentTab === 'opportunities' 
    ? opportunityStatusOptions 
    : allStatusOptions
  
  // Filter customers based on current tab, status, and user
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = customer.name?.toLowerCase() || ''
      const email = customer.email?.toLowerCase() || ''
      const phone = customer.phone?.toLowerCase() || ''
      const source = customer.source?.toLowerCase() || ''
      const origin = customer.addresses.origin?.toLowerCase() || ''
      const destination = customer.addresses.destination?.toLowerCase() || ''
      
      const matchesSearch = 
        name.includes(query) || 
        email.includes(query) || 
        phone.includes(query) || 
        source.includes(query) ||
        origin.includes(query) ||
        destination.includes(query)
        
      if (!matchesSearch) return false
    }
    
    // Tab filter
    const matchesTab = currentTab === 'opportunities'
      ? opportunityStatusOptions.includes(customer.status.toLowerCase())
      : true
    
    // Status filter
    const matchesStatus = statusParam === 'all' || 
      customer.status.toLowerCase() === statusParam.toLowerCase()
    
    // User filter - check if any quotes are claimed by the filtered user
    const matchesUser = userIdParam === 'all' || 
      customer.quotes.some(quote => quote.user_id === parseInt(userIdParam))
    
    return matchesTab && matchesStatus && matchesUser
  })

  // Function to refresh customer data for real-time updates
  const refreshCustomers = useCallback(async () => {
    const supabase = createSupabaseClient()
    
    // Fetch quotes with leads, jobs, and job addresses
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        id,
        created_at,
        status,
        user_id,
        service_type,
        referral_source,
        total,
        move_size,
        lead_id,
        leads (
          id,
          name,
          email,
          phone,
          created_at
        ),
        jobs (
          id,
          job_type,
          move_date,
          total_price,
          job_status,
          job_addresses (
            id,
            address,
            type,
            job_id
          )
        )
      `)
      .not('status', 'eq', 'lead')
      .not('status', 'eq', 'hot lead')
      
    if (quotesError) {
      console.error('Error refreshing quotes:', quotesError)
      throw new Error('Failed to refresh customer data')
    }
    
    // Process quotes into customer objects (same logic as server component)
    const updatedCustomers = (quotesData || [])
      .filter(quote => quote.leads)
      .reduce((acc: ClientCustomer[], quote: any) => {
        // Ensure we're working with the actual lead object
        const lead = Array.isArray(quote.leads) 
          ? quote.leads[0] 
          : quote.leads
        
        if (!lead) return acc
        
        // Skip if already processed this lead
        const existingIndex = acc.findIndex(c => c.id === lead.id)
        
        // Setup job addresses
        const addresses = {
          origin: null as string | null,
          destination: null as string | null
        }
        
        if (quote.jobs && quote.jobs.length > 0) {
          // First sort jobs by ID to get most recent jobs first
          const sortedJobs = [...quote.jobs].sort((a, b) => b.id - a.id)
          
          for (const job of sortedJobs) {
            if (job.job_addresses && job.job_addresses.length > 0) {
              // For each job, find origin and destination addresses
              const jobAddresses = [...job.job_addresses].sort((a, b) => a.id - b.id);
                
              // Find the first origin address
              const originAddress = jobAddresses.find(addr => 
                (addr.type?.toUpperCase() === 'ORIGIN')
              );
                
              // Find the last destination address
              const destinationAddresses = jobAddresses.filter(addr => 
                (addr.type?.toUpperCase() === 'DESTINATION')
              );
              const lastDestinationAddress = destinationAddresses.length > 0 
                ? destinationAddresses[destinationAddresses.length - 1] 
                : null;
                
              // Set the addresses
              if (originAddress?.address && !addresses.origin) {
                addresses.origin = originAddress.address;
              }
                
              if (lastDestinationAddress?.address) {
                addresses.destination = lastDestinationAddress.address;
              }
                
              // If we found both address types, break out of the job loop
              if (addresses.origin && addresses.destination) {
                break;
              }
            }
          }
        }
  
        const status = quote.status || 'OPPORTUNITY'
        const firstJob = quote.jobs && quote.jobs.length > 0 ? quote.jobs[0] : null
        
        // Calculate age of the lead/customer in days
        const createdAt = new Date(lead.created_at)
        const currentDate = new Date()
        const ageDays = Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        
        if (existingIndex >= 0) {
          // If lead already exists, just add the quote
          acc[existingIndex].quotes.push(quote)
          
          // Update addresses if not already set
          if (!acc[existingIndex].addresses.origin && addresses.origin) {
            acc[existingIndex].addresses.origin = addresses.origin
          }
          if (!acc[existingIndex].addresses.destination && addresses.destination) {
            acc[existingIndex].addresses.destination = addresses.destination
          }
          
          // Update status if the new quote has a "higher" status
          const statusPriority = {
            'opportunity': 1,
            'booked': 2,
            'confirmed': 3,
            'in progress': 4,
            'completed': 5,
            'reviewed': 6,
            'closed': 7,
            'claims': 8,
            'lost': 9
          }
          
          const currentPriority = statusPriority[acc[existingIndex].status.toLowerCase() as keyof typeof statusPriority] || 0
          const newPriority = statusPriority[status.toLowerCase() as keyof typeof statusPriority] || 0
          
          if (newPriority > currentPriority) {
            acc[existingIndex].status = status
          }
          
          return acc
        }
        
        // Create a new customer entry
        acc.push({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          created_at: lead.created_at,
          age_days: ageDays,
          quotes: [quote],
          addresses,
          status,
          source: quote.referral_source,
          estimated_revenue: firstJob?.total_price || quote.total || 0,
          move_type: firstJob?.job_type || null
        })
        
        return acc
      }, [])
      // Sort customers by creation date (newest first)
      .sort((a: ClientCustomer, b: ClientCustomer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    setCustomers(updatedCustomers)
    return updatedCustomers
  }, [])

  return (
    <div className="w-full">
      <CustomerRealTimeSubscription onUpdate={refreshCustomers} />
      
      <div className="overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <StatusFilterDropdown 
              statuses={statusOptions} 
              defaultStatus={statusParam}
            />
            
            {isAdmin && (
              <UserFilterDropdown 
                users={allUsers}
                defaultUserId={userIdParam}
              />
            )}
          </div>
          
          <SearchBar placeholder="Search customers..." className="max-w-xs" />
        </div>
      
        <CustomerTable 
          customers={filteredCustomers}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          users={allUsers}
          tableType={currentTab as 'opportunities' | 'all-customers'}
          pageSize={pageSizeFromUrl}
          currentPage={currentPageFromUrl}
          totalItems={totalCustomers}
        />
      </div>
    </div>
  )
}
