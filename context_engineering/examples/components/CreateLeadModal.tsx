'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Database } from '@/types/supabase'
import { CalendarIcon, PlusCircle, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete'
import { toast } from 'sonner'
import { notifyLeadAssignment } from '@/lib/notifications'

interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Address {
  address: string
  type: 'origin' | 'destination'
}

interface FormData {
  name: string
  email: string
  phone: string
  referralSource: string
  moveDate: Date | undefined
  moveSize: string
  salesPerson: string
  serviceType: string
  addresses: Address[]
  notes: string
}

interface InsertQuote {
  lead_id: number
  status: string
  move_size: string
  referral_source: string
  service_type: string
  user_id: number | null
  is_self_claimed: boolean
}

interface InsertJob {
  quote_id: number
  move_date: string | null
  notes: string | null
}

interface InsertJobSchedule {
  job_id: number
  scheduled_date: string | null
}

interface InsertAddress {
  job_id: number
  address: string
  type: 'origin' | 'destination'
}

export default function CreateLeadModal({ 
  isOpen, 
  onClose,
  onSuccess = () => {}
}: CreateLeadModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  
  // Default form values to reset to
  const defaultFormValues: FormData = {
    name: '',
    email: '',
    phone: '',
    referralSource: '',
    moveDate: undefined,
    moveSize: '',
    salesPerson: '',
    serviceType: '',
    addresses: [{ address: '', type: 'origin' }],
    notes: ''
  }
  
  const [formData, setFormData] = useState<FormData>(defaultFormValues)

  // Define user type to match database schema
  interface Role {
    role: string
    permissions: {
      admin?: boolean
      dashboard: boolean
      leads: boolean
      customers: boolean
      dispatch: boolean
      tasks: boolean
      marketing: boolean
      reports: boolean
      settings: boolean
    }
  }

  interface UserRole {
    roles: Role
  }

  interface User {
    id: number
    email: string | null
    first_name: string | null
    last_name: string | null
    profile_image: string | null
    status: string | null
    phone: string | null
    created_at: string | null
    updated_at: string | null
    user_roles: UserRole[]
  }

  const [salesPeople, setSalesPeople] = useState<User[]>([])
  const [isLoadingSalesPeople, setIsLoadingSalesPeople] = useState(true)
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'AIzaSyBkgqL9hXnA8DIzK0Xi-S1pgLg2BZrOyc8'
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleChange = (key: keyof FormData, value: any) => {
    if (key === 'salesPerson' && typeof value === 'string') {
      // Validate sales person selection
      const selectedPerson = salesPeople.find(p => p.id.toString() === value)
      if (!selectedPerson) return
    }
    setFormData(prev => ({ ...prev, [key]: value }))
  }
  
  const handleAddressChange = (index: number, field: string, value: any) => {
    const updatedAddresses = [...formData.addresses]
    updatedAddresses[index] = { 
      ...updatedAddresses[index], 
      [field]: value 
    }
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }))
  }
  
  const addAddress = () => {
    if (formData.addresses.length < 10) {
      setFormData(prev => ({
        ...prev,
        addresses: [...prev.addresses, { address: '', type: 'destination' }]
      }))
    }
  }
  
  const removeAddress = (index: number) => {
    if (formData.addresses.length > 1) {
      const updatedAddresses = [...formData.addresses]
      updatedAddresses.splice(index, 1)
      setFormData(prev => ({ ...prev, addresses: updatedAddresses }))
    }
  }
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.referralSource) {
      setError('Customer name and referral source are required')
      return
    }
    
    setError(null)
    
    startTransition(async () => {
      try {
        // Get current user ID first, so we can set is_self_claimed appropriately
        let currentUserId: number | null = null
        
        const session = await supabase.auth.getSession()
        const currentUserEmail = session?.data?.session?.user?.email
        
        if (currentUserEmail) {
          const { data: currentUserData } = await supabase
            .from('users')
            .select('id')
            .eq('email', currentUserEmail)
            .single()
            
          if (currentUserData) {
            currentUserId = currentUserData.id
          }
        }
        
        // 1. Create lead
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
          .select('id')
          .single()
          
        if (leadError) throw leadError
        
        // 2. Create quote with hot lead status
        const quoteData: InsertQuote = {
          lead_id: leadData.id,
          status: 'hot lead',
          move_size: formData.moveSize,
          referral_source: formData.referralSource,
          service_type: formData.serviceType,
          user_id: formData.salesPerson ? parseInt(formData.salesPerson) : null,
          // Set is_self_claimed to true only if the current user is assigning to themselves
          is_self_claimed: formData.salesPerson && currentUserId ? (
            parseInt(formData.salesPerson) === currentUserId
          ) : false
        }
        const { data: quoteDataResult, error: quoteError } = await supabase
          .from('quotes')
          .insert(quoteData)
          .select('id')
          .single()
          
        if (quoteError) throw quoteError

        // 3. Create job with move date if specified
        let jobId: number | null = null;
        
        if (formData.moveDate || formData.addresses.length > 0 || formData.notes) {
          const jobData: InsertJob = {
            quote_id: quoteDataResult.id,
            move_date: formData.moveDate ? formData.moveDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
            notes: formData.notes || null
          }

          const { data: jobDataResult, error: jobError } = await supabase
            .from('jobs')
            .insert(jobData)
            .select('id')
            .single()

          if (jobError) throw jobError
          jobId = jobDataResult.id;
          
          // 3.1 Create job_schedule entry if we have a move date
          if (formData.moveDate && jobId) {
            const scheduledDate = formData.moveDate.toISOString();
            
            const jobScheduleData: InsertJobSchedule = {
              job_id: jobId,
              scheduled_date: scheduledDate
            };
            
            const { error: scheduleError } = await supabase
              .from('job_schedule')
              .insert(jobScheduleData);
              
            if (scheduleError) throw scheduleError;
          }
        }
        
        // 4. Insert addresses
        if (formData.addresses.length > 0 && jobId) {
          const addressData: InsertAddress[] = formData.addresses.map(addr => ({
            job_id: jobId,
            address: addr.address,
            type: addr.type
          }))

          const { error: addressError } = await supabase
            .from('job_addresses')
            .insert(addressData)
            
          if (addressError) throw addressError
        }
        
        // Handle success
        onSuccess()
        onClose()
        
        // Send notification for lead assignment if a sales person was selected
        // This will notify the assigned user that they have a new lead
        if (formData.salesPerson) {
          const assignedUserId = parseInt(formData.salesPerson);
          // Only pass currentUserId if it's not null
          await notifyLeadAssignment(
            assignedUserId, 
            currentUserId || undefined
          );
        }
        
        // Check if the lead was assigned to the current user for redirection
        if (currentUserId && formData.salesPerson && parseInt(formData.salesPerson) === currentUserId) {
          // Redirect to the customer sales page
          router.push(`/customers/${quoteDataResult.id}/sales`)
          return
        }
        
        // Show success notification for unassigned leads or leads assigned to others
        toast.success(`Lead "${formData.name}" has been created successfully`)
        
        // Otherwise just refresh the page
        router.refresh() // Refresh the page data
        
      } catch (error: any) {
        console.error('Error creating lead:', error)
        setError(error.message || 'Failed to create lead')
      }
    })
  }
  
  const phoneTypes = ['mobile', 'home', 'work', 'other']
  const moveSizes = [
    'Office (Small)',
    'Office (Medium)',
    'Office (Large)',
    'Room or Less',
    'Studio Apartment',
    '1 Bedroom Apartment',
    '2 Bedroom Apartment',
    '3 Bedroom Apartment',
    '1 Bedroom House',
    '1 Bedroom House (Large)',
    '2 Bedroom House',
    '2 Bedroom House (Large)',
    '3 Bedroom House',
    '3 Bedroom House (Large)',
    '4 Bedroom House',
    '4 Bedroom House (Large)',
    '5 Bedroom House',
    '5 Bedroom House (Large)',
    '5 x 10 Storage Unit',
    '5 x 15 Storage Unit',
    '10 x 10 Storage Unit',
    '10 x 15 Storage Unit',
    '10 x 20 Storage Unit'
  ]
  const serviceTypes = ['local', 'long distance', 'international', 'storage', 'packing', 'unpacking', 'other']
  const referralSources = ['Google', 'Yelp', 'Facebook', 'Instagram', 'Word Of Mouth', 'Website', 'Other']
  
  // Fetch list of sales people on component mount
  useEffect(() => {
    async function loadSalesPeople() {
      try {
        setIsLoadingSalesPeople(true)
        setError(null)
        
        // Get authenticated user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Auth error:', sessionError.message)
          router.push('/auth')
          return
        }
        
        if (!session?.user?.email) {
          router.push('/auth')
          return
        }

        // Get user data with roles and permissions
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id, 
            email, 
            first_name, 
            last_name,
            profile_image,
            status,
            phone,
            created_at,
            updated_at,
            user_roles(
              roles(
                role,
                permissions
              )
            )
          `)
          .eq('email', session.user.email)
          .single()
        
        if (userError) {
          console.error('Error fetching user data:', userError)
          setError('Unable to verify user permissions')
          router.push('/auth')
          return
        }

        // Check user role and status based on our auth flow
        const currentUser = userData as unknown as User
        const userRole = currentUser.user_roles?.[0]?.roles?.role

        if (!currentUser.user_roles?.length || userRole === 'new') {
          router.push('/admin-approval')
          return
        }

        if (!session.user.email_confirmed_at) {
          router.push('/email-verification')
          return
        }

        if (currentUser.status !== 'active') {
          router.push('/admin-approval')
          return
        }
        
        // Check if user has admin privileges based on permissions
        const isAdmin = currentUser.user_roles[0].roles.permissions.admin === true
        
        if (isAdmin) {
          // Admin can see all active users
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select(`
              id, 
              email, 
              first_name, 
              last_name,
              profile_image,
              status,
              phone,
              created_at,
              updated_at,
              user_roles(
                roles(
                  role,
                  permissions
                )
              )
            `)
            .eq('status', 'active')
            .not('user_roles.roles.role', 'eq', 'new') // Don't show new users
            .order('first_name', { ascending: true })
            
          if (usersError) {
            console.error('Error fetching users:', usersError)
            setError('Unable to load sales team')
            return
          }
          
          setSalesPeople((users || []).map(user => user as unknown as User))
        } else {
          // Non-admin only sees themselves
          setSalesPeople([currentUser])
        }
      } catch (error) {
        console.error('Error:', error)
        setError('An unexpected error occurred')
        router.push('/auth')
      } finally {
        setIsLoadingSalesPeople(false)
      }
    }
    
    loadSalesPeople()
  }, [supabase, router])
  
  // Format user name for display
  const formatUserName = (user: User) => {
    if (!user) return ''
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown'
  }

  // Simple Google Places status tracking
  const [googlePlacesOpen, setGooglePlacesOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Keep track of Google Places status
  const handleGooglePlacesInteraction = (isOpen: boolean) => {
    setGooglePlacesOpen(isOpen)
  }

  // Reset form when modal closes
  useEffect(() => {
    // When modal is closed, reset form data to defaults
    if (!isOpen) {
      setFormData(defaultFormValues)
      setError(null)
    }
  }, [isOpen])

  // Custom close handler to ensure form reset
  const handleClose = () => {
    onClose()
    // Form will be reset in the useEffect when isOpen changes
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" ref={modalRef}>
        {/* Custom X button that uses the same approach as the Cancel button */}
        <div className="absolute right-4 top-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new lead. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <div className="mt-1 text-sm text-destructive/90">
                  {error}
                  {isLoadingSalesPeople && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                        <span>Retrying...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Customer Name */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="name">Customer Name *</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Full name"
                  className="h-10 w-full"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="customer@example.com"
                  className="h-10 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-10 w-full"
                />
              </div>
              
              {/* Referral Source */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="referralSource">Referral Source *</Label>
                <Select 
                  value={formData.referralSource} 
                  onValueChange={(value) => handleChange('referralSource', value)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent>
                    {referralSources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Move Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Move Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Move Date */}
              <div className="grid gap-2">
                <Label htmlFor="moveDate">Move Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.moveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.moveDate ? (
                        format(formData.moveDate, "MMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.moveDate}
                      onSelect={(date) => handleChange('moveDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Move Size */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="moveSize">Move Size</Label>
                <Select 
                  value={formData.moveSize} 
                  onValueChange={(value) => handleChange('moveSize', value)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select move size" />
                  </SelectTrigger>
                  <SelectContent>
                    {moveSizes.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Service Type */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={formData.serviceType} 
                  onValueChange={(value) => handleChange('serviceType', value)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sales Person */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="salesPerson">Sales Person</Label>
                <Select 
                  value={formData.salesPerson} 
                  onValueChange={(value) => handleChange('salesPerson', value)}
                  disabled={isLoadingSalesPeople}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select sales person">
                      {isLoadingSalesPeople ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : (
                        salesPeople.find(p => p.id.toString() === formData.salesPerson)
                          ? formatUserName(salesPeople.find(p => p.id.toString() === formData.salesPerson)!)
                          : "Select sales person"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {salesPeople.map(person => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {formatUserName(person)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
            
          {/* Addresses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Addresses</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addAddress}
                disabled={formData.addresses.length >= 10}
                className="h-8"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Location
              </Button>
            </div>
            
            {formData.addresses.map((address, index) => (
              <div key={index} className="group relative">
                <div className="border rounded-md p-4 bg-gray-50 pr-8">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Select 
                        value={address.type} 
                        onValueChange={(value) => handleAddressChange(index, 'type', value)}
                      >
                        <SelectTrigger className="w-[140px] h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="origin">Origin</SelectItem>
                          <SelectItem value="destination">Destination</SelectItem>
                        </SelectContent>
                      </Select>
                      <GooglePlacesAutocomplete
                        apiKey={googleApiKey}
                        value={address.address}
                        onChange={(value) => handleAddressChange(index, 'address', value)}
                        placeholder="Enter a location"
                        onDropdownStatusChange={handleGooglePlacesInteraction}
                        modalRef={modalRef}
                        strict={false} // Set to non-strict mode to allow any address input
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeAddress(index)}
                  disabled={formData.addresses.length <= 1}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 hover:bg-gray-200 bg-white shadow-sm border"
                  aria-label="Remove address"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional information"
              className="min-h-[100px] w-full"
              rows={3}
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} className="h-10">Cancel</Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isLoadingSalesPeople || isPending} 
              className="h-10"
            >
              {isLoadingSalesPeople || isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Loading...</span>
                </div>
              ) : (
                "Create Lead"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
