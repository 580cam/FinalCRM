'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface User {
  id: number
  name: string
}

interface UserFilterDropdownProps {
  users: User[]
  defaultUserId?: string
}

export default function UserFilterDropdown({ users, defaultUserId }: UserFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Get selectedUserId from URL in the client component or use defaultUserId
  const selectedUserId = defaultUserId || searchParams.get('userId') || 'all'
  
  // Handle user selection change
  const handleUserChange = (userId: string) => {
    // Create new URLSearchParams with current params
    const params = new URLSearchParams(searchParams.toString())
    
    if (userId === 'all') {
      // Remove the userId param if 'all' is selected
      params.delete('userId')
    } else {
      // Set the userId param
      params.set('userId', userId)
    }
    
    // Reset page to 1 whenever user filter changes
    params.set('page', '1')
    
    // Ensure tab parameter is preserved
    const tabParam = searchParams.get('tab')
    if (tabParam && !params.has('tab')) {
      params.set('tab', tabParam)
    }
    
    // Navigate to the new URL
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }
  
  return (
    <div className="flex items-center space-x-2 relative">
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-md">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
        )}
        <select 
          value={selectedUserId}
          onChange={(e) => handleUserChange(e.target.value)}
          disabled={isPending}
          className="block w-[200px] rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id.toString()}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Show a clear filter link when a filter is applied */}
      {selectedUserId !== "all" && (
        <button 
          onClick={() => handleUserChange('all')}
          disabled={isPending}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
