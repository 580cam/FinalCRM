# Marketing Website PRP - Customer Acquisition & Self-Service Platform

## Goal
Create a comprehensive Next.js marketing website that serves as the primary customer acquisition channel for the moving company. This includes SEO-optimized landing pages, an exact 10-step quote form, Yembo AI integration, customer self-service portal, GPS tracking for customers, and conversion-optimized design to generate and capture high-quality leads.

## Why
- **Primary Lead Generation**: Main source of new customer acquisition and business growth
- **Customer Self-Service**: Reduce operational overhead by enabling customer self-management
- **Professional Brand Presence**: Establish credibility and trust with potential customers
- **SEO & Local Search**: Capture organic traffic and local moving searches
- **Conversion Optimization**: Convert website visitors into qualified leads and bookings
- **Customer Experience**: Provide transparent, real-time move tracking and communication

## What
Complete Next.js 14 marketing website with SEO-optimized pages, exact quote form implementation, Yembo AI integration, customer portal, GPS tracking, payment processing, and conversion-focused design optimized for moving company lead generation.

### Success Criteria
- [ ] Complete sitemap with 25+ service and location-specific landing pages
- [ ] Exact 10-step quote form implementation matching INITIAL.md specifications
- [ ] Yembo AI integration for visual inventory estimation
- [ ] Customer self-service portal with GPS tracking and payments
- [ ] Local SEO optimization for 9+ cities/neighborhoods
- [ ] Conversion tracking and analytics integration
- [ ] Mobile-responsive design optimized for all devices
- [ ] Fast loading speeds and Core Web Vitals optimization
- [ ] Lead capture and CRM integration for seamless handoff

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app/building-your-application/routing
  why: Next.js 14 App Router for dynamic pages and SEO optimization
  
- url: https://nextjs.org/docs/app/building-your-application/optimizing/seo
  why: SEO optimization patterns and meta tag management
  
- url: https://developers.google.com/maps/documentation/javascript
  why: Google Maps integration for service areas and customer tracking
  
- url: https://docs.yembo.ai/
  why: Yembo AI integration for visual inventory estimation
  
- url: https://stripe.com/docs/payments/quickstart
  why: Payment processing for deposits and final payments
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/GooglePlacesAutocomplete.tsx
  why: Address input patterns for quote form
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/estimationUtils.ts
  why: Pricing calculation logic for quote generation
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/app/api/leads/route.ts
  why: Lead creation API integration patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/INITIAL.md
  why: Exact quote form specifications and landing page requirements
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/CLAUDE.md
  why: Shared business logic integration and development standards
```

### Current Codebase Tree
```bash
packages/shared/                # Shared business logic to integrate
├── api/                       # Lead creation and pricing functions
├── utils/                     # Estimation and calculation utilities
├── integrations/              # Third-party service integrations
└── types/                     # Business logic type definitions

