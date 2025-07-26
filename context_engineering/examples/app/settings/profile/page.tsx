import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = {
  title: 'Profile Settings | High Quality Moving CRM',
  description: 'Manage your profile settings and personal information',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (userError) {
    // Handle error - could redirect to an error page
    console.error('Error fetching user data:', userError)
  }

  const userInitials = userData?.first_name && userData?.last_name 
    ? `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and how others see you on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  {userData?.profile_image ? (
                    <AvatarImage src={userData.profile_image} alt={userData.first_name || 'User'} />
                  ) : (
                    <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max size of 3MB.
                  </p>
                </div>
              </div>
            </div>
            
            <form className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  defaultValue={userData?.first_name || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  defaultValue={userData?.last_name || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  defaultValue={userData?.email || user?.email || ''} 
                  disabled 
                />
                <p className="text-xs text-muted-foreground">
                  Email changes require verification and admin approval
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  defaultValue={userData?.phone || ''} 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input 
                  id="jobTitle" 
                  name="jobTitle" 
                  defaultValue={userData?.job_title || ''} 
                />
              </div>
              
              <div className="md:col-span-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience with the CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select 
                id="language" 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                defaultValue="en-US"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <select 
                id="timezone" 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                defaultValue="America/New_York"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select 
                id="dateFormat" 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                defaultValue="MM/DD/YYYY"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Details about your account status and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Account Type</span>
              <span className="text-sm">
                {userData?.user_roles?.[0]?.roles.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
            </div>
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm">
                {userData?.created_at 
                  ? new Date(userData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </span>
            </div>
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Login</span>
              <span className="text-sm">
                {user?.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString('en-US')
                  : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
