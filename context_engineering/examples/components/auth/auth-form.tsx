'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {}

interface Role {
  id: number;
  role: string;
  permissions: Record<string, boolean>;
}

interface UserRole {
  roles: Role;
}

interface UserData {
  id: number;
  email: string;
  user_roles: UserRole[];
}

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpFormValues = z.infer<typeof signUpSchema>
type LoginFormValues = z.infer<typeof loginSchema>

export function AuthForm({}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  })

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSignUp(values: SignUpFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      
      // Store the email in localStorage immediately for the email verification page
      localStorage.setItem('verification_email', values.email)
      console.log('[AuthForm] Stored email in localStorage for verification:', values.email)
      
      // First, check if the email already exists in our database
      const { data: existingUsers, error: userCheckError } = await supabase
        .from('users')
        .select('email')
        .eq('email', values.email)
        .limit(1)
      
      if (userCheckError) {
        console.error('[AuthForm] Error checking existing email:', userCheckError)
      }
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }
      
      // Create auth user - Supabase will handle duplicate email checking
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone
          }
        },
      })

      if (authError) {
        // Check for specific error messages related to existing accounts
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('already exists') ||
            authError.message?.includes('email taken')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        throw authError
      }

      if (!authData.user?.id) {
        throw new Error('Failed to create user account')
      }

      // Get the 'new' role ID first to ensure it exists
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role', 'new')
        .single()

      if (roleError || !roleData) {
        console.error('Role error:', roleError)
        throw new Error('Failed to retrieve role data')
      }

      // Create user record - following Authentication Workflow rule
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          status: 'pending', // Set to pending as per Authentication Workflow memory
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (userError || !newUser) {
        console.error('User creation error:', userError)
        throw new Error('Failed to create user record')
      }

      // Assign the user to the 'new' role
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_id: roleData.id,
          assigned_at: new Date().toISOString(),
        })

      if (userRoleError) {
        console.error('User role assignment error:', userRoleError)
        throw new Error('Failed to assign role to user')
      }

      console.log('[AuthForm] Sign up successful, navigating to email-verification')
      
      // Manual navigation with custom URL to force a hard refresh and avoid middleware issues
      window.location.href = '/email-verification'
    } catch (error) {
      console.error('[AuthForm] Sign up error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred during sign up')
      
      // Clean up localStorage on error
      localStorage.removeItem('verification_email')
    } finally {
      setIsLoading(false)
    }
  }

  async function onLogin(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) throw error

      // Check if email is verified (only for email/password users)
      if (data.user && !data.user.app_metadata?.provider && !data.user.email_confirmed_at) {
        console.log('[AuthForm] Email not verified, redirecting to verification page')
        
        // Store email in localStorage for verification page
        localStorage.setItem('verification_email', values.email)
        
        // Email not verified yet, redirect to verification page
        window.location.href = '/email-verification'
        return
      }

      // Check user role permissions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, user_roles!inner(roles!inner(id, role, permissions))')
        .eq('email', values.email)
        .single() as { data: UserData | null, error: any }

      if (userError) {
        console.error('[AuthForm] User fetch error:', userError)
        throw new Error('Unable to fetch user data')
      }

      // Check if the user has permission to access the dashboard
      let hasAccess = false
      
      if (userData?.user_roles && 
          Array.isArray(userData.user_roles) && 
          userData.user_roles.length > 0) {
        // Get the user's role permissions
        const roleData = userData.user_roles[0].roles
        
        if (roleData) {
          // Check if the role is 'new' which requires admin approval
          if (roleData.role === 'new') {
            // Redirect to admin approval page
            window.location.href = '/admin-approval'
            return
          }
          
          // Check if user has dashboard permission
          hasAccess = roleData.permissions?.dashboard === true
        }
      }
      
      if (hasAccess) {
        // Redirect to dashboard
        console.log('[AuthForm] User has dashboard access, redirecting')
        window.location.href = '/dashboard'
      } else {
        // Redirect to admin approval page
        console.log('[AuthForm] User lacks permissions, redirecting to admin approval')
        window.location.href = '/admin-approval'
      }
    } catch (error) {
      console.error('[AuthForm] Login error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Google sign in error:', error)
      setError(error instanceof Error ? error.message : 'Error signing in with Google')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Login'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" onClick={signInWithGoogle} disabled={isLoading} className="w-full">
          Continue with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
