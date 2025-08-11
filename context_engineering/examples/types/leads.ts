// Enhanced Lead Management Types for CRM Web Application
// Built on top of existing Supabase database types

import { 
  Lead as BaseLead,
  Quote,
  ActivityLog,
  User,
  FollowUp
} from '@/packages/shared/api/supabase/types'

// Extended Lead interface with computed fields and relationships
export interface EnhancedLead extends BaseLead {
  // Relationship data
  quotes?: EnhancedQuote[]
  latest_quote?: EnhancedQuote
  activities?: ActivityLog[]
  follow_ups?: FollowUp[]
  
  // Computed fields for display
  status: LeadDisplayStatus
  priority: LeadPriority
  age_in_minutes: number
  age_display: string
  claimed_by?: string
  claimed_by_user?: User
  move_date?: string
  move_date_display?: string
  move_size?: string
  service_type?: string
  source?: string
  estimated_value?: number
  
  // UTM and attribution data
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referral_source?: string
  
  // Lead scoring
  lead_score: number
  conversion_probability: number
  
  // Activity summary
  last_contact_date?: string
  last_contact_method?: ContactMethod
  total_interactions: number
  next_follow_up_date?: string
  days_until_move?: number
}

// Enhanced Quote with user information
export interface EnhancedQuote extends Quote {
  user?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  jobs?: Array<{
    id: string
    move_date: string | null
  }>
}

// Lead display status (extends database status with computed states)
export type LeadDisplayStatus = 
  | 'HOT LEAD'           // First 5 minutes
  | 'LEAD'               // After 5 minutes, unclaimed
  | 'NEW'                // Claimed but not contacted
  | 'CONTACTED'          // First contact made
  | 'QUALIFIED'          // Lead shows interest and fits criteria
  | 'QUOTE_PENDING'      // Quote has been sent
  | 'QUOTE_SENT'         // Quote delivered
  | 'FOLLOW_UP_NEEDED'   // Requires follow-up action
  | 'LOST'               // Lead lost to competitor or not interested
  | 'WON'                // Lead converted to customer

// Lead priority system
export type LeadPriority = 'hot' | 'warm' | 'cold'

// Contact methods for activity logging
export type ContactMethod = 'phone' | 'email' | 'sms' | 'in_person' | 'whatsapp'

// Activity types specific to leads
export type LeadActivityType = 
  | 'lead_created'
  | 'lead_claimed'
  | 'lead_assigned'
  | 'phone_call_made'
  | 'phone_call_received'
  | 'email_sent'
  | 'email_received'
  | 'sms_sent'
  | 'sms_received'
  | 'note_added'
  | 'follow_up_scheduled'
  | 'quote_generated'
  | 'status_changed'
  | 'lead_lost'
  | 'lead_won'

// Follow-up automation settings
export interface FollowUpSequence {
  id: string
  name: string
  description: string
  triggers: FollowUpTrigger[]
  steps: FollowUpStep[]
  is_active: boolean
}

export interface FollowUpTrigger {
  type: 'lead_created' | 'quote_sent' | 'no_response' | 'move_date_approaching'
  delay_hours?: number
  conditions?: Record<string, any>
}

export interface FollowUpStep {
  sequence_number: number
  delay_hours: number
  method: ContactMethod
  template_id?: string
  custom_message?: string
  is_automated: boolean
  assigned_to?: string
}

// Lead sources with UTM tracking
export interface LeadSource {
  primary_source: string
  sub_source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer_url?: string
  landing_page?: string
}

// Lead scoring configuration
export interface LeadScoringRules {
  source_weights: Record<string, number>
  timing_weights: {
    move_date_soon: number      // Moving within 30 days
    move_date_medium: number    // Moving 30-90 days
    move_date_far: number       // Moving 90+ days
    move_date_unknown: number   // No move date specified
  }
  engagement_weights: {
    phone_answered: number
    email_opened: number
    email_clicked: number
    form_completed: number
    callback_requested: number
  }
  demographics_weights: {
    high_value_zip: number
    large_move_size: number
    premium_services: number
  }
}

// Quick action types for lead management
export type QuickActionType = 
  | 'call'
  | 'text'
  | 'email'
  | 'note'
  | 'schedule_callback'
  | 'create_task'
  | 'change_status'
  | 'assign_to_user'

