import { Metadata } from 'next'
import DispatchCalendar from '@/components/dispatch/DispatchCalendar'
import DispatchResourceList from '@/components/dispatch/DispatchResourceList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMockDispatchEvents } from '@/lib/mock/dispatchData'

export const metadata: Metadata = {
  title: 'Dispatch | High Quality Moving CRM',
  description: 'Schedule and manage moves and resources',
}

export default function DispatchPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the view type from URL or default to 'month'
  const viewType = typeof searchParams.view === 'string' ? searchParams.view : 'month'
  
  // Get mock data
  const dispatchEvents = getMockDispatchEvents()
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Dispatch</h1>
          <p className="mt-2 text-sm text-gray-700 max-w-3xl">
            Schedule and manage moves, crews, and equipment.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar for resources */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white p-4 shadow-sm h-full">
            <DispatchResourceList />
          </div>
        </div>
        
        {/* Main calendar area */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm h-full">
            <Tabs defaultValue={viewType} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                    Today
                  </button>
                  <div className="flex">
                    <button className="px-3 py-2 rounded-l-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                      &lt;
                    </button>
                    <button className="px-3 py-2 rounded-r-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
              
              <TabsContent value="month" className="mt-2">
                <DispatchCalendar view="month" />
              </TabsContent>
              
              <TabsContent value="week" className="mt-2">
                <DispatchCalendar view="week" />
              </TabsContent>
              
              <TabsContent value="day" className="mt-2">
                <DispatchCalendar view="day" />
              </TabsContent>
              
              <TabsContent value="agenda" className="mt-2">
                <DispatchCalendar view="agenda" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
