import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4 pb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24 mt-2" />
              <Skeleton className="h-4 w-36 mt-2" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array(2).fill(null).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card">
              <div className="p-6">
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-80 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-6">
            <Skeleton className="h-6 w-44 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
