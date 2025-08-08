# CRM Web Application PRP - Complete Business Management System

## Goal
Build the comprehensive web-based CRM application that serves as the primary business management interface for the moving company. This includes all 12 core modules: dashboard, lead management, customer management, sales pipeline, dispatch, customer service, AI voice center, marketing, accounting, reports, fleet management, and settings.

## Why
- **Primary Business Interface**: Main system where all moving company operations are managed
- **Multi-Role Access**: Supports sales team, dispatchers, customer service, management, and admin users
- **Real-Time Operations**: Live updates across all modules for coordinated business operations
- **Comprehensive Coverage**: Single interface for complete business management from lead to completion
- **Role-Based Workflows**: Different user roles see relevant functionality and data

## What
Complete Next.js 14 web application with 12 integrated modules providing full moving company business management, real-time data synchronization, advanced analytics, and role-based access control.

### Success Criteria
- [ ] All 12 core modules implemented with full functionality
- [ ] Role-based access control working across all modules
- [ ] Real-time data updates throughout the application
- [ ] Advanced dashboard with business intelligence
- [ ] Complete sales pipeline with drag-and-drop functionality
- [ ] GPS fleet tracking with live customer portal
- [ ] AI voice center integration for call handling
- [ ] Unified communication inbox across all channels
- [ ] Complete accounting integration with QuickBooks/Stripe
- [ ] Advanced reporting and analytics system
- [ ] Mobile-responsive design optimized for all devices

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app
  why: Next.js 14 App Router patterns and server components
  
- url: https://ui.shadcn.com/docs
  why: Shadcn/UI component library for consistent design system
  
- url: https://supabase.com/docs/guides/realtime/overview
  why: Real-time subscriptions for live data updates
  
- url: https://www.tremor.so/docs
  why: Tremor charts for dashboard analytics and reporting
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/CreateLeadModal.tsx
  why: Complex form patterns, validation, and modal management
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/dashboard/dashboard-content.tsx
  why: Dashboard layout and KPI display patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/app/api/leads/route.ts
  why: API integration patterns and error handling
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/app/customers/page.tsx
  why: Page layout and data fetching patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/ui/
  why: Complete UI component library patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/INITIAL.md
  why: Complete business requirements and feature specifications
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/CLAUDE.md
  why: Development standards and monorepo architecture
```

### Current Codebase Tree
```bash
context_engineering/examples/
├── app/                        # Next.js app router examples
│   ├── dashboard/             # Dashboard page patterns
│   ├── leads/                 # Lead management pages
│   ├── customers/             # Customer management pages
│   ├── dispatch/              # Dispatch calendar pages
│   └── api/                   # API route patterns
├── components/                 # React component examples
│   ├── ui/                    # Shadcn/UI components
│   ├── dashboard/             # Dashboard components
│   ├── leads/                 # Lead management components
│   ├── customers/             # Customer components
│   └── CreateLeadModal.tsx    # Complex form patterns
└── supabase/                  # Database client patterns
```

### Desired Codebase Tree (CRM Web Application)
```bash
packages/crm-web/              # Next.js 14 web application
├── app/                       # App router pages
│   ├── (auth)/               # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/            # Main dashboard
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── leads/                # Lead management module
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── components/
│   ├── customers/            # Customer management module
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── components/
│   ├── pipeline/             # Visual sales pipeline
│   │   ├── page.tsx
│   │   └── components/
│   ├── dispatch/             # Dispatch and scheduling
│   │   ├── page.tsx
│   │   ├── calendar/
│   │   └── fleet-tracking/
│   ├── customer-service/     # Customer service module
│   │   ├── page.tsx
│   │   ├── claims/
│   │   └── reviews/
│   ├── voice-center/         # AI voice call center
│   │   ├── page.tsx
│   │   ├── active-calls/
│   │   └── call-history/
│   ├── marketing/            # Marketing management
│   │   ├── page.tsx
│   │   ├── campaigns/
│   │   └── social-media/
│   ├── accounting/           # Financial management
│   │   ├── page.tsx
│   │   ├── invoices/
│   │   └── reports/
│   ├── reports/              # Business intelligence
│   │   ├── page.tsx
│   │   ├── analytics/
│   │   └── custom/
│   ├── fleet/                # Fleet and inventory
│   │   ├── page.tsx
│   │   ├── vehicles/
│   │   └── equipment/
│   ├── settings/             # Configuration
│   │   ├── page.tsx
│   │   ├── profile/
│   │   ├── notifications/
│   │   └── integrations/
│   ├── inbox/                # Unified communication
│   │   ├── page.tsx
│   │   └── components/
│   ├── layout.tsx            # Root layout with navigation
│   ├── loading.tsx           # Global loading component
│   ├── error.tsx             # Global error boundary
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # Shadcn/UI component library
│   ├── layout/               # Layout components (header, sidebar, nav)
│   ├── forms/                # Form components and modals
│   ├── charts/               # Data visualization components
│   ├── tables/               # Data table components
│   └── [module]/             # Module-specific components
├── hooks/                    # Custom React hooks
│   ├── useRealtime.ts        # Real-time subscription hooks
│   ├── useAuth.ts            # Authentication hooks
│   └── useBusiness.ts        # Business logic hooks
├── lib/                      # Utility functions
│   ├── utils.ts              # General utilities
│   ├── validations.ts        # Form validation schemas
│   └── constants.ts          # Application constants
└── types/                    # TypeScript type definitions
    ├── components.ts         # Component prop types
    └── pages.ts              # Page-specific types
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js 14 App Router patterns
// Example: Server components for data fetching, client components for interactivity
// Example: Proper use of loading.tsx and error.tsx for user experience
// Example: Server actions for form submissions and data mutations

