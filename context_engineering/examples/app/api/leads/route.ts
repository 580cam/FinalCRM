import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// POST handler for creating a new lead with related quote and job
export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const {
      name,
      email,
      phone,
      phoneType,
      referralSource,
      moveDate,
      moveSize,
      salesPerson,
      serviceType,
      addresses,
      notes
    } = requestData

    // Validate required fields
    if (!name || !referralSource) {
      return NextResponse.json(
        { error: 'Customer name and referral source are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Database transaction to ensure all related records are created or none
    // Start with creating the lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        phone_type: phoneType
      })
      .select('id')
      .single()
      
    if (leadError) {
      console.error('Error creating lead:', leadError)
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    // Create quote with hot lead status
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        lead_id: leadData.id,
        status: 'hot lead', // Initial status is hot lead
        move_size: moveSize,
        referral_source: referralSource,
        service_type: serviceType,
        user_id: salesPerson || null // Assigned salesperson or null if none selected
      })
      .select('id')
      .single()
      
    if (quoteError) {
      console.error('Error creating quote:', quoteError)
      return NextResponse.json(
        { error: 'Failed to create quote' },
        { status: 500 }
      )
    }

    // Create job for the quote
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert({
        quote_id: quoteData.id,
        job_type: serviceType,
        move_date: moveDate,
        job_status: 'scheduled',
        notes: notes
      })
      .select('id')
      .single()
      
    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }

    // Insert addresses if provided
    if (addresses && addresses.length > 0) {
      const formattedAddresses = addresses.map((addr: { address: string; type: string }) => ({
        job_id: jobData.id,
        address: addr.address,
        type: addr.type
      }))

      const { error: addressError } = await supabase
        .from('job_addresses')
        .insert(formattedAddresses)
        
      if (addressError) {
        console.error('Error creating addresses:', addressError)
        return NextResponse.json(
          { error: 'Failed to create addresses' },
          { status: 500 }
        )
      }
    }

    // Return success response with created data
    return NextResponse.json({
      success: true,
      lead: leadData,
      quote: quoteData,
      job: jobData
    })
    
  } catch (error: any) {
    console.error('Error in lead creation API:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
