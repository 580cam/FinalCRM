'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import {
  EnhancedCustomer,
  CustomerStatus,
  PipelineMetrics,
  CustomerPipelineProps,
  PipelineColumn,
  PipelineDragResult
} from '@/types/customers'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Pipeline stage configuration
const PIPELINE_STAGES: Record<CustomerStatus, { title: string; color: string; icon: React.ReactNode }> = {
  opportunity: {
    title: 'Opportunities',
    color: 'bg-blue-100 border-blue-300 text-blue-700',
    icon: <Clock className="h-4 w-4" />
  },
  booked: {
    title: 'Booked',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    icon: <Calendar className="h-4 w-4" />
  },
  confirmed: {
    title: 'Confirmed',
    color: 'bg-purple-100 border-purple-300 text-purple-700',
    icon: <CheckCircle className="h-4 w-4" />
  },
  in_progress: {
    title: 'In Progress',
    color: 'bg-orange-100 border-orange-300 text-orange-700',
    icon: <AlertCircle className="h-4 w-4" />
  },
  completed: {
    title: 'Completed',
    color: 'bg-green-100 border-green-300 text-green-700',
    icon: <CheckCircle className="h-4 w-4" />
  },
  reviewed: {
    title: 'Reviewed',
    color: 'bg-teal-100 border-teal-300 text-teal-700',
    icon: <CheckCircle className="h-4 w-4" />
  },
  closed: {
    title: 'Closed',
    color: 'bg-gray-100 border-gray-300 text-gray-700',
    icon: <XCircle className="h-4 w-4" />
  },
  claims: {
    title: 'Claims',
    color: 'bg-red-100 border-red-300 text-red-700',
    icon: <AlertCircle className="h-4 w-4" />
  },
  lost: {
    title: 'Lost',
    color: 'bg-gray-100 border-gray-300 text-gray-600',
    icon: <XCircle className="h-4 w-4" />
  }
}

// Individual customer card component
interface CustomerCardProps {
  customer: EnhancedCustomer
  isDragging?: boolean
  onCustomerSelect: (customer: EnhancedCustomer) => void
  onQuickCall?: (customer: EnhancedCustomer) => void
  onQuickEmail?: (customer: EnhancedCustomer) => void
}

