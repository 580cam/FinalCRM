import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Tasks | High Quality Moving CRM',
  description: 'Manage your tasks and activities',
}

// Type definition to match database schema (TypeScript Usage rule)
interface UserData {
  id: number
  email: string
  user_roles: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

export default async function TasksPage() {
  const supabase = await createClient()
  
  // Check authentication - following Authentication System rule
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user permissions - following Authentication and Authorization Flow rule
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
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
    redirect('/auth')
  }

  // Properly type our userData to avoid TypeScript errors
  const typedUserData = userData as unknown as UserData
  
  // Check if user has any roles assigned
  if (!typedUserData.user_roles || typedUserData.user_roles.length === 0) {
    redirect('/admin-approval')
  }
  
  // Get permissions from the first role (assuming one role per user)
  const permissions = typedUserData.user_roles[0].roles.permissions
  
  // Check tasks permission - following Permission Structure rule
  if (!permissions || !permissions.tasks) {
    redirect('/admin-approval')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks and track progress
        </p>
      </div>
      
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Your Tasks</h2>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add New Task
          </button>
        </div>
        
        <div className="py-6">
          <p className="text-center text-gray-500">No tasks found. Create a new task to get started.</p>
        </div>
      </div>
    </div>
  )
}
