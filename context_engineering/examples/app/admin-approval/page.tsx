'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AdminApprovalPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 px-4 py-8 sm:px-8">
        <div className="relative h-20 w-20">
          <Image
            src="/lock.svg"
            alt="Admin Approval Required"
            fill
            priority
            className="object-contain"
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Approval Required</h1>
          <p className="mt-2 text-base text-gray-600">
            Your account has been created, but requires admin approval before you can access the dashboard.
          </p>
        </div>
        
        <div className="w-full space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">What happens next?</h2>
            <p className="text-sm text-gray-600">
              An administrator will review your account request and grant you the appropriate access permissions.
            </p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Need immediate access?</h2>
            <p className="text-sm text-gray-600">
              Please contact your administrator at <span className="font-medium">admin@highqualitymoving.com</span> and provide your email address and request details.
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Return to Login'}
        </Button>
      </div>
    </div>
  )
}
