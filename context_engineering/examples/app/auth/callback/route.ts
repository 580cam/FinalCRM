import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Define interface types for proper type checking
interface Role {
  permissions: Record<string, boolean>;
}

interface UserRole {
  roles: Role;
}

interface UserData {
  user_roles: UserRole[];
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=Unable to authenticate`)
    }

    if (session?.user) {
      // Check if user is signing in with OAuth (Google)
      const isOAuthUser = session.user.app_metadata?.provider === 'google'
      
      // For email/password users, check if email is verified
      if (!isOAuthUser && !session.user.email_confirmed_at) {
        console.log('Email not verified for:', session.user.email)
        return NextResponse.redirect(`${requestUrl.origin}/email-verification`)
      }
      
      // At this point, the user is either using OAuth or has a verified email
      console.log('Proceeding with authenticated user:', session.user.email)
        
      // Check if user exists in our users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, user_roles(role_id)')
        .eq('email', session.user.email)
        .single()

      if (userError || !existingUser) {
        console.log('Creating new user for:', session.user.email)
        
        // Get the 'new' role first
        const { data: newRole, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('role', 'new')
          .single()

        if (roleError || !newRole) {
          console.error('Error finding new role:', roleError)
          return NextResponse.redirect(`${requestUrl.origin}/auth?error=Role configuration error`)
        }

        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: session.user.email,
            first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: session.user.user_metadata?.full_name?.split(' ')[1] || '',
            profile_image: session.user.user_metadata?.avatar_url || null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single()

        if (createError || !newUser) {
          console.error('Error creating user:', createError)
          return NextResponse.redirect(`${requestUrl.origin}/auth?error=Unable to create user`)
        }

        // Assign 'new' role to user
        const { error: roleAssignError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: newUser.id,
            role_id: newRole.id,
            assigned_at: new Date().toISOString()
          }])

        if (roleAssignError) {
          console.error('Error assigning role:', roleAssignError)
          return NextResponse.redirect(`${requestUrl.origin}/auth?error=Unable to assign role`)
        }
        
        // New users always go to admin approval page
        return NextResponse.redirect(`${requestUrl.origin}/admin-approval`)
      } else if (!existingUser.user_roles || existingUser.user_roles.length === 0) {
        // User exists but doesn't have a role - assign the 'new' role
        const { data: newRole } = await supabase
          .from('roles')
          .select('id')
          .eq('role', 'new')
          .single()

        if (newRole) {
          await supabase
            .from('user_roles')
            .insert([{
              user_id: existingUser.id,
              role_id: newRole.id,
              assigned_at: new Date().toISOString()
            }])
        }
        
        return NextResponse.redirect(`${requestUrl.origin}/admin-approval`)
      }
      
      // Check user permissions for dashboard access
      const { data: userData, error: permissionError } = await supabase
        .from('users')
        .select('user_roles(roles(permissions))')
        .eq('email', session.user.email)
        .single() as { data: UserData | null, error: any }
        
      if (permissionError || !userData) {
        console.error('Error checking permissions:', permissionError)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=Unable to check permissions`)
      }
      
      let hasAccess = false
      
      if (userData.user_roles && 
          Array.isArray(userData.user_roles) && 
          userData.user_roles.length > 0 && 
          userData.user_roles[0].roles) {
          
        const permissions = userData.user_roles[0].roles.permissions
        hasAccess = permissions && permissions.dashboard === true
      }
      
      if (!hasAccess) {
        return NextResponse.redirect(`${requestUrl.origin}/admin-approval`)
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth?error=No code provided`)
}
