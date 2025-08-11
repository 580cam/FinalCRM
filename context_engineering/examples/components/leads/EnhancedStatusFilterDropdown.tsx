'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LeadDisplayStatus } from '@/types/leads'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter } from 'lucide-react'
import { getStatusColor } from '@/lib/utils/leadUtils'

interface EnhancedStatusFilterDropdownProps {
  statuses: LeadDisplayStatus[]
  defaultStatus: string
  paramName: string
}

export default function EnhancedStatusFilterDropdown({
  statuses,
  defaultStatus,
  paramName
}: EnhancedStatusFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (status === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, status)
    }
    params.set('page', '1') // Reset to first page
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentStatus = searchParams.get(paramName) || defaultStatus
  const displayStatus = currentStatus === 'all' ? 'All Statuses' : currentStatus

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 min-w-[140px] justify-start"
        >
          <Filter className="h-4 w-4" />
          <span className="truncate">{displayStatus}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem 
          onClick={() => handleStatusChange('all')}
          className={currentStatus === 'all' ? 'bg-gray-100' : ''}
        >
          <span>All Statuses</span>
          {currentStatus === 'all' && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </DropdownMenuItem>
        
        {statuses.map((status) => (
          <DropdownMenuItem 
            key={status} 
            onClick={() => handleStatusChange(status.toLowerCase())}
            className={currentStatus.toLowerCase() === status.toLowerCase() ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(status)}`}
              >
                {status}
              </Badge>
              {currentStatus.toLowerCase() === status.toLowerCase() && (
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