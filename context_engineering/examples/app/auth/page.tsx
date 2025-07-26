import { AuthForm } from '@/components/auth/auth-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (user && !error) {
    redirect('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">High Quality Moving</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account or create a new one</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
