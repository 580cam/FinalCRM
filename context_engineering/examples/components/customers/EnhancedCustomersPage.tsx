'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BarChart3, 
  Target, 
  Activity,
  Plus,
  Filter,
  Search,
  Download,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import CustomerPipeline from './CustomerPipeline'
import CustomerDetail from './CustomerDetail'
import PipelineMetrics from './PipelineMetrics'
import { ClientCustomersPage } from './ClientCustomersPage'
import {
  EnhancedCustomer,
  PipelineMetrics as PipelineMetricsType,
  CustomerStatus,
  CustomerPermissions
} from '@/types/customers'
import { cn } from '@/lib/utils'

interface EnhancedCustomersPageProps {
  initialCustomers: EnhancedCustomer[]
  currentUserId: number
  allUsers: Array<{ id: number; name: string }>
  isAdmin: boolean
  allStatusOptions: string[]
  opportunityStatusOptions: string[]
  permissions: CustomerPermissions
}

// Mock pipeline metrics - in real app would come from API
const mockMetrics: PipelineMetricsType = {
  opportunity_to_booked: 0.65,
  booked_to_confirmed: 0.82,
  confirmed_to_completed: 0.94,
  completed_to_reviewed: 0.75,
  avg_opportunity_duration: 3.2,
  avg_booked_duration: 8.5,
  avg_confirmed_duration: 12.1,
  total_pipeline_value: 485000,
  weighted_pipeline_value: 362000,
  average_deal_size: 4850,
  new_customers_this_month: 23,
  conversion_rate_this_month: 0.68,
  customer_lifetime_value: 7200,
  quote_acceptance_rate: 0.72,
  job_completion_rate: 0.96,
  customer_satisfaction_avg: 4.3,
  on_time_completion_rate: 0.89
}

