'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Create a notification and send it to a specific user
 */
export async function createNotificationForUser(
  type: string,
  message: string,
  userId: number
): Promise<boolean> {
  const supabase = createClient()
  
  try {
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
      console.error('Failed to create notification:', notificationError)
      return false
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
      console.error('Failed to create notification recipient:', recipientError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

/**
 * Create a notification and send it to all users with a specific role
 */
export async function createNotificationForRole(
  type: string,
  message: string,
  roleName: string
): Promise<boolean> {
  const supabase = createClient()
  
  try {
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
      console.error('Failed to create notification:', notificationError)
      return false
    }
    
    // Get all users with the specified role
    const { data: usersWithRole, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        user_roles!inner(
          role_id,
          roles!inner(
            name
          )
        )
      `)
      .eq('user_roles.roles.name', roleName)
    
    if (userError || !usersWithRole || usersWithRole.length === 0) {
      console.error('Failed to find users with role:', userError)
      return false
    }
    
    // Create notification recipients for all users with the role
    const recipients = usersWithRole.map(user => ({
      notification_id: notification.id,
      user_id: user.id,
      is_read: false
    }))
    
    const { error: recipientError } = await supabase
      .from('notification_recipients')
      .insert(recipients)
    
    if (recipientError) {
      console.error('Failed to create notification recipients:', recipientError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

/**
 * Create a notification for a new unclaimed lead
 */
export async function notifyNewUnclaimedLead(): Promise<boolean> {
  return createNotificationForRole(
    'NEW_LEAD',
    'A new lead is available to claim',
    'sales'
  )
}

/**
 * Create a notification for a lead assignment
 * @param {number} userId - ID of the user receiving the lead assignment
 * @param {number} assignerId - ID of the user making the assignment
 * @returns {Promise<boolean>}
 * @deprecated Use database triggers instead to avoid duplicate notifications
 */
export async function notifyLeadAssignment(
  userId: number, 
  assignerId?: number
): Promise<boolean> {
  console.log('WARNING: This function is deprecated. Use database triggers instead.');
  // Skip notification creation entirely as this is now handled by database triggers
  return true;
}

/**
 * Create a notification for an opportunity assignment
 * @param {number} userId - ID of the user receiving the opportunity assignment
 * @param {number} assignerId - ID of the user making the assignment
 * @returns {Promise<boolean>}
 * @deprecated Use database triggers instead to avoid duplicate notifications
 */
export async function notifyOpportunityAssignment(
  userId: number, 
  assignerId?: number
): Promise<boolean> {
  console.log('WARNING: This function is deprecated. Use database triggers instead.');
  // Skip notification creation entirely as this is now handled by database triggers
  return true;
}

/**
 * Remove all unclaimed lead notifications when a lead is claimed
 */
export async function removeUnclaimedLeadNotifications(): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Find all NEW_LEAD type notifications
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'NEW_LEAD')
    
    if (notificationError) {
      console.error('Failed to find notifications:', notificationError)
      return false
    }
    
    if (!notifications || notifications.length === 0) {
      // No notifications to remove
      return true
    }
    
    const notificationIds = notifications.map(n => n.id)
    
    // Delete notification recipients
    const { error: recipientError } = await supabase
      .from('notification_recipients')
      .delete()
      .in('notification_id', notificationIds)
    
    if (recipientError) {
      console.error('Failed to delete notification recipients:', recipientError)
      return false
    }
    
    // Delete notifications
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds)
    
    if (deleteError) {
      console.error('Failed to delete notifications:', deleteError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error removing notifications:', error)
    return false
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationRecipientId: number): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('notification_recipients')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationRecipientId)
    
    if (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('notification_recipients')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}
