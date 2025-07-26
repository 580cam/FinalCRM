'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Inbox, Plus, ChevronDown, User, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import CreateLeadModal from '@/components/CreateLeadModal'
import NotificationDropdown from '@/components/NotificationDropdown'
import CreateOpportunityModal from '@/components/CreateOpportunityModal'

interface User {
  id: number
  email: string | null
  first_name: string | null
  last_name: string | null
  profile_image: string | null
  status: string | null
  phone: string | null
  created_at: string | null
  updated_at: string | null
  user_roles?: Array<{
    roles: {
      permissions: Record<string, boolean>
    }
  }>
}

interface DashboardHeaderProps {
  user: User
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false)
  const [isCreateOpportunityModalOpen, setIsCreateOpportunityModalOpen] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  
  useEffect(() => {
    async function getUserId() {
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
  }, [user.email])

  const userInitials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleCreateLeadSuccess = () => {
    // Optionally refresh data or show success message
    setIsCreateLeadModalOpen(false)
  }

  const handleCreateOpportunitySuccess = () => {
    // Optionally refresh data or show success message
    setIsCreateOpportunityModalOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white" role="banner">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex-1">
          <Link href="/dashboard">
            <h1 className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors">
              High Quality Moving
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          
          {userId && <NotificationDropdown userId={userId} />}
          
          <Button variant="ghost" size="icon" aria-label="Inbox">
            <Inbox className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsCreateLeadModalOpen(true)}>
                New Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateOpportunityModalOpen(true)}>
                New Opportunity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_image || ''} alt={user?.first_name || 'User'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-10 w-10 items-center justify-center space-y-0 rounded-full border">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profile_image || ''} alt={user?.first_name || 'User'} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.email || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 mt-2"
                onClick={() => router.push('/settings/profile')}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2"
                onClick={() => router.push('/settings')}
              >
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 text-red-600"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Create Lead Modal */}
      <CreateLeadModal 
        isOpen={isCreateLeadModalOpen} 
        onClose={() => setIsCreateLeadModalOpen(false)}
        onSuccess={handleCreateLeadSuccess}
      />

      {/* Create Opportunity Modal */}
      <CreateOpportunityModal 
        isOpen={isCreateOpportunityModalOpen} 
        onClose={() => setIsCreateOpportunityModalOpen(false)}
        onSuccess={handleCreateOpportunitySuccess}
      />
    </header>
  )
}
