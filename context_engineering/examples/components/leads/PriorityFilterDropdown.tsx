'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LeadPriority } from '@/types/leads'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Flame } from 'lucide-react'
import { getPriorityColor } from '@/lib/utils/leadUtils'

interface PriorityFilterDropdownProps {
  priorities: LeadPriority[]
  defaultPriority: string
  paramName: string
}

const priorityIcons = {
  hot: '🔥',
  warm: '🌡️',
  cold: '❄️'
}

const priorityLabels = {
  hot: 'Hot',
  warm: 'Warm', 
  cold: 'Cold'
}

export default function PriorityFilterDropdown({
  priorities,
  defaultPriority,
  paramName
}: PriorityFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handlePriorityChange = (priority: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priority === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, priority)
    }
    params.set('page', '1') // Reset to first page
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentPriority = searchParams.get(paramName) || defaultPriority
  const displayPriority = currentPriority === 'all' ? 'All Priorities' : priorityLabels[currentPriority as LeadPriority] || currentPriority

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 min-w-[130px] justify-start"
        >
          <Flame className="h-4 w-4" />
          <span className="truncate">{displayPriority}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem 
          onClick={() => handlePriorityChange('all')}
          className={currentPriority === 'all' ? 'bg-gray-100' : ''}
        >
          <span>All Priorities</span>
          {currentPriority === 'all' && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </DropdownMenuItem>
        
        {priorities.map((priority) => (
          <DropdownMenuItem 
            key={priority} 
            onClick={() => handlePriorityChange(priority)}
            className={currentPriority === priority ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  priority === 'hot' ? 'bg-red-500' :
                  priority === 'warm' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <span className={`font-medium capitalize ${getPriorityColor(priority)}`}>
                  {priorityLabels[priority]}
                </span>
                <span>{priorityIcons[priority]}</span>
              </div>
              {currentPriority === priority && (
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