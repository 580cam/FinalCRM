'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Users,
  BarChart2,
  Trash,
  Edit,
  Pause,
  Play,
  Clock
} from "lucide-react"
import { MarketingCampaign } from '@/types/marketing'
import { formatMoveDate } from '@/lib/utils/timeUtils'

interface MarketingCampaignsListProps {
  campaigns: MarketingCampaign[]
}

export default function MarketingCampaignsList({ campaigns }: MarketingCampaignsListProps) {
  const [status, setStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter campaigns based on status and search query
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by status
    if (status !== 'all' && campaign.status !== status) return false
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  // Get status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Paused</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Format cost as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Get trend indicator with color
  const getTrendIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    } else if (value < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
    return null
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-auto flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto md:ml-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Campaign
          </Button>
        </div>
      </div>
      
      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No campaigns found</p>
          </div>
        ) : (
          filteredCampaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatMoveDate(campaign.startDate.toString())} - {campaign.endDate ? formatMoveDate(campaign.endDate.toString()) : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{formatCurrency(campaign.budget)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{campaign.roi}x ROI</span>
                    {getTrendIndicator(campaign.roiTrend)}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{campaign.leadsGenerated} Leads</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{campaign.conversionRate}% Conv.</span>
                  </div>
                </div>
                
                <div className="flex mt-4 gap-2 items-center">
                  <div className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                    {campaign.platform}
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                    {campaign.channel}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 pt-0">
                {campaign.status === 'active' ? (
                  <Button variant="outline" size="sm" className="px-3">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : campaign.status === 'paused' ? (
                  <Button variant="outline" size="sm" className="px-3">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                ) : campaign.status === 'scheduled' ? (
                  <Button variant="outline" size="sm" className="px-3">
                    <Clock className="h-4 w-4 mr-1" />
                    Start Now
                  </Button>
                ) : null}
                
                <Button variant="ghost" size="sm" className="px-3">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-600 px-3">
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
