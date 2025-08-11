import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EnhancedLead } from '@/types/leads'
import { Database } from '@/packages/shared/api/supabase/types'
import { 
  calculateLeadAge, 
  calculateLeadStatus, 
  calculateLeadPriority,
  calculateLeadScore,
  calculateConversionProbability,
  formatLeadAge, 
  formatMoveDate,
  DEFAULT_SCORING_RULES
} from '@/lib/utils/leadUtils'
import EnhancedClientLeadsPage from '@/components/leads/EnhancedClientLeadsPage'
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils'

export const metadata: Metadata = {
  title: 'Leads Management | High Quality Moving CRM',
  description: 'Comprehensive lead management system with real-time updates, scoring, and automated follow-up',
}

// Enhanced Database types for comprehensive lead management
type DatabaseLead = Database['public']['Tables']['leads']['Row'] & {
  quotes?: Array<Database['public']['Tables']['quotes']['Row'] & {
    jobs?: Array<{
      id: string
      move_date: string | null
    }>
    users?: {
      id: string
      first_name: string | null
      last_name: string | null
      email: string | null
    }
  }>
  activities?: Array<Database['public']['Tables']['activity_logs']['Row']>
  follow_ups?: Array<Database['public']['Tables']['follow_ups']['Row']>
}

// Type definition to match database schema (TypeScript Usage rule)
interface UserData {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  user_roles: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

export default async function EnhancedLeadsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Properly await searchParams to access its properties
  const params = await searchParams;
  const leadStatusParam = (params.leadStatus as string) || 'all';
  const userIdParam = (params.userId as string) || 'all';
  const tabParam = (params.tab as string) || 'unclaimed';
  const priorityParam = (params.priority as string) || 'all';
  const sourceParam = (params.source as string) || 'all';
  const searchQuery = (params.query as string) || '';
  
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
  
  // Check if user has admin or sales privileges
  const isAdmin = permissions?.admin === true
  const isSales = permissions?.sales === true || isAdmin
  
  // Only sales roles can access leads
  if (!isSales) {
    redirect('/dashboard')
  }
  
  // Get all users if admin, otherwise just sales team members
  let allUsers: { id: string; first_name: string | null; last_name: string | null }[] = []
  
  if (isAdmin) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name,
        user_roles(
          roles(permissions)
        )
      `)
      .order('first_name', { ascending: true })

    if (usersError) {
      console.error('Error fetching users:', usersError)
    } else {
      // Filter to only sales team members
      allUsers = users.filter(u => {
        const userRoles = u.user_roles as any[]
        return userRoles.some(ur => 
          ur.roles?.permissions?.sales === true || 
          ur.roles?.permissions?.admin === true
        )
      }).map(u => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name
      }))
    }
  }

  // Format users for dropdown
  const formattedUsers = allUsers.map(user => ({
    id: user.id,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
  }))

  // Comprehensive leads query with all related data
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
        status,
        referral_source,
        move_size,
        service_type,
        total,
        user_id,
        created_at,
        is_self_claimed,
        jobs (
          id,
          move_date
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      ),
      activity_logs (
        id,
        activity_type,
        direction,
        title,
        content,
        contact_method,
        contact_value,
        created_at,
        user_id,
        metadata
      ),
      follow_ups (
        id,
        follow_up_date,
        method,
        notes,
        status,
        user_id,
        created_at
      )
    `)
    .order('created_at', { ascending: false }) as { 
      data: DatabaseLead[] | null
      error: any 
    }

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
  }

  // Transform database leads into enhanced leads with computed fields
  const formatEnhancedLeads = (leadsData: DatabaseLead[] | null): EnhancedLead[] => {
    if (!leadsData) return []
    
    return leadsData.map(lead => {
      // Calculate age and timing
      const ageMinutes = calculateLeadAge(lead.created_at)
      const ageDisplay = formatLeadAge(lead.created_at)
      
      // Get the latest quote data
      const quotes = lead.quotes || []
      const latestQuote = quotes.length > 0 ? quotes[0] : null
      
      // Enhanced quote data
      const enhancedQuotes = quotes.map(quote => ({
        ...quote,
        user: quote.users ? {
          id: quote.users.id,
          first_name: quote.users.first_name,
          last_name: quote.users.last_name,
          email: quote.users.email
        } : undefined,
        jobs: quote.jobs || []
      }))
      
      // Calculate enhanced properties
      const enhancedLead: EnhancedLead = {
        ...lead,
        quotes: enhancedQuotes,
        latest_quote: enhancedQuotes[0] || undefined,
        activities: lead.activity_logs || [],
        follow_ups: lead.follow_ups || [],
        
        // Computed display fields
        age_in_minutes: ageMinutes,
        age_display: ageDisplay,
        status: calculateLeadStatus({ ...lead, activities: lead.activity_logs } as EnhancedLead, ageMinutes),
        priority: calculateLeadPriority({ ...lead } as EnhancedLead, ageMinutes),
        
        // Lead assignment info
        claimed_by: latestQuote?.users ? 
          `${latestQuote.users.first_name || ''} ${latestQuote.users.last_name || ''}`.trim() : 
          undefined,
        claimed_by_user: latestQuote?.users ? {
          id: latestQuote.users.id,
          first_name: latestQuote.users.first_name,
          last_name: latestQuote.users.last_name,
          email: latestQuote.users.email
        } : undefined,
        
        // Move details
        move_date: latestQuote?.jobs?.[0]?.move_date || undefined,
        move_date_display: formatMoveDate(latestQuote?.jobs?.[0]?.move_date),
        move_size: latestQuote?.move_size || undefined,
        service_type: latestQuote?.service_type ? capitalizeFirstLetter(latestQuote.service_type) : undefined,
        source: latestQuote?.referral_source || 'Direct',
        estimated_value: latestQuote?.total || undefined,
        
        // Lead scoring
        lead_score: calculateLeadScore({ ...lead } as EnhancedLead, DEFAULT_SCORING_RULES),
        conversion_probability: calculateConversionProbability({ ...lead } as EnhancedLead),
        
        // Activity summary
        total_interactions: (lead.activity_logs || []).length,
        last_contact_date: lead.activity_logs && lead.activity_logs.length > 0 ? 
          lead.activity_logs[0].created_at : undefined,
        last_contact_method: lead.activity_logs && lead.activity_logs.length > 0 ? 
          lead.activity_logs[0].contact_method as any : undefined,
        next_follow_up_date: lead.follow_ups && lead.follow_ups.length > 0 ?
          lead.follow_ups.find(f => f.status === 'pending')?.follow_up_date : undefined,
        
        // Move timing
        days_until_move: latestQuote?.jobs?.[0]?.move_date ? 
          Math.ceil((new Date(latestQuote.jobs[0].move_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
          undefined
      }
      
      return enhancedLead
    })
  }
  
  // Process all leads with enhanced data
  const enhancedLeads = formatEnhancedLeads(leadsData)
    // Sort by priority first, then by creation date
    .sort((a, b) => {
      // Priority sort (hot > warm > cold)
      const priorityOrder = { 'hot': 3, 'warm': 2, 'cold': 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground">
            Comprehensive lead management with real-time updates, smart scoring, and automated follow-up
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-white shadow-sm">
        <EnhancedClientLeadsPage 
          leads={enhancedLeads}
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