'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText, 
  DollarSign,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Video,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CustomerActivity,
  ContactMethod
} from '@/types/customers'
import { cn } from '@/lib/utils'

// Activity type configuration
const ACTIVITY_TYPES = {
  communication: {
    phone: { label: 'Phone Call', icon: <Phone className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
    email: { label: 'Email', icon: <Mail className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' },
    sms: { label: 'SMS', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    in_person: { label: 'In-Person', icon: <Users className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' },
    video: { label: 'Video Call', icon: <Video className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700' }
  },
  quote: {
    generated: { label: 'Quote Generated', icon: <FileText className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700' },
    sent: { label: 'Quote Sent', icon: <Mail className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
    viewed: { label: 'Quote Viewed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    accepted: { label: 'Quote Accepted', icon: <Star className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    expired: { label: 'Quote Expired', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-700' }
  },
  job: {
    scheduled: { label: 'Job Scheduled', icon: <Calendar className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
    started: { label: 'Job Started', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Job Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    rescheduled: { label: 'Job Rescheduled', icon: <Calendar className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' }
  },
  payment: {
    deposit: { label: 'Deposit Received', icon: <DollarSign className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    payment: { label: 'Payment Received', icon: <DollarSign className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    refund: { label: 'Refund Issued', icon: <DollarSign className="h-4 w-4" />, color: 'bg-red-100 text-red-700' }
  },
  issue: {
    claim: { label: 'Claim Filed', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-700' },
    complaint: { label: 'Complaint Received', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' },
    resolved: { label: 'Issue Resolved', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-700' }
  }
}

// Add activity dialog
interface AddActivityDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (activity: Partial<CustomerActivity>) => Promise<void>
  activity?: CustomerActivity | null
}

function AddActivityDialog({ isOpen, onClose, onSave, activity }: AddActivityDialogProps) {
  const [formData, setFormData] = useState({
    activity_category: activity?.activity_category || 'communication',
    activity_type: activity?.activity_type || '',
    communication_method: activity?.communication_method || 'phone',
    title: activity?.title || '',
    description: activity?.description || '',
    outcome: activity?.outcome || '',
    follow_up_required: activity?.follow_up_required || false,
    follow_up_date: activity?.follow_up_date || '',
    satisfaction_rating: activity?.satisfaction_rating || 0,
    metadata: activity?.metadata || {}
  })

  const handleSave = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Activity title is required')
      return
    }

    try {
      await onSave({
        ...activity,
        ...formData,
        created_at: activity?.created_at || new Date().toISOString()
      })
      onClose()
      toast.success(activity ? 'Activity updated' : 'Activity added')
    } catch (error) {
      toast.error('Failed to save activity')
    }
  }, [formData, activity, onSave, onClose])

  const getActivityTypeOptions = () => {
    const category = formData.activity_category as keyof typeof ACTIVITY_TYPES
    return Object.entries(ACTIVITY_TYPES[category] || {}).map(([key, config]) => ({
      value: key,
      label: config.label
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.activity_category}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  activity_category: value as any,
                  activity_type: '' // Reset activity type when category changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {getActivityTypeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.activity_category === 'communication' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication Method</label>
              <Select
                value={formData.communication_method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, communication_method: value as ContactMethod }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the activity"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the activity"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Outcome</label>
            <Textarea
              value={formData.outcome}
              onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
              placeholder="What was the result or outcome?"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="follow_up_required"
              checked={formData.follow_up_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, follow_up_required: checked as boolean }))}
            />
            <label htmlFor="follow_up_required" className="text-sm">Follow-up required</label>
          </div>

          {formData.follow_up_required && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Follow-up Date</label>
              <Input
                type="datetime-local"
                value={formData.follow_up_date}
                onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
              />
            </div>
          )}

          {formData.activity_category === 'communication' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Satisfaction Rating (1-5)</label>
              <Select
                value={formData.satisfaction_rating?.toString() || '0'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, satisfaction_rating: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No rating</SelectItem>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {activity ? 'Update' : 'Add'} Activity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Activity timeline item component
interface ActivityItemProps {
  activity: CustomerActivity
  onEdit: (activity: CustomerActivity) => void
  onDelete: (activityId: string) => void
  isFirst: boolean
  isLast: boolean
}

function ActivityItem({ activity, onEdit, onDelete, isFirst, isLast }: ActivityItemProps) {
  const getActivityConfig = () => {
    const category = ACTIVITY_TYPES[activity.activity_category as keyof typeof ACTIVITY_TYPES]
    if (!category) return { label: activity.activity_type, icon: <FileText className="h-4 w-4" />, color: 'bg-gray-100 text-gray-700' }
    
    const type = category[activity.activity_type as keyof typeof category]
    return type || { label: activity.activity_type, icon: <FileText className="h-4 w-4" />, color: 'bg-gray-100 text-gray-700' }
  }

  const config = getActivityConfig()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`
    return format(date, 'MMM d, yyyy h:mm a')
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
      )}
      
      {/* Activity icon */}
      <div className={cn(
        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white shadow-sm",
        config.color
      )}>
        {config.icon}
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  {activity.communication_method && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.communication_method}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">{formatDate(activity.created_at)}</p>

                {activity.description && (
                  <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                )}

                {activity.outcome && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Outcome</div>
                    <p className="text-sm text-gray-700">{activity.outcome}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {activity.user && (
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {getInitials(`${activity.user.first_name} ${activity.user.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{activity.user.first_name} {activity.user.last_name}</span>
                    </div>
                  )}
                  
                  {activity.satisfaction_rating && activity.satisfaction_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{activity.satisfaction_rating}/5</span>
                    </div>
                  )}
                  
                  {activity.follow_up_required && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Follow-up needed
                    </Badge>
                  )}
                </div>

                {activity.follow_up_date && activity.follow_up_required && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-medium text-yellow-800">Follow-up scheduled:</div>
                    <div className="text-yellow-700">
                      {format(new Date(activity.follow_up_date), 'PPpp')}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(activity)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(activity.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main ActivityTimeline component
interface ActivityTimelineProps {
  customerId: number
  activities: CustomerActivity[]
  onActivityAdd: (activity: Partial<CustomerActivity>) => Promise<void>
}

export default function ActivityTimeline({ customerId, activities, onActivityAdd }: ActivityTimelineProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<CustomerActivity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = searchTerm === '' || 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.outcome?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || activity.activity_category === categoryFilter
      
      return matchesSearch && matchesCategory
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [activities, searchTerm, categoryFilter])

  const handleAddActivity = useCallback(async (activityData: Partial<CustomerActivity>) => {
    try {
      setIsLoading(true)
      await onActivityAdd({
        ...activityData,
        customer_id: customerId,
        user_id: 'current_user' // Replace with actual user ID
      })
    } catch (error) {
      console.error('Error adding activity:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [customerId, onActivityAdd])

  const handleEditActivity = useCallback(async (activityData: Partial<CustomerActivity>) => {
    try {
      setIsLoading(true)
      await onActivityAdd(activityData) // Assuming the same function handles updates
      setEditingActivity(null)
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onActivityAdd])

  const handleDeleteActivity = useCallback(async (activityId: string) => {
    try {
      setIsLoading(true)
      // This would typically call an API to delete the activity
      toast.success('Activity deleted')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get activity statistics
  const activityStats = useMemo(() => {
    const totalActivities = activities.length
    const pendingFollowUps = activities.filter(a => a.follow_up_required && 
      (!a.follow_up_date || new Date(a.follow_up_date) < new Date())).length
    const communicationActivities = activities.filter(a => a.activity_category === 'communication').length
    const avgSatisfaction = activities
      .filter(a => a.satisfaction_rating && a.satisfaction_rating > 0)
      .reduce((sum, a) => sum + (a.satisfaction_rating || 0), 0) / 
      activities.filter(a => a.satisfaction_rating && a.satisfaction_rating > 0).length || 0

    return {
      totalActivities,
      pendingFollowUps,
      communicationActivities,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10
    }
  }, [activities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Activity Timeline</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activityStats.totalActivities}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{activityStats.pendingFollowUps}</div>
            <div className="text-sm text-gray-600">Pending Follow-ups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activityStats.communicationActivities}</div>
            <div className="text-sm text-gray-600">Communications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {activityStats.avgSatisfaction > 0 ? activityStats.avgSatisfaction.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-gray-600">Avg Satisfaction</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="quote">Quote</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="issue">Issue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activities.length === 0 ? 'No activities yet' : 'No activities match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activities.length === 0 
                ? 'Start tracking customer interactions by adding your first activity'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {activities.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {filteredActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onEdit={setEditingActivity}
                onDelete={handleDeleteActivity}
                isFirst={index === 0}
                isLast={index === filteredActivities.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Activity Dialog */}
      <AddActivityDialog
        isOpen={isAddDialogOpen || editingActivity !== null}
        onClose={() => {
          setIsAddDialogOpen(false)
          setEditingActivity(null)
        }}
        onSave={editingActivity ? handleEditActivity : handleAddActivity}
        activity={editingActivity}
      />
    </div>
  )
}