context_engineering/examples/   # Patterns to adapt for marketing site
├── components/                # Form and UI component patterns
├── app/api/                   # API integration examples
└── estimationUtils.ts         # Pricing calculation patterns
```

### Desired Codebase Tree (Marketing Website)
```bash
packages/website/              # Next.js 14 marketing website
├── app/                       # App router pages
│   ├── (marketing)/          # Marketing page group
│   │   ├── page.tsx          # Homepage with hero and services
│   │   ├── about/page.tsx    # About us page
│   │   ├── services/         # Service-specific landing pages
│   │   │   ├── local-moving/page.tsx
│   │   │   ├── long-distance/page.tsx
│   │   │   ├── packing-services/page.tsx
│   │   │   ├── storage-solutions/page.tsx
│   │   │   ├── office-moving/page.tsx
│   │   │   ├── specialty-items/page.tsx
│   │   │   └── [service]/page.tsx # Dynamic service pages
│   │   ├── locations/        # Location-specific SEO pages
│   │   │   ├── [city]/page.tsx # Dynamic city pages
│   │   │   ├── manhattan/page.tsx
│   │   │   ├── brooklyn/page.tsx
│   │   │   ├── queens/page.tsx
│   │   │   └── long-island/page.tsx
│   │   ├── quote/            # Quote form and results
│   │   │   ├── page.tsx      # Main quote form
│   │   │   ├── step/[step]/page.tsx # Dynamic step pages
│   │   │   ├── results/page.tsx # Quote results and booking
│   │   │   └── loading/page.tsx # Quote processing
│   │   ├── reviews/page.tsx  # Customer reviews and testimonials
│   │   ├── faq/page.tsx      # Frequently asked questions
│   │   ├── contact/page.tsx  # Contact information and form
│   │   └── blog/             # SEO blog content
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── (customer)/           # Customer portal group
│   │   ├── login/page.tsx    # Customer authentication
│   │   ├── dashboard/page.tsx # Customer dashboard
│   │   ├── track-move/page.tsx # GPS tracking interface
│   │   ├── documents/page.tsx # Document access
│   │   ├── payments/page.tsx # Payment management
│   │   ├── photos/page.tsx   # Photo gallery access
│   │   └── support/page.tsx  # Customer support
│   ├── api/                  # API routes
│   │   ├── quote/            # Quote generation endpoints
│   │   │   ├── route.ts      # Main quote API
│   │   │   ├── yembo/route.ts # Yembo integration
│   │   │   └── pricing/route.ts # Pricing calculations
│   │   ├── leads/route.ts    # Lead creation
│   │   ├── tracking/route.ts # GPS tracking API
│   │   ├── payments/route.ts # Stripe payment processing
│   │   ├── customer-auth/route.ts # Customer authentication
│   │   └── webhooks/         # Third-party webhooks
│   │       ├── stripe/route.ts
│   │       └── yembo/route.ts
│   ├── layout.tsx            # Root layout with analytics
│   ├── loading.tsx           # Global loading component
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404 page
│   ├── sitemap.xml           # Dynamic sitemap generation
│   ├── robots.txt            # SEO robots file
│   └── globals.css           # Global styles and branding
├── components/               # React components
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── marketing/            # Marketing-specific components
│   │   ├── Hero.tsx          # Homepage hero section
│   │   ├── Services.tsx      # Services overview
│   │   ├── Testimonials.tsx  # Customer testimonials
│   │   ├── LocalSEO.tsx      # Location-specific content
│   │   ├── CTASection.tsx    # Call-to-action sections
│   │   └── TrustSignals.tsx  # Trust badges and certifications
│   ├── quote-form/           # Quote form components
│   │   ├── QuoteWizard.tsx   # Main form wizard
│   │   ├── StepIndicator.tsx # Progress indicator
│   │   ├── ServiceTypeStep.tsx # Step 1: Service selection
│   │   ├── MoveTypeStep.tsx  # Step 2: Move type and property
│   │   ├── LocationStep.tsx  # Step 3: Addresses with autocomplete
│   │   ├── AdditionalInfoStep.tsx # Step 4: Additional services
│   │   ├── ConditionalStep.tsx # Step 5: Conditional questions
│   │   ├── ContactInfoStep.tsx # Step 6: Customer information
│   │   ├── YemboStep.tsx     # Step 7: Visual inventory (optional)
│   │   ├── ReviewStep.tsx    # Step 8: Review and confirm
│   │   ├── ProcessingStep.tsx # Step 9: Processing and calculation
│   │   └── ResultsStep.tsx   # Step 10: Results and booking
│   ├── customer-portal/      # Customer portal components
│   │   ├── Dashboard.tsx     # Customer dashboard
│   │   ├── MoveTracking.tsx  # GPS tracking display
│   │   ├── DocumentViewer.tsx # Document access
│   │   ├── PaymentForm.tsx   # Payment processing
│   │   ├── PhotoGallery.tsx  # Photo access
│   │   └── SupportChat.tsx   # Customer support
│   ├── tracking/             # GPS tracking components
│   │   ├── LiveMap.tsx       # Real-time crew location
│   │   ├── RouteDisplay.tsx  # Planned vs actual route
│   │   ├── ETACalculator.tsx # Estimated arrival time
│   │   └── StatusUpdates.tsx # Move status notifications
│   ├── seo/                  # SEO optimization components
│   │   ├── StructuredData.tsx # JSON-LD schema markup
│   │   ├── LocalBusiness.tsx # Local business schema
│   │   ├── ReviewSchema.tsx  # Review schema markup
│   │   └── BreadcrumbNav.tsx # SEO-friendly navigation
│   └── analytics/            # Analytics and tracking
│       ├── GoogleAnalytics.tsx
│       ├── ConversionTracking.tsx
│       ├── HeatmapTracking.tsx
│       └── LeadTracking.tsx
├── hooks/                    # Custom React hooks
│   ├── useQuoteForm.ts       # Quote form state management
│   ├── useCustomerAuth.ts    # Customer authentication
│   ├── useTracking.ts        # GPS tracking functionality
│   ├── usePayments.ts        # Payment processing
│   ├── useSEO.ts             # SEO optimization utilities
│   └── useYemboIntegration.ts # Yembo AI integration
├── lib/                      # Utility functions
│   ├── seo.ts                # SEO utilities and meta generation
│   ├── analytics.ts          # Analytics tracking utilities
│   ├── payments.ts           # Stripe integration utilities
│   ├── tracking.ts           # GPS tracking utilities
│   ├── yembo.ts              # Yembo AI integration
│   └── constants.ts          # Website constants and config
├── styles/                   # Styling and themes
│   ├── components.css        # Component-specific styles
│   ├── marketing.css         # Marketing page styles
│   └── branding.css          # Brand colors and typography
├── public/                   # Static assets
│   ├── images/               # Optimized images
│   ├── icons/                # Brand icons and favicons
│   ├── seo/                  # SEO-related assets
│   └── testimonials/         # Customer testimonial media
├── next.config.js            # Next.js configuration with SEO
├── package.json              # Dependencies and scripts
└── tailwind.config.js        # Tailwind CSS configuration
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: SEO optimization requirements
// Example: Dynamic meta tags for each service and location page
// Example: Structured data markup for local business schema
// Example: Core Web Vitals optimization for Google ranking

