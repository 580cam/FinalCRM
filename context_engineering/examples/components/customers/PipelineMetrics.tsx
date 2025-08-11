'use client'

import React, { useMemo, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { 
  EnhancedCustomer, 
  PipelineMetrics, 
  CustomerStatus 
} from '@/types/customers'
import { cn } from '@/lib/utils'

// Color palette for charts
const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  purple: '#9333ea',
  teal: '#0d9488',
  pink: '#e11d48'
}

const PIPELINE_COLORS = [
  COLORS.primary,
  COLORS.warning,
  COLORS.purple,
  COLORS.teal,
  COLORS.success,
  COLORS.pink,
  COLORS.secondary,
  COLORS.danger
]

interface PipelineMetricsProps {
  customers: EnhancedCustomer[]
  metrics: PipelineMetrics
  dateRange: string
  onDateRangeChange: (range: string) => void
}

// Metric card component
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

function MetricCard({ title, value, change, changeLabel, icon, trend, color = 'text-blue-600' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="h-3 w-3 text-green-500" />
    if (trend === 'down') return <ArrowDownRight className="h-3 w-3 text-red-500" />
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn('p-2 rounded-lg bg-gray-100', color.replace('text-', 'bg-').replace('-600', '-100'))}>
              <div className={color}>{icon}</div>
            </div>
          </div>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600 mt-1">{title}</div>
          {changeLabel && (
            <div className="text-xs text-gray-500 mt-1">{changeLabel}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Pipeline funnel component
function PipelineFunnel({ customers }: { customers: EnhancedCustomer[] }) {
  const funnelData = useMemo(() => {
    const stages = ['opportunity', 'booked', 'confirmed', 'completed'] as CustomerStatus[]
    
    return stages.map(stage => {
      const count = customers.filter(c => c.status === stage).length
      const revenue = customers
        .filter(c => c.status === stage)
        .reduce((sum, c) => sum + c.estimated_revenue, 0)
      
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        revenue,
        percentage: customers.length > 0 ? (count / customers.length) * 100 : 0
      }
    })
  }, [customers])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Pipeline Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stage.stage}</span>
                  <Badge variant="outline">{stage.count}</Badge>
                </div>
                <div className="text-sm font-medium text-green-600">
                  ${stage.revenue.toLocaleString()}
                </div>
              </div>
              <div className="relative">
                <Progress value={stage.percentage} className="h-3" />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-xs font-medium text-white">
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Conversion rates component
function ConversionRates({ customers }: { customers: EnhancedCustomer[] }) {
  const conversionData = useMemo(() => {
    const stages = ['opportunity', 'booked', 'confirmed', 'completed']
    const conversions = []
    
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i] as CustomerStatus
      const nextStage = stages[i + 1] as CustomerStatus
      
      const currentCount = customers.filter(c => c.status === currentStage).length
      const nextCount = customers.filter(c => c.status === nextStage).length
      
      // For conversion rate, we look at customers who have progressed past this stage
      const progressedCount = customers.filter(c => {
        const stageIndex = stages.indexOf(c.status)
        return stageIndex > i
      }).length
      
      const conversionRate = currentCount > 0 ? (progressedCount / currentCount) * 100 : 0
      
      conversions.push({
        from: currentStage.charAt(0).toUpperCase() + currentStage.slice(1),
        to: nextStage.charAt(0).toUpperCase() + nextStage.slice(1),
        rate: conversionRate,
        fromCount: currentCount,
        toCount: progressedCount
      })
    }
    
    return conversions
  }, [customers])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Conversion Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversionData.map((conversion, index) => (
            <div key={`${conversion.from}-${conversion.to}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {conversion.from} → {conversion.to}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {conversion.rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{conversion.fromCount} customers</span>
                <span>{conversion.toCount} converted</span>
              </div>
              <Progress value={conversion.rate} className="h-2 mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Revenue trends chart
function RevenueTrends({ customers, dateRange }: { customers: EnhancedCustomer[], dateRange: string }) {
  const chartData = useMemo(() => {
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i)
      const dayCustomers = customers.filter(c => {
        const customerDate = new Date(c.created_at)
        return customerDate.toDateString() === date.toDateString()
      })
      
      const revenue = dayCustomers.reduce((sum, c) => sum + c.estimated_revenue, 0)
      const count = dayCustomers.length
      
      data.push({
        date: format(date, 'MMM dd'),
        revenue,
        customers: count,
        avgDealSize: count > 0 ? revenue / count : 0
      })
    }
    
    return data
  }, [customers, dateRange])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : name === 'customers' ? 'New Customers' : 'Avg Deal Size'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke={COLORS.primary} 
              fill={COLORS.primary}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Pipeline distribution pie chart
function PipelineDistribution({ customers }: { customers: EnhancedCustomer[] }) {
  const distributionData = useMemo(() => {
    const stages = ['opportunity', 'booked', 'confirmed', 'in_progress', 'completed', 'reviewed', 'closed', 'lost']
    
    return stages
      .map(stage => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' '),
        value: customers.filter(c => c.status === stage as CustomerStatus).length,
        color: PIPELINE_COLORS[stages.indexOf(stage)]
      }))
      .filter(item => item.value > 0)
  }, [customers])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Pipeline Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <ResponsiveContainer width="60%" height={200}>
            <RechartsPieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          <div className="flex-1 ml-4">
            <div className="space-y-2">
              {distributionData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance metrics table
function PerformanceTable({ metrics }: { metrics: PipelineMetrics }) {
  const performanceData = [
    { metric: 'Opportunity → Booked', value: `${(metrics.opportunity_to_booked * 100).toFixed(1)}%`, trend: 'up' },
    { metric: 'Booked → Confirmed', value: `${(metrics.booked_to_confirmed * 100).toFixed(1)}%`, trend: 'up' },
    { metric: 'Confirmed → Completed', value: `${(metrics.confirmed_to_completed * 100).toFixed(1)}%`, trend: 'neutral' },
    { metric: 'Avg. Opportunity Duration', value: `${metrics.avg_opportunity_duration} days`, trend: 'down' },
    { metric: 'Avg. Deal Size', value: `$${metrics.average_deal_size.toLocaleString()}`, trend: 'up' },
    { metric: 'Customer Lifetime Value', value: `$${metrics.customer_lifetime_value.toLocaleString()}`, trend: 'up' }
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Key Performance Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {performanceData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{item.metric}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{item.value}</span>
                {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Main PipelineMetrics component
export default function PipelineMetrics({ 
  customers, 
  metrics, 
  dateRange, 
  onDateRangeChange 
}: PipelineMetricsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + c.estimated_revenue, 0)
    const completedCustomers = customers.filter(c => c.status === 'completed').length
    const conversionRate = totalCustomers > 0 ? (completedCustomers / totalCustomers) * 100 : 0
    
    return {
      totalCustomers,
      totalRevenue,
      completedCustomers,
      conversionRate,
      avgDealSize: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    }
  }, [customers])

  const handleExportData = () => {
    // Implementation for exporting metrics data
    console.log('Exporting pipeline metrics...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Analytics</h2>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Customers"
          value={keyMetrics.totalCustomers}
          icon={<Users className="h-5 w-5" />}
          color="text-blue-600"
          change={12}
          changeLabel="vs last period"
          trend="up"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${keyMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="text-green-600"
          change={8}
          changeLabel="vs last period"
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${keyMetrics.conversionRate.toFixed(1)}%`}
          icon={<Target className="h-5 w-5" />}
          color="text-purple-600"
          change={-2}
          changeLabel="vs last period"
          trend="down"
        />
        <MetricCard
          title="Avg Deal Size"
          value={`$${keyMetrics.avgDealSize.toLocaleString()}`}
          icon={<Award className="h-5 w-5" />}
          color="text-orange-600"
          change={5}
          changeLabel="vs last period"
          trend="up"
        />
        <MetricCard
          title="Completed Jobs"
          value={keyMetrics.completedCustomers}
          icon={<Activity className="h-5 w-5" />}
          color="text-teal-600"
          change={15}
          changeLabel="vs last period"
          trend="up"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Pipeline Funnel</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PipelineFunnel customers={customers} />
            <ConversionRates customers={customers} />
            <PipelineDistribution customers={customers} />
          </div>
          
          <RevenueTrends customers={customers} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineFunnel customers={customers} />
            <ConversionRates customers={customers} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: 'Opportunity', count: customers.filter(c => c.status === 'opportunity').length },
                  { stage: 'Booked', count: customers.filter(c => c.status === 'booked').length },
                  { stage: 'Confirmed', count: customers.filter(c => c.status === 'confirmed').length },
                  { stage: 'Completed', count: customers.filter(c => c.status === 'completed').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <RevenueTrends customers={customers} dateRange={dateRange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { month: 'Jan', customers: 12, revenue: 45000 },
                    { month: 'Feb', customers: 19, revenue: 67000 },
                    { month: 'Mar', customers: 15, revenue: 52000 },
                    { month: 'Apr', customers: 23, revenue: 78000 },
                    { month: 'May', customers: 18, revenue: 61000 },
                    { month: 'Jun', customers: 27, revenue: 89000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke={COLORS.primary} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win Rate by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { source: 'Google Ads', rate: 24, customers: 45 },
                    { source: 'Referrals', rate: 67, customers: 23 },
                    { source: 'Website', rate: 31, customers: 38 },
                    { source: 'Social Media', rate: 18, customers: 29 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress value={item.rate} className="h-2" />
                        </div>
                        <span className="text-sm font-bold w-12">{item.rate}%</span>
                        <span className="text-xs text-gray-500">({item.customers})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceTable metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stage Duration Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Opportunity', avgDays: 3.2, target: 2.0 },
                    { stage: 'Booked', avgDays: 8.5, target: 7.0 },
                    { stage: 'Confirmed', avgDays: 12.1, target: 10.0 },
                    { stage: 'In Progress', avgDays: 1.2, target: 1.0 }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.stage}</span>
                        <span className="text-sm">
                          {item.avgDays} days 
                          <span className="text-xs text-gray-500 ml-1">
                            (target: {item.target})
                          </span>
                        </span>
                      </div>
                      <Progress 
                        value={(item.target / item.avgDays) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'John Smith', deals: 12, revenue: 45000, rate: 78 },
                    { name: 'Sarah Johnson', deals: 8, revenue: 38000, rate: 65 },
                    { name: 'Mike Brown', deals: 15, revenue: 52000, rate: 82 },
                    { name: 'Lisa Davis', deals: 10, revenue: 41000, rate: 71 }
                  ].map((person, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{person.name}</div>
                        <div className="text-xs text-gray-500">
                          {person.deals} deals • ${person.revenue.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">{person.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}