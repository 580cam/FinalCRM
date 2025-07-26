import { createClient } from '@/lib/supabase/server'
import { CustomerLayout } from '@/components/customer/CustomerLayout'
import { redirect, notFound } from 'next/navigation'
import { PlusCircle, Calendar, Truck, User, DollarSign, Package, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatTime } from '@/lib/formatters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { TRAVEL_CONSTANTS } from '@/lib/estimationUtils'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
}

interface Job {
  id: number
  quote_id: number
  move_date: string | null
  notes: string | null
  created_at: string
  job_charges?: JobCharge[]
  job_materials?: JobMaterial[]
  job_addresses?: JobAddress[]
  trucks: number
  movers: number
  move_distance: number | null
}

interface JobCharge {
  id: number
  job_id: number
  type: string
  amount: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  hourly_rate?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  hours?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  driving_time_mins?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  is_billable?: {
    initialValue: boolean
    estimatedValue: boolean
    actualValue: boolean | null
    isOverridden: boolean
  }
  price_per_mile?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  distance?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
  trucks?: {
    initialValue: number
    estimatedValue: number
    actualValue: number | null
    isOverridden: boolean
  }
}

interface JobMaterial {
  id: number
  job_id: number
  material_type: string
  estimated_quantity: {
    initialValue: {
      large: number
      small: number
      tvBox: number
      medium: number
      dishPack: number
      wardrobe: number
      mattressBag: number
    }
    estimatedValue: {
      large: number
      small: number
      tvBox: number
      medium: number
      dishPack: number
      wardrobe: number
      mattressBag: number
    }
    actualValue: any
    isOverridden: boolean
  }
  price_per_unit: {
    large: number
    small: number
    tvBox: number
    medium: number
    dishPack: number
    wardrobe: number
    mattressBag: number
  }
  total_estimated_cost: {
    initialValue: number
    estimatedValue: number
    actualValue: any
    isOverridden: boolean
  }
}

interface JobAddress {
  id: number
  job_id: number
  address: string
  property_name?: string
  unit_number?: string
  stairs?: string
  elevator?: boolean
  walk_distance?: string
  type: 'origin' | 'destination' | 'stop'
}

interface Quote {
  id: number
  status: string
  created_at: string
  move_size: string | null
  referral_source: string | null
  service_type: string | null
  lead_id: number
  total: number | null
  jobs?: Job[]
  packing_density?: string
}

