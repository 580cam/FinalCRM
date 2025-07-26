'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import Sidebar from '@/components/dashboard/sidebar'
import { useEffect, useState } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true)
        
        // Get authenticated user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          // Not authenticated, redirect to login
          router.push('/auth')
          return
        }
        
        // Get user data from the custom users table
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id, 
            email, 
            first_name, 
            last_name,
            profile_image,
            status,
            phone,
            created_at,
            updated_at,
            user_roles(
              role_id,
              roles(
                role,
                permissions
              )
            )
          `)
          .eq('email', session.user.email)
          .single()
        
        if (error || !userData) {
          console.error('Error fetching user data:', error)
          router.push('/auth')
          return
        }
        
        setUser(userData)
      } catch (error) {
        console.error('Error in AppShell:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <DashboardHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
