'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { EnhancedLead, LeadDisplayStatus, LeadPriority, LeadFilters } from '@/types/leads'
import EnhancedLeadsPageTabs from '@/components/leads/EnhancedLeadsPageTabs'
import EnhancedStatusFilterDropdown from '@/components/leads/EnhancedStatusFilterDropdown'
import EnhancedUserFilterDropdown from '@/components/leads/EnhancedUserFilterDropdown'
import PriorityFilterDropdown from '@/components/leads/PriorityFilterDropdown'
import SourceFilterDropdown from '@/components/leads/SourceFilterDropdown'
import EnhancedLeadsTable from '@/components/leads/EnhancedLeadsTable'
import CreateLeadButton from '@/components/CreateLeadButton'
import SearchBar from '@/components/SearchBar'
import LeadsStatsCards from '@/components/leads/LeadsStatsCards'

interface User {
  id: string
  name: string
}

interface EnhancedClientLeadsPageProps {
  leads: EnhancedLead[]
  isAdmin: boolean
  currentUserId: string
  users: User[]
  pageSize: number
  currentPage: number
}

export default function EnhancedClientLeadsPage({
  leads,
  isAdmin,
  currentUserId,
  users,
  pageSize,
  currentPage
}: EnhancedClientLeadsPageProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || 'unclaimed'
  const leadStatusParam = searchParams.get('leadStatus') || 'all'
  const userIdParam = searchParams.get('userId') || 'all'
  const priorityParam = searchParams.get('priority') || 'all'
  const sourceParam = searchParams.get('source') || 'all'
  const searchQuery = searchParams.get('query') || ''
  
  // Advanced filtering state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [leadStats, setLeadStats] = useState({
    total: leads.length,
    unclaimed: 0,
    hot: 0,
    myLeads: 0,
    needsFollowUp: 0,
    avgScore: 0
  })

  // Calculate stats when leads change
  useEffect(() => {
    const unclaimed = leads.filter(lead => !lead.claimed_by).length
    const hot = leads.filter(lead => lead.priority === 'hot').length
    const myLeads = leads.filter(lead => 
      lead.latest_quote?.user_id === currentUserId
    ).length
    const needsFollowUp = leads.filter(lead => {
      // Check if last activity was more than 24 hours ago for hot leads, 48 for others
      if (!lead.activities || lead.activities.length === 0) return true
      
      const lastActivity = new Date(lead.activities[0].created_at)
      const now = new Date()
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
      
      return lead.priority === 'hot' ? hoursSinceActivity > 24 : hoursSinceActivity > 48
    }).length
    
    const avgScore = leads.length > 0 ? 
      leads.reduce((sum, lead) => sum + lead.lead_score, 0) / leads.length : 0

    setLeadStats({
      total: leads.length,
      unclaimed,
      hot,
      myLeads,
      needsFollowUp,
      avgScore: Math.round(avgScore)
    })
  }, [leads, currentUserId])

  // Apply comprehensive filtering
  const getFilteredLeads = (tabType: 'unclaimed' | 'my-leads') => {
    let filtered = leads.filter(lead => {
      // Tab-based filtering
      if (tabType === 'unclaimed') {
        const isUnclaimed = !lead.claimed_by
        if (!isUnclaimed) return false
      } else {
        // My leads tab
        const isClaimed = Boolean(lead.claimed_by)
        if (!isClaimed) return false
        
        // Filter by user assignment
        if (isAdmin && userIdParam !== 'all') {
          const filterUserId = userIdParam
          const matchesUser = lead.latest_quote?.user_id === filterUserId
          if (!matchesUser) return false
        } else if (!isAdmin) {
          // If not admin, only show leads assigned to current user
          const matchesCurrentUser = lead.latest_quote?.user_id === currentUserId
          if (!matchesCurrentUser) return false
        }
      }

      // Search query filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query) ||
          lead.source?.toLowerCase().includes(query) ||
          lead.claimed_by?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Status filtering
      if (leadStatusParam !== 'all') {
        const matchesStatus = lead.status.toLowerCase() === leadStatusParam.toLowerCase()
        if (!matchesStatus) return false
      }

      // Priority filtering
      if (priorityParam !== 'all') {
        const matchesPriority = lead.priority === priorityParam
        if (!matchesPriority) return false
      }

      // Source filtering
      if (sourceParam !== 'all') {
        const matchesSource = lead.source?.toLowerCase() === sourceParam.toLowerCase()
        if (!matchesSource) return false
      }

      return true
    })

    // Sort filtered results
    return filtered.sort((a, b) => {
      // Priority sort first
      const priorityOrder = { 'hot': 3, 'warm': 2, 'cold': 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Then by lead score
      const scoreDiff = b.lead_score - a.lead_score
      if (scoreDiff !== 0) return scoreDiff

      // Finally by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: keyof EnhancedLead): string[] => {
    const values = leads
      .map(lead => lead[field])
      .filter((value): value is string => Boolean(value))
      .map(value => value.toString())
    return [...new Set(values)].sort()
  }

  const statusOptions = getUniqueValues('status') as LeadDisplayStatus[]
  const priorityOptions: LeadPriority[] = ['hot', 'warm', 'cold']
  const sourceOptions = getUniqueValues('source')

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <LeadsStatsCards stats={leadStats} />
      
      <EnhancedLeadsPageTabs 
        defaultTab={tabParam}
        actionButton={<CreateLeadButton />}
        unclaimedContent={
          <div className="flex flex-col h-full">
            {/* Filters Section */}
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <div className="flex flex-col gap-4">
                {/* Primary filters row */}
                <div className="flex flex-wrap gap-3 items-center">
                  <EnhancedStatusFilterDropdown 
                    statuses={statusOptions} 
                    defaultStatus={leadStatusParam}
                    paramName="leadStatus"
                  />
                  <PriorityFilterDropdown
                    priorities={priorityOptions}
                    defaultPriority={priorityParam}
                    paramName="priority"
                  />
                  <SourceFilterDropdown
                    sources={sourceOptions}
                    defaultSource={sourceParam}
                    paramName="source"
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <SearchBar placeholder="Search leads..." className="w-80" />
                  </div>
                </div>
                
                {/* Advanced filters toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
                >
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
                
                {/* Advanced filters (expandable) */}
                {showAdvancedFilters && (
                  <div className="flex flex-wrap gap-3 items-center pt-2 border-t">
                    {/* Add more advanced filters here */}
                    <div className="text-sm text-gray-500">
                      Move Date Range, Lead Score Range, Service Type, etc.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Results count */}
            <div className="px-6 py-2 text-sm text-gray-600 bg-white border-b">
              Showing {getFilteredLeads('unclaimed').length} unclaimed leads
            </div>
            
            {/* Table */}
            <div className="flex-1 overflow-hidden">
              <EnhancedLeadsTable 
                leads={getFilteredLeads('unclaimed')}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                users={users}
                tableType="unclaimed"
                pageSize={pageSize}
                currentPage={currentPage}
              />
            </div>
          </div>
        }
        myLeadsContent={
          <div className="flex flex-col h-full">
            {/* Filters Section */}
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <div className="flex flex-col gap-4">
                {/* Primary filters row */}
                <div className="flex flex-wrap gap-3 items-center">
                  <EnhancedStatusFilterDropdown 
                    statuses={statusOptions} 
                    defaultStatus={leadStatusParam}
                    paramName="leadStatus"
                  />
                  <PriorityFilterDropdown
                    priorities={priorityOptions}
                    defaultPriority={priorityParam}
                    paramName="priority"
                  />
                  <SourceFilterDropdown
                    sources={sourceOptions}
                    defaultSource={sourceParam}
                    paramName="source"
                  />
                  {isAdmin && (
                    <EnhancedUserFilterDropdown 
                      users={users}
                      defaultUserId={userIdParam}
                      paramName="userId"
                    />
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <SearchBar placeholder="Search my leads..." className="w-80" />
                  </div>
                </div>
                
                {/* Advanced filters toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start"
                >
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
                
                {/* Advanced filters (expandable) */}
                {showAdvancedFilters && (
                  <div className="flex flex-wrap gap-3 items-center pt-2 border-t">
                    {/* Add more advanced filters here */}
                    <div className="text-sm text-gray-500">
                      Last Contact Date, Follow-up Status, Conversion Probability, etc.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Results count */}
            <div className="px-6 py-2 text-sm text-gray-600 bg-white border-b">
              Showing {getFilteredLeads('my-leads').length} assigned leads
            </div>
            
            {/* Table */}
            <div className="flex-1 overflow-hidden">
              <EnhancedLeadsTable 
                leads={getFilteredLeads('my-leads')}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                users={users}
                tableType="my-leads"
                pageSize={pageSize}
                currentPage={currentPage}
              />
            </div>
          </div>
        }
      />
    </div>
  )
}