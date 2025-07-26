'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import LeadsPageTabs from '@/components/LeadsPageTabs'
import StatusFilterDropdown from '@/components/StatusFilterDropdown'
import UserFilterDropdown from '@/components/UserFilterDropdown'
import LeadsTable from '@/components/LeadsTable'
import CreateLeadButton from '@/components/CreateLeadButton'
import SearchBar from '@/components/SearchBar'
import { Lead, User } from '@/types/leads'

interface ClientLeadsPageProps {
  leads: Lead[]
  isAdmin: boolean
  currentUserId: number
  users: User[]
  pageSize: number
  currentPage: number
}

export default function ClientLeadsPage({
  leads,
  isAdmin,
  currentUserId,
  users,
  pageSize,
  currentPage
}: ClientLeadsPageProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || 'unclaimed'
  const leadStatusParam = searchParams.get('leadStatus') || 'all'
  const userIdParam = searchParams.get('userId') || 'all'
  const searchQuery = searchParams.get('query') || ''
  
  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    // Handle search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = lead.name?.toLowerCase() || ''
      const email = lead.email?.toLowerCase() || ''
      const phone = lead.phone?.toLowerCase() || ''
      const source = lead.source?.toLowerCase() || ''
      
      const matchesSearch = 
        name.includes(query) || 
        email.includes(query) || 
        phone.includes(query) || 
        source.includes(query)
        
      if (!matchesSearch) return false
    }
    
    return true
  })
  
  return (
    <LeadsPageTabs 
      defaultTab={tabParam}
      actionButton={<CreateLeadButton />}
      unclaimedContent={
        <>
          <div className="px-6 pb-4 flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <StatusFilterDropdown 
                statuses={["lead", "hot lead"]} 
                defaultStatus="all"
                paramName="leadStatus"
              />
            </div>
            <SearchBar placeholder="Search leads..." className="max-w-xs" />
          </div>
          
          <div className="overflow-hidden flex flex-col flex-1">
            <LeadsTable 
              leads={filteredLeads.filter(lead => {
                // No claimed by filter
                const isNotClaimed = !lead.claimed_by;
                
                // Status filter
                const matchesStatus = leadStatusParam === 'all' || 
                  lead.status.toLowerCase() === leadStatusParam.toLowerCase();
                
                return isNotClaimed && matchesStatus && 
                  (lead.status === "LEAD" || lead.status === "HOT LEAD");
              })}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              users={users}
              tableType="unclaimed"
              pageSize={pageSize}
              currentPage={currentPage}
            />
          </div>
        </>
      }
      myLeadsContent={
        <>
          <div className="px-6 pb-4 flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <StatusFilterDropdown 
                statuses={["lead", "hot lead"]} 
                defaultStatus="all"
                paramName="leadStatus"
              />
              {isAdmin && (
                <UserFilterDropdown 
                  users={users}
                />
              )}
            </div>
            <SearchBar placeholder="Search leads..." className="max-w-xs" />
          </div>
          
          <div className="overflow-hidden flex flex-col flex-1">
            <LeadsTable 
              leads={filteredLeads.filter(lead => {
                // Check if claimed
                const claimed = Boolean(lead.claimed_by);
                
                // Filter by claimed user if admin
                let userMatch = true;
                if (isAdmin && userIdParam !== 'all') {
                  const filterUserId = parseInt(userIdParam);
                  userMatch = lead.quotes?.some(quote => quote.user_id === filterUserId) || false;
                } else if (!isAdmin) {
                  // If not admin, only show leads claimed by current user
                  userMatch = lead.quotes?.some(quote => quote.user_id === currentUserId) || false;
                }
                
                // Status filter
                const statusMatch = leadStatusParam === 'all' || 
                  lead.status.toLowerCase() === leadStatusParam.toLowerCase();
                
                return claimed && userMatch && statusMatch && 
                  (lead.status === "LEAD" || lead.status === "HOT LEAD");
              })}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              users={users}
              tableType="my-leads"
              pageSize={pageSize}
              currentPage={currentPage}
            />
          </div>
        </>
      }
    />
  )
}
