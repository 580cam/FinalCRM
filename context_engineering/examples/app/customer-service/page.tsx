import { Metadata } from 'next'
import CustomerServiceTabs from '@/components/customer-service/CustomerServiceTabs'
import ReviewsPanel from '@/components/customer-service/ReviewsPanel'
import ClaimsPanel from '@/components/customer-service/ClaimsPanel'
import { getMockReviews } from '@/lib/mock/customerServiceData'
import { getMockClaims } from '@/lib/mock/customerServiceData'

export const metadata: Metadata = {
  title: 'Customer Service | High Quality Moving CRM',
  description: 'Manage customer reviews and claims',
}

export default function CustomerServicePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get tab from URL or default to reviews
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'reviews'
  
  // Get mock data
  const reviews = getMockReviews()
  const claims = getMockClaims()
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Customer Service</h1>
          <p className="mt-2 text-sm text-gray-700 max-w-3xl">
            Manage customer reviews and claims to ensure high-quality service delivery.
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-white shadow-sm">
        <CustomerServiceTabs 
          defaultTab={tab}
          reviewsContent={<ReviewsPanel reviews={reviews} />}
          claimsContent={<ClaimsPanel claims={claims} />}
        />
      </div>
    </div>
  )
}
