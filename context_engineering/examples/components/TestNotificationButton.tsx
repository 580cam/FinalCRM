'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TestNotificationButtonProps {
  userId: number
}

export default function TestNotificationButton({ userId }: TestNotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const createTestNotification = async () => {
    setIsLoading(true)
    try {
      // Create a test notification directly
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .insert({
          type: 'TEST',
          message: 'This is a test notification'
        })
        .select()

      if (notifError || !notifData || notifData.length === 0) {
        toast.error('Failed to create notification')
        return
      }

      // Add the notification to the current user
      const { error: recipError } = await supabase
        .from('notification_recipients')
        .insert({
          notification_id: notifData[0].id,
          user_id: userId,
          is_read: false
        })

      if (recipError) {
        toast.error('Failed to assign notification to user')
        return
      }

      toast.success('Test notification created successfully')
    } catch (error) {
      toast.error('An error occurred creating test notification')
      console.error('Test notification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={createTestNotification} 
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? 'Creating...' : 'Create Test Notification'}
    </Button>
  )
}