export interface QuickAction {
  type: QuickActionType
  label: string
  icon: string
  color: string
  requires_input: boolean
  input_type?: 'text' | 'datetime' | 'select'
  input_options?: string[]
}

// Filter and search types
export interface LeadFilters {
  status?: LeadDisplayStatus[]
  priority?: LeadPriority[]
  source?: string[]
  assigned_to?: string[]
  date_range?: {
    start: string
    end: string
    field: 'created_at' | 'updated_at' | 'move_date'
  }
  move_date_range?: {
    start: string
    end: string
  }
  move_size?: string[]
  service_type?: string[]
  lead_score_range?: {
    min: number
    max: number
  }
  has_activity?: boolean
  needs_follow_up?: boolean
}

export interface LeadSearchQuery {
  query: string
  filters: LeadFilters
  sort_by: 'created_at' | 'updated_at' | 'lead_score' | 'move_date' | 'last_contact'
  sort_order: 'asc' | 'desc'
  page: number
  per_page: number
}

// Component props interfaces
export interface LeadsTableProps {
  leads: EnhancedLead[]
  isAdmin: boolean
  currentUserId: string
  users: User[]
  tableType: 'unclaimed' | 'my-leads'
  pageSize: number
  currentPage: number
  onLeadClaim?: (leadId: string, quoteId: string) => Promise<void>
  onLeadAssign?: (leadId: string, quoteId: string, userId: string) => Promise<void>
  onQuickAction?: (leadId: string, action: QuickActionType, data?: any) => Promise<void>
}

export interface LeadDetailModalProps {
  lead: EnhancedLead | null
  isOpen: boolean
  onClose: () => void
  onLeadUpdate: (updatedLead: EnhancedLead) => void
  currentUserId: string
  isAdmin: boolean
}

export interface LeadActivityTimelineProps {
  leadId: string
  activities: ActivityLog[]
  onActivityAdd: (activity: Partial<ActivityLog>) => Promise<void>
}

export interface QuickActionsBarProps {
  lead: EnhancedLead
  onAction: (action: QuickActionType, data?: any) => Promise<void>
  disabled?: boolean
}

// API response types
export interface LeadsResponse {
  leads: EnhancedLead[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface LeadStatsResponse {
  total_leads: number
  unclaimed_leads: number
  hot_leads: number
  my_leads: number
  leads_this_week: number
  leads_this_month: number
  conversion_rate: number
  average_response_time: number // in minutes
}

// Real-time subscription types
export interface LeadRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: EnhancedLead
  old?: EnhancedLead
}

export interface ActivityRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: ActivityLog
  old?: ActivityLog
}

// Utility types for lead management
export type LeadActionResult = {
  success: boolean
  message: string
  data?: any
  error?: string
}

export type LeadBulkActionType = 
  | 'assign_to_user'
  | 'change_status'
  | 'add_to_sequence'
  | 'export_to_csv'
  | 'delete'

export interface LeadBulkAction {
  type: LeadBulkActionType
  leadIds: string[]
  data?: any
}

// Configuration types
export interface LeadsModuleConfig {
  hot_lead_duration_minutes: number
  auto_assign_enabled: boolean
  round_robin_assignment: boolean
  lead_scoring_enabled: boolean
  follow_up_sequences_enabled: boolean
  real_time_notifications: boolean
  export_permissions: string[]
  bulk_actions_permissions: string[]
}

// Hook return types
export interface UseLeadsReturn {
  leads: EnhancedLead[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
  claimLead: (leadId: string, quoteId: string) => Promise<LeadActionResult>
  assignLead: (leadId: string, quoteId: string, userId: string) => Promise<LeadActionResult>
  updateLeadStatus: (leadId: string, status: LeadDisplayStatus) => Promise<LeadActionResult>
  addActivity: (leadId: string, activity: Partial<ActivityLog>) => Promise<LeadActionResult>
  scheduleFollowUp: (leadId: string, followUp: Partial<FollowUp>) => Promise<LeadActionResult>
}

export interface UseLeadDetailReturn {
  lead: EnhancedLead | null
  activities: ActivityLog[]
  followUps: FollowUp[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addActivity: (activity: Partial<ActivityLog>) => Promise<LeadActionResult>
  updateLead: (updates: Partial<EnhancedLead>) => Promise<LeadActionResult>
}