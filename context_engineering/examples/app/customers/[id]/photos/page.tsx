import { createClient } from '@/lib/supabase/server'
import { CustomerLayout } from '@/components/customer/CustomerLayout'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

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

interface Photo {
  id: number;
  url: string;
  name: string;
  size: string;
  createdAt: string;
  thumbnailUrl: string;
}

interface File {
  id: number;
  name: string;
  size: string;
  createdAt: string;
  type: string;
}

export default async function CustomerPhotosPage({ params }: { params: { id: string } }) {
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

    // Mock photos and files data
    const photos: Photo[] = [
      {
        id: 1,
        url: 'https://source.unsplash.com/random/800x600?interior',
        thumbnailUrl: 'https://source.unsplash.com/random/200x150?interior',
        name: 'Living Room.jpg',
        size: '2.4 MB',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        url: 'https://source.unsplash.com/random/800x600?furniture',
        thumbnailUrl: 'https://source.unsplash.com/random/200x150?furniture',
        name: 'Furniture.jpg',
        size: '1.8 MB',
        createdAt: new Date().toISOString(),
      }
    ];

    const files: File[] = [
      {
        id: 1,
        name: 'Inventory List.pdf',
        size: '1.2 MB',
        type: 'pdf',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Contract.docx',
        size: '428 KB',
        type: 'docx',
        createdAt: new Date().toISOString(),
      }
    ];

    return (
      <CustomerLayout
        quoteId={quoteId}
        leadInfo={leadInfo}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Photos & Documents</h2>
            <a href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-1">
              <PlusCircle size={16} />
              Upload
            </a>
          </div>
          
          {/* Photos section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={photo.thumbnailUrl} 
                      alt={photo.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardFooter className="p-2">
                    <div className="w-full">
                      <p className="text-sm font-medium truncate">{photo.name}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{photo.size}</span>
                        <span>{new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Documents section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Documents</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span>{new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <a href="#" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">Download</a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CustomerLayout>
    );

  } catch (error) {
    console.error('Photos page error:', error);
    
    // Return error state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Photos Data</h1>
        <p className="text-red-500 mb-6">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <a href={`/customers/${id}/photos`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Try Again
        </a>
      </div>
    );
  }
}
