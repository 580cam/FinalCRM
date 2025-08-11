import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const QuoteCreateSchema = z.object({
  service_type: z.string().min(1),
  move_date: z.string().optional(),
  crew_size: z.number().min(1).max(10),
  truck_count: z.number().min(1).max(5),
  estimated_hours: z.number().min(0.25),
  packing_services: z.boolean().default(false),
  unpacking_services: z.boolean().default(false),
  base_cost: z.number().min(0),
  materials_cost: z.number().min(0).default(0),
  travel_cost: z.number().min(0).default(0),
  fuel_cost: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
  inventory: z.array(z.object({
    id: z.string(),
    name: z.string(),
    room: z.string(),
    cubic_feet: z.number(),
    weight: z.number().optional(),
    quantity: z.number(),
    requires_special_handling: z.boolean().default(false),
    special_handling_notes: z.string().optional()
  })).optional(),
  special_items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    base_price: z.number(),
    quantity: z.number(),
    total_price: z.number(),
    requires_crating: z.boolean().default(false),
    requires_specialty_crew: z.boolean().default(false),
    special_instructions: z.string().optional()
  })).optional()
})

const QuoteUpdateSchema = QuoteCreateSchema.partial()

// GET /api/customers/[id]/quotes - Get all quotes for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const customerId = parseInt(params.id)
    
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (!permissions?.customers && !permissions?.quotes) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch quotes for the customer
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        service_type,
        move_date,
        total,
        move_size,
        crew_size,
        estimated_hours,
        packing_services,
        unpacking_services,
        notes,
        expires_at,
        sent_at,
        viewed_at,
        accepted_at,
        version,
        metadata,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('lead_id', customerId)
      .order('created_at', { ascending: false })

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError)
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }

    // Enhance quotes with calculated fields
    const enhancedQuotes = quotes.map(quote => {
      const metadata = quote.metadata || {}
      
      return {
        ...quote,
        version: quote.version || 1,
        is_current: quote.status !== 'expired' && quote.status !== 'lost',
        base_cost: metadata.base_cost || quote.total || 0,
        additional_services_cost: metadata.additional_services_cost || 0,
        materials_cost: metadata.materials_cost || 0,
        travel_cost: metadata.travel_cost || 0,
        fuel_cost: metadata.fuel_cost || 0,
        discount_amount: metadata.discount_amount || 0,
        tax_amount: metadata.tax_amount || 0,
        total_amount: quote.total || 0,
        crew_size: quote.crew_size || 3,
        truck_count: metadata.truck_count || 1,
        estimated_hours: quote.estimated_hours || 4,
        packing_services: quote.packing_services || false,
        unpacking_services: quote.unpacking_services || false,
        inventory: metadata.inventory || [],
        box_estimate: metadata.box_estimate || {
          small_boxes: 0,
          medium_boxes: 0,
          large_boxes: 0,
          wardrobe_boxes: 0,
          dish_boxes: 0,
          specialty_boxes: 0,
          total_boxes: 0,
          packing_paper_bundles: 0,
          bubble_wrap_rolls: 0,
          packing_tape_rolls: 0,
          total_materials_cost: metadata.materials_cost || 0,
          estimated_packing_hours: 0,
          estimated_unpacking_hours: 0
        },
        special_items: metadata.special_items || [],
        created_by_user: quote.users,
        approval_required: (quote.total || 0) > 5000, // Example threshold
        approval_status: metadata.approval_status || 'approved',
        win_probability: metadata.win_probability || 0.7,
        competitor_quotes: metadata.competitor_quotes || []
      }
    })

    return NextResponse.json({
      quotes: enhancedQuotes,
      total: enhancedQuotes.length,
      current_quote: enhancedQuotes.find(q => q.is_current) || enhancedQuotes[0]
    })

  } catch (error) {
    console.error('Get quotes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers/[id]/quotes - Create new quote for customer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const customerId = parseInt(params.id)
    
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const quoteData = QuoteCreateSchema.parse(body)

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
    if (!permissions?.quotes && !permissions?.admin) {
      return NextResponse.json({ error: 'Insufficient permissions to create quotes' }, { status: 403 })
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('leads')
      .select('id, name')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get current quote version for this customer
    const { data: existingQuotes } = await supabase
      .from('quotes')
      .select('version')
      .eq('lead_id', customerId)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingQuotes?.[0]?.version ? existingQuotes[0].version + 1 : 1

    // Prepare metadata
    const metadata = {
      base_cost: quoteData.base_cost,
      additional_services_cost: 0,
      materials_cost: quoteData.materials_cost,
      travel_cost: quoteData.travel_cost,
      fuel_cost: quoteData.fuel_cost,
      discount_amount: quoteData.discount_amount,
      tax_amount: quoteData.tax_amount,
      truck_count: quoteData.truck_count,
      inventory: quoteData.inventory || [],
      special_items: quoteData.special_items || [],
      box_estimate: {
        small_boxes: 0,
        medium_boxes: 0,
        large_boxes: 0,
        wardrobe_boxes: 0,
        dish_boxes: 0,
        specialty_boxes: 0,
        total_boxes: 0,
        packing_paper_bundles: 0,
        bubble_wrap_rolls: 0,
        packing_tape_rolls: 0,
        total_materials_cost: quoteData.materials_cost,
        estimated_packing_hours: quoteData.packing_services ? Math.ceil(quoteData.estimated_hours * 0.3) : 0,
        estimated_unpacking_hours: quoteData.unpacking_services ? Math.ceil(quoteData.estimated_hours * 0.2) : 0
      },
      approval_status: quoteData.total_amount > 5000 ? 'pending' : 'approved',
      win_probability: 0.7
    }

    // Create quote
    const { data: newQuote, error: createError } = await supabase
      .from('quotes')
      .insert({
        lead_id: customerId,
        user_id: userData.id,
        status: 'pending',
        service_type: quoteData.service_type,
        move_date: quoteData.move_date,
        total: quoteData.total_amount,
        crew_size: quoteData.crew_size,
        estimated_hours: quoteData.estimated_hours,
        packing_services: quoteData.packing_services,
        unpacking_services: quoteData.unpacking_services,
        notes: quoteData.notes,
        expires_at: quoteData.expires_at,
        version: nextVersion,
        metadata
      })
      .select(`
        id,
        created_at,
        status,
        service_type,
        move_date,
        total,
        version,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating quote:', createError)
      return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userData.id,
        action: 'quote_created',
        table_name: 'quotes',
        record_id: newQuote.id,
        metadata: {
          customer_id: customerId,
          customer_name: customer.name,
          quote_amount: quoteData.total_amount,
          service_type: quoteData.service_type,
          version: nextVersion
        }
      })

    // Mark previous quotes as not current if this is approved
    if (metadata.approval_status === 'approved') {
      await supabase
        .from('quotes')
        .update({ metadata: { ...metadata, is_current: false } })
        .eq('lead_id', customerId)
        .neq('id', newQuote.id)
    }

    const response = {
      ...newQuote,
      ...quoteData,
      is_current: metadata.approval_status === 'approved',
      approval_required: quoteData.total_amount > 5000,
      approval_status: metadata.approval_status,
      win_probability: metadata.win_probability
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Create quote error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}