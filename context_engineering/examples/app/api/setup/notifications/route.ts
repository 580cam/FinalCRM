import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Function to create a notification from the api server
export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { type, message, userId } = requestData
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Create notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type,
        message
      })
      .select()
      .single()
    
    if (notificationError || !notification) {
      return NextResponse.json(
        { error: `Failed to create notification: ${notificationError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    // Create notification recipient
    const { error: recipientError } = await supabase
      .from('notification_recipients')
      .insert({
        notification_id: notification.id,
        user_id: userId,
        is_read: false
      })
    
    if (recipientError) {
      return NextResponse.json(
        { error: `Failed to create notification recipient: ${recipientError.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