// GOTCHA: Quote form complexity and validation
// Example: Conditional logic based on previous selections
// Example: Address validation with Google Places API
// Example: Real-time pricing calculations with proper rounding

// GOTCHA: Yembo AI integration complexity
// Example: Handling visual inventory estimation workflow
// Example: Processing AI results and integrating with pricing
// Example: Fallback options when AI estimation unavailable

// GOTCHA: Customer portal security and access
// Example: Secure customer authentication without full user accounts
// Example: GPS tracking privacy and permission management
// Example: Payment processing compliance and security
```

## Implementation Blueprint

### Data Models and Structure

Website-specific interfaces extending shared backend types:

```typescript
// Quote form state management
export interface QuoteFormData {
  step: number;
  serviceType: ServiceType;
  moveType: 'residential' | 'commercial';
  propertyType: string;
  moveSize?: string;
  addresses: Address[];
  additionalServices: string[];
  conditionalAnswers: Record<string, any>;
  contactInfo: ContactInfo;
  yemboData?: YemboInventory;
  pricing?: EstimateResult;
  customerNotes?: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'text';
  moveDate?: Date;
  flexibleDates: boolean;
}

// Customer portal authentication
export interface CustomerAuth {
  email: string;
  moveDate: Date;
  lastFourSSN?: string;
  verificationCode?: string;
  authenticated: boolean;
  customerId?: string;
}

