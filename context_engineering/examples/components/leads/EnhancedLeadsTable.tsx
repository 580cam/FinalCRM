'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { EnhancedLead, QuickActionType } from '@/types/leads'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import PaginationControl from '@/components/PaginationControl'
import { Loader2, Phone, Mail, MessageSquare, User, Star, TrendingUp } from 'lucide-react'
import { LeadsRealTimeSubscription } from '@/components/leads/LeadsRealTimeSubscription'
import { ClaimLeadDialog } from '@/components/ClaimLeadDialog'
import { AssignLeadDialog } from '@/components/AssignLeadDialog'
import LeadDetailModal from '@/components/leads/LeadDetailModal'
import QuickActionsMenu from '@/components/leads/QuickActionsMenu'
import { getStatusColor, getPriorityColor } from '@/lib/utils/leadUtils'

interface User {
  id: string
  name: string
}

interface EnhancedLeadsTableProps {
  leads: EnhancedLead[]
  isAdmin: boolean
  currentUserId: string
  users: User[]
  tableType: 'unclaimed' | 'my-leads'
  pageSize: number
  currentPage: number
}

export default function EnhancedLeadsTable({ 
  leads, 
  isAdmin, 
  currentUserId,
  users,
  tableType,
  pageSize = 25,
  currentPage = 1
}: EnhancedLeadsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Dialog states
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<EnhancedLead | null>(null)
  
  // Calculate pagination 
  const totalItems = leads.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedLeads = leads.slice(startIndex, endIndex)
  
  // Handle pagination with loading state
  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      const currentPage = params.get('page') || '1'
      if (page.toString() !== currentPage) {
        params.set('page', page.toString())
        
        if (!params.has('tab') && tableType) {
          params.set('tab', tableType)
        }
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    })
  }
  
  const handlePageSizeChange = (size: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      const currentSize = params.get('size') || '25'
      if (size.toString() !== currentSize) {
        params.set('size', size.toString())
        params.set('page', '1')
        
        if (!params.has('tab') && tableType) {
          params.set('tab', tableType)
        }
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }
    })
  }
  
  // Function to open claim dialog
  const handleClaimClick = (lead: EnhancedLead) => {
    const quoteId = lead.latest_quote?.id
    if (!quoteId) {
      toast.error("Cannot claim this lead", {
        description: "This lead doesn't have an associated quote."
      });
      return;
    }
    setSelectedLeadId(lead.id);
    setSelectedQuoteId(quoteId);
    setClaimDialogOpen(true);
  }
  
  // Function to open assign dialog
  const handleAssignClick = (lead: EnhancedLead) => {
    const quoteId = lead.latest_quote?.id
    if (!quoteId) {
      toast.error("Cannot assign this lead", {
        description: "This lead doesn't have an associated quote."
      });
      return;
    }
    setSelectedLeadId(lead.id);
    setSelectedQuoteId(quoteId);
    setAssignDialogOpen(true);
  }

  // Function to open lead detail modal
  const handleViewDetails = (lead: EnhancedLead) => {
    setSelectedLead(lead)
    setDetailModalOpen(true)
  }

  // Handle quick actions
  const handleQuickAction = async (lead: EnhancedLead, action: QuickActionType, data?: any) => {
    try {
      switch (action) {
        case 'call':
          // Implement phone call action
          if (lead.phone) {
            window.open(`tel:${lead.phone}`)
            // Log activity
            toast.success(`Calling ${lead.name}`)
          } else {
            toast.error('No phone number available')
          }
          break
          
        case 'email':
          // Implement email action
          if (lead.email) {
            window.open(`mailto:${lead.email}`)
            toast.success(`Opening email to ${lead.name}`)
          } else {
            toast.error('No email address available')
          }
          break
          
        case 'text':
          // Implement SMS action
          if (lead.phone) {
            window.open(`sms:${lead.phone}`)
            toast.success(`Opening text to ${lead.name}`)
          } else {
            toast.error('No phone number available')
          }
          break
          
        case 'note':
          // Open detail modal with note focus
          setSelectedLead(lead)
          setDetailModalOpen(true)
          break
          
        default:
          console.log(`Action ${action} not implemented yet`)
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error)
      toast.error('Action failed', {
        description: 'Please try again later'
      })
    }
  }
  
  // Refresh the table after dialog action
  const handleActionSuccess = () => {
    router.refresh()
  }
  
  // Handle real-time updates
  const handleLeadUpdate = () => {
    router.refresh()
  }
  
  // If no leads are available
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
        <p className="text-gray-500 mb-4">
          {tableType === 'unclaimed' 
            ? 'There are no unclaimed leads at the moment.' 
            : 'You have no assigned leads right now.'}
        </p>
        {tableType === 'unclaimed' && (
          <Button variant="outline">
            <User className="w-4 h-4 mr-2" />
            Create New Lead
          </Button>
        )}
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
              <th className="h-12 pl-6 pr-3 text-left align-middle font-medium text-muted-foreground">
                Lead Info
              </th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">
                Status & Priority
              </th>
              {tableType === 'my-leads' && (
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">
                  Assigned To
                </th>
              )}
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">
                Move Details
              </th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">
                Lead Score
              </th>
              <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground">
                Activity
              </th>
              <th className="h-12 pl-3 pr-6 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => {
              const quoteId = lead.latest_quote?.id
              
              return (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(lead)}
                >
                  {/* Lead Info */}
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{lead.name}</span>
                      {lead.email && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mt-1">
                        {lead.age_display} • {lead.source}
                      </span>
                    </div>
                  </td>
                  
                  {/* Status & Priority */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex flex-col gap-2">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(lead.status)}
                      >
                        {lead.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          lead.priority === 'hot' ? 'bg-red-500' :
                          lead.priority === 'warm' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <span className={`text-xs font-medium capitalize ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Assigned To (My Leads only) */}
                  {tableType === 'my-leads' && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{lead.claimed_by || 'Unassigned'}</span>
                        {isAdmin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAssignClick(lead)
                                  }}
                                >
                                  <User className="w-3 h-3 text-blue-600" />
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
                  
                  {/* Move Details */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {lead.move_date_display || 'Not set'}
                      </span>
                      {lead.move_size && (
                        <span className="text-xs text-gray-400">
                          {lead.move_size.replace('_', ' ')}
                        </span>
                      )}
                      {lead.service_type && (
                        <span className="text-xs text-gray-400">
                          {lead.service_type}
                        </span>
                      )}
                      {lead.estimated_value && (
                        <span className="text-xs font-medium text-green-600">
                          ${lead.estimated_value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Lead Score */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">{lead.lead_score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-yellow-500 h-1 rounded-full" 
                          style={{ width: `${lead.lead_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {lead.conversion_probability}% likely
                      </span>
                    </div>
                  </td>
                  
                  {/* Activity */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-xs">
                        {lead.total_interactions} interactions
                      </span>
                      {lead.last_contact_date && (
                        <span className="text-xs text-gray-400">
                          Last: {new Date(lead.last_contact_date).toLocaleDateString()}
                        </span>
                      )}
                      {lead.next_follow_up_date && (
                        <span className="text-xs text-blue-600">
                          Follow-up: {new Date(lead.next_follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {tableType === 'unclaimed' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClaimClick(lead)
                            }}
                          >
                            Claim
                          </Button>
                          
                          {isAdmin && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssignClick(lead)
                              }}
                            >
                              Assign
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleQuickAction(lead, 'call')
                                    }}
                                  >
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Call</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleQuickAction(lead, 'email')
                                    }}
                                  >
                                    <Mail className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Email</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleQuickAction(lead, 'text')
                                    }}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Text</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <QuickActionsMenu 
                              lead={lead}
                              onAction={handleQuickAction}
                            />
                          </div>
                        </>
                      )}
                    </div>
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
      
      <LeadDetailModal
        lead={selectedLead}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onLeadUpdate={(updatedLead) => {
          // Handle lead update
          handleActionSuccess()
        }}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </div>
  )
}