// GOTCHA: Real-time subscriptions require proper cleanup
// Example: useEffect cleanup functions to prevent memory leaks
// Example: Proper channel subscription and unsubscription patterns

// GOTCHA: Role-based access control throughout the application
// Example: Server-side permission checks before page render
// Example: Client-side UI adjustments based on user permissions

// GOTCHA: Complex business forms require proper validation
// Example: Zod schemas for type-safe form validation
// Example: Multi-step forms with proper state management
```

## Implementation Blueprint

### Data Models and Structure

Core CRM interfaces building on the backend system:

```typescript
// Page and component interfaces
export interface DashboardStats {
  totalRevenue: number;
  activeLeads: number;
  scheduledMoves: number;
  conversionRate: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'lead_created' | 'quote_updated' | 'job_scheduled' | 'payment_received';
  description: string;
  user: string;
  timestamp: Date;
  relatedId?: string;
}

export interface PipelineColumn {
  status: QuoteStatus;
  title: string;
  count: number;
  value: number;
  quotes: Quote[];
}

// Navigation and permissions
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  current: boolean;
  permissions: string[];
}

export interface UserPermissions {
  canCreateLeads: boolean;
  canManageCustomers: boolean;
  canViewFinancials: boolean;
  canManageFleet: boolean;
  canAccessReports: boolean;
  canManageSettings: boolean;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Application Foundation
CREATE packages/crm-web/app/layout.tsx:
  - ESTABLISH root layout with navigation structure
  - INCLUDE header, sidebar, and main content areas
  - ADD authentication wrapper and permission checks
  - INTEGRATE real-time subscription providers
  - MIRROR patterns from examples/app/layout.tsx

Task 2: Authentication & Authorization System
CREATE packages/crm-web/app/(auth)/:
  - CREATE login/page.tsx with Supabase auth integration
  - CREATE signup/page.tsx with role assignment flow
  - ADD middleware for route protection
  - IMPLEMENT role-based access control
  - INCLUDE proper error handling and redirects

Task 3: Main Dashboard Module
CREATE packages/crm-web/app/dashboard/:
  - CREATE page.tsx with comprehensive business overview
  - ADD KPI cards (revenue, leads, moves, conversion)
  - IMPLEMENT real-time activity feed
  - CREATE interactive charts with Tremor
  - MIRROR patterns from examples/components/dashboard/

Task 4: Lead Management Module
CREATE packages/crm-web/app/leads/:
  - CREATE page.tsx with lead listing and filtering
  - ADD CreateLeadModal with complex form handling
  - IMPLEMENT lead assignment and claiming functionality
  - CREATE lead detail pages with full workflow
  - MIRROR patterns from examples/components/CreateLeadModal.tsx

Task 5: Customer Management Module
CREATE packages/crm-web/app/customers/:
  - CREATE page.tsx with customer listing and search
  - ADD customer detail pages with tabbed interface
  - IMPLEMENT quote management within customer context
  - CREATE job history and document management
  - INCLUDE photo management and inventory display

Task 6: Visual Sales Pipeline
CREATE packages/crm-web/app/pipeline/:
  - CREATE page.tsx with drag-and-drop kanban board
  - IMPLEMENT status-based columns with real-time updates
  - ADD quote filtering and bulk actions
  - CREATE inline editing for quick updates
  - INCLUDE pipeline analytics and conversion tracking

Task 7: Dispatch & Scheduling Module
CREATE packages/crm-web/app/dispatch/:
  - CREATE page.tsx with calendar-based job scheduling
  - ADD resource allocation (crews, vehicles, equipment)
  - IMPLEMENT GPS fleet tracking dashboard
  - CREATE customer tracking portal integration
  - ADD crew availability and skills matrix

Task 8: Customer Service Module
CREATE packages/crm-web/app/customer-service/:
  - CREATE page.tsx with claims and issues management
  - ADD review management with response automation
  - IMPLEMENT customer communication history
  - CREATE escalation workflows and resolution tracking
  - INCLUDE customer satisfaction monitoring

Task 9: AI Voice Center Module
CREATE packages/crm-web/app/voice-center/:
  - CREATE page.tsx with active call monitoring
  - ADD call history and analytics dashboard
  - IMPLEMENT real-time call coaching interface
  - CREATE automated response configuration
  - INCLUDE voice AI performance metrics

Task 10: Marketing Management Module
CREATE packages/crm-web/app/marketing/:
  - CREATE page.tsx with campaign management
  - ADD social media dashboard with unified posting
  - IMPLEMENT referral program tracking
  - CREATE lead source analytics and ROI tracking
  - INCLUDE automated campaign workflows

Task 11: Accounting & Financial Module
CREATE packages/crm-web/app/accounting/:
  - CREATE page.tsx with financial dashboard
  - ADD invoice management and payment tracking
  - IMPLEMENT QuickBooks and Stripe integration interfaces
  - CREATE payroll management with crew time integration
  - INCLUDE financial reporting and cash flow forecasting

Task 12: Business Intelligence & Reports
CREATE packages/crm-web/app/reports/:
  - CREATE page.tsx with comprehensive analytics dashboard
  - ADD custom report builder with drag-and-drop
  - IMPLEMENT scheduled report generation and export
  - CREATE performance optimization insights
  - INCLUDE industry-specific moving company reports

Task 13: Fleet & Inventory Management
CREATE packages/crm-web/app/fleet/:
  - CREATE page.tsx with vehicle and equipment tracking
  - ADD QR code scanning interface for inventory
  - IMPLEMENT maintenance scheduling and alerts
  - CREATE supply reordering automation interface
  - INCLUDE equipment lifecycle management

Task 14: Settings & Configuration
CREATE packages/crm-web/app/settings/:
  - CREATE page.tsx with system configuration
  - ADD user management and role assignment
  - IMPLEMENT notification preferences and workflows
  - CREATE integration settings for third-party services
  - INCLUDE business rule configuration interface

Task 15: Unified Communication Inbox
CREATE packages/crm-web/app/inbox/:
  - CREATE page.tsx with multi-channel message management
  - ADD SMS, email, voice, and social media integration
  - IMPLEMENT AI-powered response suggestions
  - CREATE conversation threading and customer context
  - INCLUDE performance monitoring and response times

Task 16: Shared Components & Utilities
CREATE packages/crm-web/components/:
  - CREATE comprehensive UI component library
  - ADD form components with validation
  - IMPLEMENT data tables with sorting/filtering
  - CREATE chart and visualization components
  - INCLUDE modal and dialog management
```

### Per Task Pseudocode

```typescript
// Task 1: Application Foundation
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans", fontSans.variable)}>
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

// Task 3: Main Dashboard
export default async function DashboardPage() {
  // Server-side data fetching
  const [stats, activities] = await Promise.all([
    getDashboardStats(),
    getRecentActivities()
  ]);

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      <StatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

// Task 6: Visual Sales Pipeline
"use client";
export default function PipelinePage() {
  const [columns, setColumns] = useState<PipelineColumn[]>([]);
  
  // Real-time subscription to quote updates
  useEffect(() => {
    const subscription = supabase
      .channel('quotes_pipeline')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'quotes' 
      }, handleQuoteUpdate)
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto">
        {columns.map(column => (
          <PipelineColumn 
            key={column.status} 
            column={column}
            onQuoteUpdate={updateQuote}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

// Task 11: Accounting Module
export default async function AccountingPage() {
  const [financialData, invoices] = await Promise.all([
    getFinancialOverview(),
    getRecentInvoices()
  ]);

  return (
    <div className="p-6 space-y-6">
      <FinancialHeader data={financialData} />
      <div className="grid gap-6 lg:grid-cols-3">
        <CashFlowChart />
        <RevenueBreakdown />
        <PaymentStatus />
      </div>
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
```

### Integration Points
```yaml
BACKEND:
  - consume: packages/shared/api/* for all business logic
  - subscribe: real-time channels for live data updates
  - integrate: third-party services through shared integrations
  
AUTHENTICATION:
  - pattern: Supabase Auth with role-based access control
  - middleware: Route protection and permission checks
  
UI_COMPONENTS:
  - library: Shadcn/UI for consistent design system
  - charts: Tremor for data visualization
  - forms: React Hook Form with Zod validation
  
REAL_TIME:
  - subscriptions: All core business data tables
  - notifications: User activity and system events
  - updates: Live dashboard metrics and pipeline changes
```

## Validation Loop

### Level 1: Component & Page Rendering
```bash
# Test component rendering and navigation
npm run dev
# Navigate to each module and verify pages load correctly
# Check responsive design on different screen sizes
# Verify all UI components render without errors

# Expected: All pages load, components render, navigation works
```

### Level 2: Authentication & Permissions Testing
```typescript
// CREATE __tests__/auth.test.tsx
describe('Authentication & Permissions', () => {
  test('redirects unauthenticated users to login', async () => {
    render(<DashboardPage />);
    expect(window.location.pathname).toBe('/login');
  });

  test('shows role-appropriate navigation items', () => {
    const salesUser = { role: 'sales', permissions: { leads: true, customers: true } };
    render(<Sidebar user={salesUser} />);
    
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  test('enforces page-level permissions', () => {
    const limitedUser = { role: 'crew', permissions: { reports: false } };
    render(<ReportsPage user={limitedUser} />);
    
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });
});
```

### Level 3: Real-Time Functionality Testing
```bash
# Test real-time subscriptions
# Open multiple browser windows with same user
# Create a lead in one window, verify it appears in others
# Update quote status in pipeline, verify column updates
# Check activity feed updates in real-time

# Expected: All real-time updates work across windows
```

### Level 4: Business Workflow Testing
```bash
# Test complete business workflows
# Create lead → convert to opportunity → book job → schedule crew
# Process payment → update job status → complete move
# Generate invoice → handle customer service issue
# Verify data consistency throughout workflow

# Expected: Complete workflows work end-to-end
```

## Final Validation Checklist
- [ ] All 12 modules implemented and accessible: Manual navigation testing
- [ ] Authentication and permissions working: Role-based access testing
- [ ] Real-time updates functioning: Multi-window testing
- [ ] Forms and modals working properly: User interaction testing  
- [ ] Dashboard showing accurate data: Business metrics verification
- [ ] Pipeline drag-and-drop functional: Quote status updates
- [ ] Mobile responsive design: Cross-device testing
- [ ] All API integrations working: Third-party service testing
- [ ] Error handling comprehensive: Edge case testing
- [ ] Performance optimized: Load time and render testing

---

## Anti-Patterns to Avoid
- ❌ Don't create business logic in components - use shared packages
- ❌ Don't ignore loading states - provide proper user feedback
- ❌ Don't skip error boundaries - handle failures gracefully
- ❌ Don't hardcode permissions - make them configurable
- ❌ Don't ignore real-time cleanup - prevent memory leaks
- ❌ Don't create inconsistent UI patterns - follow design system
- ❌ Don't skip accessibility - ensure WCAG compliance
- ❌ Don't ignore mobile users - responsive design is essential

**Confidence Level: 9/10** - Comprehensive context with existing patterns, detailed module specifications, and clear implementation roadmap for complete business management system.