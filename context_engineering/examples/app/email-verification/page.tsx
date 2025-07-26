'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, RefreshCw, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Time limit for resending verification emails (in milliseconds)
const RESEND_COOLDOWN_MS = 60000 // 1 minute

export default function EmailVerificationPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendError, setResendError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // On component mount, check for stored cooldown time
  useEffect(() => {
    const lastResendTime = localStorage.getItem('verification_resend_time')
    if (lastResendTime) {
      const elapsed = Date.now() - parseInt(lastResendTime)
      if (elapsed < RESEND_COOLDOWN_MS) {
        // Still in cooldown period
        setResendCooldown(Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000))
      }
    }
  }, [])

  // Countdown timer for cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [resendCooldown])

  // On component mount, immediately check for stored email
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        
        // First check localStorage - our most reliable source
        const storedEmail = localStorage.getItem('verification_email')
        if (storedEmail) {
          console.log('[EmailVerification] Using stored email from localStorage:', storedEmail)
          setEmail(storedEmail)
          setIsLoading(false)
          return
        }
        
        // As a fallback, try to get from URL params
        const urlParams = new URLSearchParams(window.location.search)
        const emailParam = urlParams.get('email')
        if (emailParam) {
          console.log('[EmailVerification] Using email from URL params:', emailParam)
          setEmail(emailParam)
          localStorage.setItem('verification_email', emailParam)
          setIsLoading(false)
          return
        }
        
        // Last resort, try to get from session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          console.log('[EmailVerification] Using email from session:', session.user.email)
          setEmail(session.user.email)
          localStorage.setItem('verification_email', session.user.email)
          setIsLoading(false)
          return
        }
        
        // If we have absolutely no way to get the email, ask the user for it
        setIsLoading(false)
      } catch (error) {
        console.error('[EmailVerification] Error in init:', error)
        setIsLoading(false)
      }
    }
    
    init()
  }, [])

  const checkVerification = async () => {
    setIsChecking(true)
    try {
      // Force refresh the auth session before checking
      await supabase.auth.refreshSession()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email_confirmed_at) {
        console.log('[EmailVerification] Email is verified, proceeding to dashboard')
        
        // Clean up localStorage
        localStorage.removeItem('verification_email')
        localStorage.removeItem('verification_resend_time')
        
        // Use full page navigation to avoid middleware issues
        window.location.href = '/dashboard'
      } else {
        // Email not verified yet
        alert('Your email has not been verified yet. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      console.error('[EmailVerification] Error checking verification:', error)
      alert('Error checking verification status. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  const resendVerificationEmail = async () => {
    // Clear any previous errors
    setResendError(null)
    
    // Check if in cooldown period
    const lastResendTime = localStorage.getItem('verification_resend_time')
    if (lastResendTime) {
      const elapsed = Date.now() - parseInt(lastResendTime)
      if (elapsed < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
        setResendCooldown(remainingSeconds)
        setResendError(`Please wait ${remainingSeconds} seconds before requesting another email.`)
        return
      }
    }
    
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        // Check for rate limiting errors
        if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
          setResendError('You have requested too many emails. Please wait before trying again.')
          setResendCooldown(60) // Default 60 second cooldown
        } else {
          throw error
        }
      } else {
        // Set the cooldown timer
        const now = Date.now()
        localStorage.setItem('verification_resend_time', now.toString())
        setResendCooldown(Math.ceil(RESEND_COOLDOWN_MS / 1000))
        
        alert('Verification email resent! Please check your inbox.')
      }
    } catch (error) {
      console.error('[EmailVerification] Error resending verification email:', error)
      setResendError('Failed to resend verification email. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-700">Loading verification status...</p>
        </div>
      </div>
    )
  }

  // If no email is found after loading completes, show an email input form
  if (!email) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Email Verification</h1>
            <p className="mt-2 text-base text-gray-600">
              Please enter the email address you used to sign up
            </p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const emailInput = formData.get('email') as string;
            if (emailInput) {
              setEmail(emailInput);
              localStorage.setItem('verification_email', emailInput);
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <Button type="submit" className="w-full">Continue</Button>
          </form>
          
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/auth'}
            className="w-full text-sm text-gray-600"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 px-4 py-8 sm:px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-10 w-10 text-blue-600" />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Verify Your Email</h1>
          <p className="mt-2 text-base text-gray-600">
            We've sent a verification email to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        {resendError && (
          <Alert className="w-full border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertDescription className="text-amber-700">
              {resendError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="w-full space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Next steps:</h2>
            <ul className="ml-5 list-disc space-y-2 text-sm text-gray-600">
              <li>Check your email inbox</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you can continue to the dashboard</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3 pt-2">
            <Button 
              onClick={checkVerification}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I've verified my email
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resendVerificationEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  Resend available in {resendCooldown}s
                </>
              ) : (
                <>
                  Resend verification email
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="text-sm text-gray-600 hover:text-gray-900"
          onClick={() => {
            // Clean up localStorage if manually returning to auth
            localStorage.removeItem('verification_email');
            localStorage.removeItem('verification_resend_time');
            window.location.href = '/auth';
          }}
        >
          Back to login
        </Button>
      </div>
    </div>
  )
}
