'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import TestNotificationButton from '@/components/TestNotificationButton'

export default function NotificationsSettingsPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    async function getUserId() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Get user ID from the database
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (data) {
        setUserId(data.id)
      }
    }
    
    getUserId()
  }, [])
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Testing</CardTitle>
            <CardDescription>
              Test the notification system by creating a test notification for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to create a test notification. You should see it appear in the notification 
              dropdown in the header with a red badge showing the count of unread notifications.
            </p>
          </CardContent>
          <CardFooter>
            {userId ? (
              <TestNotificationButton userId={userId} />
            ) : (
              <p className="text-sm text-muted-foreground">Loading user information...</p>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              The system currently supports the following notification types:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li className="text-sm">
                <span className="font-medium">New Unclaimed Lead:</span> Notifies admin, sales, and sales_lead users when a new unclaimed lead is created
              </li>
              <li className="text-sm">
                <span className="font-medium">Lead Assignment:</span> Notifies a user when a lead is assigned to them
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
