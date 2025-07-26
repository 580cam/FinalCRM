'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ClaimLeadDialog } from '@/components/ClaimLeadDialog'
import { AssignLeadDialog } from '@/components/AssignLeadDialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Lead, User, LeadsTableProps } from '@/types/leads'
import PaginationControl, { usePagination } from '@/components/PaginationControl'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { LeadsRealTimeSubscription } from '@/components/leads/LeadsRealTimeSubscription'

export default function LeadsTable({ 
  leads, 
  isAdmin, 
  currentUserId,
  users,
  tableType,
  pageSize = 25,
  currentPage = 1
}: LeadsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const selectedUserId = searchParams.get('userId') || 'all'
  
  // State for claim and assign dialogs
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  
  // Filter leads based on selectedUserId and tableType
  const filteredLeads = leads.filter(lead => {
    // For unclaimed leads table
    if (tableType === 'unclaimed') {
      return !lead.claimed_by && (lead.status === "LEAD" || lead.status === "HOT LEAD")
    }
    
    // For my leads table - if not admin, only show leads claimed by current user
    if (!isAdmin) {
      return lead.quotes?.some(quote => quote.user_id === currentUserId) || false
    }
    
    // For admin and filtering by specific user
    if (isAdmin && selectedUserId !== 'all') {
      const filterUserId = parseInt(selectedUserId)
      return lead.quotes?.some(quote => quote.user_id === filterUserId) || false
    }
    
    // Admin viewing all leads
    return true
  })
  
  // Calculate pagination 
  const totalItems = filteredLeads.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)
  
  // Handle pagination with loading state
  const handlePageChange = (page: number) => {
    startTransition(() => {
      // Create a new URLSearchParams instance
      const params = new URLSearchParams(searchParams.toString())
      
      // Only update if the page is actually changing
      const currentPage = params.get('page') || '1'
      if (page.toString() !== currentPage) {
        params.set('page', page.toString())
        
        // Ensure we preserve the tab parameter
        if (!params.has('tab') && tableType) {
          params.set('tab', tableType)
        }
        
        // Update the URL with the new params
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    })
  }
  
  // Handle page size change with loading state
  const handlePageSizeChange = (size: number) => {
    startTransition(() => {
      // Create a new URLSearchParams instance
      const params = new URLSearchParams(searchParams.toString())
      
      // Only update if the size is actually changing
      const currentSize = params.get('size') || '25'
      if (size.toString() !== currentSize) {
        params.set('size', size.toString())
        params.set('page', '1') // Reset to page 1 when changing page size
        
        // Ensure we preserve the tab parameter
        if (!params.has('tab') && tableType) {
          params.set('tab', tableType)
        }
        
        // Update the URL with the new params
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    })
  }
  
  // Function to open claim dialog
  const handleClaimClick = (leadId: number, quoteId: number | undefined) => {
    if (!quoteId) {
      toast.error("Cannot claim this lead", {
        description: "This lead doesn't have an associated quote."
      });
      return;
    }
    setSelectedLeadId(leadId);
    setSelectedQuoteId(quoteId);
    setClaimDialogOpen(true);
  }
  
  // Function to open assign dialog
  const handleAssignClick = (leadId: number, quoteId: number | undefined) => {
    if (!quoteId) {
      toast.error("Cannot assign this lead", {
        description: "This lead doesn't have an associated quote."
      });
      return;
    }
    setSelectedLeadId(leadId);
    setSelectedQuoteId(quoteId);
    setAssignDialogOpen(true);
  }
  
  // Refresh the table after dialog action
  const handleActionSuccess = () => {
    // Refresh the current page
    router.refresh()
  }
  
  // Handle real-time updates
  const handleLeadUpdate = () => {
    // Refresh the data
    router.refresh()
  }
  
  // If no leads are available after filtering
  if (filteredLeads.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500">
        No leads found. {isAdmin && selectedUserId !== 'all' && tableType === 'my-leads' && 'Try selecting a different user or clear the filter.'}
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Real-time subscription for lead updates */}
      <LeadsRealTimeSubscription onLeadUpdate={handleLeadUpdate} />
    
      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
    
      <div className="overflow-auto flex-1 rounded-md border">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b">
              <th className="h-12 pl-6 pr-3 text-left align-middle font-medium text-muted-foreground">Lead</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Status</th>
              {tableType === 'my-leads' && (
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Claimed By</th>
              )}
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Source</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Move Date</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Move Size</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Service Type</th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">Age</th>
              <th className="h-12 pl-3 pr-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => {
              // Find the user name for claimed_by
              const claimedByUser = users.find(user => {
                return lead.quotes?.some(quote => quote.user_id === user.id)
              })
              
              // Get the first quote ID (for claim/assign actions)
              const quoteId = lead.quotes?.[0]?.id
              
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{lead.name}</span>
                      {lead.email && <span className="text-xs text-gray-500">{lead.email}</span>}
                      {lead.phone && <span className="text-xs text-gray-500">{lead.phone}</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === "HOT LEAD" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}>
                      {lead.status}
                    </span>
                  </td>
                  {tableType === 'my-leads' && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{claimedByUser ? claimedByUser.name : lead.claimed_by || 'Unclaimed'}</span>
                        {isAdmin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full hover:bg-blue-50"
                                  onClick={() => handleAssignClick(lead.id, quoteId)}
                                >
                                  <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="text-blue-600"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reassign lead</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.source || 'Unknown'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="font-medium">{lead.move_date || 'Not set'}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.move_size || 'Unknown'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.service_type || 'Not set'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lead.age}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    {tableType === 'unclaimed' ? (
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleClaimClick(lead.id, quoteId)}
                        >
                          Claim
                        </Button>
                        
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleAssignClick(lead.id, quoteId)}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Link 
                        href={`/customers/${quoteId}/sales`} 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 rounded-md px-3 py-2"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <PaginationControl
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      
      {/* Dialogs */}
      <ClaimLeadDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        leadId={selectedLeadId}
        quoteId={selectedQuoteId}
        userId={currentUserId}
        onSuccess={handleActionSuccess}
      />
      
      <AssignLeadDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        leadId={selectedLeadId}
        quoteId={selectedQuoteId}
        users={users}
        onSuccess={handleActionSuccess}
      />
    </div>
  )
}