export default function EnhancedCustomersPage({
  initialCustomers,
  currentUserId,
  allUsers,
  isAdmin,
  allStatusOptions,
  opportunityStatusOptions,
  permissions
}: EnhancedCustomersPageProps) {
  const [customers, setCustomers] = useState<EnhancedCustomer[]>(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pipeline')
  const [dateRange, setDateRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Transform customers to match EnhancedCustomer interface
  const enhancedCustomers: EnhancedCustomer[] = useMemo(() => {
    return customers.map(customer => ({
      ...customer,
      status: customer.status.toLowerCase().replace(' ', '_') as CustomerStatus,
      quotes: customer.quotes?.map(quote => ({
        ...quote,
        status: 'pending' as any, // Default quote status
        version: 1,
        is_current: true,
        base_cost: quote.total || 0,
        additional_services_cost: 0,
        materials_cost: 0,
        travel_cost: 0,
        fuel_cost: 0,
        total_amount: quote.total || 0,
        estimated_hours: 4,
        crew_size: 3,
        truck_count: 1,
        packing_services: false,
        unpacking_services: false,
        inventory: [],
        box_estimate: {
          small_boxes: 0,
          medium_boxes: 0,
          large_boxes: 0,
          wardrobe_boxes: 0,
          dish_boxes: 0,
          specialty_boxes: 0,
          total_boxes: 0,
          packing_paper_bundles: 0,
          bubble_wrap_rolls: 0,
          packing_tape_rolls: 0,
          total_materials_cost: 0,
          estimated_packing_hours: 0,
          estimated_unpacking_hours: 0
        },
        special_items: [],
        approval_required: false,
        win_probability: 0.7
      })) || [],
      jobs: [],
      activities: [],
      inventory: [],
      tags: [],
      conversion_probability: 0.7,
      customer_score: 75,
      total_interactions: 5,
      total_quoted_amount: customer.estimated_revenue || 0,
      payment_status: 'pending' as any,
      current_job: undefined,
      latest_quote: customer.quotes?.[0] ? {
        ...customer.quotes[0],
        status: 'pending' as any,
        version: 1,
        is_current: true,
        base_cost: customer.quotes[0].total || 0,
        additional_services_cost: 0,
        materials_cost: 0,
        travel_cost: 0,
        fuel_cost: 0,
        total_amount: customer.quotes[0].total || 0,
        estimated_hours: 4,
        crew_size: 3,
        truck_count: 1,
        packing_services: false,
        unpacking_services: false,
        inventory: [],
        box_estimate: {
          small_boxes: 0,
          medium_boxes: 0,
          large_boxes: 0,
          wardrobe_boxes: 0,
          dish_boxes: 0,
          specialty_boxes: 0,
          total_boxes: 0,
          packing_paper_bundles: 0,
          bubble_wrap_rolls: 0,
          packing_tape_rolls: 0,
          total_materials_cost: 0,
          estimated_packing_hours: 0,
          estimated_unpacking_hours: 0
        },
        special_items: [],
        approval_required: false,
        win_probability: 0.7
      } : undefined,
      addresses: {
        origin: customer.addresses.origin,
        destination: customer.addresses.destination,
        additional_stops: []
      },
      status_changed_at: customer.created_at,
      updated_at: customer.created_at,
      days_until_move: customer.quotes?.[0]?.jobs?.[0]?.move_date ? 
        Math.ceil((new Date(customer.quotes[0].jobs[0].move_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
        undefined
    }))
  }, [customers])

  // Handle customer status change
  const handleStatusChange = useCallback(async (customerId: number, newStatus: CustomerStatus) => {
    try {
      setIsLoading(true)
      
      // Update customer in state
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: newStatus }
          : customer
      ))
      
      // Update selected customer if it's the one being changed
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null)
      }
      
      // Here you would typically call an API to update the status
      // await updateCustomerStatus(customerId, newStatus)
      
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast.error('Failed to update customer status')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [selectedCustomer])

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer: EnhancedCustomer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }, [])

  // Handle customer update
  const handleCustomerUpdate = useCallback(async (updates: Partial<EnhancedCustomer>) => {
    if (!selectedCustomer) return

    try {
      setIsLoading(true)
      
      const updatedCustomer = { ...selectedCustomer, ...updates }
      
      // Update customer in state
      setCustomers(prev => prev.map(customer => 
        customer.id === selectedCustomer.id 
          ? updatedCustomer
          : customer
      ))
      
      setSelectedCustomer(updatedCustomer)
      
      // Here you would typically call an API to update the customer
      // await updateCustomer(selectedCustomer.id, updates)
      
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [selectedCustomer])

  // Get tab-specific customer counts
  const tabCounts = useMemo(() => {
    return {
      pipeline: enhancedCustomers.filter(c => ['opportunity', 'booked', 'confirmed', 'in_progress', 'completed'].includes(c.status)).length,
      list: enhancedCustomers.length,
      analytics: enhancedCustomers.length
    }
  }, [enhancedCustomers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer journey from opportunity to completion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{enhancedCustomers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${mockMetrics.total_pipeline_value.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mockMetrics.conversion_rate_this_month * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${mockMetrics.average_deal_size.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pipeline
            <Badge variant="secondary">{tabCounts.pipeline}</Badge>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer List
            <Badge variant="secondary">{tabCounts.list}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
            <Badge variant="secondary">{tabCounts.analytics}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6 mt-6">
          <CustomerPipeline
            customers={enhancedCustomers}
            metrics={mockMetrics}
            onStatusChange={handleStatusChange}
            onCustomerSelect={handleCustomerSelect}
            isLoading={isLoading}
            permissions={permissions}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <ClientCustomersPage
                initialCustomers={customers as any[]}
                currentUserId={currentUserId}
                allUsers={allUsers}
                isAdmin={isAdmin}
                allStatusOptions={allStatusOptions}
                opportunityStatusOptions={opportunityStatusOptions}
                tableType="all-customers"
                pageSize={25}
                currentPage={1}
                totalCustomers={customers.length}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <PipelineMetrics
            customers={enhancedCustomers}
            metrics={mockMetrics}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </TabsContent>
      </Tabs>

      {/* Customer Detail Modal */}
      <CustomerDetail
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedCustomer(null)
        }}
        onCustomerUpdate={handleCustomerUpdate}
        onStatusChange={(status) => selectedCustomer ? handleStatusChange(selectedCustomer.id, status) : Promise.resolve()}
        permissions={permissions}
      />
    </div>
  )
}