'use client'

import { ActivityLog } from '@/packages/shared/api/supabase/types'
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  Calendar, 
  User, 
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react'

interface LeadActivityTimelineProps {
  leadId: string
  activities: ActivityLog[]
  onActivityAdd?: (activity: Partial<ActivityLog>) => Promise<void>
}

function getActivityIcon(activityType: string) {
  switch (activityType) {
    case 'phone_call_made':
    case 'phone_call_received':
      return <Phone className="w-4 h-4" />
    case 'email_sent':
    case 'email_received':
      return <Mail className="w-4 h-4" />
    case 'sms_sent':
    case 'sms_received':
      return <MessageSquare className="w-4 h-4" />
    case 'note_added':
      return <FileText className="w-4 h-4" />
    case 'follow_up_scheduled':
      return <Calendar className="w-4 h-4" />
    case 'lead_claimed':
    case 'lead_assigned':
      return <User className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

function getActivityColor(activityType: string, direction?: string | null) {
  const isInbound = direction === 'inbound'
  
  switch (activityType) {
    case 'phone_call_made':
    case 'phone_call_received':
      return isInbound ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'
    case 'email_sent':
    case 'email_received':
      return isInbound ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'sms_sent':
    case 'sms_received':
      return isInbound ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'note_added':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'follow_up_scheduled':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'lead_claimed':
    case 'lead_assigned':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'status_changed':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function formatActivityType(activityType: string): string {
  return activityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  // For older activities, show the actual date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export default function LeadActivityTimeline({ 
  leadId, 
  activities, 
  onActivityAdd 
}: LeadActivityTimelineProps) {
  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (sortedActivities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No activity recorded yet</p>
        <p className="text-sm">Activity will appear here as you interact with this lead</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity, index) => {
        const isLast = index === sortedActivities.length - 1
        
        return (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200" />
            )}
            
            {/* Activity item */}
            <div className="flex gap-4">
              {/* Icon */}
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white z-10
                ${getActivityColor(activity.activity_type, activity.direction)}
              `}>
                {getActivityIcon(activity.activity_type)}
                
                {/* Direction indicator */}
                {activity.direction && (
                  <div className="absolute -bottom-1 -right-1">
                    {activity.direction === 'inbound' ? (
                      <ArrowLeft className="w-3 h-3 text-green-600 bg-white rounded-full p-0.5 border border-green-200" />
                    ) : (
                      <ArrowRight className="w-3 h-3 text-blue-600 bg-white rounded-full p-0.5 border border-blue-200" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActivityColor(activity.activity_type, activity.direction)}`}
                      >
                        {formatActivityType(activity.activity_type)}
                      </Badge>
                      {activity.direction && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            activity.direction === 'inbound' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {activity.direction}
                        </Badge>
                      )}
                    </div>
                    
                    {activity.content && (
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatRelativeTime(activity.created_at)}</span>
                      
                      {activity.contact_method && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{activity.contact_method}</span>
                        </>
                      )}
                      
                      {activity.contact_value && (
                        <>
                          <span>•</span>
                          <span>{activity.contact_value}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Metadata display */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <details>
                          <summary className="cursor-pointer hover:text-gray-800">
                            Additional Details
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 ml-4">
                    {new Date(activity.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}