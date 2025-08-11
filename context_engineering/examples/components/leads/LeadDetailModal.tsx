'use client'

import { useState, useEffect } from 'react'
import { EnhancedLead, ContactMethod, LeadActivityType } from '@/types/leads'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Star,
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  Activity,
  Plus,
  X
} from 'lucide-react'
import { getStatusColor, getPriorityColor, formatMoveDate } from '@/lib/utils/leadUtils'
import LeadActivityTimeline from '@/components/leads/LeadActivityTimeline'

interface LeadDetailModalProps {
  lead: EnhancedLead | null
  isOpen: boolean
  onClose: () => void
  onLeadUpdate: (updatedLead: EnhancedLead) => void
  currentUserId: string
  isAdmin: boolean
}

interface NewActivityForm {
  type: LeadActivityType
  method: ContactMethod
  title: string
  content: string
  direction: 'inbound' | 'outbound'
}

const activityTypes: Array<{ value: LeadActivityType; label: string }> = [
  { value: 'phone_call_made', label: 'Phone Call Made' },
  { value: 'phone_call_received', label: 'Phone Call Received' },
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'email_received', label: 'Email Received' },
  { value: 'sms_sent', label: 'SMS Sent' },
  { value: 'sms_received', label: 'SMS Received' },
  { value: 'note_added', label: 'Note Added' },
  { value: 'follow_up_scheduled', label: 'Follow-up Scheduled' },
  { value: 'status_changed', label: 'Status Changed' }
]

const contactMethods: Array<{ value: ContactMethod; label: string }> = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'in_person', label: 'In Person' },
  { value: 'whatsapp', label: 'WhatsApp' }
]

