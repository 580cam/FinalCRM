// Lead Management Utility Functions
// Comprehensive business logic for lead processing and scoring

import { 
  EnhancedLead, 
  LeadDisplayStatus, 
  LeadPriority,
  LeadScoringRules,
  LeadSource,
  ContactMethod
} from '@/types/leads'
import { ActivityLog } from '@/packages/shared/api/supabase/types'

/**
 * Calculate lead age in minutes from creation time
 */
export function calculateLeadAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
}

/**
 * Format lead age for human-readable display
 */
export function formatLeadAge(createdAt: string): string {
  const ageMinutes = calculateLeadAge(createdAt)
  
  if (ageMinutes < 1) return 'Just now'
  if (ageMinutes < 60) return `${ageMinutes}m ago`
  
  const ageHours = Math.floor(ageMinutes / 60)
  if (ageHours < 24) return `${ageHours}h ago`
  
  const ageDays = Math.floor(ageHours / 24)
  if (ageDays < 7) return `${ageDays}d ago`
  
  const ageWeeks = Math.floor(ageDays / 7)
  if (ageWeeks < 4) return `${ageWeeks}w ago`
  
  const ageMonths = Math.floor(ageDays / 30)
  return `${ageMonths}mo ago`
}

/**
 * Determine lead display status based on age, claimed status, and activity
 */
export function calculateLeadStatus(
  lead: EnhancedLead,
  ageMinutes: number
): LeadDisplayStatus {
  // Check if lead has been claimed (has assigned user)
  const isClaimed = Boolean(lead.claimed_by || lead.latest_quote?.user_id)
  
  // Hot lead status (first 5 minutes, unclaimed)
  if (ageMinutes <= 5 && !isClaimed) {
    return 'HOT LEAD'
  }
  
  // Unclaimed lead after hot lead period
  if (!isClaimed) {
    return 'LEAD'
  }
  
  // For claimed leads, check activity and quote status
  if (lead.latest_quote?.status) {
    const quoteStatus = lead.latest_quote.status.toLowerCase()
    
    switch (quoteStatus) {
      case 'hot lead':
      case 'lead':
        return hasBeenContacted(lead.activities) ? 'CONTACTED' : 'NEW'
      case 'opportunity':
        return 'QUALIFIED'
      case 'booked':
      case 'confirmed':
        return 'WON'
      case 'complete':
      case 'reviewed':
        return 'WON'
      default:
        return hasBeenContacted(lead.activities) ? 'CONTACTED' : 'NEW'
    }
  }
  
  // Default for claimed leads without clear status
  return hasBeenContacted(lead.activities) ? 'CONTACTED' : 'NEW'
}

/**
 * Check if lead has been contacted based on activity log
 */
function hasBeenContacted(activities: ActivityLog[] = []): boolean {
  const contactActivities = [
    'phone_call_made',
    'email_sent',
    'sms_sent'
  ]
  
  return activities.some(activity => 
    contactActivities.includes(activity.activity_type)
  )
}

/**
 * Calculate lead priority based on age, move date, and source
 */
