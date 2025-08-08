# Core Backend System PRP - Foundation & Business Logic

## Goal
Create the complete backend foundation for the moving company CRM ecosystem including database schema, API infrastructure, business logic scripts, and real-time synchronization. This is the foundation that all frontend applications (CRM Web, CRM Mobile, Crew Mobile, Marketing Website) will consume.

## Why  
- **Foundation First**: Backend must be rock-solid before building any frontends
- **Shared Business Logic**: 80%+ of code will be shared across all 4 applications
- **Real-Time Operations**: Moving company operations require instant data sync
- **Complex Business Rules**: Moving industry has intricate pricing, scheduling, and workflow logic
- **Scalable Architecture**: Support multiple frontend applications from single backend

## What
Complete backend system that handles all moving company operations including lead management, job scheduling, crew coordination, pricing calculations, real-time notifications, and third-party integrations.

### Success Criteria
- [ ] Complete Supabase database schema with all tables and relationships
- [ ] All API routes for CRUD operations with proper authentication
- [ ] Business logic scripts for pricing, scheduling, and crew optimization
- [ ] Real-time subscriptions working across all data models
- [ ] Third-party integrations (Stripe, QuickBooks, Google Maps, Twilio)
- [ ] All estimation and calculation algorithms implemented
- [ ] Row Level Security (RLS) policies for multi-role access
- [ ] Complete TypeScript types generated from database schema

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://supabase.com/docs/guides/database/overview
  why: Database schema design and PostgreSQL best practices
  
- url: https://supabase.com/docs/guides/api/rest/introduction  
  why: Auto-generated REST API patterns and usage
  
- url: https://supabase.com/docs/guides/realtime/overview
  why: Real-time subscriptions for live data sync
  
- url: https://supabase.com/docs/guides/auth/row-level-security
  why: RLS policies for role-based access control
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/supabase/client.ts
  why: Existing Supabase client initialization pattern
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/app/api/leads/route.ts
  why: API route structure, authentication, and error handling patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/estimationUtils.ts
  why: Complex business logic patterns and calculation algorithms
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/chargeUtils.ts
  why: Charge calculation and job charge data structures
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/INITIAL.md
  why: Complete specification of all business requirements
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/CLAUDE.md  
  why: Project architecture, tech stack, and development guidelines
```

### Current Codebase Tree
```bash
context_engineering/
├── examples/                    # Existing patterns to follow
│   ├── supabase/               # Database client patterns
│   ├── app/api/                # API route examples
│   ├── estimationUtils.ts      # Business logic examples
│   ├── chargeUtils.ts         # Data structure examples
│   └── googleMapsUtils.ts     # Third-party integration examples
└── INITIAL.md                  # Complete business requirements
```

### Desired Codebase Tree (Backend Foundation)
```bash
packages/
├── shared/                     # Core business logic (80%+ of codebase)
│   ├── types/                 # TypeScript definitions
│   │   ├── database.ts        # Supabase generated types
│   │   ├── business.ts        # Business logic types
│   │   ├── api.ts            # API request/response types
│   │   └── index.ts          # Exported types
│   ├── database/              # Database configuration
│   │   ├── schema.sql        # Complete database schema
│   │   ├── seed.sql          # Initial data
│   │   ├── migrations/       # Database migrations
│   │   └── policies.sql      # RLS policies
│   ├── api/                   # Business logic and API helpers
│   │   ├── leads.ts          # Lead management logic
│   │   ├── quotes.ts         # Quote management logic  
│   │   ├── jobs.ts           # Job management logic
│   │   ├── customers.ts      # Customer management logic
│   │   ├── crews.ts          # Crew management logic
│   │   ├── scheduling.ts     # Scheduling algorithms
│   │   ├── pricing.ts        # Pricing calculations
│   │   ├── notifications.ts  # Real-time notifications
│   │   └── index.ts          # Exported functions
│   ├── utils/                 # Business utilities
│   │   ├── estimation.ts     # Move estimation algorithms
│   │   ├── calculations.ts   # Pricing and time calculations
│   │   ├── validation.ts     # Data validation schemas
│   │   ├── formatters.ts     # Data formatting utilities
│   │   └── index.ts          # Exported utilities
│   ├── integrations/          # Third-party service integrations
│   │   ├── stripe.ts         # Payment processing
│   │   ├── quickbooks.ts     # Accounting integration
│   │   ├── twilio.ts         # SMS and voice services
│   │   ├── google-maps.ts    # Maps and location services
│   │   ├── yembo.ts          # AI inventory estimation
│   │   └── index.ts          # Exported integrations
│   └── supabase/              # Database clients
│       ├── client.ts         # Browser client
│       ├── middleware.ts     # Next.js middleware client
│       ├── server.ts         # Server-side client
│       └── admin.ts          # Admin client for migrations
└── api/                       # Next.js API routes
    ├── leads/                 # Lead management endpoints
    ├── quotes/               # Quote management endpoints
    ├── jobs/                 # Job management endpoints
    ├── customers/            # Customer management endpoints
    ├── crews/                # Crew management endpoints
    ├── scheduling/           # Scheduling endpoints
    ├── notifications/        # Real-time notification endpoints
    ├── integrations/         # Third-party integration endpoints
    └── webhooks/             # Webhook handlers
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Supabase client initialization varies by environment
// Example: Different clients for browser, server, and admin operations
// Example: RLS policies require proper user context for security
// Example: Real-time subscriptions need proper cleanup to prevent memory leaks
// Example: TypeScript types must be generated after schema changes
// Example: Complex business logic should be in shared packages for monorepo consistency

