import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EnhancedCustomersPage from '@/components/customers/EnhancedCustomersPage'
import { CustomerPermissions } from '@/types/customers'

export const metadata: Metadata = {
  title: 'Customer Pipeline | High Quality Moving CRM',
  description: 'Comprehensive customer pipeline management with drag-and-drop interface, analytics, and detailed tracking',
}

// Type definitions to match database schema
interface UserData {
  id: number
  email: string
  user_roles: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

interface JobAddress {
  id: number
  address: string | null
  type: string | null
  job_id: number
}

interface Job {
  id: number
  job_type: string | null
  move_date: string | null
  total_price: number | null
  job_status: string | null
  job_addresses?: JobAddress[]
}

interface Lead {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
}

interface Quote {
  id: number
  created_at: string
  user_id: number | null
  status: string | null
  service_type: string | null
  referral_source: string | null
  total: number | null
  move_size: string | null
  lead_id: number | null
  leads: Lead | Lead[]
  jobs?: Job[]
}

interface Customer {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  age_days: number
  quotes: Quote[]
  addresses: {
    origin: string | null
    destination: string | null
  }
  status: string
  source: string | null
  estimated_revenue: number | null
  move_type: string | null
}

export default async function EnhancedCustomersPageServer({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user permissions
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      user_roles(
        roles(
          permissions
        )
      )
    `)
    .eq('email', user.email)
    .single()

  if (userError || !userData) {
    console.error('Error fetching user data:', userError)
    redirect('/auth')
  }

  const typedUserData = userData as unknown as UserData
  
  if (!typedUserData.user_roles || typedUserData.user_roles.length === 0) {
    redirect('/admin-approval')
  }
  
  const permissions = typedUserData.user_roles[0].roles.permissions
  
  if (!permissions || !permissions.customers) {
    redirect('/admin-approval')
  }

  const isAdmin = permissions.admin || false

  // Fetch all users for the filter dropdown
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('status', 'active')
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
  }
  
  // Format users for dropdown
  const formattedUsers = (usersData || []).map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id}`
  }))

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
    console.error('Error fetching quotes:', quotesError)
  }

  // Process quotes into customer objects
  const customers: Customer[] = (quotesData || [])
    .filter(quote => quote.leads)
    .reduce((acc: Customer[], quote) => {
      const lead = Array.isArray(quote.leads) 
        ? quote.leads[0]
        : quote.leads

      if (!lead) return acc
      
      const existingIndex = acc.findIndex(c => c.id === lead.id)
      
      // Setup job addresses
      const addresses = {
        origin: null as string | null,
        destination: null as string | null
      }
      
      if (quote.jobs && quote.jobs.length > 0) {
        const sortedJobs = [...quote.jobs].sort((a, b) => b.id - a.id)
        
        for (const job of sortedJobs) {
          if (job.job_addresses && job.job_addresses.length > 0) {
            const jobAddresses = [...job.job_addresses].sort((a, b) => a.id - b.id)
            
            const originAddress = jobAddresses.find(addr => 
              addr.type?.toUpperCase() === 'ORIGIN'
            )
            
            const destinationAddresses = jobAddresses.filter(addr => 
              addr.type?.toUpperCase() === 'DESTINATION'
            )
            const lastDestinationAddress = destinationAddresses.length > 0 
              ? destinationAddresses[destinationAddresses.length - 1] 
              : null
            
            if (originAddress?.address && !addresses.origin) {
              addresses.origin = originAddress.address
            }
            
            if (lastDestinationAddress?.address) {
              addresses.destination = lastDestinationAddress.address
            }
            
            if (addresses.origin && addresses.destination) {
              break
            }
          }
        }
      }

      const status = quote.status || 'OPPORTUNITY'
      const firstJob = quote.jobs && quote.jobs.length > 0 ? quote.jobs[0] : null
      
      const createdAt = new Date(lead.created_at)
      const currentDate = new Date()
      const ageDays = Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      if (existingIndex >= 0) {
        acc[existingIndex].quotes.push(quote as unknown as Quote)
        
        if (!acc[existingIndex].addresses.origin && addresses.origin) {
          acc[existingIndex].addresses.origin = addresses.origin
        }
        if (!acc[existingIndex].addresses.destination && addresses.destination) {
          acc[existingIndex].addresses.destination = addresses.destination
        }
        
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
      
      acc.push({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        created_at: lead.created_at,
        age_days: ageDays,
        quotes: [quote as unknown as Quote],
        addresses,
        status,
        source: quote.referral_source,
        estimated_revenue: firstJob?.total_price || quote.total || 0,
        move_type: firstJob?.job_type || null
      })
      
      return acc
    }, [] as Customer[])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get status options
  const opportunityStatusOptions = ['opportunity', 'booked', 'confirmed']
  const allStatusOptions = [
    'opportunity', 'booked', 'confirmed', 'in progress', 
    'completed', 'reviewed', 'closed', 'claims', 'lost'
  ]

  // Create customer permissions based on user roles
  const customerPermissions: CustomerPermissions = {
    canView: true,
    canEdit: permissions.customers || false,
    canChangeStatus: permissions.customers || permissions.admin || false,
    canAssign: permissions.admin || false,
    canViewFinancials: permissions.accounting || permissions.admin || false,
    canCreateQuote: permissions.quotes || permissions.admin || false,
    canViewAllCustomers: permissions.admin || false
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <EnhancedCustomersPage
        initialCustomers={customers as any[]}
        currentUserId={typedUserData.id}
        allUsers={formattedUsers}
        isAdmin={isAdmin}
        allStatusOptions={allStatusOptions}
        opportunityStatusOptions={opportunityStatusOptions}
        permissions={customerPermissions}
      />
    </div>
  )
}