export default async function CustomerQuotesPage({ params }: { params: { id: string } }) {
  // Properly await the params object
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  if (!id || isNaN(parseInt(id))) {
    console.error('Invalid ID parameter:', id);
    notFound();
  }

  const quoteId = parseInt(id);
  
  try {
    // Fetch quote data from the database
    const supabase = await createClient();
    
    console.log('Fetching quote with ID:', quoteId);
    
    // Get the quote information
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, status, created_at, move_size, referral_source, service_type, lead_id, total, packing_density')
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      console.error('Error fetching quote:', quoteError);
      throw new Error(`Error fetching quote: ${JSON.stringify(quoteError)}`);
    }
    
    if (!quote) {
      console.error('Quote not found for ID:', quoteId);
      notFound();
    }
    
    // Fetch the lead information separately
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, name, email, phone')
      .eq('id', quote.lead_id)
      .single();
    
    if (leadError) {
      console.error('Error fetching lead:', leadError);
    }

    // Extract lead info
    const leadInfo = {
      name: lead?.name || 'Unknown',
      email: lead?.email || 'No email provided',
      phone: lead?.phone || 'No phone provided',
      status: quote.status,
      createdAt: quote.created_at
    };

    // Get jobs associated with this quote with all their details
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, move_date, notes, created_at, trucks, movers, move_distance')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
    }

    // Enhanced jobs data with charges, materials and addresses
    const enhancedJobs = [];
    
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        // Fetch job charges
        const { data: jobCharges, error: chargesError } = await supabase
          .from('job_charges')
          .select('*')
          .eq('job_id', job.id);
          
        if (chargesError) {
          console.error(`Error fetching charges for job ${job.id}:`, chargesError);
        }
        
        // Fetch job materials
        const { data: jobMaterials, error: materialsError } = await supabase
          .from('job_materials')
          .select('*')
          .eq('job_id', job.id);
          
        if (materialsError) {
          console.error(`Error fetching materials for job ${job.id}:`, materialsError);
        }
        
        // Fetch job addresses
        const { data: jobAddresses, error: addressesError } = await supabase
          .from('job_addresses')
          .select('*')
          .eq('job_id', job.id)
          .order('type', { ascending: true }); // Origin first, then destination
          
        if (addressesError) {
          console.error(`Error fetching addresses for job ${job.id}:`, addressesError);
        }
        
        // Add all this data to the job object
        enhancedJobs.push({
          ...job,
          job_charges: jobCharges || [],
          job_materials: jobMaterials || [],
          job_addresses: jobAddresses || []
        });
      }
    }
    
    // Add the enhanced jobs to the quote
    const enhancedQuote = {
      ...quote,
      jobs: enhancedJobs
    };

    // Function to get total by charge type
    function calculateTotalByChargeType(charges: JobCharge[], type: string): number {
      return charges
        .filter(charge => charge.type === type)
        .reduce((sum, charge) => sum + (charge.amount?.estimatedValue || 0), 0);
    }

    // Function to get total charges for a job
    function calculateTotalCharges(charges: JobCharge[]): number {
      return charges.reduce((sum, charge) => {
        // Only include billable charges in the total
        const isBillable = charge.is_billable?.estimatedValue !== false;
        return sum + (isBillable ? (charge.amount?.estimatedValue || 0) : 0);
      }, 0);
    }

    return (
      <CustomerLayout
        quoteId={quoteId}
        leadInfo={leadInfo}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Quote #{quoteId}</h2>
              <p className="text-muted-foreground">
                {quote.service_type || 'Unknown service'} - {quote.move_size || 'Unknown size'}
              </p>
            </div>
            
            <Badge variant={
              quote.status === 'Opportunity' ? 'default' :
              quote.status === 'Booked' ? 'secondary' :
              quote.status === 'Confirmed' ? 'secondary' :
              quote.status === 'Lost' ? 'destructive' : 'outline'
            }>
              {quote.status}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>Created on {new Date(quote.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{quote.service_type || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Move Size</p>
                  <p className="font-medium">{quote.move_size || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Referral Source</p>
                  <p className="font-medium">{quote.referral_source || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Estimate</p>
                  <p className="font-medium">{formatCurrency(quote.total || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Move Jobs Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Jobs & Scheduling</h3>
            {enhancedQuote.jobs && enhancedQuote.jobs.length > 0 ? (
              <div className="space-y-6">
                {enhancedQuote.jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Job #{job.id}</CardTitle>
                        {job.move_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(job.move_date), 'EEEE, MMMM d, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Resources Section */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Resources
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
                            <span className="text-muted-foreground">Movers</span>
                            <span className="font-semibold">{job.movers || 0}</span>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
                            <span className="text-muted-foreground">Trucks</span>
                            <span className="font-semibold">{job.trucks || 0}</span>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
                            <span className="text-muted-foreground">Distance</span>
                            <span className="font-semibold">{(job.move_distance || 0).toFixed(1)} miles</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Addresses Section */}
                      {job.job_addresses && job.job_addresses.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-3">Locations</h4>
                          <div className="space-y-3">
                            {[...(job.job_addresses || [])].sort((a, b) => a.id - b.id).map((address) => (
                              <div key={address.id} className="bg-muted/30 p-3 rounded-md">
                                <div className="flex justify-between">
                                  <span className="font-medium capitalize">{address.type}</span>
                                  {address.property_name && (
                                    <span className="text-sm text-muted-foreground">{address.property_name}</span>
                                  )}
                                </div>
                                <p className="text-sm mt-1">{address.address}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {address.unit_number && (
                                    <Badge variant="outline">Unit: {address.unit_number}</Badge>
                                  )}
                                  {address.stairs && parseInt(address.stairs) > 0 && (
                                    <Badge variant="outline">Stairs: {address.stairs}</Badge>
                                  )}
                                  {address.elevator && (
                                    <Badge variant="outline">Elevator</Badge>
                                  )}
                                  {address.walk_distance && parseInt(address.walk_distance) > 0 && (
                                    <Badge variant="outline">Walk: {address.walk_distance} ft</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Charges Section */}
                      {job.job_charges && job.job_charges.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Charges
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {job.job_charges
                                // Sort charges in specific order
                                .sort((a, b) => {
                                  const typeOrder = {
                                    'packing': 1,
                                    'load': 2,
                                    'travel': 3,
                                    'unload': 4,
                                    'unpacking': 5,
                                    'materials': 6,
                                    'mileage': 7,
                                    'fuel': 8,
                                    'special_items': 9
                                  };
                                  
                                  // Get the order position for each type, defaulting to 999 for unknown types
                                  const aOrder = typeOrder[a.type as keyof typeof typeOrder] ?? 999;
                                  const bOrder = typeOrder[b.type as keyof typeof typeOrder] ?? 999;
                                  
                                  return aOrder - bOrder;
                                })
                                .map((charge) => (
                                <TableRow key={charge.id}>
                                  <TableCell className="font-medium capitalize">
                                    {charge.type}
                                    {charge.is_billable?.estimatedValue === false && (
                                      <Badge variant="destructive" className="ml-2">Non-billable</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {charge.hours && (
                                      <div className="text-sm">
                                        {formatTime(charge.hours.estimatedValue)}
                                        {charge.hourly_rate && ` @ $${charge.hourly_rate.estimatedValue}/hr`}
                                      </div>
                                    )}
                                    {charge.type === 'travel' && charge.driving_time_mins && (
                                      <div className="text-sm text-muted-foreground">
                                        {formatTime(charge.driving_time_mins.estimatedValue / 60)} drive time
                                      </div>
                                    )}
                                    {(charge.type === 'mileage' || charge.type === 'fuel') && (
                                      <div className="text-sm">
                                        <div>
                                          {charge.type === 'mileage' 
                                            ? `$${TRAVEL_CONSTANTS.MILEAGE_RATE_PER_MILE.toFixed(2)}/mile` 
                                            : `$${TRAVEL_CONSTANTS.FUEL_RATE_PER_MILE.toFixed(2)}/mile`} × {(job.move_distance || 0).toFixed(1)} miles
                                          {job.trucks && job.trucks > 0 && ` × ${job.trucks} ${job.trucks === 1 ? 'truck' : 'trucks'}`}
                                        </div>
                                      </div>
                                    )}
                                    {charge.type === 'materials' && (
                                      <div className="text-sm">
                                        <span className="font-medium">Packing Density:</span>{' '}
                                        <span className="capitalize">{quote.packing_density || 'Normal'}</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(charge.amount?.estimatedValue || 0)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={2} className="font-semibold">
                                  Total
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(calculateTotalCharges(job.job_charges))}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {/* Materials Section */}
                      {job.job_materials && job.job_materials.length > 0 && job.job_materials[0]?.estimated_quantity && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Materials
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Display materials in the specified order */}
                              {[
                                { key: 'small', label: 'Small Box' },
                                { key: 'medium', label: 'Medium Box' },
                                { key: 'large', label: 'Large Box' },
                                { key: 'dishPack', label: 'Dish Pack' },
                                { key: 'wardrobe', label: 'Wardrobe Box' },
                                { key: 'tvBox', label: 'TV Box' },
                                { key: 'mattressBag', label: 'Mattress Bag' }
                              ].map((item) => {
                                const quantity = job.job_materials[0].estimated_quantity.estimatedValue[item.key] || 0;
                                if (quantity <= 0) return null; // Skip if quantity is 0
                                
                                const unitPrice = job.job_materials[0].price_per_unit[item.key] || 0;
                                const itemTotal = unitPrice * quantity;
                                
                                return (
                                  <TableRow key={item.key}>
                                    <TableCell className="font-medium">{item.label}</TableCell>
                                    <TableCell>{quantity}</TableCell>
                                    <TableCell>{formatCurrency(unitPrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(itemTotal)}</TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow>
                                <TableCell colSpan={3} className="font-semibold">
                                  Total Materials
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(job.job_materials[0].total_estimated_cost.estimatedValue)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {/* Notes Section */}
                      {job.notes && (
                        <div>
                          <h4 className="font-semibold text-md mb-3">Notes</h4>
                          <div className="bg-muted/30 p-3 rounded-md whitespace-pre-line">
                            {job.notes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="bg-muted/20 flex justify-end space-x-2 py-3">
                      <a href={`/customers/${quoteId}/jobs/${job.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        Edit Job
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No move jobs created yet</p>
                  <a href="#" className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Job
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CustomerLayout>
    );

  } catch (error) {
    console.error('Quotes page error:', error);
    
    // Return error state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Quote Data</h1>
        <p className="text-red-500 mb-6">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <a href={`/customers/${id}/quotes`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Try Again
        </a>
      </div>
    );
  }
}
