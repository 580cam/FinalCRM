import { createClient } from '@/lib/supabase/server'
import { CustomerLayout } from '@/components/customer/CustomerLayout'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
}

interface Quote {
  id: number
  status: string
  created_at: string
  move_size: string | null
  referral_source: string | null
  service_type: string | null
  lead_id: number
}

export default async function CustomerSalesPage({ params }: { params: { id: string } }) {
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
      .select('id, status, created_at, move_size, referral_source, service_type, lead_id')
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

    return (
      <CustomerLayout
        quoteId={quoteId}
        leadInfo={leadInfo}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Sales Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quote.status}</div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(quote.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Move Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quote.move_size || 'Not specified'}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quote.referral_source || 'Unknown'}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end mt-6">
            <a href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Update Sales Stage
            </a>
          </div>
        </div>
      </CustomerLayout>
    );
  } catch (error) {
    console.error('Sales page error:', error);
    
    // Return error state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Sales Data</h1>
        <p className="text-red-500 mb-6">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <a href={`/customers/${id}/sales`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Try Again
        </a>
      </div>
    );
  }
}
