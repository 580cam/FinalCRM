'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface StatusFilterDropdownProps {
  statuses: string[]
  defaultStatus?: string
  paramName?: string
}

export default function StatusFilterDropdown({ 
  statuses, 
  defaultStatus = 'all',
  paramName = 'status'
}: StatusFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const selectedStatus = searchParams.get(paramName) || defaultStatus
  
  const handleStatusChange = (status: string) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString())
    
    // Set or delete the status parameter
    if (status === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, status)
    }
    
    // Reset page to 1 whenever status filter changes
    params.set('page', '1')
    
    // Ensure tab parameter is preserved
    const tabParam = searchParams.get('tab')
    if (tabParam && !params.has('tab')) {
      params.set('tab', tabParam)
    }
    
    // Update the URL with the new params
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }
  
  // Helper function to title case a string (capitalize first letter of each word)
  const toTitleCase = (str: string): string => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-md">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}
      <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status">
            {selectedStatus === 'all' ? 'All Statuses' : toTitleCase(selectedStatus)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map(status => (
            <SelectItem key={status} value={status}>{toTitleCase(status)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
