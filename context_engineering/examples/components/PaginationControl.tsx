'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface PaginationControlProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

// Custom hook to manage pagination URL parameters
export function usePagination() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Only update page if it's different from current
    const currentPage = params.get('page') || '1'
    if (page.toString() !== currentPage) {
      params.set('page', page.toString())
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    }
  }, [router, pathname, searchParams])
  
  const setPageSize = useCallback((size: number) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentSize = params.get('size') || '25'
    
    // Only make the update if the page size is actually changing
    if (size.toString() !== currentSize) {
      params.set('size', size.toString())
      params.set('page', '1') // Reset to page 1 when changing page size
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    }
  }, [router, pathname, searchParams])
  
  return { setPage, setPageSize, isPending }
}

export default function PaginationControl({ 
  currentPage,
  totalItems, 
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationControlProps) {
  const { setPage, setPageSize, isPending } = usePagination()
  
  // Calculate total pages and validate current page
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const validatedCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page === validatedCurrentPage || page < 1 || page > totalPages) return
    
    if (onPageChange) {
      onPageChange(page)
    } else {
      setPage(page)
    }
  }
  
  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value)
    
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    } else {
      setPageSize(newSize)
    }
  }
  
  // Generate page buttons
  const generatePageButtons = () => {
    const buttons = []
    const maxVisiblePages = 5
    
    // Function to add a page button
    const addPageButton = (page: number, isActive = false) => {
      buttons.push(
        <Button
          key={page}
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(page)}
          className="h-8 w-8"
          disabled={isPending}
        >
          {page}
        </Button>
      )
    }
    
    // Always show first page
    addPageButton(1, validatedCurrentPage === 1)
    
    let startPage = Math.max(2, validatedCurrentPage - 1)
    let endPage = Math.min(totalPages - 1, validatedCurrentPage + 1)
    
    // Adjust when current page is near start or end
    if (validatedCurrentPage <= 3) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1)
    } else if (validatedCurrentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 2)
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      buttons.push(<span key="start-ellipsis" className="mx-1">...</span>)
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      addPageButton(i, validatedCurrentPage === i)
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      buttons.push(<span key="end-ellipsis" className="mx-1">...</span>)
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      addPageButton(totalPages, validatedCurrentPage === totalPages)
    }
    
    return buttons
  }
  
  return (
    <div className="flex items-center justify-between py-4 px-2 relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
         Showing  {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="500">500</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(validatedCurrentPage - 1)}
          disabled={validatedCurrentPage === 1 || isPending}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <div className="flex items-center">
          {generatePageButtons()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(validatedCurrentPage + 1)}
          disabled={validatedCurrentPage === totalPages || isPending}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  )
}
