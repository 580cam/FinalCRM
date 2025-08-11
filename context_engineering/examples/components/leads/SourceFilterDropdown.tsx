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
import { ChevronDown, Globe } from 'lucide-react'

interface SourceFilterDropdownProps {
  sources: string[]
  defaultSource: string
  paramName: string
}

const sourceIcons: Record<string, string> = {
  'google': '🔍',
  'facebook': '👥',
  'referral': '🤝',
  'direct': '💻',
  'yelp': '⭐',
  'website': '🌐',
  'phone': '📞',
  'email': '📧',
  'other': '📌'
}

export default function SourceFilterDropdown({
  sources,
  defaultSource,
  paramName
}: SourceFilterDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handleSourceChange = (source: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (source === 'all') {
      params.delete(paramName)
    } else {
      params.set(paramName, source)
    }
    params.set('page', '1') // Reset to first page
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentSource = searchParams.get(paramName) || defaultSource
  const displaySource = currentSource === 'all' ? 'All Sources' : currentSource

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 min-w-[120px] justify-start"
        >
          <Globe className="h-4 w-4" />
          <span className="truncate">{displaySource}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleSourceChange('all')}
          className={currentSource === 'all' ? 'bg-gray-100' : ''}
        >
          <span>All Sources</span>
          {currentSource === 'all' && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </DropdownMenuItem>
        
        {sources.map((source) => (
          <DropdownMenuItem 
            key={source} 
            onClick={() => handleSourceChange(source.toLowerCase())}
            className={currentSource.toLowerCase() === source.toLowerCase() ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                <span>{sourceIcons[source.toLowerCase()] || '📌'}</span>
                <span className="capitalize">{source}</span>
              </div>
              {currentSource.toLowerCase() === source.toLowerCase() && (
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