'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Users } from 'lucide-react'

interface User {
  id: string
  name: string
}

interface EnhancedUserFilterDropdownProps {
  users: User[]
  defaultUserId: string
  paramName: string
}

export default function EnhancedUserFilterDropdown({
  users,
  defaultUserId,
  paramName
}: EnhancedUserFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handleUserChange = (userId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (userId === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, userId)
    }
    params.set('page', '1') // Reset to first page
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentUserId = searchParams.get(paramName) || defaultUserId
  const currentUser = users.find(user => user.id === currentUserId)
  const displayName = currentUserId === 'all' ? 'All Users' : (currentUser?.name || 'Select User')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 min-w-[140px] justify-start"
        >
          <Users className="h-4 w-4" />
          <span className="truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem 
          onClick={() => handleUserChange('all')}
          className={currentUserId === 'all' ? 'bg-gray-100' : ''}
        >
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-200">
                All
              </AvatarFallback>
            </Avatar>
            <span>All Users</span>
            {currentUserId === 'all' && (
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            )}
          </div>
        </DropdownMenuItem>
        
        {users.map((user) => (
          <DropdownMenuItem 
            key={user.id} 
            onClick={() => handleUserChange(user.id)}
            className={currentUserId === user.id ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{user.name}</span>
              {currentUserId === user.id && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}