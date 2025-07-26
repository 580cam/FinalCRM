import { Metadata } from 'next'
import MarketingDashboard from '@/components/marketing/MarketingDashboard'
import MarketingCampaignsList from '@/components/marketing/MarketingCampaignsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMockMarketingData, getMockMarketingCampaigns } from '@/lib/mock/marketingData'

export const metadata: Metadata = {
  title: 'Marketing | High Quality Moving CRM',
  description: 'Analyze and manage marketing campaigns and performance',
}

export default function MarketingPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get tab from URL or default to dashboard
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'dashboard'
  
  // Get mock data
  const marketingData = getMockMarketingData()
  const campaigns = getMockMarketingCampaigns()
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Marketing</h1>
          <p className="mt-2 text-sm text-gray-700 max-w-3xl">
            Track campaign performance, analyze lead sources, and optimize marketing strategies.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex items-center gap-2">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            New Campaign
          </button>
        </div>
      </div>
      
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <MarketingDashboard data={marketingData} />
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <MarketingCampaignsList campaigns={campaigns} />
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-6">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Lead Sources Analysis</h2>
            <p className="text-gray-500">
              Lead source analysis component will be implemented here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