// GOTCHA: Moving industry calculations have specific rounding rules
// Example: Time must round to nearest 15-minute increment (0.25 hours)
// Example: Crew size determination based on cubic feet thresholds
// Example: Handicap percentages affect time, not cost directly

// GOTCHA: Database transactions required for related record creation
// Example: Creating Lead → Quote → Job → Addresses must be atomic
// Example: Job charges have complex hierarchical charge item structure
```

## Implementation Blueprint

### Data Models and Structure

Core database schema following the hierarchical business model from INITIAL.md:

```typescript
// Core business entities with relationships
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phone_type?: 'mobile' | 'home' | 'work';
  status: 'active' | 'inactive' | 'converted';
  source: string;
  utm_data?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Quote {
  id: string;
  lead_id: string;
  status: 'hot lead' | 'lead' | 'opportunity' | 'booked' | 'confirmed' | 'complete' | 'reviewed';
  move_size: string;
  service_type: ServiceType;
  referral_source: string;
  user_id?: string; // Assigned salesperson
  pricing_data?: EstimateResult;
  created_at: Date;
  updated_at: Date;
}

export interface Job {
  id: string;
  quote_id: string;
  job_type: ServiceType;
  job_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  move_date: Date;
  estimated_duration: number;
  actual_duration?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Complete charge tracking system
export interface JobCharge {
  id: string;
  job_id: string;
  type: 'load' | 'unload' | 'packing' | 'unpacking' | 'travel' | 'materials' | 'special_items';
  hourly_rate?: ChargeValue;
  hours?: ChargeValue;
  amount: ChargeValue;
  is_billable: ChargeValue;
}

export interface ChargeValue {
  calculatedValue: number;
  overriddenValue?: number;
  isOverridden: boolean;
  reason?: string;
  unit: string;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Database Schema Setup
MODIFY packages/shared/database/schema.sql:
  - CREATE all core tables (leads, quotes, jobs, job_addresses, job_charges, etc.)
  - ESTABLISH foreign key relationships following Lead → Quote → Job hierarchy
  - ADD proper indexes for query performance
  - INCLUDE all fields from INITIAL.md specification

Task 2: Row Level Security Policies  
MODIFY packages/shared/database/policies.sql:
  - CREATE RLS policies for role-based access (sales, dispatch, crew, admin)
  - ENABLE different permissions per user role and data ownership
  - SECURE customer data and business operations
  - ALLOW real-time subscriptions with proper security

Task 3: TypeScript Type Generation
CREATE packages/shared/types/database.ts:
  - GENERATE types from Supabase schema using CLI
  - EXPORT all database table types
  - INCLUDE relationship types and join queries
  - MAINTAIN type safety across all applications

Task 4: Business Logic Types
CREATE packages/shared/types/business.ts:
  - DEFINE ServiceType, PackingIntensity, and business enums
  - CREATE EstimationParams and EstimateResult interfaces  
  - ESTABLISH address, inventory, and charge value types
  - MIRROR patterns from examples/estimationUtils.ts

Task 5: Supabase Client Configuration
CREATE packages/shared/supabase/:
  - MODIFY client.ts - browser client with proper environment variables
  - CREATE server.ts - server-side client for API routes
  - CREATE middleware.ts - Next.js middleware client
  - CREATE admin.ts - admin client for database operations
  - MIRROR patterns from examples/supabase/client.ts

Task 6: Core API Business Logic
CREATE packages/shared/api/:
  - CREATE leads.ts - lead management functions
  - CREATE quotes.ts - quote management and status progression
  - CREATE jobs.ts - job lifecycle and crew assignment
  - CREATE customers.ts - customer data and history
  - INCLUDE proper error handling and validation
  - MIRROR patterns from examples/app/api/leads/route.ts

Task 7: Estimation & Calculation Engine
CREATE packages/shared/utils/estimation.ts:
  - MIGRATE estimation algorithms from examples/estimationUtils.ts
  - IMPLEMENT pricing calculations with proper rounding
  - CREATE crew size determination logic
  - ADD handicap percentage calculations
  - INCLUDE day-split logic for large moves

Task 8: Real-Time Subscription System
CREATE packages/shared/api/notifications.ts:
  - SETUP Supabase realtime channels for all core tables
  - CREATE subscription management functions
  - IMPLEMENT activity logging for all operations
  - ADD proper cleanup and error handling

Task 9: Third-Party Integrations Foundation
CREATE packages/shared/integrations/:
  - CREATE stripe.ts - payment processing integration
  - CREATE google-maps.ts - distance and location services
  - CREATE twilio.ts - SMS and voice communication
  - ADD proper error handling and retry logic
  - INCLUDE environment variable configuration

Task 10: API Route Infrastructure
CREATE Next.js API routes in api/:
  - CREATE leads/ - POST, GET, PUT, DELETE endpoints
  - CREATE quotes/ - quote management and status updates
  - CREATE jobs/ - job operations and crew assignment
  - CREATE scheduling/ - calendar and resource management
  - MIRROR authentication patterns from examples
  - INCLUDE proper validation and error responses

Task 11: Database Migrations and Seeding
CREATE packages/shared/database/migrations/:
  - CREATE initial migration with complete schema
  - ADD seed data for testing and development
  - INCLUDE proper rollback procedures
  - TEST migration process and data integrity

Task 12: Validation and Testing Infrastructure
CREATE packages/shared/utils/validation.ts:
  - CREATE Zod schemas for all business entities
  - ADD validation functions for API requests
  - INCLUDE proper error messages and field validation
  - MIRROR validation patterns from existing code
```

### Per Task Pseudocode

```typescript
// Task 1: Database Schema
-- Core hierarchical structure
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  phone_type lead_phone_type,
  status lead_status DEFAULT 'active',
  source TEXT NOT NULL,
  utm_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  status quote_status DEFAULT 'hot lead',
  move_size TEXT NOT NULL,
  service_type service_type NOT NULL,
  referral_source TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  pricing_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

// Task 5: Supabase Clients
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

// Task 6: Business Logic
export async function createLead(data: CreateLeadData): Promise<Lead> {
  const supabase = createServerClient();
  
  // Validate input
  const validated = validateLeadData(data);
  
  // Create database record with proper error handling
  const { data: lead, error } = await supabase
    .from('leads')
    .insert(validated)
    .select()
    .single();
    
  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  
  // Trigger real-time notification
  await notifyLeadCreated(lead);
  
  return lead;
}
```

### Integration Points
```yaml
DATABASE:
  - migration: "Complete schema with all business entities"
  - indexes: "Performance indexes on commonly queried fields"
  - RLS: "Role-based security policies for all tables"
  
TYPES:
  - add to: packages/shared/types/
  - pattern: "Generated from database + business logic types"
  
API_ROUTES:  
  - add to: api/
  - pattern: "RESTful endpoints with proper authentication"
  
REALTIME:
  - channels: "Live subscriptions for all core business data"
  - notifications: "Activity logging and user notifications"
```

## Validation Loop

### Level 1: Database & Schema
```bash
# Test database connection and schema
npx supabase db push                 # Deploy schema changes
npx supabase db reset --debug        # Test fresh database setup
npx supabase gen types typescript --local --schema public > packages/shared/types/database.ts

# Expected: Schema deployed successfully, types generated
```

### Level 2: Business Logic Testing
```typescript
// CREATE __tests__/estimation.test.ts
describe('Estimation Engine', () => {
  test('calculates correct crew size for cubic feet', () => {
    const result = determineMovers(1200);
    expect(result).toBe(3); // 1200 cuft should require 3 movers
  });

  test('applies handicap percentages correctly', () => {
    const address: Address = { stairs: 2, elevator: true, walkDistance: 150 };
    const handicap = calculateHandicapPercentage(address);
    expect(handicap).toBe(0.45); // 9%*2 + 18% + 9%*1 = 45%
  });

  test('rounds time to quarter hours', () => {
    expect(roundTimeToQuarterHour(2.1)).toBe(2.25);
    expect(roundTimeToQuarterHour(2.8)).toBe(3.0);
  });
});
```

```bash
# Run business logic tests
npm test packages/shared/utils/
# Expected: All estimation and calculation tests pass
```

### Level 3: API Integration Testing
```bash
# Start development server
npm run dev

# Test lead creation API
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "phone": "555-1234",
    "referralSource": "Google",
    "moveSize": "3 Bedroom House"
  }'

# Expected: {"success": true, "lead": {...}, "quote": {...}, "job": {...}}

# Test real-time subscriptions
# Open browser to http://localhost:3000/test-realtime
# Create a lead and verify real-time update appears
```

## Final Validation Checklist
- [ ] Database schema deployed successfully: `npx supabase db push`
- [ ] All TypeScript types generated: `npx supabase gen types typescript`
- [ ] Business logic tests pass: `npm test packages/shared/`
- [ ] API endpoints respond correctly: Manual curl testing
- [ ] Real-time subscriptions working: Browser testing
- [ ] RLS policies secure data properly: Security testing
- [ ] Third-party integrations configured: Integration testing
- [ ] Error handling comprehensive: Edge case testing

---

## Anti-Patterns to Avoid
- ❌ Don't create business logic in API routes - keep it in shared packages
- ❌ Don't skip RLS policies - security is critical for customer data
- ❌ Don't ignore real-time cleanup - prevents memory leaks
- ❌ Don't hardcode business rules - make them configurable
- ❌ Don't skip database transactions - data integrity is essential
- ❌ Don't ignore TypeScript types - type safety prevents runtime errors
- ❌ Don't create separate calculation logic per app - centralize in shared

**Confidence Level: 8/10** - Comprehensive context provided with existing patterns, complete business requirements, and detailed implementation steps for one-pass success.