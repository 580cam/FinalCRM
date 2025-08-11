// Enhanced Customer Pipeline Management Types for CRM Web Application
// Built on top of existing Supabase database types and lead management

import { 
  Lead,
  Quote,
  Job,
  ActivityLog,
  User,
  JobAddress,
  JobCharge,
  InventoryItem as BaseInventoryItem
} from '@/packages/shared/api/supabase/types'

// Customer status progression through pipeline
export type CustomerStatus = 
  | 'opportunity'      // Initial opportunity state
  | 'booked'          // Customer accepted quote and booked service
  | 'confirmed'       // Move details confirmed and scheduled
  | 'in_progress'     // Move is currently happening
  | 'completed'       // Move completed successfully
  | 'reviewed'        // Customer has provided feedback/review
  | 'closed'          // Customer record closed/archived
  | 'claims'          // Customer has filed claims
  | 'lost'            // Lost to competitor or cancelled

// Quote status for comprehensive tracking
export type QuoteStatus = 
  | 'pending'         // Initial quote generated
  | 'sent'           // Quote delivered to customer
  | 'viewed'         // Customer opened quote
  | 'accepted'       // Customer accepted quote (becomes Booked)
  | 'expired'        // Quote passed expiration date
  | 'revised'        // Modified quote created
  | 'lost'           // Quote rejected or lost

// Inventory sources for multi-channel management
export type InventorySource = 
  | 'yembo_ai'       // Automated AI detection from photos
  | 'crm_entry'      // Manual entry through CRM
  | 'customer_portal'// Customer entered through website
  | 'phone_survey'   // Sales rep phone interview
  | 'in_home_survey' // In-person home survey
  | 'video_survey'   // Virtual video survey

// Enhanced Customer interface with pipeline functionality
export interface EnhancedCustomer {
  // Core customer information
  id: number
  lead_id?: number
  name: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
  
  // Pipeline status and progression
  status: CustomerStatus
  status_changed_at: string
  status_changed_by?: string
  previous_status?: CustomerStatus
  
  // Move and service details
  move_date?: string | null
  move_size?: string | null
  service_type?: string | null
  move_type?: 'local' | 'long_distance' | 'international'
  
  // Address information
  addresses: {
    origin: string | null
    destination: string | null
    additional_stops?: string[]
  }
  
  // Financial information
  estimated_revenue: number
  total_quoted_amount: number
  deposit_amount?: number
  deposit_paid?: boolean
  final_amount?: number
  payment_status?: 'pending' | 'partial' | 'paid' | 'overdue'
  
  // Lead source and attribution
  source: string | null
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referral_source?: string
  
  // Relationships
  quotes: EnhancedQuote[]
  latest_quote?: EnhancedQuote
  jobs: EnhancedJob[]
  current_job?: EnhancedJob
  activities: CustomerActivity[]
  inventory: CustomerInventoryItem[]
  
  // Computed fields
  age_days: number
  days_until_move?: number
  conversion_probability: number
  customer_score: number
  last_contact_date?: string
  next_follow_up_date?: string
  total_interactions: number
  
  // Assigned team
  assigned_to?: string
  assigned_user?: User
  sales_rep?: User
  account_manager?: User
  
  // Tags and notes
  tags: string[]
  notes?: string
  internal_notes?: string
  special_requirements?: string[]
}

// Enhanced Quote with comprehensive tracking
export interface EnhancedQuote extends Quote {
  // Status and tracking
  status: QuoteStatus
  version: number
  parent_quote_id?: number
  is_current: boolean
  
  // Timing information
  sent_at?: string
  viewed_at?: string
  accepted_at?: string
  expired_at?: string
  expires_at?: string
  
  // Pricing breakdown
  base_cost: number
  additional_services_cost: number
  materials_cost: number
  travel_cost: number
  fuel_cost: number
  discount_amount?: number
  tax_amount?: number
  total_amount: number
  
