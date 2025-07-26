'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface NotificationType {
  id: number
  type: string
  message: string
  created_at: string
}

interface NotificationRecipientType {
  id: number
  notification_id: number
  user_id: number
  is_read: boolean
  read_at: string | null
  notification: NotificationType
}

// Helper function to deduplicate notifications
const deduplicateNotifications = (notifications: NotificationRecipientType[]) => {
  // Log incoming notifications for debugging
  console.log('Notifications before processing:', notifications.length);
  console.log('DISABLING ALL DEDUPLICATION - returning all notifications');
  
  // Sort by ID descending (most recent first)
  return notifications.sort((a, b) => b.id - a.id);
}

export default function NotificationDropdown({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<NotificationRecipientType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Initial fetch of notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notification_recipients')
        .select(`
          id,
          notification_id,
          user_id,
          is_read,
          read_at,
          notification:notifications(id, type, message, created_at)
        `)
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(20)

      if (data && !error) {
        // Transform the data to match our expected type structure
        const transformedData = data.map(item => ({
          ...item,
          notification: item.notification as unknown as NotificationType
        })) as NotificationRecipientType[]
        
        // Deduplicate notifications
        const deduplicatedData = deduplicateNotifications(transformedData);
        
        setNotifications(deduplicatedData)
        // Count unread notifications
        const unread = deduplicatedData.filter(notification => !notification.is_read).length
        setUnreadCount(unread)
      }
    }

    fetchNotifications()
  }, [userId])

  // Set up realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('notification_recipients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notification_recipients',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Refresh notifications when changes occur
          fetchLatestNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId])

  const fetchLatestNotifications = async () => {
    const { data, error } = await supabase
      .from('notification_recipients')
      .select(`
        id,
        notification_id,
        user_id,
        is_read,
        read_at,
        notification:notifications(id, type, message, created_at)
      `)
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(20)

    if (data && !error) {
      // Transform the data to match our expected type structure
      const transformedData = data.map(item => ({
        ...item,
        notification: item.notification as unknown as NotificationType
      })) as NotificationRecipientType[]
      
      // Deduplicate notifications
      const deduplicatedData = deduplicateNotifications(transformedData);
      
      setNotifications(deduplicatedData)
      const unread = deduplicatedData.filter(notification => !notification.is_read).length
      setUnreadCount(unread)
    }
  }

  const markAsRead = async (notificationId: number) => {
    // Update the specific notification
    const { error } = await supabase
      .from('notification_recipients')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (!error) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    // Update all unread notifications
    const { error } = await supabase
      .from('notification_recipients')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (!error) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: notification.read_at || new Date().toISOString() 
        }))
      )
      setUnreadCount(0)
    }
  }

  const clearAllNotifications = async () => {
    try {
      // Clear recipient records first (due to foreign key constraints)
      const { error: recipientError } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('user_id', userId);
        
      if (recipientError) {
        console.error('Error clearing notification recipients:', recipientError);
        return;
      }
      
      // Now fetch and clear the actual notifications
      const { data: notificationIds } = await supabase
        .from('notification_recipients')
        .select('notification_id')
        .eq('user_id', userId);
        
      if (notificationIds && notificationIds.length > 0) {
        const ids = notificationIds.map(item => item.notification_id);
        
        const { error: notifError } = await supabase
          .from('notifications')
          .delete()
          .in('id', ids);
          
        if (notifError) {
          console.error('Error clearing notifications:', notifError);
        }
      }
      
      // Refresh the UI
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error in clearAllNotifications:', err);
    }
  }

  const handleNotificationClick = async (notification: NotificationRecipientType) => {
    // Mark as read first
    await markAsRead(notification.id)
    
    // Navigate based on notification type
    switch (notification.notification.type) {
      case 'NEW_LEAD':
      case 'NEW_UNASSIGNED_LEAD':
        router.push('/leads?tab=unclaimed')
        break
      case 'LEAD_ASSIGNED':
        router.push('/leads?tab=my-leads')
        break
      case 'OPPORTUNITY_ASSIGNED':
        router.push('/customers')
        break
      // Add more navigation rules as needed for different notification types
      default:
        // Default action if no specific route is defined
        break
    }
    
    // Close dropdown after click
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="h-auto p-1 text-xs" 
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="h-auto p-1 text-xs" 
            onClick={clearAllNotifications}
          >
            Clear all
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start py-2 px-4 ${!notification.is_read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col w-full">
                    <div className="font-medium text-sm">{notification.notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No notifications
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
