import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserFilterDropdown from '@/components/UserFilterDropdown'
import StatusFilterDropdown from '@/components/StatusFilterDropdown'
import CustomerTable from '@/components/CustomerTable'
import { formatDistance } from 'date-fns'
import CustomersPageTabs from '@/components/CustomersPageTabs'
import PaginationControl from '@/components/PaginationControl'
import { formatMoveDate } from '@/lib/utils/timeUtils'
import CreateQuoteButton from '@/components/CreateQuoteButton'
import CreateOpportunityButton from '@/components/CreateOpportunityButton'
import { ClientCustomersPage } from '@/components/customers/ClientCustomersPage'

export const metadata: Metadata = {
  title: 'Customers | High Quality Moving CRM',
  description: 'Manage your customers and ongoing opportunities',
}

// Type definitions to match database schema (TypeScript Usage rule)
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

export default async function CustomersPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Properly await searchParams to access its properties
  const params = await searchParams;
  const customerStatusParam = (params.status as string) || 'all';
  const userIdParam = (params.userId as string) || 'all';
  const tabParam = (params.tab as string) || 'opportunities';
  
  // Pagination parameters
  const pageParam = (params.page as string) || '1';
  const pageSizeParam = (params.size as string) || '25';
  const currentPage = parseInt(pageParam);
  const pageSize = parseInt(pageSizeParam);

  // Initialize Supabase client
  const supabase = await createClient()
  
  // Check authentication - following Authentication System rule
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user permissions - following Authentication and Authorization Flow rule
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

  // Properly type our userData to avoid TypeScript errors
  const typedUserData = userData as unknown as UserData
  
  // Check if user has any roles assigned
  if (!typedUserData.user_roles || typedUserData.user_roles.length === 0) {
    redirect('/admin-approval')
  }
  
  // Get permissions from the first role (assuming one role per user)
  const permissions = typedUserData.user_roles[0].roles.permissions
  
  // Check customers permission - following Permission Structure rule
  if (!permissions || !permissions.customers) {
    redirect('/admin-approval')
  }

  // Check if user has admin privileges
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
    .filter(quote => quote.leads) // Filter out quotes without leads
    .reduce((acc: Customer[], quote) => {
      // Ensure we're working with the actual lead object
      const lead = Array.isArray(quote.leads) 
        ? quote.leads[0] // If leads is an array, take the first element
        : quote.leads;   // Otherwise use the lead object directly
      
      if (!lead) return acc;
      
      // Skip if already processed this lead
      const existingIndex = acc.findIndex(c => c.id === lead.id);
      
      // Setup job addresses
      const addresses = {
        origin: null as string | null,
        destination: null as string | null
      };
      
      if (quote.jobs && quote.jobs.length > 0) {
        // First sort jobs by ID to get most recent jobs first
        const sortedJobs = [...quote.jobs].sort((a, b) => b.id - a.id);
        
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

      const status = quote.status || 'OPPORTUNITY';
      const firstJob = quote.jobs && quote.jobs.length > 0 ? quote.jobs[0] : null;
      
      // Calculate age of the lead/customer in days
      const createdAt = new Date(lead.created_at);
      const currentDate = new Date();
      const ageDays = Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (existingIndex >= 0) {
        // If lead already exists, just add the quote
        acc[existingIndex].quotes.push(quote as unknown as Quote);
        
        // Update addresses if not already set
        if (!acc[existingIndex].addresses.origin && addresses.origin) {
          acc[existingIndex].addresses.origin = addresses.origin;
        }
        if (!acc[existingIndex].addresses.destination && addresses.destination) {
          acc[existingIndex].addresses.destination = addresses.destination;
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
        };
        
        const currentPriority = statusPriority[acc[existingIndex].status.toLowerCase() as keyof typeof statusPriority] || 0;
        const newPriority = statusPriority[status.toLowerCase() as keyof typeof statusPriority] || 0;
        
        if (newPriority > currentPriority) {
          acc[existingIndex].status = status;
        }
        
        return acc;
      }
      
      // Create a new customer entry
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
      });
      
      return acc;
    }, [] as Customer[])
    // Sort customers by creation date (newest first)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Get status options for opportunities tab - using lowercase to match database values
  const opportunityStatusOptions = ['opportunity', 'booked', 'confirmed'];
  
  // Get status options for all customers tab - using lowercase to match database values
  const allStatusOptions = [
    'opportunity', 'booked', 'confirmed', 'in progress', 
    'completed', 'reviewed', 'closed', 'claims', 'lost'
  ];

  // Apply pagination to the customers array
  const totalCustomers = customers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700 max-w-3xl">
            A list of all customers and opportunities in your account.
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CustomersPageTabs 
          defaultTab="opportunities"
          actionButton={<CreateOpportunityButton />}
          opportunitiesContent={
            <ClientCustomersPage 
              initialCustomers={paginatedCustomers as any[]}
              currentUserId={typedUserData.id}
              allUsers={formattedUsers}
              isAdmin={isAdmin}
              allStatusOptions={allStatusOptions}
              opportunityStatusOptions={opportunityStatusOptions}
              tableType="opportunities"
              pageSize={pageSize}
              currentPage={currentPage}
              totalCustomers={totalCustomers}
            />
          }
          allCustomersContent={
            <ClientCustomersPage 
              initialCustomers={paginatedCustomers as any[]}
              currentUserId={typedUserData.id}
              allUsers={formattedUsers}
              isAdmin={isAdmin}
              allStatusOptions={allStatusOptions}
              opportunityStatusOptions={opportunityStatusOptions}
              tableType="all-customers"
              pageSize={pageSize}
              currentPage={currentPage}
              totalCustomers={totalCustomers}
            />
          }
        />
      </div>
    </div>
  )
}
