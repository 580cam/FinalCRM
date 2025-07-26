import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth',
  '/login', 
  '/email-verification',
  '/admin-approval',
  '/auth/callback'
]

export async function middleware(request: NextRequest) {
  // Add debug logging to help trace middleware execution
  console.log('Middleware executing for path:', request.nextUrl.pathname)
  
  // Check if the current path should bypass middleware entirely
  const shouldBypass = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  )
  
  if (shouldBypass) {
    console.log('Bypassing middleware for public path:', request.nextUrl.pathname)
    return NextResponse.next()
  }
  
  // Only apply session checking for non-public paths
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images etc)
     * Also exclude certain auth-related paths from middleware processing
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth/.*$).*)',
  ],
}