export default function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onLeadUpdate,
  currentUserId,
  isAdmin
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [newActivity, setNewActivity] = useState<NewActivityForm>({
    type: 'note_added',
    method: 'phone',
    title: '',
    content: '',
    direction: 'outbound'
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && lead) {
      setActiveTab('overview')
      setIsAddingActivity(false)
      setNewActivity({
        type: 'note_added',
        method: 'phone',
        title: '',
        content: '',
        direction: 'outbound'
      })
    }
  }, [isOpen, lead])

  if (!lead) return null

  const handleAddActivity = async () => {
    try {
      if (!newActivity.title.trim()) {
        toast.error('Please enter an activity title')
        return
      }

      // TODO: Implement API call to add activity
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: lead.id,
          quote_id: lead.latest_quote?.id,
          user_id: currentUserId,
          activity_type: newActivity.type,
          direction: newActivity.direction,
          title: newActivity.title,
          content: newActivity.content,
          contact_method: newActivity.method,
          contact_value: newActivity.method === 'phone' ? lead.phone : lead.email
        })
      })

      if (response.ok) {
        toast.success('Activity added successfully')
        setIsAddingActivity(false)
        setNewActivity({
          type: 'note_added',
          method: 'phone',
          title: '',
          content: '',
          direction: 'outbound'
        })
        // Trigger refresh
        onLeadUpdate(lead)
      } else {
        throw new Error('Failed to add activity')
      }
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error('Failed to add activity')
    }
  }

  const handleQuickCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`)
      // Auto-populate activity form
      setNewActivity(prev => ({
        ...prev,
        type: 'phone_call_made',
        method: 'phone',
        title: `Called ${lead.name}`,
        direction: 'outbound'
      }))
      setIsAddingActivity(true)
    }
  }

  const handleQuickEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`)
      setNewActivity(prev => ({
        ...prev,
        type: 'email_sent',
        method: 'email',
        title: `Emailed ${lead.name}`,
        direction: 'outbound'
      }))
      setIsAddingActivity(true)
    }
  }

  const handleQuickText = () => {
    if (lead.phone) {
      window.open(`sms:${lead.phone}`)
      setNewActivity(prev => ({
        ...prev,
        type: 'sms_sent',
        method: 'sms',
        title: `Texted ${lead.name}`,
        direction: 'outbound'
      }))
      setIsAddingActivity(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{lead.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    lead.priority === 'hot' ? 'bg-red-500' :
                    lead.priority === 'warm' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <span className={`text-sm font-medium capitalize ${getPriorityColor(lead.priority)}`}>
                    {lead.priority} priority
                  </span>
                </div>
              </DialogDescription>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {lead.phone && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleQuickCall}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              )}
              {lead.email && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleQuickEmail}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              )}
              {lead.phone && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleQuickText}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Text
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">
              Activity ({lead.activities?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followups">
              Follow-ups ({lead.follow_ups?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="m-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="space-y-3">
                  {lead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Created {lead.age_display}</span>
                  </div>
                  {lead.claimed_by && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Claimed by {lead.claimed_by}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Scoring */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lead Intelligence</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Lead Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${lead.lead_score}%` }}
                        />
                      </div>
                      <span className="font-medium">{lead.lead_score}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Conversion Likelihood</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {lead.conversion_probability}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Total Interactions</span>
                    </div>
                    <span className="font-medium">{lead.total_interactions}</span>
                  </div>
                </div>
              </div>

              {/* Move Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Move Details</h3>
                <div className="space-y-3">
                  {lead.move_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{lead.move_date_display}</span>
                      {lead.days_until_move !== undefined && (
                        <Badge variant={lead.days_until_move <= 14 ? "destructive" : "secondary"}>
                          {lead.days_until_move} days
                        </Badge>
                      )}
                    </div>
                  )}
                  {lead.move_size && (
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span>{lead.move_size.replace('_', ' ')}</span>
                    </div>
                  )}
                  {lead.service_type && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{lead.service_type}</span>
                    </div>
                  )}
                  {lead.estimated_value && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-600">
                        ${lead.estimated_value.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lead Source</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Primary Source:</span>
                    <span>{lead.source}</span>
                  </div>
                  {lead.utm_source && (
                    <div className="text-sm text-gray-600">
                      <div>UTM Source: {lead.utm_source}</div>
                      {lead.utm_medium && <div>UTM Medium: {lead.utm_medium}</div>}
                      {lead.utm_campaign && <div>UTM Campaign: {lead.utm_campaign}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="m-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                <Button
                  onClick={() => setIsAddingActivity(!isAddingActivity)}
                  size="sm"
                  variant={isAddingActivity ? "outline" : "default"}
                >
                  {isAddingActivity ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </>
                  )}
                </Button>
              </div>

              {/* Add Activity Form */}
              {isAddingActivity && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="activity-type">Activity Type</Label>
                        <Select 
                          value={newActivity.type}
                          onValueChange={(value: LeadActivityType) => 
                            setNewActivity(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {activityTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="contact-method">Contact Method</Label>
                        <Select 
                          value={newActivity.method}
                          onValueChange={(value: ContactMethod) => 
                            setNewActivity(prev => ({ ...prev, method: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contactMethods.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="activity-title">Title</Label>
                      <Input
                        id="activity-title"
                        value={newActivity.title}
                        onChange={(e) => 
                          setNewActivity(prev => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Brief description of the activity"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="activity-content">Notes (Optional)</Label>
                      <Textarea
                        id="activity-content"
                        value={newActivity.content}
                        onChange={(e) => 
                          setNewActivity(prev => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Additional details about this activity..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingActivity(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddActivity}>
                        Add Activity
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <ScrollArea className="h-96">
                <LeadActivityTimeline
                  leadId={lead.id}
                  activities={lead.activities || []}
                  onActivityAdd={handleAddActivity}
                />
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="followups" className="m-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Follow-ups</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </div>
              
              {lead.follow_ups && lead.follow_ups.length > 0 ? (
                <div className="space-y-3">
                  {lead.follow_ups.map(followUp => (
                    <div key={followUp.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {new Date(followUp.follow_up_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {followUp.method} • {followUp.status}
                          </div>
                          {followUp.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              {followUp.notes}
                            </div>
                          )}
                        </div>
                        <Badge 
                          variant={followUp.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {followUp.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No follow-ups scheduled</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="m-6">
            <div className="space-y-6">
              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Lead ID:</span> {lead.id}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(lead.created_at).toLocaleString()}
                  </div>
                  {lead.updated_at && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(lead.updated_at).toLocaleString()}
                    </div>
                  )}
                  {lead.latest_quote && (
                    <div>
                      <span className="font-medium">Quote ID:</span> {lead.latest_quote.id}
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Information */}
              {lead.latest_quote && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span> {lead.latest_quote.status}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(lead.latest_quote.created_at).toLocaleString()}
                      </div>
                      {lead.latest_quote.total && (
                        <div>
                          <span className="font-medium">Total:</span> ${lead.latest_quote.total.toLocaleString()}
                        </div>
                      )}
                      {lead.latest_quote.calculation_mode && (
                        <div>
                          <span className="font-medium">Calculation Mode:</span> {lead.latest_quote.calculation_mode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}