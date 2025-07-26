import { createClient } from '@/lib/supabase/server'
import { CustomerLayout } from '@/components/customer/CustomerLayout'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

interface Invoice {
  id: number;
  number: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
}

interface Payment {
  id: number;
  date: string;
  amount: string;
  method: string;
  referenceNumber: string;
}

export default async function CustomerAccountingPage({ params }: { params: { id: string } }) {
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

    // Mock invoice and payment data
    const invoices: Invoice[] = [
      {
        id: 1,
        number: 'INV-001',
        date: '2025-02-12',
        dueDate: '2025-03-14',
        amount: '$1,250.00',
        status: 'Paid',
      },
      {
        id: 2,
        number: 'INV-002',
        date: '2025-03-01',
        dueDate: '2025-03-31',
        amount: '$750.00',
        status: 'Due',
      }
    ];

    const payments: Payment[] = [
      {
        id: 1,
        date: '2025-02-18',
        amount: '$1,250.00',
        method: 'Credit Card',
        referenceNumber: 'TX-87654321',
      }
    ];

    return (
      <CustomerLayout
        quoteId={quoteId}
        leadInfo={leadInfo}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Accounting</h2>
            <div className="flex gap-2">
              <a href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-1">
                <PlusCircle size={16} />
                Create Invoice
              </a>
              <a href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1">
                <PlusCircle size={16} />
                Record Payment
              </a>
            </div>
          </div>
          
          {/* Invoice summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'Due' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <a href="#" className="text-sm text-blue-600 hover:underline">View</a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Payment history */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference #</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="font-mono">{payment.referenceNumber}</TableCell>
                      <TableCell className="text-right">
                        <a href="#" className="text-sm text-blue-600 hover:underline">Details</a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );

  } catch (error) {
    console.error('Accounting page error:', error);
    
    // Return error state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Accounting Data</h1>
        <p className="text-red-500 mb-6">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <a href={`/customers/${id}/accounting`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Try Again
        </a>
      </div>
    );
  }
}
