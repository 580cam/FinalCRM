import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const PipelineUpdateSchema = z.object({
  customer_id: z.number(),
  new_status: z.enum(['opportunity', 'booked', 'confirmed', 'in_progress', 'completed', 'reviewed', 'closed', 'claims', 'lost']),
  user_id: z.string().optional(),
  notes: z.string().optional()
})

const PipelineFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  assigned_to: z.array(z.string()).optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  search: z.string().optional()
})

// GET /api/customers/pipeline - Get pipeline data with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse filters from query params
    const filters = {
      status: searchParams.get('status')?.split(',') || [],
      assigned_to: searchParams.get('assigned_to')?.split(',') || [],
      date_range: searchParams.get('start_date') && searchParams.get('end_date') ? {
        start: searchParams.get('start_date')!,
        end: searchParams.get('end_date')!
      } : undefined,
      search: searchParams.get('search') || ''
    }

    // Build query
    let query = supabase
      .from('quotes')
      .select(`
        id,
        created_at,
        updated_at,
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
          created_at,
          updated_at
        ),
        jobs (
          id,
          job_type,
          move_date,
          total_price,
          job_status,
          scheduled_date,
          job_addresses (
            id,
            address,
            type,
            job_id
          )
        ),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .not('status', 'eq', 'lead')
      .not('status', 'eq', 'hot lead')

    // Apply filters
    if (filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters.assigned_to.length > 0) {
      query = query.in('user_id', filters.assigned_to)
    }

    if (filters.date_range) {
      query = query.gte('created_at', filters.date_range.start)
                  .lte('created_at', filters.date_range.end)
    }

    // Execute query
    const { data: quotesData, error: quotesError } = await query

    if (quotesError) {
      console.error('Error fetching pipeline data:', quotesError)
      return NextResponse.json({ error: 'Failed to fetch pipeline data' }, { status: 500 })
    }

    // Process quotes into enhanced customer objects
    const customers = (quotesData || [])
      .filter(quote => quote.leads)
      .reduce((acc: any[], quote) => {
        const lead = Array.isArray(quote.leads) ? quote.leads[0] : quote.leads
        if (!lead) return acc

        const existingIndex = acc.findIndex(c => c.id === lead.id)
        
        // Setup addresses from jobs
        const addresses = { origin: null, destination: null, additional_stops: [] }
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

              if (addresses.origin && addresses.destination) break
            }
          }
        }

        const status = quote.status || 'opportunity'
        const firstJob = quote.jobs?.[0]
        
        const createdAt = new Date(lead.created_at)
        const ageDays = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        const customerData = {
          id: lead.id,
          lead_id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          created_at: lead.created_at,
          updated_at: lead.updated_at || lead.created_at,
          status: status.toLowerCase().replace(' ', '_'),
          status_changed_at: quote.updated_at || quote.created_at,
          addresses,
          estimated_revenue: firstJob?.total_price || quote.total || 0,
          total_quoted_amount: quote.total || 0,
          service_type: quote.service_type,
          move_type: firstJob?.job_type,
          move_date: firstJob?.move_date || firstJob?.scheduled_date,
          source: quote.referral_source,
          age_days: ageDays,
          assigned_user: quote.users ? {
            id: quote.users.id,
            first_name: quote.users.first_name,
            last_name: quote.users.last_name,
            email: quote.users.email
          } : null,
          quotes: [],
          jobs: [],
          activities: [],
          inventory: [],
          tags: [],
          conversion_probability: 0.7,
          customer_score: 75,
          total_interactions: 0
        }

        if (existingIndex >= 0) {
          // Update existing customer
          acc[existingIndex].quotes.push(quote)
          if (quote.jobs) {
            acc[existingIndex].jobs.push(...quote.jobs)
          }
          
          // Update status to highest priority
          const statusPriority = {
            'opportunity': 1, 'booked': 2, 'confirmed': 3, 'in_progress': 4,
            'completed': 5, 'reviewed': 6, 'closed': 7, 'claims': 8, 'lost': 9
          }
          
          const currentPriority = statusPriority[acc[existingIndex].status as keyof typeof statusPriority] || 0
          const newPriority = statusPriority[customerData.status as keyof typeof statusPriority] || 0
          
          if (newPriority > currentPriority) {
            acc[existingIndex].status = customerData.status
            acc[existingIndex].status_changed_at = customerData.status_changed_at
          }
          
          return acc
        }

        customerData.quotes = [quote]
        customerData.jobs = quote.jobs || []
        acc.push(customerData)
        return acc
      }, [])
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    // Apply search filter
    const filteredCustomers = filters.search 
      ? customers.filter(customer => 
          customer.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.phone?.includes(filters.search) ||
          customer.addresses.origin?.toLowerCase().includes(filters.search.toLowerCase()) ||
          customer.addresses.destination?.toLowerCase().includes(filters.search.toLowerCase())
        )
      : customers

    // Calculate pipeline metrics
    const metrics = {
      total_customers: filteredCustomers.length,
      total_pipeline_value: filteredCustomers.reduce((sum, c) => sum + c.estimated_revenue, 0),
      opportunity_to_booked: filteredCustomers.filter(c => c.status === 'opportunity').length > 0 
        ? filteredCustomers.filter(c => ['booked', 'confirmed', 'in_progress', 'completed'].includes(c.status)).length / filteredCustomers.filter(c => c.status === 'opportunity').length
        : 0,
      booked_to_confirmed: filteredCustomers.filter(c => c.status === 'booked').length > 0
        ? filteredCustomers.filter(c => ['confirmed', 'in_progress', 'completed'].includes(c.status)).length / filteredCustomers.filter(c => c.status === 'booked').length
        : 0,
      confirmed_to_completed: filteredCustomers.filter(c => c.status === 'confirmed').length > 0
        ? filteredCustomers.filter(c => ['completed'].includes(c.status)).length / filteredCustomers.filter(c => c.status === 'confirmed').length
        : 0,
      average_deal_size: filteredCustomers.length > 0 
        ? filteredCustomers.reduce((sum, c) => sum + c.estimated_revenue, 0) / filteredCustomers.length 
        : 0,
      conversion_rate_this_month: 0.68, // Mock data - would calculate from actual data
      new_customers_this_month: filteredCustomers.filter(c => {
        const created = new Date(c.created_at)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return created >= monthAgo
      }).length
    }

    return NextResponse.json({
      customers: filteredCustomers,
      metrics,
      total: filteredCustomers.length
    })

  } catch (error) {
    console.error('Pipeline API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers/pipeline - Update customer status in pipeline
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { customer_id, new_status, user_id, notes } = PipelineUpdateSchema.parse(body)

    // Get user permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        user_roles(
          roles(
            permissions
          )
        )
      `)
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const permissions = userData.user_roles?.[0]?.roles?.permissions
    if (!permissions?.customers && !permissions?.admin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update quote status
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update({
        status: new_status,
        updated_at: new Date().toISOString(),
        user_id: user_id || user.id
      })
      .eq('lead_id', customer_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating quote status:', updateError)
      return NextResponse.json({ error: 'Failed to update customer status' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'customer_status_changed',
        table_name: 'quotes',
        record_id: updatedQuote.id,
        metadata: {
          customer_id,
          old_status: body.old_status,
          new_status,
          notes
        }
      })

    // Create job if status is 'confirmed' and no job exists
    if (new_status === 'confirmed') {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('quote_id', updatedQuote.id)
        .single()

      if (!existingJob) {
        const { error: jobError } = await supabase
          .from('jobs')
          .insert({
            quote_id: updatedQuote.id,
            service_type: updatedQuote.service_type,
            job_status: 'scheduled',
            created_by: user.id
          })

        if (jobError) {
          console.error('Error creating job:', jobError)
          // Don't fail the status update if job creation fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      customer_id,
      new_status,
      updated_at: updatedQuote.updated_at
    })

  } catch (error) {
    console.error('Pipeline update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/customers/pipeline - Bulk update customer statuses
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updates } = body // Array of { customer_id, new_status, notes }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid updates array' }, { status: 400 })
    }

    // Check permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        user_roles(
          roles(
            permissions
          )
        )
      `)
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const permissions = userData.user_roles?.[0]?.roles?.permissions
    if (!permissions?.admin) {
      return NextResponse.json({ error: 'Admin permissions required for bulk updates' }, { status: 403 })
    }

    const results = []
    
    // Process each update
    for (const update of updates) {
      try {
        const { customer_id, new_status, notes } = PipelineUpdateSchema.parse(update)

        const { data: updatedQuote, error: updateError } = await supabase
          .from('quotes')
          .update({
            status: new_status,
            updated_at: new Date().toISOString()
          })
          .eq('lead_id', customer_id)
          .select()
          .single()

        if (updateError) {
          results.push({ customer_id, success: false, error: updateError.message })
          continue
        }

        // Log activity
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'customer_status_bulk_changed',
            table_name: 'quotes',
            record_id: updatedQuote.id,
            metadata: { customer_id, new_status, notes }
          })

        results.push({ customer_id, success: true, new_status })
      } catch (error) {
        results.push({ customer_id: update.customer_id, success: false, error: 'Invalid data' })
      }
    }

    return NextResponse.json({ results, processed: results.length })

  } catch (error) {
    console.error('Bulk pipeline update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}