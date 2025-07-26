'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Search, AlertCircle, FileText, FileCheck, Clock, DollarSign } from "lucide-react"
import { Claim } from '@/types/customer-service'
import { formatMoveDate } from '@/lib/utils/timeUtils'

interface ClaimsPanelProps {
  claims: Claim[]
}

export default function ClaimsPanel({ claims }: ClaimsPanelProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Helper functions for displaying badges
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>
      case 'in-review':
        return <Badge className="bg-amber-500">In Review</Badge>
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'denied':
        return <Badge className="bg-red-500">Denied</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge className="bg-gray-500">{priority}</Badge>
    }
  }
  
  // Filter claims based on status and search
  const filteredClaims = claims.filter(claim => {
    // Apply status filter
    if (statusFilter !== 'all' && claim.status !== statusFilter) return false
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        claim.customerName.toLowerCase().includes(query) ||
        claim.description.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  // Group claims by status for Kanban view
  const claimsByStatus = {
    new: filteredClaims.filter(claim => claim.status === 'new'),
    investigating: filteredClaims.filter(claim => claim.status === 'investigating'),
    'in-progress': filteredClaims.filter(claim => claim.status === 'in-progress'),
    resolved: filteredClaims.filter(claim => claim.status === 'resolved'),
    denied: filteredClaims.filter(claim => claim.status === 'denied')
  }
  
  return (
    <div className="p-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {claims.filter(c => ['new', 'investigating', 'in-progress'].includes(c.status)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {claims.filter(c => c.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Denied Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {claims.filter(c => c.status === 'denied').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${claims
                .filter(c => c.status === 'resolved' && c.compensationAmount)
                .reduce((sum, claim) => sum + (claim.compensationAmount || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
        <div className="w-full md:w-auto flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Claim
          </Button>
        </div>
      </div>
      
      {/* View Selector */}
      <Tabs defaultValue="kanban" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        {/* Kanban Board View */}
        <TabsContent value="kanban" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(claimsByStatus).map(([status, statusClaims]) => (
              <div key={status} className="flex flex-col">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <h3 className="font-medium text-gray-700 capitalize">
                    {status.replace('-', ' ')}
                  </h3>
                  <Badge variant="outline" className="bg-gray-100">
                    {statusClaims.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {statusClaims.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-200 text-center text-gray-500 text-sm">
                      No claims
                    </div>
                  ) : (
                    statusClaims.map(claim => (
                      <Card key={claim.id} className="shadow-sm">
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-sm font-medium">
                            {claim.customerName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            #{claim.id} • Quote #{claim.quoteId}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {claim.description}
                          </p>
                          <div className="flex flex-wrap gap-1 text-xs">
                            {getPriorityBadge(claim.priority)}
                            {claim.compensationAmount && (
                              <Badge variant="outline" className="bg-gray-50">
                                ${claim.compensationAmount.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Compensation</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map(claim => (
                    <tr key={claim.id} className="border-b">
                      <td className="px-4 py-3 font-medium">#{claim.id}</td>
                      <td className="px-4 py-3">
                        <div>{claim.customerName}</div>
                        <div className="text-xs text-gray-500">Quote #{claim.quoteId}</div>
                      </td>
                      <td className="px-4 py-3">{formatMoveDate(claim.dateSubmitted)}</td>
                      <td className="px-4 py-3">{getStatusBadge(claim.status)}</td>
                      <td className="px-4 py-3">{getPriorityBadge(claim.priority)}</td>
                      <td className="px-4 py-3">
                        {claim.compensationAmount
                          ? `$${claim.compensationAmount.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
