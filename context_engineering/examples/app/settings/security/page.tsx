import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Shield, AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Settings | High Quality Moving CRM',
  description: 'Manage your security settings and account protection',
}

export default async function SecuritySettingsPage() {
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
    console.error('Error fetching user data:', userError)
  }

  const lastPasswordChange = 'Not available' // This would need to be retrieved from auth metadata

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Security Settings</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to maintain account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Toggle password visibility"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Toggle password visibility"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground mt-2">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                    At least 8 characters long
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                    Contains uppercase and lowercase letters
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                    Contains at least one number
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></span>
                    Contains at least one special character
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Toggle password visibility"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Email Authentication</div>
                <div className="text-sm text-muted-foreground">
                  Receive a verification code via email
                </div>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Authenticator App</div>
                <div className="text-sm text-muted-foreground">
                  Use an authenticator app to generate codes
                </div>
              </div>
              <Switch defaultChecked={false} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">SMS Authentication</div>
                <div className="text-sm text-muted-foreground">
                  Receive a verification code via SMS
                </div>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Configure 2FA</Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Security Information</CardTitle>
                <CardDescription>
                  Review your account security status and recent activity
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Last Password Change</h3>
                <p className="text-sm text-muted-foreground">{lastPasswordChange}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Last Login</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('en-US')
                    : 'Unknown'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Login Method</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email and Password'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Recent Login Activity</h3>
              <div className="border rounded-md">
                <div className="grid grid-cols-3 gap-4 p-4 border-b">
                  <div className="text-sm font-medium">Date & Time</div>
                  <div className="text-sm font-medium">IP Address</div>
                  <div className="text-sm font-medium">Device / Browser</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/30">
                  <div className="text-sm">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString('en-US')
                      : 'Unknown'}
                  </div>
                  <div className="text-sm">198.51.100.42</div>
                  <div className="text-sm">Windows / Chrome</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 border-b">
                  <div className="text-sm">Mar 15, 2025, 9:42 AM</div>
                  <div className="text-sm">198.51.100.42</div>
                  <div className="text-sm">Windows / Chrome</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div className="text-sm">Mar 14, 2025, 3:15 PM</div>
                  <div className="text-sm">198.51.100.42</div>
                  <div className="text-sm">Windows / Chrome</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Sign Out All Devices
            </Button>
            <Button variant="outline">
              View Full Activity Log
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