// GPS tracking for customers
export interface CustomerTracking {
  moveId: string;
  crewLocation: GPSLocation;
  route: GPSLocation[];
  estimatedArrival: Date;
  status: 'preparing' | 'en-route' | 'on-site' | 'completed';
  lastUpdate: Date;
}

// SEO page data
export interface SEOPageData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  structuredData: any;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Next.js Website Foundation
CREATE packages/website/next.config.js:
  - CONFIGURE Next.js 14 with App Router
  - ADD SEO optimization and sitemap generation
  - SETUP image optimization and performance
  - CONFIGURE domain and SSL settings
  - INCLUDE analytics and tracking integration

Task 2: Brand Design System & Styling
CREATE packages/website/styles/:
  - CREATE branding.css with exact color scheme (#D4A855 gold)
  - ADD typography system and component styles
  - IMPLEMENT responsive design breakpoints
  - CREATE marketing-specific styling patterns
  - ADD CSS animations and transitions

Task 3: Homepage & Marketing Foundation
CREATE packages/website/app/(marketing)/page.tsx:
  - CREATE hero section with compelling value proposition
  - ADD services overview with conversion-focused copy
  - IMPLEMENT testimonials and trust signals
  - CREATE call-to-action sections throughout
  - ADD conversion tracking integration

Task 4: Service-Specific Landing Pages
CREATE packages/website/app/(marketing)/services/:
  - CREATE local-moving/page.tsx with local SEO optimization
  - ADD long-distance/page.tsx with distance-specific content
  - CREATE packing-services/page.tsx with service details
  - ADD storage-solutions/page.tsx with storage options
  - CREATE office-moving/page.tsx with commercial focus
  - ADD specialty-items/page.tsx with high-value item handling

Task 5: Location-Based SEO Pages
CREATE packages/website/app/(marketing)/locations/:
  - CREATE [city]/page.tsx dynamic city pages
  - ADD specific pages for Manhattan, Brooklyn, Queens
  - IMPLEMENT local SEO optimization with structured data
  - CREATE location-specific service offerings
  - ADD local testimonials and case studies

Task 6: Exact Quote Form Implementation (Critical)
CREATE packages/website/app/(marketing)/quote/:
  - CREATE page.tsx with exact 10-step form specification
  - ADD step/[step]/page.tsx for each form step
  - IMPLEMENT conditional logic matching INITIAL.md exactly
  - CREATE Google Places autocomplete integration
  - ADD real-time validation and error handling

Task 7: Quote Form Steps (Exact Implementation)
CREATE packages/website/components/quote-form/:
  - CREATE ServiceTypeStep.tsx (6 service options)
  - ADD MoveTypeStep.tsx (residential/commercial with property types)
  - CREATE LocationStep.tsx (Google autocomplete, multiple addresses)
  - ADD AdditionalInfoStep.tsx (multi-select services)
  - CREATE ConditionalStep.tsx (based on previous selections)
  - ADD ContactInfoStep.tsx (customer information collection)

Task 8: Yembo AI Integration
CREATE packages/website/lib/yembo.ts:
  - INTEGRATE Yembo AI for visual inventory estimation
  - CREATE photo upload and processing interface
  - ADD AI result processing and pricing integration
  - IMPLEMENT fallback for manual inventory entry
  - CREATE inventory review and editing interface

Task 9: Quote Results & Booking System
CREATE packages/website/app/(marketing)/quote/results/:
  - CREATE page.tsx with pricing display and booking options
  - ADD calendar integration for move date selection
  - IMPLEMENT deposit payment processing with Stripe
  - CREATE lead creation and CRM integration
  - ADD email confirmation and follow-up automation

Task 10: Customer Authentication System
CREATE packages/website/app/(customer)/login/:
  - CREATE secure customer authentication without accounts
  - ADD verification using email + move date + identifier
  - IMPLEMENT temporary access token system
  - CREATE password-less authentication flow
  - ADD security measures for customer data protection

Task 11: Customer Self-Service Portal
CREATE packages/website/app/(customer)/:
  - CREATE dashboard/page.tsx with move overview
  - ADD documents/page.tsx for contract and document access
  - CREATE payments/page.tsx for balance and payment management
  - ADD photos/page.tsx for move photo gallery access
  - CREATE support/page.tsx for customer service contact

Task 12: GPS Tracking Interface
CREATE packages/website/app/(customer)/track-move/:
  - CREATE page.tsx with real-time crew location display
  - ADD interactive map with route and ETA
  - IMPLEMENT automatic status updates and notifications
  - CREATE arrival notifications and customer preparation alerts
  - ADD two-way communication with crew

Task 13: SEO Optimization & Analytics
CREATE packages/website/lib/seo.ts:
  - IMPLEMENT dynamic meta tag generation
  - ADD structured data markup for all page types
  - CREATE XML sitemap generation
  - ADD local business schema markup
  - IMPLEMENT Core Web Vitals optimization

Task 14: Payment Processing Integration
CREATE packages/website/api/payments/:
  - CREATE route.ts for Stripe payment processing
  - ADD deposit collection during booking
  - IMPLEMENT final payment processing
  - CREATE payment history and receipt management
  - ADD refund and adjustment capabilities

Task 15: Lead Generation & CRM Integration
CREATE packages/website/api/leads/:
  - CREATE route.ts for lead creation from quote form
  - ADD lead scoring based on quote form data
  - IMPLEMENT automatic lead assignment logic
  - CREATE email automation triggers
  - ADD lead tracking and analytics

Task 16: Customer Communication System
CREATE packages/website/components/customer-portal/:
  - CREATE SupportChat.tsx for customer service
  - ADD automated email notifications
  - IMPLEMENT SMS updates for move progress
  - CREATE customer satisfaction surveys
  - ADD review request automation

Task 17: Blog & Content Management
CREATE packages/website/app/(marketing)/blog/:
  - CREATE page.tsx with blog listing
  - ADD [slug]/page.tsx for individual blog posts
  - IMPLEMENT SEO-optimized content structure
  - CREATE related content recommendations
  - ADD social sharing and engagement features

Task 18: Performance & Conversion Optimization
CREATE packages/website/lib/analytics.ts:
  - IMPLEMENT Google Analytics 4 integration
  - ADD conversion tracking for quote submissions
  - CREATE heat mapping and user behavior tracking
  - ADD A/B testing framework for optimization
  - IMPLEMENT performance monitoring and alerts
```

### Per Task Pseudocode

```typescript
// Task 6: Exact Quote Form Implementation
export default function QuoteFormPage() {
  const [formData, setFormData] = useState<QuoteFormData>({
    step: 1,
    serviceType: '',
    moveType: 'residential',
    addresses: [{ address: '', type: 'origin' }],
    additionalServices: [],
    conditionalAnswers: {},
    contactInfo: { firstName: '', lastName: '', email: '', phone: '' }
  });

  const steps = [
    { id: 1, name: 'Service Type', component: ServiceTypeStep },
    { id: 2, name: 'Move Details', component: MoveTypeStep },
    { id: 3, name: 'Locations', component: LocationStep },
    { id: 4, name: 'Additional Services', component: AdditionalInfoStep },
    { id: 5, name: 'Details', component: ConditionalStep },
    { id: 6, name: 'Contact Info', component: ContactInfoStep },
    { id: 7, name: 'Processing', component: ProcessingStep },
    { id: 8, name: 'Your Quote', component: ResultsStep }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep={formData.step} totalSteps={steps.length} />
      <QuoteWizard 
        formData={formData}
        onUpdate={setFormData}
        onComplete={handleQuoteComplete}
      />
    </div>
  );
}

// Task 8: Yembo AI Integration
export async function processYemboInventory(photos: File[]): Promise<YemboResult> {
  try {
    // Upload photos to Yembo AI
    const uploadPromises = photos.map(photo => uploadToYembo(photo));
    const uploadResults = await Promise.all(uploadPromises);
    
    // Process inventory estimation
    const estimationRequest = {
      photos: uploadResults.map(r => r.photoId),
      moveType: 'residential',
      options: {
        includeBoxCount: true,
        includeCubicFeet: true,
        includeWeightEstimate: true
      }
    };
    
    const yemboResult = await yemboAPI.processInventory(estimationRequest);
    
    // Convert Yembo results to our pricing format
    const inventory: InventoryItem[] = yemboResult.items.map(item => ({
      id: item.id,
      name: item.name,
      cubicFeet: item.cubicFeet,
      quantity: item.quantity
    }));
    
    // Calculate pricing with AI inventory
    const pricing = await calculateEstimate({
      calculationMode: 'inventory',
      inventory,
      serviceType: 'Full Service',
      addresses: formData.addresses
    });
    
    return {
      success: true,
      inventory,
      pricing,
      confidence: yemboResult.confidence
    };
  } catch (error) {
    console.error('Yembo processing failed:', error);
    return {
      success: false,
      error: 'AI inventory estimation failed. Please use manual entry.',
      fallbackToManual: true
    };
  }
}

// Task 11: Customer Portal Dashboard
export default async function CustomerDashboard() {
  const customer = await getCurrentCustomer();
  const moveData = await getMoveData(customer.id);
  
  return (
    <div className="p-6 space-y-6">
      <WelcomeHeader customer={customer} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MoveStatusCard move={moveData} />
        <UpcomingEventsCard events={moveData.events} />
        <QuickActionsCard customerId={customer.id} />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDocuments customerId={customer.id} />
        <PaymentSummary moveId={moveData.id} />
      </div>
      
      {moveData.status === 'in-progress' && (
        <LiveTrackingSection moveId={moveData.id} />
      )}
    </div>
  );
}

// Task 12: GPS Tracking Interface
export default function TrackMoveePage({ params }: { params: { moveId: string } }) {
  const [tracking, setTracking] = useState<CustomerTracking | null>(null);
  const [mapCenter, setMapCenter] = useState<GPSLocation | null>(null);
  
  useEffect(() => {
    // Set up real-time tracking subscription
    const subscription = supabase
      .channel(`move_tracking_${params.moveId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'job_tracking',
        filter: `move_id=eq.${params.moveId}`
      }, handleTrackingUpdate)
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [params.moveId]);
  
  const handleTrackingUpdate = (payload: any) => {
    const newTracking = payload.new as CustomerTracking;
    setTracking(newTracking);
    setMapCenter(newTracking.crewLocation);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <TrackingHeader tracking={tracking} />
      
      <div className="flex-1 relative">
        <GoogleMap
          center={mapCenter}
          crewLocation={tracking?.crewLocation}
          route={tracking?.route}
          customerAddress={tracking?.destination}
        />
        
        <StatusPanel 
          status={tracking?.status}
          eta={tracking?.estimatedArrival}
          onContactCrew={handleContactCrew}
        />
      </div>
      
      <TrackingFooter 
        moveId={params.moveId}
        onEmergencyContact={handleEmergencyContact}
      />
    </div>
  );
}
```

### Integration Points
```yaml
SHARED_BACKEND:
  - consume: packages/shared/api/* for pricing and lead creation
  - integrate: Real-time job tracking and customer communication
  - connect: Payment processing and customer authentication
  
THIRD_PARTY_SERVICES:
  - yembo: AI visual inventory estimation
  - google: Maps, Places API, and Analytics
  - stripe: Payment processing and subscription management
  - analytics: Conversion tracking and optimization
  
SEO_OPTIMIZATION:
  - structured: Local business and service schema markup
  - dynamic: Meta tags and Open Graph for all pages
  - performance: Core Web Vitals and page speed optimization
  - local: Google My Business and local search optimization
  
CONVERSION_FUNNEL:
  - traffic: SEO and paid advertising landing pages
  - capture: Quote form with exact specifications
  - qualify: Lead scoring and CRM integration
  - convert: Booking system with payment processing
```

## Validation Loop

### Level 1: SEO & Performance Testing
```bash
# Test SEO optimization
npm run build
npm run start

# Check Core Web Vitals
npx lighthouse http://localhost:3000 --view
# Verify structured data markup
# Test mobile responsiveness
# Check page loading speeds

# Expected: High performance scores and proper SEO implementation
```

### Level 2: Quote Form Validation
```typescript
// CREATE __tests__/quote-form.test.tsx
describe('Quote Form Implementation', () => {
  test('follows exact 10-step specification from INITIAL.md', () => {
    render(<QuoteFormPage />);
    
    // Step 1: Service Type (6 options)
    expect(screen.getByText('Moving')).toBeInTheDocument();
    expect(screen.getByText('Packing')).toBeInTheDocument();
    expect(screen.getByText('Full Service')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Full Service'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Move Type
    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
  });

  test('integrates with Google Places API correctly', async () => {
    render(<LocationStep />);
    
    const addressInput = screen.getByPlaceholderText('Enter pickup address');
    fireEvent.changeText(addressInput, '123 Main St');
    
    await waitFor(() => {
      expect(mockGooglePlaces.autocomplete).toHaveBeenCalled();
    });
  });

  test('calculates pricing accurately', async () => {
    const formData: QuoteFormData = {
      serviceType: 'Full Service',
      moveSize: '3 Bedroom House',
      addresses: [
        { address: '123 Main St, NYC', type: 'origin' },
        { address: '456 Oak Ave, NYC', type: 'destination' }
      ]
    };
    
    const result = await calculateQuotePricing(formData);
    
    expect(result.total).toBeGreaterThan(0);
    expect(result.jobCharges).toBeDefined();
  });
});
```

### Level 3: Customer Portal Testing
```bash
# Test customer authentication and portal access
# Authenticate with email + move date + verification
# Access documents, payments, and tracking features
# Test GPS tracking with real-time updates
# Verify payment processing with test transactions

# Expected: Complete customer self-service functionality
```

### Level 4: Conversion Tracking Testing
```bash
# Test complete conversion funnel
# Landing page → Quote form → Results → Booking → Payment
# Verify analytics tracking at each step
# Test lead creation and CRM integration
# Check email automation triggers
# Validate conversion optimization features

# Expected: Full conversion funnel working with proper tracking
```

## Final Validation Checklist
- [ ] All landing pages optimized for SEO: Search visibility testing
- [ ] Quote form matches exact INITIAL.md specification: Requirement validation
- [ ] Yembo AI integration functional: Visual inventory testing
- [ ] Customer portal provides full self-service: Portal functionality testing
- [ ] GPS tracking accurate and real-time: Location tracking testing
- [ ] Payment processing secure and compliant: Transaction testing
- [ ] Core Web Vitals optimized: Performance testing
- [ ] Conversion tracking comprehensive: Analytics validation
- [ ] Mobile-responsive design perfect: Cross-device testing
- [ ] Lead generation and CRM integration working: End-to-end testing

---

## Anti-Patterns to Avoid
- ❌ Don't ignore SEO optimization - organic traffic is crucial for lead generation
- ❌ Don't deviate from exact quote form specification - business depends on accurate quotes
- ❌ Don't skip mobile optimization - majority of traffic is mobile
- ❌ Don't ignore Core Web Vitals - affects search rankings and conversions
- ❌ Don't skip conversion tracking - need data to optimize performance
- ❌ Don't ignore security - customer data and payments must be protected
- ❌ Don't skip performance optimization - slow sites lose customers
- ❌ Don't ignore accessibility - website must be usable by all customers

**Confidence Level: 9/10** - Comprehensive marketing website specification with exact quote form requirements, SEO optimization, customer portal, and conversion-focused design for successful lead generation and customer acquisition.