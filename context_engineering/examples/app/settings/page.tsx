import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BellRing, 
  Users, 
  Lock, 
  Database, 
  Mail, 
  Workflow, 
  Gauge, 
  Building2,
  FileText,
  Receipt,
  CircleDollarSign,
  Truck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Settings | High Quality Moving CRM',
  description: 'Configure your CRM system settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Get current user and their role permissions
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/auth')
  }

  // Get user data and role permissions
  const { data, error: userError } = await supabase
    .from('users')
    .select('*, user_roles(roles(role, permissions))')
    .eq('email', user.email)
    .single()

  // Check if admin, otherwise some settings won't be shown
  const isAdmin = data?.user_roles?.some(
    (userRole: { roles?: { role?: string } }) => userRole.roles?.role === 'admin'
  ) || false

  const settingsCategories = [
    {
      id: 'user',
      title: 'User Settings',
      description: 'Manage your personal settings and preferences',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Configure your notification preferences',
          icon: BellRing,
          href: '/settings/notifications',
          adminOnly: false
        },
        {
          id: 'profile',
          title: 'Profile Settings',
          description: 'Update your personal information and preferences',
          icon: Users,
          href: '/settings/profile',
          adminOnly: false
        },
        {
          id: 'security',
          title: 'Security',
          description: 'Manage your password and security settings',
          icon: Lock,
          href: '/settings/security',
          adminOnly: false
        }
      ]
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Manage system-wide configuration',
      items: [
        {
          id: 'users',
          title: 'User Management',
          description: 'Manage user accounts and permissions',
          icon: Users,
          href: '/settings/users',
          adminOnly: true
        },
        {
          id: 'company',
          title: 'Company Profile',
          description: 'Update company information and business details',
          icon: Building2,
          href: '/settings/company',
          adminOnly: true
        },
        {
          id: 'email',
          title: 'Email Settings',
          description: 'Configure email templates and notification settings',
          icon: Mail,
          href: '/settings/email',
          adminOnly: true
        },
        {
          id: 'integrations',
          title: 'Integrations',
          description: 'Connect with third-party services and APIs',
          icon: Workflow,
          href: '/settings/integrations',
          adminOnly: true
        },
        {
          id: 'performance',
          title: 'Performance',
          description: 'Configure system performance settings',
          icon: Gauge,
          href: '/settings/performance',
          adminOnly: true
        }
      ]
    },
    {
      id: 'modules',
      title: 'Module Settings',
      description: 'Configure settings for specific CRM modules',
      items: [
        {
          id: 'leads',
          title: 'Leads Settings',
          description: 'Configure lead management settings and workflows',
          icon: Users,
          href: '/settings/leads',
          adminOnly: true
        },
        {
          id: 'customers',
          title: 'Customer Settings',
          description: 'Configure customer management settings',
          icon: Users,
          href: '/settings/customers',
          adminOnly: true
        },
        {
          id: 'dispatch',
          title: 'Dispatch Settings',
          description: 'Configure dispatch and scheduling settings',
          icon: Truck,
          href: '/settings/dispatch',
          adminOnly: true
        },
        {
          id: 'quotes',
          title: 'Quote Settings',
          description: 'Configure quote templates and pricing rules',
          icon: FileText,
          href: '/settings/quotes',
          adminOnly: true
        },
        {
          id: 'invoices',
          title: 'Invoice Settings',
          description: 'Configure invoice templates and payment terms',
          icon: Receipt,
          href: '/settings/invoices',
          adminOnly: true
        },
        {
          id: 'accounting',
          title: 'Accounting Settings',
          description: 'Configure accounting settings and tax rates',
          icon: CircleDollarSign,
          href: '/settings/accounting',
          adminOnly: true
        }
      ]
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="space-y-8">
        {settingsCategories.map(category => (
          <div key={category.id}>
            <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items
                .filter(item => !item.adminOnly || isAdmin)
                .map(item => (
                  <Link key={item.id} href={item.href}>
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">{item.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
