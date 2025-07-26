'use client'

import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { debounce } from 'lodash'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBar({ 
  placeholder = "Search...",
  className = ""
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get initial query from URL
  const urlQuery = searchParams.get('query') || ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  
  // Handle input change without immediate URL update
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Clear search
  const handleClearSearch = () => {
    // Clear local state
    setSearchQuery('')
    
    // Create a new URLSearchParams object and clear the query parameter
    const params = new URLSearchParams(searchParams.toString())
    params.delete('query')
    
    // Ensure we preserve the tab parameter
    const tabParam = searchParams.get('tab')
    if (tabParam && !params.has('tab')) {
      params.set('tab', tabParam)
    }
    
    // Update the URL directly without debounce
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    
    // Set focus back to the input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }
  
  // Update URL with debounced function
  const updateUrl = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const currentQuery = params.get('query') || ''
      
      // Only update if the query is actually changing
      if (value !== currentQuery) {
        if (value) {
          params.set('query', value)
        } else {
          params.delete('query')
        }
        
        // Reset to page 1 when search changes
        params.set('page', '1')
        
        // Ensure the tab parameter is preserved
        const tabParam = searchParams.get('tab')
        if (tabParam && !params.has('tab')) {
          params.set('tab', tabParam)
        }
        
        // Update URL without causing a full refresh
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    }, 600),
    [searchParams, pathname, router]
  )
  
  // Update URL when search query changes
  useEffect(() => {
    updateUrl(searchQuery)
  }, [searchQuery, updateUrl])
  
  // Update the input value if URL query param changes from elsewhere
  useEffect(() => {
    if (urlQuery !== searchQuery && document.activeElement !== inputRef.current) {
      setSearchQuery(urlQuery)
    }
  }, [urlQuery, searchQuery])
  
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
          ref={inputRef}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}
