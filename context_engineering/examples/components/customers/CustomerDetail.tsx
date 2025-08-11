'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { X, Phone, Mail, MessageSquare, Calendar, Plus, Edit, Save, User, MapPin, DollarSign, Clock, FileText, Camera, Star, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import {
  EnhancedCustomer,
  CustomerDetailProps,
  CustomerStatus,
  EnhancedQuote,
  EnhancedJob,
  CustomerActivity
} from '@/types/customers'
import { cn } from '@/lib/utils'
import ActivityTimeline from './ActivityTimeline'
import InventoryManager from './InventoryManager'
import QuoteManager from './QuoteManager'

// Status configuration for display
const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bgColor: string }> = {
  opportunity: { label: 'Opportunity', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  booked: { label: 'Booked', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Confirmed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  in_progress: { label: 'In Progress', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  reviewed: { label: 'Reviewed', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  closed: { label: 'Closed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  claims: { label: 'Claims', color: 'text-red-700', bgColor: 'bg-red-100' },
  lost: { label: 'Lost', color: 'text-gray-600', bgColor: 'bg-gray-100' }
}

// Quick actions bar
interface QuickActionsBarProps {
  customer: EnhancedCustomer
  onCall: () => void
  onEmail: () => void
  onText: () => void
  onSchedule: () => void
  onCreateQuote: () => void
  onAddNote: () => void
}

function QuickActionsBar({ customer, onCall, onEmail, onText, onSchedule, onCreateQuote, onAddNote }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b">
      <Button variant="outline" size="sm" onClick={onCall} className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Call
      </Button>
      <Button variant="outline" size="sm" onClick={onEmail} className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Email
      </Button>
      <Button variant="outline" size="sm" onClick={onText} className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Text
      </Button>
      <Button variant="outline" size="sm" onClick={onSchedule} className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Schedule
      </Button>
      <Button variant="outline" size="sm" onClick={onCreateQuote} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create Quote
      </Button>
      <Button variant="outline" size="sm" onClick={onAddNote} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Add Note
      </Button>
    </div>
  )
}

// Customer overview section
interface CustomerOverviewProps {
  customer: EnhancedCustomer
  onStatusChange: (status: CustomerStatus) => Promise<void>
  permissions: any
  isEditing: boolean
  onEditToggle: () => void
  onSave: (updates: Partial<EnhancedCustomer>) => void
}

function CustomerOverview({ customer, onStatusChange, permissions, isEditing, onEditToggle, onSave }: CustomerOverviewProps) {
  const [editData, setEditData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    move_date: customer.move_date || '',
    service_type: customer.service_type || '',
    notes: customer.notes || '',
    special_requirements: customer.special_requirements?.join(', ') || ''
  })

  const handleSave = useCallback(() => {
    onSave({
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      move_date: editData.move_date,
      service_type: editData.service_type,
      notes: editData.notes,
      special_requirements: editData.special_requirements.split(',').map(s => s.trim()).filter(Boolean)
    })
    onEditToggle()
  }, [editData, onSave, onEditToggle])

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-medium">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="font-semibold text-xl"
                  placeholder="Customer Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {customer.name || 'Unnamed Customer'}
                </h2>
              )}
              {permissions.canChangeStatus && (
                <Select
                  value={customer.status}
                  onValueChange={(value: CustomerStatus) => onStatusChange(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      <Badge className={cn(STATUS_CONFIG[customer.status].bgColor, STATUS_CONFIG[customer.status].color)}>
                        {STATUS_CONFIG[customer.status].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <Badge className={cn(config.bgColor, config.color)}>
                          {config.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>ID: {customer.id}</span>
              <span>Created {formatDistanceToNow(new Date(customer.created_at))} ago</span>
              {customer.source && <span>Source: {customer.source}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {permissions.canEdit && (
            <>
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={onEditToggle} size="sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={onEditToggle} size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              ) : (
                <span className="text-sm">{customer.email || 'No email'}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <Input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              ) : (
                <span className="text-sm">{customer.phone || 'No phone'}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Move Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.move_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, move_date: e.target.value }))}
                />
              ) : (
                <span className="text-sm">
                  {customer.move_date ? format(new Date(customer.move_date), 'PPP') : 'No move date'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <Input
                  value={editData.service_type}
                  onChange={(e) => setEditData(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="Service type"
                />
              ) : (
                <span className="text-sm">{customer.service_type || 'No service type'}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Revenue</span>
              <span className="text-sm font-medium text-green-600">
                {formatRevenue(customer.estimated_revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latest Quote</span>
              <span className="text-sm font-medium">
                {customer.latest_quote 
                  ? formatRevenue(customer.latest_quote.total_amount) 
                  : 'No quotes'}
              </span>
            </div>
            {customer.deposit_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deposit</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {formatRevenue(customer.deposit_amount)}
                  </span>
                  <Badge variant={customer.deposit_paid ? 'default' : 'destructive'} className="text-xs">
                    {customer.deposit_paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Addresses */}
      {(customer.addresses.origin || customer.addresses.destination) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.addresses.origin && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Origin</div>
                  <div className="text-sm">{customer.addresses.origin}</div>
                </div>
              </div>
            )}
            {customer.addresses.destination && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Destination</div>
                  <div className="text-sm">{customer.addresses.destination}</div>
                </div>
              </div>
            )}
            {customer.addresses.additional_stops && customer.addresses.additional_stops.length > 0 && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Additional Stops</div>
                  <div className="space-y-1">
                    {customer.addresses.additional_stops.map((stop, index) => (
                      <div key={index} className="text-sm">{stop}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes and Special Requirements */}
      {(customer.notes || customer.special_requirements?.length || isEditing) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Notes & Special Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(customer.notes || isEditing) && (
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium mb-2">Notes</div>
                {isEditing ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Customer notes..."
                    rows={3}
                  />
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{customer.notes}</div>
                )}
              </div>
            )}
            {(customer.special_requirements?.length || isEditing) && (
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium mb-2">Special Requirements</div>
                {isEditing ? (
                  <Input
                    value={editData.special_requirements}
                    onChange={(e) => setEditData(prev => ({ ...prev, special_requirements: e.target.value }))}
                    placeholder="Special requirements (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {customer.special_requirements?.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Assignment */}
      {(customer.assigned_user || customer.sales_rep || customer.account_manager) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Team Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.assigned_user && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Assigned To</div>
                  <div className="text-sm">
                    {customer.assigned_user.first_name} {customer.assigned_user.last_name}
                  </div>
                </div>
              </div>
            )}
            {customer.sales_rep && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Sales Rep</div>
                  <div className="text-sm">
                    {customer.sales_rep.first_name} {customer.sales_rep.last_name}
                  </div>
                </div>
              </div>
            )}
            {customer.account_manager && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-medium">Account Manager</div>
                  <div className="text-sm">
                    {customer.account_manager.first_name} {customer.account_manager.last_name}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Main CustomerDetail component
export default function CustomerDetail({
  customer,
  isOpen,
  onClose,
  onCustomerUpdate,
  onStatusChange,
  permissions
}: CustomerDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleQuickCall = useCallback(() => {
    if (customer?.phone) {
      window.open(`tel:${customer.phone}`, '_self')
      toast.success(`Calling ${customer.name}`)
    } else {
      toast.error('No phone number available')
    }
  }, [customer])

  const handleQuickEmail = useCallback(() => {
    if (customer?.email) {
      window.open(`mailto:${customer.email}`, '_blank')
      toast.success(`Opening email to ${customer.name}`)
    } else {
      toast.error('No email address available')
    }
  }, [customer])

  const handleQuickText = useCallback(() => {
    if (customer?.phone) {
      window.open(`sms:${customer.phone}`, '_self')
      toast.success(`Opening SMS to ${customer.name}`)
    } else {
      toast.error('No phone number available')
    }
  }, [customer])

  const handleSchedule = useCallback(() => {
    toast.info('Schedule feature coming soon')
  }, [])

  const handleCreateQuote = useCallback(() => {
    toast.info('Create quote feature coming soon')
  }, [])

  const handleAddNote = useCallback(() => {
    toast.info('Add note feature coming soon')
  }, [])

  const handleCustomerSave = useCallback(async (updates: Partial<EnhancedCustomer>) => {
    try {
      await onCustomerUpdate({ ...customer!, ...updates })
      toast.success('Customer updated successfully')
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
    }
  }, [customer, onCustomerUpdate])

  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Customer Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <QuickActionsBar
          customer={customer}
          onCall={handleQuickCall}
          onEmail={handleQuickEmail}
          onText={handleQuickText}
          onSchedule={handleSchedule}
          onCreateQuote={handleCreateQuote}
          onAddNote={handleAddNote}
        />

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 rounded-none border-b">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Quotes
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="p-6 h-full m-0">
                <CustomerOverview
                  customer={customer}
                  onStatusChange={onStatusChange}
                  permissions={permissions}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  onSave={handleCustomerSave}
                />
              </TabsContent>

              <TabsContent value="quotes" className="p-6 h-full m-0">
                <QuoteManager
                  customerId={customer.id}
                  quotes={customer.quotes}
                  onQuoteCreate={handleCreateQuote}
                  onQuoteUpdate={() => {}}
                  onQuoteSend={() => {}}
                  permissions={{ canCreate: true, canEdit: true, canSend: true, canApprove: true, canViewCosts: true, canApplyDiscounts: true, requiresApproval: false }}
                />
              </TabsContent>

              <TabsContent value="inventory" className="p-6 h-full m-0">
                <InventoryManager
                  customerId={customer.id}
                  inventory={customer.inventory}
                  onInventoryUpdate={() => Promise.resolve()}
                  onYemboSync={() => Promise.resolve()}
                />
              </TabsContent>

              <TabsContent value="activity" className="p-6 h-full m-0">
                <ActivityTimeline
                  customerId={customer.id}
                  activities={customer.activities}
                  onActivityAdd={() => Promise.resolve()}
                />
              </TabsContent>

              <TabsContent value="jobs" className="p-6 h-full m-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job History</h3>
                  {customer.jobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No jobs scheduled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customer.jobs.map(job => (
                        <Card key={job.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{job.service_type || 'Moving Service'}</h4>
                                <p className="text-sm text-gray-500">
                                  {job.scheduled_date ? format(new Date(job.scheduled_date), 'PPP') : 'Not scheduled'}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {job.job_status || 'Pending'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="p-6 h-full m-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Photos & Documents</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No photos uploaded yet</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}