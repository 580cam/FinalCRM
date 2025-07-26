import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  LineChart, 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Truck, 
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const metadata: Metadata = {
  title: 'Reports | High Quality Moving CRM',
  description: 'Analytics and reporting dashboard for your moving company',
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Date Range:</span>
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$145,679.32</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">
                  +18.2% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">182</div>
                <p className="text-xs text-muted-foreground">
                  +7.3% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Job Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,458.23</div>
                <p className="text-xs text-muted-foreground">
                  +3.1% from previous period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue comparison
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full border rounded flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Revenue chart will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Job Distribution</CardTitle>
                <CardDescription>
                  Jobs by type and location
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full border rounded flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Job distribution chart will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Performance trends across different business areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Customer Acquisition Cost</div>
                  <div className="text-2xl font-bold">$124.58</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↓ 8.2%</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Customer Retention Rate</div>
                  <div className="text-2xl font-bold">78.4%</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↑ 3.5%</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Average Response Time</div>
                  <div className="text-2xl font-bold">2.4 hrs</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↓ 15.3%</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Quote Conversion Rate</div>
                  <div className="text-2xl font-bold">42.7%</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↑ 5.1%</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">On-time Arrival Rate</div>
                  <div className="text-2xl font-bold">94.2%</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↑ 1.8%</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Customer Satisfaction</div>
                  <div className="text-2xl font-bold">4.7/5</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-1">↑ 0.2</span>
                    <span className="text-muted-foreground">vs previous</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Detailed analysis of sales performance and trends</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full border rounded flex flex-col items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Sales analytics will be displayed here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This section will include sales performance metrics, pipeline analysis, and conversion rates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer demographics, retention, and behavior analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full border rounded flex flex-col items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Customer analytics will be displayed here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This section will include customer segmentation, lifetime value, and satisfaction metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operations Analytics</CardTitle>
              <CardDescription>Performance metrics for your moving operations</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full border rounded flex flex-col items-center justify-center">
                <Truck className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Operations analytics will be displayed here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This section will include job completion rates, resource utilization, and efficiency metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Performance</CardTitle>
              <CardDescription>Analysis of marketing campaigns and channel effectiveness</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="h-full w-full border rounded flex flex-col items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Marketing analytics will be displayed here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This section will include campaign performance, lead sources, and conversion metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
