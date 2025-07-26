import { Skeleton } from "@/components/ui/skeleton"

export default function AccountingLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4 pb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 mt-2" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-6">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                  {Array(5).fill(null).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
