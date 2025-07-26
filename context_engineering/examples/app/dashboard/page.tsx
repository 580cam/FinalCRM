import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard | High Quality Moving CRM',
  description: 'Manage your moving company operations efficiently',
}

interface UserData {
  id: number
  email: string
  first_name: string
  last_name: string
  profile_image: string
  status: string
  phone: string
  created_at: string
  updated_at: string
  user_roles: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user and their data
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user data and role permissions
  const { data, error: userError } = await supabase
    .from('users')
    .select('*, user_roles(roles(*))')
    .eq('email', user.email)
    .single()

  let finalUserData: UserData

  if (userError || !data) {
    // Create new user with 'new' role
    const { data: newRole } = await supabase
      .from('roles')
      .select('id')
      .eq('role', 'new')
      .single()

    if (!newRole) {
      console.error('New role not found')
      redirect('/auth?error=Role configuration error')
    }

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: user.email,
        first_name: '',
        last_name: '',
        profile_image: '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (createError || !newUser) {
      console.error('Error creating user:', createError)
      redirect('/auth?error=Unable to create user')
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: newUser.id,
        role_id: newRole.id,
        assigned_at: new Date().toISOString()
      }])

    if (roleError) {
      console.error('Error assigning role:', roleError)
      redirect('/auth?error=Unable to assign role')
    }

    // Fetch the newly created user with role
    const { data: createdUserData, error: fetchError } = await supabase
      .from('users')
      .select('*, user_roles(roles(*))')
      .eq('id', newUser.id)
      .single()

    if (fetchError || !createdUserData) {
      redirect('/auth?error=Unable to fetch user data')
    }

    finalUserData = createdUserData
  } else {
    finalUserData = data
  }

  // Check dashboard access permission
  const userRole = finalUserData.user_roles[0]?.roles
  
  if (!userRole || !userRole.permissions) {
    redirect('/admin-approval')
  }
  
  const permissions = userRole.permissions as { dashboard: boolean }

  if (!permissions.dashboard) {
    redirect('/admin-approval')
  }

  // Return only the dashboard content since layout is handled by layout.tsx
  return <DashboardContent />
}
