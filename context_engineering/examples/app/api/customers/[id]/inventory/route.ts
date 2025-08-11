import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const InventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  room_location: z.string().min(1),
  cubic_feet: z.number().min(0),
  weight: z.number().min(0).optional(),
  quantity: z.number().min(1),
  source: z.enum(['yembo_ai', 'crm_entry', 'customer_portal', 'phone_survey', 'in_home_survey', 'video_survey']).default('crm_entry'),
  special_handling: z.array(z.string()).optional(),
  packing_required: z.boolean().default(false),
  disassembly_required: z.boolean().default(false),
  value_estimate: z.number().min(0).optional(),
  condition_notes: z.string().optional(),
  photo_urls: z.array(z.string()).optional()
})

const BulkInventoryUpdateSchema = z.object({
  items: z.array(InventoryItemSchema),
  source: z.string().optional(),
  replace_all: z.boolean().default(false)
})

// GET /api/customers/[id]/inventory - Get customer inventory
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
    if (!permissions?.customers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch inventory items for the customer
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('customer_inventory')
      .select(`
        id,
        name,
        description,
        room_location,
        cubic_feet,
        weight,
        quantity,
        source,
        special_handling,
        packing_required,
        disassembly_required,
        value_estimate,
        condition_notes,
        photo_urls,
        created_at,
        updated_at,
        created_by,
        verified_by,
        users!customer_inventory_created_by_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq('customer_id', customerId)
      .order('room_location', { ascending: true })
      .order('name', { ascending: true })

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    // Calculate summary statistics
    const summary = {
      total_items: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      total_cubic_feet: inventoryItems.reduce((sum, item) => sum + (item.cubic_feet * item.quantity), 0),
      total_weight: inventoryItems.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0),
      total_estimated_value: inventoryItems.reduce((sum, item) => sum + ((item.value_estimate || 0) * item.quantity), 0),
      items_requiring_packing: inventoryItems.filter(item => item.packing_required).length,
      items_requiring_disassembly: inventoryItems.filter(item => item.disassembly_required).length,
      items_with_special_handling: inventoryItems.filter(item => item.special_handling && item.special_handling.length > 0).length,
      rooms: [...new Set(inventoryItems.map(item => item.room_location))].sort(),
      sources: [...new Set(inventoryItems.map(item => item.source))]
    }

    return NextResponse.json({
      inventory: inventoryItems,
      summary,
      last_updated: inventoryItems.length > 0 ? inventoryItems[0].updated_at : null
    })

  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers/[id]/inventory - Add inventory item
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
    const itemData = InventoryItemSchema.parse(body)

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
    if (!permissions?.customers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
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

    // Create inventory item
    const { data: newItem, error: createError } = await supabase
      .from('customer_inventory')
      .insert({
        customer_id: customerId,
        name: itemData.name,
        description: itemData.description,
        room_location: itemData.room_location,
        cubic_feet: itemData.cubic_feet,
        weight: itemData.weight,
        quantity: itemData.quantity,
        source: itemData.source,
        special_handling: itemData.special_handling || [],
        packing_required: itemData.packing_required,
        disassembly_required: itemData.disassembly_required,
        value_estimate: itemData.value_estimate,
        condition_notes: itemData.condition_notes,
        photo_urls: itemData.photo_urls || [],
        created_by: userData.id
      })
      .select(`
        id,
        name,
        description,
        room_location,
        cubic_feet,
        weight,
        quantity,
        source,
        special_handling,
        packing_required,
        disassembly_required,
        value_estimate,
        condition_notes,
        photo_urls,
        created_at,
        updated_at
      `)
      .single()

    if (createError) {
      console.error('Error creating inventory item:', createError)
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userData.id,
        action: 'inventory_item_added',
        table_name: 'customer_inventory',
        record_id: newItem.id,
        metadata: {
          customer_id: customerId,
          customer_name: customer.name,
          item_name: itemData.name,
          room_location: itemData.room_location,
          cubic_feet: itemData.cubic_feet,
          quantity: itemData.quantity,
          source: itemData.source
        }
      })

    return NextResponse.json(newItem, { status: 201 })

  } catch (error) {
    console.error('Create inventory item error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/customers/[id]/inventory - Bulk update inventory
export async function PUT(
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
    const { items, source, replace_all } = BulkInventoryUpdateSchema.parse(body)

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
    if (!permissions?.customers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
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

    // If replace_all is true, delete existing inventory
    if (replace_all) {
      const { error: deleteError } = await supabase
        .from('customer_inventory')
        .delete()
        .eq('customer_id', customerId)

      if (deleteError) {
        console.error('Error deleting existing inventory:', deleteError)
        return NextResponse.json({ error: 'Failed to replace inventory' }, { status: 500 })
      }
    }

    const results = []
    
    // Process each item
    for (const item of items) {
      try {
        if (item.id && !replace_all) {
          // Update existing item
          const { data: updatedItem, error: updateError } = await supabase
            .from('customer_inventory')
            .update({
              name: item.name,
              description: item.description,
              room_location: item.room_location,
              cubic_feet: item.cubic_feet,
              weight: item.weight,
              quantity: item.quantity,
              special_handling: item.special_handling || [],
              packing_required: item.packing_required,
              disassembly_required: item.disassembly_required,
              value_estimate: item.value_estimate,
              condition_notes: item.condition_notes,
              photo_urls: item.photo_urls || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('customer_id', customerId)
            .select()
            .single()

          if (updateError) {
            results.push({ item_name: item.name, success: false, error: updateError.message })
            continue
          }

          results.push({ item_name: item.name, success: true, action: 'updated', data: updatedItem })
        } else {
          // Create new item
          const { data: newItem, error: createError } = await supabase
            .from('customer_inventory')
            .insert({
              customer_id: customerId,
              name: item.name,
              description: item.description,
              room_location: item.room_location,
              cubic_feet: item.cubic_feet,
              weight: item.weight,
              quantity: item.quantity,
              source: item.source || source || 'crm_entry',
              special_handling: item.special_handling || [],
              packing_required: item.packing_required,
              disassembly_required: item.disassembly_required,
              value_estimate: item.value_estimate,
              condition_notes: item.condition_notes,
              photo_urls: item.photo_urls || [],
              created_by: userData.id
            })
            .select()
            .single()

          if (createError) {
            results.push({ item_name: item.name, success: false, error: createError.message })
            continue
          }

          results.push({ item_name: item.name, success: true, action: 'created', data: newItem })
        }
      } catch (itemError) {
        results.push({ item_name: item.name || 'Unknown', success: false, error: 'Invalid item data' })
      }
    }

    // Log bulk activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userData.id,
        action: replace_all ? 'inventory_replaced' : 'inventory_bulk_updated',
        table_name: 'customer_inventory',
        record_id: customerId,
        metadata: {
          customer_id: customerId,
          customer_name: customer.name,
          items_processed: results.length,
          successful_updates: results.filter(r => r.success).length,
          source: source || 'bulk_update',
          replace_all
        }
      })

    // Recalculate inventory summary
    const { data: updatedInventory } = await supabase
      .from('customer_inventory')
      .select('cubic_feet, weight, quantity, value_estimate')
      .eq('customer_id', customerId)

    const summary = updatedInventory ? {
      total_items: updatedInventory.reduce((sum, item) => sum + item.quantity, 0),
      total_cubic_feet: updatedInventory.reduce((sum, item) => sum + (item.cubic_feet * item.quantity), 0),
      total_weight: updatedInventory.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0),
      total_estimated_value: updatedInventory.reduce((sum, item) => sum + ((item.value_estimate || 0) * item.quantity), 0)
    } : null

    return NextResponse.json({
      results,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      summary
    })

  } catch (error) {
    console.error('Bulk inventory update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/customers/[id]/inventory - Delete customer inventory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const customerId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('item_id')
    
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
    if (!permissions?.customers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (itemId) {
      // Delete specific item
      const { data: deletedItem, error: deleteError } = await supabase
        .from('customer_inventory')
        .delete()
        .eq('id', itemId)
        .eq('customer_id', customerId)
        .select('name')
        .single()

      if (deleteError) {
        console.error('Error deleting inventory item:', deleteError)
        return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userData.id,
          action: 'inventory_item_deleted',
          table_name: 'customer_inventory',
          record_id: itemId,
          metadata: {
            customer_id: customerId,
            item_name: deletedItem.name
          }
        })

      return NextResponse.json({ success: true, deleted_item: deletedItem.name })
    } else {
      // Delete all inventory for customer
      const { error: deleteAllError } = await supabase
        .from('customer_inventory')
        .delete()
        .eq('customer_id', customerId)

      if (deleteAllError) {
        console.error('Error deleting all inventory:', deleteAllError)
        return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 })
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userData.id,
          action: 'inventory_cleared',
          table_name: 'customer_inventory',
          record_id: customerId,
          metadata: {
            customer_id: customerId
          }
        })

      return NextResponse.json({ success: true, message: 'All inventory deleted' })
    }

  } catch (error) {
    console.error('Delete inventory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}