'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, 
  BarChart,
  DonutChart 
} from '@tremor/react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  CalendarClock, 
  PercentSquare 
} from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState } from 'react'
import { MarketingMetrics, LeadSourceData } from '@/types/marketing'

interface MarketingDashboardProps {
  data: {
    metrics: MarketingMetrics;
    leadsByDate: {
      date: string;
      leads: number;
      calls: number;
    }[];
    leadSources: LeadSourceData[];
    conversionBySource: {
      source: string;
      rate: number;
    }[];
  }
}

export default function MarketingDashboard({ data }: MarketingDashboardProps) {
  const [timeRange, setTimeRange] = useState('30')
  
  // Calculate change indicators with percentage
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          <span>+{change}%</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          <span>{change}%</span>
        </div>
      )
    } else {
      return <span className="text-gray-500">0%</span>
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalLeads.toLocaleString()}</div>
            <div className="flex items-center space-x-2">
              {getChangeIndicator(data.metrics.totalLeadsChange)}
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <PercentSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.conversionRate}%</div>
            <div className="flex items-center space-x-2">
              {getChangeIndicator(data.metrics.conversionRateChange)}
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.avgResponseTime} min</div>
            <div className="flex items-center space-x-2">
              {getChangeIndicator(-data.metrics.avgResponseTimeChange)} {/* Negative since less time is better */}
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.marketingROI.toFixed(1)}x</div>
            <div className="flex items-center space-x-2">
              {getChangeIndicator(data.metrics.marketingROIChange)}
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Trend</CardTitle>
            <CardDescription>Total leads and calls per day</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={data.leadsByDate}
              index="date"
              categories={["leads", "calls"]}
              colors={["blue", "indigo"]}
              valueFormatter={(value) => `${value.toLocaleString()}`}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Distribution of leads by source</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-72"
              data={data.leadSources}
              index="source"
              category="count"
              valueFormatter={(value) => `${value.toLocaleString()} leads`}
              colors={["blue", "cyan", "indigo", "violet", "fuchsia", "rose"]}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversion Rate by Source</CardTitle>
            <CardDescription>Percentage of leads that convert to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-72"
              data={data.conversionBySource}
              index="source"
              categories={["rate"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              showLegend={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
