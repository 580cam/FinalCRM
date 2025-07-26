import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r p-4">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="flex-1">
        {/* Header Skeleton */}
        <div className="h-16 border-b bg-white px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>

          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