function CustomerCard({ customer, isDragging, onCustomerSelect, onQuickCall, onQuickEmail }: CustomerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: customer.id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const handleQuickCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onQuickCall) {
      onQuickCall(customer)
    }
  }, [customer, onQuickCall])

  const handleQuickEmail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onQuickEmail) {
      onQuickEmail(customer)
    }
  }, [customer, onQuickEmail])

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getDaysUntilMove = () => {
    if (!customer.move_date) return null
    const moveDate = new Date(customer.move_date)
    const today = new Date()
    const diffTime = moveDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilMove = getDaysUntilMove()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCustomerSelect(customer)}
      className={cn(
        "bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        isDragging || isSortableDragging ? "shadow-lg border-blue-300" : "hover:border-gray-300"
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header with customer info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate text-gray-900">
                {customer.name || 'Unnamed Customer'}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {customer.email || customer.phone}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleQuickCall}>
                <Phone className="h-3 w-3 mr-2" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleQuickEmail}>
                <Mail className="h-3 w-3 mr-2" />
                Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Revenue and move date */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {formatRevenue(customer.estimated_revenue)}
              </span>
            </div>
            {customer.latest_quote && (
              <Badge variant="outline" className="text-xs">
                {customer.latest_quote.status}
              </Badge>
            )}
          </div>

          {customer.move_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {format(new Date(customer.move_date), 'MMM d')}
                {daysUntilMove !== null && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded text-xs font-medium",
                    daysUntilMove <= 7 
                      ? "bg-red-100 text-red-700" 
                      : daysUntilMove <= 30 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-green-100 text-green-700"
                  )}>
                    {daysUntilMove > 0 ? `${daysUntilMove}d` : 'Today'}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Addresses */}
        {(customer.addresses.origin || customer.addresses.destination) && (
          <div className="space-y-1">
            {customer.addresses.origin && (
              <div className="flex items-start space-x-1">
                <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 line-clamp-1">
                  {customer.addresses.origin}
                </span>
              </div>
            )}
            {customer.addresses.destination && customer.addresses.destination !== customer.addresses.origin && (
              <div className="flex items-start space-x-1">
                <MapPin className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 line-clamp-1">
                  {customer.addresses.destination}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Service type and assigned user */}
        <div className="flex items-center justify-between">
          {customer.service_type && (
            <Badge variant="secondary" className="text-xs">
              {customer.service_type}
            </Badge>
          )}
          {customer.assigned_user && (
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {customer.assigned_user.first_name} {customer.assigned_user.last_name}
              </span>
            </div>
          )}
        </div>

        {/* Last activity */}
        <div className="text-xs text-gray-500 border-t pt-2">
          {customer.last_contact_date ? (
            `Last contact ${formatDistanceToNow(new Date(customer.last_contact_date))} ago`
          ) : (
            `Created ${formatDistanceToNow(new Date(customer.created_at))} ago`
          )}
        </div>
      </div>
    </div>
  )
}

// Pipeline column component
interface PipelineColumnProps {
  column: PipelineColumn
  customers: EnhancedCustomer[]
  onCustomerSelect: (customer: EnhancedCustomer) => void
  onQuickCall?: (customer: EnhancedCustomer) => void
  onQuickEmail?: (customer: EnhancedCustomer) => void
}

function PipelineColumn({ column, customers, onCustomerSelect, onQuickCall, onQuickEmail }: PipelineColumnProps) {
  const stageConfig = PIPELINE_STAGES[column.id]
  
  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(amount)
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 h-full flex flex-col min-w-80">
      {/* Column Header */}
      <div className={cn(
        "px-4 py-3 border-b border-gray-200 rounded-t-lg",
        stageConfig.color
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {stageConfig.icon}
            <h3 className="font-medium text-sm">{stageConfig.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {customers.length}
            </Badge>
          </div>
          <div className="text-sm font-medium">
            {formatRevenue(column.total_value)}
          </div>
        </div>
      </div>

      {/* Customer Cards Container */}
      <div className="flex-1 p-3 overflow-y-auto">
        <SortableContext items={customers.map(c => c.id.toString())} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {customers.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onCustomerSelect={onCustomerSelect}
                onQuickCall={onQuickCall}
                onQuickEmail={onQuickEmail}
              />
            ))}
          </div>
        </SortableContext>
        
        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No customers in this stage</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main CustomerPipeline component
export default function CustomerPipeline({
  customers,
  metrics,
  onStatusChange,
  onCustomerSelect,
  isLoading,
  permissions
}: CustomerPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedCustomer, setDraggedCustomer] = useState<EnhancedCustomer | null>(null)

  // Group customers by status into pipeline columns
  const pipelineColumns = useMemo((): PipelineColumn[] => {
    const visibleStages: CustomerStatus[] = ['opportunity', 'booked', 'confirmed', 'in_progress', 'completed']
    
    return visibleStages.map(status => {
      const stageCustomers = customers.filter(customer => customer.status === status)
      const totalValue = stageCustomers.reduce((sum, customer) => sum + customer.estimated_revenue, 0)
      
      return {
        id: status,
        title: PIPELINE_STAGES[status].title,
        color: PIPELINE_STAGES[status].color,
        customers: stageCustomers.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        total_value: totalValue,
        count: stageCustomers.length
      }
    })
  }, [customers])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id.toString())
    
    const customer = customers.find(c => c.id.toString() === active.id.toString())
    setDraggedCustomer(customer || null)
  }, [customers])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDraggedCustomer(null)

    if (!over || !permissions.canChangeStatus) {
      return
    }

    const customerId = parseInt(active.id.toString())
    const customer = customers.find(c => c.id === customerId)
    
    if (!customer) {
      return
    }

    // Extract target status from the over container
    // The container ID should be the status
    const targetStatus = over.id.toString() as CustomerStatus
    
    if (customer.status === targetStatus) {
      return // No change needed
    }

    try {
      await onStatusChange(customerId, targetStatus)
      toast.success(`Customer moved to ${PIPELINE_STAGES[targetStatus].title}`)
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast.error('Failed to update customer status')
    }
  }, [customers, onStatusChange, permissions.canChangeStatus])

  const handleQuickCall = useCallback((customer: EnhancedCustomer) => {
    if (customer.phone) {
      window.open(`tel:${customer.phone}`, '_self')
      // Log activity
      toast.success(`Calling ${customer.name}`)
    } else {
      toast.error('No phone number available')
    }
  }, [])

  const handleQuickEmail = useCallback((customer: EnhancedCustomer) => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_blank')
      // Log activity
      toast.success(`Opening email to ${customer.name}`)
    } else {
      toast.error('No email address available')
    }
  }, [])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full">
        {/* Pipeline Overview */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(metrics.total_pipeline_value)}
              </div>
              <div className="text-sm text-gray-600">Pipeline Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(metrics.conversion_rate_this_month * 100)}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(metrics.average_deal_size)}
              </div>
              <div className="text-sm text-gray-600">Avg Deal Size</div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-6 pb-4 min-h-96">
            {pipelineColumns.map(column => (
              <PipelineColumn
                key={column.id}
                column={column}
                customers={column.customers}
                onCustomerSelect={onCustomerSelect}
                onQuickCall={handleQuickCall}
                onQuickEmail={handleQuickEmail}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedCustomer ? (
          <CustomerCard
            customer={draggedCustomer}
            isDragging
            onCustomerSelect={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}