  // Service details
  estimated_hours: number
  crew_size: number
  truck_count: number
  packing_services: boolean
  unpacking_services: boolean
  
  // Inventory and materials
  inventory: QuoteInventoryItem[]
  box_estimate: BoxEstimate
  special_items: SpecialItem[]
  
  // User and approval information
  created_by_user?: User
  approved_by_user?: User
  approval_required: boolean
  approval_status?: 'pending' | 'approved' | 'rejected'
  
  // Communication tracking
  sent_method?: 'email' | 'sms' | 'in_person' | 'phone'
  delivery_confirmation?: boolean
  customer_feedback?: string
  
  // Comparison data
  competitor_quotes?: CompetitorQuote[]
  win_probability: number
  loss_reason?: string
}

// Enhanced Job with scheduling and execution tracking
export interface EnhancedJob extends Job {
  // Scheduling information
  scheduled_date?: string
  scheduled_time_start?: string
  scheduled_time_end?: string
  estimated_duration_hours: number
  
  // Crew and resources
  assigned_crew: CrewMember[]
  lead_crew_member?: CrewMember
  trucks_assigned: TruckAssignment[]
  
  // Job execution
  actual_start_time?: string
  actual_end_time?: string
  actual_duration_hours?: number
  completion_percentage: number
  
  // Addresses with detailed information
  job_addresses: EnhancedJobAddress[]
  
  // Job charges and pricing
  job_charges: JobCharge[]
  estimated_cost: number
  actual_cost?: number
  cost_variance?: number
  
  // Quality and completion
  quality_score?: number
  customer_satisfaction?: number
  issues_reported: JobIssue[]
  photos: JobPhoto[]
  
  // Post-move information
  completion_notes?: string
  follow_up_required: boolean
  review_requested: boolean
  claims_filed: JobClaim[]
}

// Enhanced Job Address with accessibility details
export interface EnhancedJobAddress extends JobAddress {
  // Accessibility information
  stairs: number
  elevator: boolean
  walk_distance: number // in feet
  parking_availability: 'street' | 'driveway' | 'garage' | 'none'
  
  // Special requirements
  handicap_accessibility: boolean
  loading_dock: boolean
  special_instructions?: string
  
  // Timing
  availability_start?: string
  availability_end?: string
  time_restrictions?: string
}

// Customer activity tracking
export interface CustomerActivity extends ActivityLog {
  activity_category: 'communication' | 'quote' | 'job' | 'payment' | 'issue'
  communication_method?: 'phone' | 'email' | 'sms' | 'in_person' | 'video'
  outcome?: string
  follow_up_required: boolean
  follow_up_date?: string
  satisfaction_rating?: number
}

// Inventory management
export interface CustomerInventoryItem extends BaseInventoryItem {
  source: InventorySource
  created_by?: string
  verified_by?: string
  photo_urls: string[]
  room_location: string
  special_handling?: string[]
  estimated_hours?: number
  packing_required: boolean
  disassembly_required: boolean
  value_estimate?: number
  condition_notes?: string
}

// Quote inventory items with detailed information
export interface QuoteInventoryItem {
  id: string
  inventory_item_id?: string
  name: string
  description?: string
  room: string
  cubic_feet: number
  weight?: number
  quantity: number
  requires_special_handling: boolean
  special_handling_notes?: string
  requires_disassembly: boolean
  estimated_time_hours?: number
  photo_urls: string[]
}

// Box estimation for packing services
export interface BoxEstimate {
  small_boxes: number
  medium_boxes: number
  large_boxes: number
  wardrobe_boxes: number
  dish_boxes: number
  specialty_boxes: number
  total_boxes: number
  packing_paper_bundles: number
  bubble_wrap_rolls: number
  packing_tape_rolls: number
  total_materials_cost: number
  estimated_packing_hours: number
  estimated_unpacking_hours: number
}