export function calculateLeadPriority(
  lead: EnhancedLead,
  ageMinutes: number
): LeadPriority {
  // Hot leads are always high priority
  if (ageMinutes <= 5) return 'hot'
  
  // Check move date proximity
  if (lead.move_date) {
    const moveDate = new Date(lead.move_date)
    const now = new Date()
    const daysUntilMove = Math.ceil((moveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Moving soon = high priority
    if (daysUntilMove <= 14) return 'hot'
    if (daysUntilMove <= 30) return 'warm'
  }
  
  // Check lead source quality
  const highValueSources = ['referral', 'google_ads', 'facebook_ads', 'direct']
  if (lead.source && highValueSources.includes(lead.source.toLowerCase())) {
    return 'warm'
  }
  
  return 'cold'
}

/**
 * Calculate lead score based on configured scoring rules
 */
export function calculateLeadScore(
  lead: EnhancedLead,
  scoringRules: LeadScoringRules
): number {
  let score = 0
  
  // Source scoring
  if (lead.source) {
    score += scoringRules.source_weights[lead.source.toLowerCase()] || 0
  }
  
  // Move date timing scoring
  if (lead.move_date) {
    const daysUntilMove = getDaysUntilMove(lead.move_date)
    
    if (daysUntilMove <= 30) {
      score += scoringRules.timing_weights.move_date_soon
    } else if (daysUntilMove <= 90) {
      score += scoringRules.timing_weights.move_date_medium
    } else {
      score += scoringRules.timing_weights.move_date_far
    }
  } else {
    score += scoringRules.timing_weights.move_date_unknown
  }
  
  // Engagement scoring based on activities
  if (lead.activities) {
    const engagement = calculateEngagementScore(lead.activities, scoringRules)
    score += engagement
  }
  
  // Demographics scoring
  const demographics = calculateDemographicsScore(lead, scoringRules)
  score += demographics
  
  return Math.max(0, Math.min(100, score)) // Clamp between 0-100
}

/**
 * Calculate days until move date
 */
function getDaysUntilMove(moveDate: string): number {
  const move = new Date(moveDate)
  const now = new Date()
  return Math.ceil((move.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Calculate engagement score from activities
 */
function calculateEngagementScore(
  activities: ActivityLog[],
  rules: LeadScoringRules
): number {
  let score = 0
  
  activities.forEach(activity => {
    switch (activity.activity_type) {
      case 'phone_call_received':
        score += rules.engagement_weights.phone_answered
        break
      case 'email_received':
        score += rules.engagement_weights.email_opened
        break
      // Add more engagement types as needed
    }
  })
  
  return score
}

/**
 * Calculate demographics-based score
 */
function calculateDemographicsScore(
  lead: EnhancedLead,
  rules: LeadScoringRules
): number {
  let score = 0
  
  // High-value move sizes
  const largeMoveSize = ['4_bedroom', '5_plus_bedroom', 'commercial']
  if (lead.move_size && largeMoveSize.includes(lead.move_size)) {
    score += rules.demographics_weights.large_move_size
  }
  
  // Premium services
  const premiumServices = ['full_service', 'white_glove', 'packing_service']
  if (lead.service_type && premiumServices.includes(lead.service_type)) {
    score += rules.demographics_weights.premium_services
  }
  
  return score
}

/**
 * Estimate conversion probability based on lead characteristics
 */
export function calculateConversionProbability(lead: EnhancedLead): number {
  let probability = 50 // Base probability
  
  // Age factor (fresher leads convert better)
  const ageMinutes = calculateLeadAge(lead.created_at)
  if (ageMinutes <= 60) probability += 20
  else if (ageMinutes <= 1440) probability += 10 // 24 hours
  else if (ageMinutes > 10080) probability -= 20 // 1 week
  
  // Source quality factor
  const highConversionSources = ['referral', 'repeat_customer']
  const mediumConversionSources = ['google_organic', 'direct']
  
  if (lead.source) {
    if (highConversionSources.includes(lead.source)) probability += 25
    else if (mediumConversionSources.includes(lead.source)) probability += 10
  }
  
  // Move timing factor
  if (lead.move_date) {
    const daysUntilMove = getDaysUntilMove(lead.move_date)
    if (daysUntilMove <= 14) probability += 30
    else if (daysUntilMove <= 30) probability += 20
    else if (daysUntilMove <= 90) probability += 10
  }
  
  // Contact responsiveness
  if (lead.activities) {
    const hasRespondedToContact = lead.activities.some(a => 
      ['phone_call_received', 'email_received', 'sms_received'].includes(a.activity_type)
    )
    if (hasRespondedToContact) probability += 25
  }
  
  return Math.max(0, Math.min(100, probability))
}

/**
 * Parse UTM parameters from lead source data
 */
export function parseLeadSource(sourceData: any): LeadSource {
  return {
    primary_source: sourceData.primary || sourceData.source || 'unknown',
    sub_source: sourceData.sub_source,
    utm_source: sourceData.utm_source,
    utm_medium: sourceData.utm_medium,
    utm_campaign: sourceData.utm_campaign,
    utm_content: sourceData.utm_content,
    utm_term: sourceData.utm_term,
    referrer_url: sourceData.referrer,
    landing_page: sourceData.landing_page
  }
}

/**
 * Format move date for display
 */
export function formatMoveDate(moveDate: string | null | undefined): string | null {
  if (!moveDate) return null
  
  const date = new Date(moveDate)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
  
  if (diffDays < 0) {
    return `${formattedDate} (Past)`
  } else if (diffDays === 0) {
    return `${formattedDate} (Today!)`
  } else if (diffDays === 1) {
    return `${formattedDate} (Tomorrow)`
  } else if (diffDays <= 7) {
    return `${formattedDate} (${diffDays} days)`
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${formattedDate} (${weeks}w)`
  } else {
    return formattedDate
  }
}

/**
 * Get the appropriate color for lead status
 */
export function getStatusColor(status: LeadDisplayStatus): string {
  const colorMap: Record<LeadDisplayStatus, string> = {
    'HOT LEAD': 'bg-red-100 text-red-800 border-red-200',
    'LEAD': 'bg-orange-100 text-orange-800 border-orange-200',
    'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
    'CONTACTED': 'bg-purple-100 text-purple-800 border-purple-200',
    'QUALIFIED': 'bg-green-100 text-green-800 border-green-200',
    'QUOTE_PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'QUOTE_SENT': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'FOLLOW_UP_NEEDED': 'bg-amber-100 text-amber-800 border-amber-200',
    'WON': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'LOST': 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get the appropriate color for lead priority
 */
export function getPriorityColor(priority: LeadPriority): string {
  const colorMap: Record<LeadPriority, string> = {
    'hot': 'text-red-600',
    'warm': 'text-orange-600',
    'cold': 'text-blue-600'
  }
  
  return colorMap[priority] || 'text-gray-600'
}

/**
 * Check if a lead needs follow-up based on last activity
 */
export function needsFollowUp(lead: EnhancedLead): boolean {
  if (!lead.activities || lead.activities.length === 0) return true
  
  const lastActivity = lead.activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  
  const hoursSinceLastActivity = Math.floor(
    (new Date().getTime() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60)
  )
  
  // Different follow-up rules based on status
  switch (lead.status) {
    case 'HOT LEAD':
      return hoursSinceLastActivity > 1 // 1 hour for hot leads
    case 'LEAD':
    case 'NEW':
      return hoursSinceLastActivity > 24 // 24 hours for new leads
    case 'CONTACTED':
      return hoursSinceLastActivity > 48 // 48 hours after contact
    case 'QUALIFIED':
      return hoursSinceLastActivity > 72 // 72 hours for qualified leads
    default:
      return hoursSinceLastActivity > 96 // 4 days default
  }
}

/**
 * Generate automated follow-up message based on lead status and history
 */
export function generateFollowUpMessage(
  lead: EnhancedLead,
  method: ContactMethod
): string {
  const customerName = lead.name || 'there'
  const moveDate = lead.move_date ? formatMoveDate(lead.move_date) : 'your upcoming move'
  
  const templates = {
    phone: {
      initial: `Hi ${customerName}, I'm following up on your moving quote request. I'd love to discuss your move details and see how we can help.`,
      quote_sent: `Hi ${customerName}, I wanted to follow up on the moving quote I sent for ${moveDate}. Do you have any questions I can answer?`,
      qualified: `Hi ${customerName}, I'm checking in about your move. Are you still planning to move on ${moveDate}? I'd be happy to finalize your quote.`
    },
    email: {
      initial: `Hi ${customerName},\n\nThank you for requesting a moving quote. I'd love to learn more about your move and provide you with an accurate estimate.\n\nWould you have a few minutes to discuss your moving needs?`,
      quote_sent: `Hi ${customerName},\n\nI hope you had a chance to review the moving quote I sent for ${moveDate}.\n\nDo you have any questions about our services or pricing?`,
      qualified: `Hi ${customerName},\n\nI wanted to check in about your upcoming move. Are you still planning to move on ${moveDate}?\n\nI'm here to help finalize the details and ensure everything goes smoothly.`
    },
    sms: {
      initial: `Hi ${customerName}! Following up on your moving quote request. Can we schedule a quick call to discuss your move details?`,
      quote_sent: `Hi ${customerName}! Checking in on the moving quote for ${moveDate}. Any questions?`,
      qualified: `Hi ${customerName}! Still planning to move on ${moveDate}? Let's finalize your booking!`
    }
  }
  
  let templateType = 'initial'
  if (lead.status === 'QUOTE_SENT' || lead.status === 'QUOTE_PENDING') {
    templateType = 'quote_sent'
  } else if (lead.status === 'QUALIFIED') {
    templateType = 'qualified'
  }
  
  return templates[method][templateType] || templates[method].initial
}

/**
 * Default lead scoring rules
 */
export const DEFAULT_SCORING_RULES: LeadScoringRules = {
  source_weights: {
    'referral': 30,
    'repeat_customer': 35,
    'google_organic': 20,
    'google_ads': 25,
    'facebook_ads': 15,
    'yelp': 18,
    'direct': 22,
    'website': 15,
    'other': 10
  },
  timing_weights: {
    move_date_soon: 25,    // Within 30 days
    move_date_medium: 15,  // 30-90 days
    move_date_far: 5,      // 90+ days
    move_date_unknown: -5  // No move date
  },
  engagement_weights: {
    phone_answered: 20,
    email_opened: 5,
    email_clicked: 10,
    form_completed: 15,
    callback_requested: 25
  },
  demographics_weights: {
    high_value_zip: 10,
    large_move_size: 15,
    premium_services: 20
  }
}