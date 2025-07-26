import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>
      
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
        
        <div className="mt-4">
          <Skeleton className="h-10 w-full mb-4" />
          
          <div className="space-y-3 mt-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