// Special items requiring extra handling
export interface SpecialItem {
  id: string
  name: string
  description: string
  category: string
  base_price: number
  quantity: number
  total_price: number
  requires_crating: boolean
  requires_specialty_crew: boolean
  insurance_value?: number
  special_instructions?: string
}

// Competitor analysis
export interface CompetitorQuote {
  competitor_name: string
  quoted_amount: number
  service_level: string
  advantages?: string[]
  disadvantages?: string[]
  win_strategy?: string
}

// Crew member information
export interface CrewMember {
  id: string
  name: string
  role: 'crew_lead' | 'crew_member' | 'driver' | 'specialist'
  experience_years: number
  certifications: string[]
  hourly_rate: number
  availability_status: 'available' | 'busy' | 'off_duty'
}

// Truck assignment
export interface TruckAssignment {
  truck_id: string
  truck_type: string
  capacity_cubic_feet: number
  driver_id: string
  fuel_cost_estimate: number
}

// Job issues tracking
export interface JobIssue {
  id: string
  type: 'damage' | 'delay' | 'quality' | 'communication' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  reported_by: string
  reported_at: string
  resolved: boolean
  resolution?: string
  resolved_by?: string
  resolved_at?: string
}

// Job photos documentation
export interface JobPhoto {
  id: string
  url: string
  type: 'before' | 'during' | 'after' | 'damage' | 'completion'
  room_location?: string
  description?: string
  timestamp: string
  taken_by: string
}

// Claims management
export interface JobClaim {
  id: string
  type: 'damage' | 'loss' | 'delay' | 'quality' | 'billing'
  amount_claimed: number
  description: string
  status: 'filed' | 'investigating' | 'approved' | 'denied' | 'settled'
  filed_at: string
  resolved_at?: string
  settlement_amount?: number
  insurance_claim_number?: string
}

// Pipeline metrics and analytics
export interface PipelineMetrics {
  // Stage conversion rates
  opportunity_to_booked: number
  booked_to_confirmed: number
  confirmed_to_completed: number
  completed_to_reviewed: number
  
  // Average time in stages (days)
  avg_opportunity_duration: number
  avg_booked_duration: number
  avg_confirmed_duration: number
  
  // Revenue metrics
  total_pipeline_value: number
  weighted_pipeline_value: number
  average_deal_size: number
  
  // Customer acquisition
  new_customers_this_month: number
  conversion_rate_this_month: number
  customer_lifetime_value: number
  
  // Performance indicators
  quote_acceptance_rate: number
  job_completion_rate: number
  customer_satisfaction_avg: number
  on_time_completion_rate: number
}

// Filter and search interfaces
export interface CustomerFilters {
  status?: CustomerStatus[]
  move_date_range?: {
    start: string
    end: string
  }
  revenue_range?: {
    min: number
    max: number
  }
  service_type?: string[]
  assigned_to?: string[]
  source?: string[]
  tags?: string[]
  has_issues?: boolean
  payment_status?: string[]
  last_activity_days?: number
}

// Pipeline drag-and-drop interfaces
export interface PipelineColumn {
  id: CustomerStatus
  title: string
  color: string
  customers: EnhancedCustomer[]
  total_value: number
  count: number
}

export interface PipelineDragResult {
  customerId: number
  sourceStatus: CustomerStatus
  targetStatus: CustomerStatus
  position: number
}

// Component prop interfaces
export interface CustomerPipelineProps {
  customers: EnhancedCustomer[]
  metrics: PipelineMetrics
  onStatusChange: (customerId: number, newStatus: CustomerStatus) => Promise<void>
  onCustomerSelect: (customer: EnhancedCustomer) => void
  isLoading?: boolean
  permissions: CustomerPermissions
}

export interface CustomerDetailProps {
  customer: EnhancedCustomer | null
  isOpen: boolean
  onClose: () => void
  onCustomerUpdate: (updatedCustomer: EnhancedCustomer) => void
  onStatusChange: (newStatus: CustomerStatus) => Promise<void>
  permissions: CustomerPermissions
}

