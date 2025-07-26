import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserFilterDropdown from '@/components/UserFilterDropdown'
import StatusFilterDropdown from '@/components/StatusFilterDropdown'
import LeadsTable from '@/components/LeadsTable'
import { Database } from '@/types/supabase'
import CreateLeadButton from '@/components/CreateLeadButton'
import { formatLeadAge, formatMoveDate } from '@/lib/utils/timeUtils'
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils'
import { Lead } from '@/types/leads'
import LeadsPageTabs from '@/components/LeadsPageTabs'
import ClientLeadsPage from '@/components/leads/ClientLeadsPage'

export const metadata: Metadata = {
  title: 'Leads | High Quality Moving CRM',
  description: 'Manage your leads and potential customers',
}

// Type definition to match database schema (TypeScript Usage rule)
interface UserData {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  user_roles: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

// Database types
type DatabaseLead = Database['public']['Tables']['leads']['Row'] & {
  quotes?: Array<Database['public']['Tables']['quotes']['Row'] & {
    jobs?: Array<{
      id: number
      move_date: string | null
    }>
    users?: {
      first_name: string | null
      last_name: string | null
    }
  }>
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Properly await searchParams to access its properties
  const params = await searchParams;
  const leadStatusParam = (params.leadStatus as string) || 'all';
  const userIdParam = (params.userId as string) || 'all';
  const tabParam = (params.tab as string) || 'unclaimed';
  
  // Pagination parameters
  const pageParam = (params.page as string) || '1';
  const pageSizeParam = (params.size as string) || '25';
  const currentPage = parseInt(pageParam);
  const pageSize = parseInt(pageSizeParam);

  // Initialize Supabase client
  const supabase = await createClient()

  // Check authentication using getUser for security (as recommended by Supabase)
  const { data: { user }, error: userAuthError } = await supabase.auth.getUser()
  if (!user || userAuthError) {
    redirect('/auth/signin')
  }

  // Get user permissions - following Authentication and Authorization Flow rule
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
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
    redirect('/auth/signin')
  }

  // Properly type our userData to avoid TypeScript errors
  const typedUserData = userData as unknown as UserData
  
  // Check if user has any roles assigned
  if (!typedUserData.user_roles || typedUserData.user_roles.length === 0) {
    redirect('/admin-approval')
  }
  
  // Get permissions from the first role (assuming one role per user)
  const permissions = typedUserData.user_roles[0].roles.permissions
  
  // Check if user has admin privileges (admin permission in user roles)
  const isAdmin = permissions?.admin === true
  
  // Get all users if admin, otherwise just the current user
  let allUsers: { id: number; first_name: string | null; last_name: string | null }[] = []
  
  if (isAdmin) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .order('first_name', { ascending: true })

    if (usersError) {
      console.error('Error fetching users:', usersError)
    } else {
      allUsers = users
    }
  }

  // Format users for dropdown
  const formattedUsers = allUsers.map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
  }))

  // Restore the filtering conditions now that we know the data is coming through
  // But simplify the filtering to happen in JavaScript after we've fetched the data
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select(`
      id,
      name,
      email,
      phone,
      created_at,
      updated_at,
      quotes (
        id,
        move_size,
        referral_source,
        user_id,
        created_at,
        status,
        jobs (
          id,
          move_date
        ),
        users (
          first_name,
          last_name
        ),
        service_type
      )
    `)
    .order('created_at', { ascending: false }) as { 
      data: DatabaseLead[] | null
      error: any 
    }

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
  }

  // Format leads for display
  const formatLeads = (leadsData: DatabaseLead[] | null): Lead[] => {
    if (!leadsData) return []
    
    return leadsData.map(lead => {
      const createdAt = new Date(lead.created_at)
      const now = new Date()
      const ageInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
      
      // Get the quote data if available
      const quotes = lead.quotes || []
      let quoteData = null
      if (quotes.length > 0) {
        quoteData = quotes[0]
      }
      
      // Set default status based on creation time
      let status = ageInSeconds <= 300 ? "HOT LEAD" : "LEAD" // 300 seconds = 5 minutes
      
      // Override with actual status from quote if available
      if (quoteData && quoteData.status) {
        status = quoteData.status.toUpperCase()
      }
      
      // Get claimed by info
      let claimedBy = null
      if (quoteData && quoteData.users) {
        const { first_name, last_name } = quoteData.users
        if (first_name && last_name) {
          claimedBy = `${first_name} ${last_name}`
        }
      }

      // Get move date from jobs if available and format it
      let moveDate = null
      if (quoteData && quoteData.jobs && quoteData.jobs.length > 0) {
        moveDate = formatMoveDate(quoteData.jobs[0].move_date)
      }
      
      const moveSize = quoteData ? quoteData.move_size : null
      const source = quoteData ? quoteData.referral_source : 'Direct'
      const serviceType = quoteData ? capitalizeFirstLetter(quoteData.service_type) : null

      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        created_at: lead.created_at,
        status,
        move_date: moveDate,
        move_size: moveSize,
        claimed_by: claimedBy,
        age: formatLeadAge(createdAt),
        source,
        service_type: serviceType,
        quotes
      }
    })
  }
  
  // Process all leads
  const formattedLeads = formatLeads(leadsData)
    // Sort leads by creation date (newest first)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage potential customers before they receive quotes
        </p>
      </div>
      
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ClientLeadsPage 
          leads={formattedLeads}
          isAdmin={isAdmin}
          currentUserId={typedUserData.id}
          users={formattedUsers}
          pageSize={pageSize}
          currentPage={currentPage}
        />
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric', 
    year: 'numeric'
  }).format(date)
}
