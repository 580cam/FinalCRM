import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, CreditCard, TrendingUp, BarChart4 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accounting | High Quality Moving CRM',
  description: 'Financial overview and accounting management for your moving company',
}

export default function AccountingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounting</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,231.00</div>
                <p className="text-xs text-muted-foreground">
                  +15.2% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,464.00</div>
                <p className="text-xs text-muted-foreground">
                  12 invoices pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$14,312.00</div>
                <p className="text-xs text-muted-foreground">
                  -2.5% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$9,919.00</div>
                <p className="text-xs text-muted-foreground">
                  +22.5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Overview of the most recent financial activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 text-sm font-medium text-muted-foreground">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Category</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                <div className="grid grid-cols-5 items-center gap-4 text-sm">
                  <div>Mar 15, 2025</div>
                  <div>Johnson Family Move - Payment</div>
                  <div>Income</div>
                  <div className="text-green-600">$2,450.00</div>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Completed
                  </div>
                </div>
                <div className="grid grid-cols-5 items-center gap-4 text-sm">
                  <div>Mar 14, 2025</div>
                  <div>Vehicle Maintenance - Truck #102</div>
                  <div>Expense</div>
                  <div className="text-red-600">-$435.00</div>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Paid
                  </div>
                </div>
                <div className="grid grid-cols-5 items-center gap-4 text-sm">
                  <div>Mar 12, 2025</div>
                  <div>Smith Office Relocation</div>
                  <div>Income</div>
                  <div className="text-green-600">$3,800.00</div>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    Pending
                  </div>
                </div>
                <div className="grid grid-cols-5 items-center gap-4 text-sm">
                  <div>Mar 10, 2025</div>
                  <div>Fuel - Weekly Expense</div>
                  <div>Expense</div>
                  <div className="text-red-600">-$685.00</div>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Paid
                  </div>
                </div>
                <div className="grid grid-cols-5 items-center gap-4 text-sm">
                  <div>Mar 08, 2025</div>
                  <div>Garcia Residential Move</div>
                  <div>Income</div>
                  <div className="text-green-600">$1,750.00</div>
                  <div className="flex items-center">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices Management</CardTitle>
              <CardDescription>Create, view, and manage customer invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section will contain invoice management functionality, including invoice creation, 
                tracking, and payment processing. Details will be implemented in subsequent development phases.
              </p>
              <div className="border rounded-md p-4 text-center">
                <p className="text-muted-foreground">Invoice management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>Track and categorize business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section will contain expense tracking functionality, including expense categorization, 
                budget management, and receipt tracking. Details will be implemented in subsequent development phases.
              </p>
              <div className="border rounded-md p-4 text-center">
                <p className="text-muted-foreground">Expense tracking features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This section will contain financial reporting tools, including profit and loss statements,
                balance sheets, and financial analytics. Details will be implemented in subsequent development phases.
              </p>
              <div className="border rounded-md p-4 text-center">
                <p className="text-muted-foreground">Financial reporting features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