export interface InventoryManagerProps {
  customerId: number
  inventory: CustomerInventoryItem[]
  onInventoryUpdate: (inventory: CustomerInventoryItem[]) => Promise<void>
  onYemboSync: () => Promise<void>
  readOnly?: boolean
}

export interface QuoteManagerProps {
  customerId: number
  quotes: EnhancedQuote[]
  onQuoteCreate: () => Promise<void>
  onQuoteUpdate: (quoteId: string, updates: Partial<EnhancedQuote>) => Promise<void>
  onQuoteSend: (quoteId: string, method: 'email' | 'sms') => Promise<void>
  permissions: QuotePermissions
}

// Permission interfaces
export interface CustomerPermissions {
  canView: boolean
  canEdit: boolean
  canChangeStatus: boolean
  canAssign: boolean
  canViewFinancials: boolean
  canCreateQuote: boolean
  canViewAllCustomers: boolean
}

export interface QuotePermissions {
  canCreate: boolean
  canEdit: boolean
  canSend: boolean
  canApprove: boolean
  canViewCosts: boolean
  canApplyDiscounts: boolean
  requiresApproval: boolean
}

// API response types
export interface CustomersResponse {
  customers: EnhancedCustomer[]
  total: number
  page: number
  per_page: number
  total_pages: number
  metrics: PipelineMetrics
}

export interface CustomerActionResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

// Real-time update types
export interface CustomerRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: EnhancedCustomer
  old?: EnhancedCustomer
  changes?: Partial<EnhancedCustomer>
}

export interface QuoteRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: EnhancedQuote
  old?: EnhancedQuote
  customer_id: number
}

// Hook return types
export interface UseCustomersReturn {
  customers: EnhancedCustomer[]
  loading: boolean
  error: string | null
  metrics: PipelineMetrics | null
  refetch: () => Promise<void>
  updateCustomerStatus: (customerId: number, status: CustomerStatus) => Promise<CustomerActionResult>
  assignCustomer: (customerId: number, userId: string) => Promise<CustomerActionResult>
  addActivity: (customerId: number, activity: Partial<CustomerActivity>) => Promise<CustomerActionResult>
  updateInventory: (customerId: number, inventory: CustomerInventoryItem[]) => Promise<CustomerActionResult>
}

export interface UseCustomerDetailReturn {
  customer: EnhancedCustomer | null
  quotes: EnhancedQuote[]
  jobs: EnhancedJob[]
  activities: CustomerActivity[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCustomer: (updates: Partial<EnhancedCustomer>) => Promise<CustomerActionResult>
  createQuote: (quoteData: Partial<EnhancedQuote>) => Promise<CustomerActionResult>
  updateQuote: (quoteId: string, updates: Partial<EnhancedQuote>) => Promise<CustomerActionResult>
}

// Configuration types
export interface CustomerModuleConfig {
  pipeline_stages: CustomerStatus[]
  quote_expiry_days: number
  auto_follow_up_enabled: boolean
  yembo_integration_enabled: boolean
  customer_portal_enabled: boolean
  real_time_notifications: boolean
  audit_trail_enabled: boolean
  approval_workflow_enabled: boolean
  minimum_quote_approval_amount: number
}

// Utility types
export type CustomerBulkActionType = 
  | 'assign_to_user'
  | 'change_status'
  | 'add_tags'
  | 'schedule_follow_up'
  | 'export_to_csv'
  | 'create_task'

export interface CustomerBulkAction {
  type: CustomerBulkActionType
  customerIds: number[]
  data?: any
}

export type CustomerSortField = 
  | 'created_at'
  | 'updated_at'
  | 'status_changed_at'
  | 'move_date'
  | 'estimated_revenue'
  | 'customer_score'
  | 'last_contact_date'

export interface CustomerSearchQuery {
  query: string
  filters: CustomerFilters
  sort_by: CustomerSortField
  sort_order: 'asc' | 'desc'
  page: number
  per_page: number
}