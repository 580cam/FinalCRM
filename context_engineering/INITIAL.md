## FEATURE:

### Complete Moving Company Ecosystem with Monorepo Architecture

This is a comprehensive **4-application ecosystem** for a moving company, built using a **monorepo architecture** to maximize code sharing and maintain consistency across all customer and operational touchpoints.

#### **Architecture Overview:**
```
packages/
├── shared/           # Business logic & integrations (80%+ of codebase)
│   ├── api/         # Supabase clients, all API integrations
│   ├── utils/       # Business utilities (pricing, estimation, formatting)
│   ├── hooks/       # Custom React hooks
│   ├── stores/      # State management & real-time subscriptions
│   └── types/       # TypeScript definitions & database schemas
├── website/         # Marketing website (Next.js) - Customer-facing
├── crm-web/         # CRM web application (Next.js) - Management interface
├── crm-mobile/      # CRM mobile app (Expo) - Management on-the-go
├── crew-mobile/     # Crew mobile app (Expo) - Field operations
└── components/      # Shared component logic
```

#### **The 4 Applications:**

**1. Marketing Website** (`packages/website/`)
- **Purpose**: Customer-facing marketing site for the moving company
- **Features**: 
  - Static marketing pages with company information
  - Custom instant quote calculator with dynamic pricing
  - Online booking system with date/time selection
  - Yembo AI integration for visual inventory estimates
  - Lead capture forms with automated CRM integration
  - Service area coverage and pricing information
- **Technology**: Next.js with static generation, integrated with shared pricing logic

**2. CRM Web Application** (`packages/crm-web/`)
- **Purpose**: Comprehensive business management system for office staff
- **Features**:
  - Complete lead and customer management
  - Quote generation and approval workflows
  - Scheduling and dispatch management
  - Financial reporting and invoice generation
  - Team management and role-based access
  - Advanced analytics and business intelligence
  - Integration hub for all third-party services
- **Technology**: Next.js with full CRM functionality, advanced data visualization

- **Interface Structure**:
  - **Header**: 
    - Company logo (top left)
    - Right-side controls: notifications, inbox, search
    - Quick-add dropdown (+): new lead, new opportunity, new task, new follow-up
    - Profile dropdown: account settings, logout
  - **Sidebar Navigation**:
    - Dashboard (role-based overview)
    - Calendar (comprehensive scheduling view)
    - Tasks (task management)
    - Leads (lead pipeline management)
    - Customers (customer relationship management)
    - Dispatch (crew and resource coordination)
    - Fleet & Inventory (asset and resource management)
    - Customer Service (support and claims)
    - Marketing (campaign management)
    - Accounting (financial operations)
    - Reports (analytics and insights)
    - HR & Hiring (recruitment and applicant tracking)
    - Settings (system configuration)

**3. CRM Mobile App** (`packages/crm-mobile/`)
- **Purpose**: Full CRM access for managers and sales staff on mobile
- **Target Users**: Sales managers, operations managers, sales reps, customer service (field access)
- **Core Philosophy**: Complete feature parity with web CRM, optimized for mobile workflows and touch interaction
- **Key Mobile Advantages**:
  - Access CRM anywhere (customer visits, job sites, commute)
  - Push notifications for urgent leads and updates
  - Voice-to-text for quick note-taking and responses
  - Camera integration for photos and document scanning
  - GPS location context for nearby customers and jobs
  - Offline capability with sync when connection restored
- **Technology**: Expo/React Native with native mobile capabilities

**4. Crew Mobile App** (`packages/crew-mobile/`)
- **Purpose**: Specialized app for field crews and movers
- **Features**:
  - Job details and customer information
  - Crew availability confirmation and scheduling
  - Real-time job status updates (loading, in-transit, unloading)
  - Dynamic charge modifications and material adjustments
  - Address updates and route optimization
  - Customer signature capture and payment processing
  - Photo documentation for damage claims
  - Time tracking and crew check-in/check-out
- **Technology**: Expo/React Native with field-specific mobile features

#### **Key Benefits:**
- **80%+ Code Sharing**: All business logic, pricing calculations, API integrations, and data models shared across all 4 applications
- **Consistent Experience**: Same validation rules, calculations, and real-time sync from customer website to crew app
- **Unified Data Flow**: Real-time updates between marketing leads, CRM management, and field operations
- **Complete Customer Journey**: Seamless handoff from website quote to CRM management to crew execution
- **Operational Efficiency**: Field crews, managers, and customers all use the same underlying business logic

---

## **CURRENT DATABASE SCHEMA (Supabase)**

The following is the **existing database structure** that has already been implemented in Supabase. This represents the current foundation that all applications will build upon.

### **Core Business Tables**

#### **1. leads** (Customer Lead Management)
```sql
CREATE TABLE leads (
  id                bigint PRIMARY KEY,
  created_at        timestamptz NOT NULL DEFAULT now(),
  name              text,
  email             text,
  phone             text,
  updated_at        timestamptz
);
```

#### **2. quotes** (Quote Management & Pipeline)
```sql
CREATE TABLE quotes (
  id                  bigint PRIMARY KEY,
  created_at          timestamptz NOT NULL DEFAULT now(),
  lead_id             bigint REFERENCES leads(id),
  status              text,  -- 'hot lead', 'lead', 'opportunity', 'booked', 'confirmed', 'complete', 'reviewed'
  referral_source     text,
  move_size           text,
  inventory           jsonb,  -- Stores inventory data from Yembo AI or manual entry
  service_type        text,
  total               double precision,
  calculation_mode    text,   -- 'moveSize' or 'inventory'
  total_cubic_ft      double precision,
  total_weight        double precision,
  user_id             bigint REFERENCES users(id),  -- Assigned salesperson
  is_self_claimed     boolean DEFAULT false,
  packing_density     text
);
```

#### **3. jobs** (Job Execution & Management)
```sql
CREATE TABLE jobs (
  id                bigint PRIMARY KEY,
  created_at        timestamptz NOT NULL DEFAULT now(),
  quote_id          bigint REFERENCES quotes(id),
  job_type          text,
  job_status        text,
  move_date         timestamptz,
  movers            bigint,    -- Number of movers required
  trucks            bigint,    -- Number of trucks required
  estimated_hours   double precision,
  hourly_rate       double precision,
  total_price       double precision,
  move_distance     double precision,
  notes             text,
  updated_at        timestamptz,
  crew_id           bigint REFERENCES crews(id)
);
```

#### **4. job_addresses** (Multi-Location Support)
```sql
CREATE TABLE job_addresses (
  id              bigint PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),
  job_id          bigint REFERENCES jobs(id),
  type            text,    -- 'origin', 'destination'
  address         text,
  property_name   text,
  unit_number     text,
  stairs          text,    -- Number of flights
  walk_distance   text,    -- Distance from truck to door
  elevator        boolean,
  updated_at      timestamptz
);
```

#### **5. job_charges** (Detailed Pricing Breakdown)
```sql
CREATE TABLE job_charges (
  id                      bigint PRIMARY KEY,
  created_at              timestamptz NOT NULL DEFAULT now(),
  job_id                  bigint REFERENCES jobs(id),
  type                    text,  -- 'load', 'unload', 'packing', 'travel', 'materials', etc.
  amount                  jsonb,  -- { calculatedValue, overriddenValue, isOverridden, reason, unit }
  hourly_rate             jsonb,  -- Same structure as amount
  hours                   jsonb,
  number_of_crew          jsonb,
  number_of_trucks        jsonb,
  driving_time_mins       jsonb,
  origin_handicaps        jsonb,
  destination_handicaps   jsonb,
  stops_handicaps         jsonb,
  minimum_time            jsonb,
  fuel_cost               jsonb,
  milage_cost             jsonb,
  item_cost               jsonb,
  item_quantity           jsonb,
  custom_name             text,
  custom_price            jsonb,
  tips                    numeric,
  is_billable             jsonb,
  updated_at              timestamptz
);
```

#### **6. job_schedule** (Calendar Integration)
```sql
CREATE TABLE job_schedule (
  id              bigint PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),
  job_id          bigint REFERENCES jobs(id),
  scheduled_date  timestamptz,
  start_time      time,
  end_time        time,
  updated_at      timestamptz
);
```

### **User Management & Permissions**

#### **7. users** (System Users)
```sql
CREATE TABLE users (
  id              bigint PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),
  username        text,
  first_name      text,
  last_name       text,
  email           text,
  phone           text UNIQUE,
  status          text,      -- 'active', 'inactive', 'pending'
  profile_image   text,
  updated_at      timestamptz
);
```

#### **8. roles** (Role-Based Access Control)
```sql
CREATE TABLE roles (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  role          text,       -- 'admin', 'sales', 'dispatch', 'crew_leader', etc.
  permissions   jsonb,      -- Detailed permission structure
  updated_at    timestamptz
);
```

#### **9. user_roles** (User-Role Assignment)
```sql
CREATE TABLE user_roles (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  user_id       bigint REFERENCES users(id),
  role_id       bigint REFERENCES roles(id),
  assigned_at   timestamptz
);
```

### **Crew & Fleet Management**

#### **10. crews** (Crew Teams)
```sql
CREATE TABLE crews (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          bigint,     -- Crew identifier
  date          date,       -- Crew formation date
  updated_at    bigint
);
```

#### **11. crew_movers** (Crew Member Assignment)
```sql
CREATE TABLE crew_movers (
  -- Junction table for crew-mover relationships
  -- (Schema details retrieved separately)
);
```

#### **12. movers** (Individual Crew Members)
```sql
CREATE TABLE movers (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text,
  email         text,
  phone         text,
  status        text,      -- 'available', 'assigned', 'offline'
  updated_at    timestamptz
);
```

#### **13. trucks** (Vehicle Fleet)
```sql
CREATE TABLE trucks (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text,      -- Truck identifier
  size          text,      -- 'small', 'medium', 'large'
  status        text,      -- 'available', 'in_use', 'maintenance'
  updated_at    timestamptz
);
```

#### **14. crew_trucks** (Crew-Vehicle Assignment)
```sql
CREATE TABLE crew_trucks (
  -- Junction table for crew-truck relationships
  -- (Schema details retrieved separately)
);
```

### **Operations & Communication**

#### **15. activity_logs** (System Activity Tracking)
```sql
CREATE TABLE activity_logs (
  id                bigint PRIMARY KEY,
  created_at        timestamptz DEFAULT now(),
  lead_id           bigint REFERENCES leads(id),
  quote_id          bigint REFERENCES quotes(id),
  user_id           bigint REFERENCES users(id),
  activity_type     text NOT NULL,
  direction         text,           -- 'inbound', 'outbound'
  title             text NOT NULL,
  content           text,
  contact_method    text,           -- 'phone', 'email', 'sms'
  contact_value     text,           -- Phone number or email used
  metadata          jsonb,          -- Additional structured data
  display_location  jsonb           -- Where this activity should appear
);
```

#### **16. notifications** (System Notifications)
```sql
CREATE TABLE notifications (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  type          text,
  message       text,
  quote_id      bigint REFERENCES quotes(id)
);
```

#### **17. notification_recipients** (Notification Delivery)
```sql
CREATE TABLE notification_recipients (
  -- Junction table for notification delivery tracking
  -- (Schema details retrieved separately)
);
```

#### **18. tasks** (Task Management)
```sql
CREATE TABLE tasks (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  user_id       bigint REFERENCES users(id),
  task_name     text,
  description   text,
  due_date      text,        -- String representation of due date
  status        text,        -- 'pending', 'in_progress', 'completed'
  updated_at    timestamptz
);
```

#### **19. follow_ups** (Sales Follow-up Tracking)
```sql
CREATE TABLE follow_ups (
  id              bigint PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),
  quote_id        bigint REFERENCES quotes(id),
  user_id         bigint REFERENCES users(id),
  follow_up_date  timestamptz,
  method          text,        -- 'phone', 'email', 'text'
  notes           text,
  status          text,        -- 'scheduled', 'completed', 'missed'
  updated_at      timestamptz
);
```

### **Customer Service & Feedback**

#### **20. customer_service_claims** (Claims Management)
```sql
CREATE TABLE customer_service_claims (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  job_id        bigint REFERENCES jobs(id),
  claim_date    timestamptz,
  claim_type    text,        -- 'damage', 'delay', 'service_issue'
  details       text,
  status        text,        -- 'open', 'investigating', 'resolved', 'closed'
  resolution    text,
  resolved_by   bigint,      -- User ID who resolved the claim
  updated_at    timestamptz
);
```

#### **21. customer_feedback** (Customer Satisfaction)
```sql
CREATE TABLE customer_feedback (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  job_id        bigint REFERENCES jobs(id),
  rating        bigint,      -- 1-5 or 1-10 scale
  comments      text
);
```

#### **22. submitted_reviews** (Review System)
```sql
CREATE TABLE submitted_reviews (
  id              bigint PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),
  review_type     jsonb NOT NULL,     -- Review platform and type
  review_answers  jsonb,              -- Review responses
  estimate_id     text UNIQUE         -- Link to original estimate
);
```

### **Financial Operations**

#### **23. job_accounting** (Financial Tracking)
```sql
CREATE TABLE job_accounting (
  -- Financial records for jobs
  -- (Schema details retrieved separately)
);
```

#### **24. job_accounting_charges** (Detailed Financial Breakdown)
```sql
CREATE TABLE job_accounting_charges (
  -- Detailed charge breakdown for accounting
  -- (Schema details retrieved separately)
);
```

#### **25. job_materials** (Materials & Supplies Tracking)
```sql
CREATE TABLE job_materials (
  -- Materials used per job
  -- (Schema details retrieved separately)
);
```

### **Inventory & Reference Data**

#### **26. inventory_items** (Master Inventory List)
```sql
CREATE TABLE inventory_items (
  id            bigint PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  item          text,               -- Item name
  cubic_ft      double precision,   -- Cubic feet per item
  weight        double precision    -- Weight per item
);
```

---

### **Database Relationship Summary**

**Core Flow**: `leads` → `quotes` → `jobs` → `job_charges` + `job_addresses` + `job_schedule`

**User Management**: `users` ↔ `user_roles` ↔ `roles`

**Crew Operations**: `crews` ↔ `crew_movers` ↔ `movers` + `crew_trucks` ↔ `trucks`

**Activity Tracking**: `activity_logs` tracks all system interactions with references to leads, quotes, and users

**Customer Service**: `customer_service_claims` + `customer_feedback` + `submitted_reviews` all reference jobs

**Financial**: `job_accounting` + `job_accounting_charges` + `job_materials` provide complete financial tracking

---

## **DATABASE AUTOMATION (Triggers, Functions & Cron Jobs)**

The following automated database functions, triggers, and scheduled jobs are already implemented in your Supabase database:

### **Triggers & Functions**

#### **1. Lead Creation Activity Logging**
```sql
-- Trigger: leads_creation_activity_log_trigger (AFTER INSERT on leads)
-- Function: process_lead_creation_log()
```
**Purpose**: Automatically logs all new lead creation to `activity_logs` table
- Captures lead creation with source tracking (Website, CRM, etc.)
- Records metadata including name, phone, email
- Sets display locations for user feeds and dashboard
- Uses current user context when available

#### **2. Quote Assignment Notifications**
```sql
-- Trigger: quote_assignment_notification (AFTER INSERT/UPDATE on quotes)
-- Function: handle_assignment_notifications()
```
**Purpose**: Manages lead/opportunity assignment notifications
- **New Unassigned Leads**: Creates notifications for all users when new leads are created without assignment
- **Lead Assignments**: Sends notifications to specific users when leads are assigned to them
- **Opportunity Assignments**: Handles opportunity-level assignments with appropriate messaging
- **Self-Claimed Logic**: Skips notifications when `is_self_claimed = true`
- Creates entries in `notifications` and `notification_recipients` tables

#### **3. Unassigned Lead Notification Cleanup**
```sql
-- Trigger: mark_unassigned_lead_notifications_trigger (AFTER UPDATE on quotes)  
-- Function: mark_unassigned_lead_notifications_as_read()
```
**Purpose**: Cleans up notifications when unassigned leads get claimed
- Marks "NEW_UNASSIGNED_LEAD" notifications as read when someone claims the lead
- Prevents notification spam by clearing outdated unassigned alerts
- Uses lead name matching to find relevant notifications

#### **4. User Context Management**
```sql
-- Function: set_current_user(user_id bigint)
```
**Purpose**: Sets application-level user context for audit trails
- Used to track which user performed database operations
- Enables proper activity logging with user attribution
- Sets PostgreSQL session variable for trigger access

#### **5. Hot Lead Auto-Downgrade**
```sql
-- Function: downgrade_hot_lead()
```
**Purpose**: Automatically downgrades "hot lead" status after time threshold
- Converts `status = 'hot lead'` to `status = 'lead'` after 5 minutes
- Maintains lead urgency while preventing stale hot leads
- Called by scheduled cron job

### **Scheduled Jobs (Cron)**

#### **1. Hot Lead Downgrade Job**
```sql
-- Job: downgrade-hot-leads
-- Schedule: * * * * * (every minute)
-- Command: SELECT public.downgrade_hot_lead()
-- Status: ACTIVE
```
**Purpose**: Runs the hot lead downgrade function every minute
- Ensures timely conversion of hot leads to regular leads
- Maintains lead pipeline urgency and accuracy
- Prevents hot leads from staying "hot" indefinitely

### **Edge Functions**
Currently no Edge Functions are deployed to the project.

---

### **Notification System Architecture**

The database implements a complete notification system:

**Flow**: `Trigger Event` → `Function Processing` → `notifications` table → `notification_recipients` table

**Key Features**:
- **Multi-user notifications**: Unassigned leads notify all active users
- **Targeted notifications**: Assignments only notify the assigned user  
- **Self-claim detection**: Prevents notification spam for self-assignments
- **Automatic cleanup**: Marks notifications as read when leads are claimed
- **Rich metadata**: Notifications include lead names and context

**Notification Types**:
- `NEW_UNASSIGNED_LEAD`: New lead available for claiming
- `LEAD_ASSIGNED`: Lead assigned to specific user
- `OPPORTUNITY_ASSIGNED`: Opportunity assigned to specific user

### **Activity Logging System**

Comprehensive activity tracking with:
- **Automatic lead creation logging**: Every new lead logged with metadata
- **User attribution**: Tracks which user performed actions  
- **Display targeting**: Logs appear in appropriate UI locations
- **Rich metadata**: Full context preservation for audit trails

---
- **Faster Development**: New features and integrations automatically work across all applications

#### **Shared Business Logic Examples:**
- **Pricing Engine**: Same calculation logic used in marketing quotes, CRM estimates, and crew charge modifications
- **Address Validation**: Google Places integration works identically in website forms, CRM, and crew apps
- **User Authentication**: Single sign-on and role-based access across all applications
- **Real-Time Sync**: Job updates from crew app instantly appear in CRM and customer notifications
- **Payment Processing**: Stripe integration handles payments from website bookings to crew-collected charges

#### **Shared Integrations:**
All third-party services work seamlessly across platforms:
- **Supabase**: Database, auth, real-time subscriptions
- **Stripe**: Payment processing for both web and mobile
- **Google Maps**: Distance calculations and route optimization
- **Twilio**: Voice calls and SMS messaging
- **Yembo AI**: Visual inventory assessment
- **Voice AI**: Customer service automation
- **Marketing APIs**: Lead generation and campaign management

#### **Development Approach:**
1. **Shared Logic First**: Build all business rules, pricing calculations, API clients, and data models in `packages/shared/`
2. **UI Layer Implementation**: Create application-specific interfaces that consume shared logic:
   - Marketing website: Customer-focused, conversion-optimized interfaces
   - CRM web: Complex management interfaces with advanced data visualization
   - CRM mobile: Touch-optimized versions of CRM functionality
   - Crew mobile: Field-optimized interfaces for operational efficiency
3. **Cross-Application Features**: Ensure workflows span multiple applications (e.g., website lead → CRM management → crew execution)
4. **Role-Based Access**: Implement proper permissions so each application shows appropriate functionality for its users
5. **Real-Time Coordination**: Maintain live sync between all applications for operational efficiency

#### **User Journey Integration:**
**Customer Path**: Marketing Website → Online Booking → CRM Lead Management → Crew Execution
**Business Path**: Lead Generation → Sales Management → Operations Coordination → Service Delivery
**Data Flow**: Single source of truth with real-time updates across all touchpoints

#### **Lead Flow & Status Management:**

**Lead Entry Points:**
1. **Website Quote Form** → **Opportunity** (when instant quote provided) OR **Lead** (when manual quote needed)
2. **Phone Calls** → **Lead** (until quote is generated)
3. **External Sources** (referrals, Thumbtack, etc.) → **Lead** (until quote is generated)

**Status Progression Flow:**

**Hot Lead** (5-minute auto-downgrade via cron job) → **Lead** → **Opportunity** → **Booked** → **Confirmed** → **Complete** → **Reviewed**

**Database Creation Logic:**
- **Lead Creation**: Creates `lead` record with status `'lead'`
- **Opportunity Creation**: Creates `lead` + `quote` + `job` records simultaneously, with quote status `'opportunity'`

**Quote/Opportunity Status Workflow:**
- **Lead**: No estimate available, restricted access until quote completion
- **Opportunity**: Has estimate/quote, ready for customer review
- **Booked**: Customer/staff pressed book button or online booking completed
- **Confirmed**: Day-before confirmation process completed, crew/resources allocated
- **Complete**: Job finished, ready for review collection
- **Reviewed**: Customer feedback collected, job fully closed

**Job Execution Status Workflow:**
- **En Route**: Crew dispatched to pickup location
- **Arrived**: Crew arrived at pickup location
- **Loading**: Actively loading customer belongings
- **Finished Loading**: Loading complete, ready for transport
- **Unloading**: Actively unloading at destination
- **Finished Job**: All work completed, final charges processed

**Multi-Stop Jobs**: Additional status tracking for complex moves with multiple pickup/delivery locations

#### **Database Architecture & Charge Tracking:**

**Hierarchical Data Structure:**
```
Lead (customer contact info)
├── Quotes (multiple estimates per lead)
│   ├── Status (held at quote level for multi-quote scenarios)
│   └── Jobs (multiple jobs per quote for multi-day/long-term projects)
│       ├── Job Addresses (pickup/delivery locations)
│       ├── Job Charges (detailed pricing breakdown)
│       ├── Job Schedule (timing and appointments)
│       └── Crews (assigned teams)
│           ├── Movers (individual crew members)
│           └── Trucks (assigned vehicles)
```

**Charge Tracking System:**
All pricing data uses a comprehensive tracking structure to maintain estimate integrity and sales override visibility:

```json
{
  "unit": "workers",
  "value": 7,
  "actualValue": null,
  "initialValue": 7,
  "isOverridden": false,
  "estimatedValue": 7
}
```

**Advanced Scheduling & Pricing System:**

**Customer Quote Display (Simplified View):**
- **Drive Time Between Stops**: Only show drive time between customer locations (if multiple stops)
- **Total Estimate Range**: "2-4 hours with 3 movers and 1 truck"
- **Price Breakdown**: Base rate, additional movers/trucks, total estimate
- **Simple Messaging**: Keep customer-facing estimates clean and understandable
- **No Office Drive Time**: Customers don't see or pay for office→job or job→office travel

**Internal Scheduling Breakdown (CRM/Dispatch View):**
- **Full Drive Time Calculation**: Office → First Stop → Each Additional Stop → Final Destination → Office
- **Drive Time for Scheduling**: Calculated from last job location (not office) for day planning
- **Job Component Breakdown**:
  - **Pack Time**: Based on inventory and packing requirements
  - **Load Time**: 60% of total move time (load/unload split)
  - **Drive Time**: Between all locations, traffic-adjusted
  - **Unload Time**: 40% of total move time
  - **Unpack Time**: If selected, based on service level
- **Day Planning**: Each component timed for multi-job scheduling
- **Overtime Alerts**: System warns when jobs likely to run over estimated time

**Advanced Pricing Granularity:**

**Modular Charge System:**
- **Base Hourly Rate**: $169/hr for 2 men + truck
- **Additional Movers**: $60/hr per extra crew member
- **Additional Trucks**: $30/hr per extra vehicle
- **Stair Charges**: Applied only to load/unload portions affected
- **Handicap Accessibility**: Specific to rooms/items requiring special handling
- **Drive Time**: Only between customer locations (not office travel)
- **Packing Services**: Itemized by room or service level
- **Special Items**: Piano, gun safe, artwork - individual pricing

**Sales Override System:**
- **Modal Interface**: Click any charge component to edit manually
- **Individual Adjustments**: Modify each pricing element independently
- **Override Tracking**: Log all manual changes with sales rep attribution
- **Approval Workflow**: Manager approval for significant discount overrides
- **Quote Accuracy**: Auto-quote system designed for 90-95% accuracy

**Real-Time Job Monitoring:**
- **Component Tracking**: Monitor actual vs estimated time for each job phase
- **Alert System**: Notify dispatch when load time exceeds estimate (e.g., 2:15 planned, currently at 2:30)
- **Next Job Notification**: Automatic alerts to subsequent customers about potential delays
- **Performance Analytics**: Track estimating accuracy and crew efficiency by component

**Enhanced Accessibility & Inventory Integration:**
- **Room-Specific Stair Charges**: Apply accessibility fees only to affected rooms/items
- **Inventory-Based Accessibility**: Charge handicap fees only for items requiring special handling
- **Granular Item Tracking**: Track which specific items need stairs/elevator/long walk handling
- **Dynamic Pricing Adjustment**: Modify charges based on actual item locations and requirements

**Charge Tracking Fields:**
- **`initialValue`**: Original calculated estimate
- **`estimatedValue`**: Current estimated value (may be adjusted)
- **`value`**: Current working value (displayed to customer)
- **`actualValue`**: Final executed value (filled during job completion)
- **`isOverridden`**: Flag indicating sales/manager manual adjustment
- **`unit`**: Measurement unit (workers, hours, miles, items, etc.)

**Job Charges Table Structure:**
All charges stored as JSONB with full tracking history:
- `amount`, `hourly_rate`, `hours`, `number_of_crew`, `number_of_trucks`
- `driving_time_mins`, `fuel_cost`, `milage_cost`, `item_cost`, `item_quantity`
- `origin_handicaps`, `destination_handicaps`, `stops_handicaps`
- `minimum_time`, `custom_name`, `custom_price`, `is_billable`, `tips`

This structure enables:
- **Estimate Accuracy Tracking**: Compare initial vs actual values
- **Sales Override Visibility**: Clear audit trail of manual adjustments
- **Real-time Updates**: Changes sync across all 4 applications
- **Historical Analysis**: Track pricing accuracy and improvement opportunities

#### **Estimation System & Pricing Engine:**

**Move Size to Cubic Feet Mapping:**
```javascript
export const MOVE_SIZE_CUFT = {
  "Room or Less": 75,
  "Studio Apartment": 288,
  "1 Bedroom Apartment": 432,
  "2 Bedroom Apartment": 743,
  "3 Bedroom Apartment": 1296,
  "1 Bedroom House": 576,
  "1 Bedroom House (Large)": 720,
  "2 Bedroom House": 1008,
  "2 Bedroom House (Large)": 1152,
  "3 Bedroom House": 1440,
  "3 Bedroom House (Large)": 1584,
  "4 Bedroom House": 1872,
  "4 Bedroom House (Large)": 2016,
  "5 Bedroom House": 3168,
  "5 Bedroom House (Large)": 3816,
  "5 x 10 Storage Unit": 400,
  "5 x 15 Storage Unit": 600,
  "10 x 10 Storage Unit": 800,
  "10 x 15 Storage Unit": 1200,
  "10 x 20 Storage Unit": 1600,
  "Office (Small)": 1000,
  "Office (Medium)": 2000,
  "Office (Large)": 3000
};
```

**Service Tier Speed Logic:**
| Service Type   | Cuft/hr/mover |
|----------------|---------------|
| Grab-n-Go      | 95            |
| Full Service   | 80            |
| White Glove    | 70            |
| Labor Only     | 90            |

**Crew Size Determination (Based on Cubic Feet):**
```javascript
export const CREW_SIZE_BY_CUBIC_FEET = [
  { max: 1009, movers: 2 },
  { max: 1500, movers: 3 },
  { max: 2000, movers: 4 },
  { max: 3200, movers: 5 },
  { max: Infinity, movers: 6 }
];
```

**Handicap Modifiers (only applies if cuft ≥ 400):**
| Handicap Type      | Modifier (%) | Rule      |
|--------------------|--------------|-----------|
| Each flight stairs | +9%          | Additive  |
| Each 100ft walk    | +9%          | Additive  |
| Elevator           | +18%         | Flat      |

Formula: `modifier = 1 + (stair * 0.09) + (walkFt / 100 * 0.09) + (elevator ? 0.18 : 0)`

**Base Time Calculation:**
```
baseTime = cuft / (crewCount * serviceSpeed) * handicapModifier
```

**Crew Adjustment Rules (WIP — thresholds subject to tuning):**
- Start with cuft-based crew size from table above
- Add movers based on handicap % thresholds (only if cuft ≥ 400):

| Cuft Band      | Add 1st Extra Mover | Add 2nd Extra Mover    |
|----------------|---------------------|------------------------|
| < 300 cuft     | +36% handicap       | +36% more (total 72%)  |
| 300–599 cuft   | +27% handicap       | +27% more (total 54%)  |
| ≥ 600 cuft     | +18% handicap       | +18% more (total 36%)  |

**Logic Flow:**
1. Determine base crew size from cubic feet
2. Calculate total handicap percentage
3. Determine cuft band  
4. Add movers when handicap crosses each band's threshold(s)
5. Calculate final time with adjusted crew
6. Manual overrides available in job charges for dispatch flexibility

**Day-Split Logic by Distance:**

**LOCAL MOVES (≤ 30 miles):**

*Single-Service – Packing/Unpacking Only:*
1. Estimate time from box algorithm
2. If total ≤ 9 hrs → keep crew, no split
3. If > 9 hrs → split into 2 days (Pack Day-1, Unpack Day-2 if needed)

*Single-Service – Moving, Labor, Junk Removal:*
1. Crew/time determined by cuft & handicap rules
2. If total time > 9 hrs after crew calculation → split into Load Day-1 / Unload Day-2

*Two-Service (Moving + Packing, Moving + Unpacking, etc.):*
1. Start with calculated crew
2. Add 1 mover to attempt single-day
3. If combined services fit ≤ 9 hrs → keep added mover
4. Otherwise: remove extra mover and split:
   - Pack Day-1 (crew − 1)
   - Move Day-2 (base crew)

*Three-Service (Full Service, White Glove):*
1. Attempt with base crew + 1 for single-day (≤ 9 hrs)
2. If not possible:
   - Remove extra mover
   - Split into 3-day flow: Pack Day-1 (crew − 1) / Move Day-2 (base crew) / Unpack Day-3 (crew − 1)

**REGIONAL MOVES (30–120 miles):**

*Single-Day Regional (when possible):*
1. Calculate total time: all services + drive time
2. If total ≤ 14 hrs (DOT limit) → complete in one day
3. Services can be reduced (moving only, no pack/unpack) to fit single day

*Standard 2-Day Regional:*
1. Day-1: Pack + Load (complete at origin)
2. Crew returns home/local accommodation
3. Day-2: Early morning departure → Drive → Unload + Unpack → Return same day

*Large Regional (3-4 Day Split for oversized moves):*
1. Day-1: Pack only
2. Day-2: Load only
3. Day-3: Drive + Unload
4. Day-4: Unpack (if needed)

*Key Points:*
- Attempt single-day first if time permits (≤14 hrs total)
- Can reduce services (skip pack/unpack) to fit one day
- No overnight stays at customer location
- Crew stays locally between service days
- Early departure Day-2 for reasonable arrival time

#### **Pricing Structure:**

**Base Hourly Rates by Service & Crew Size:**
```javascript
export const BASE_HOURLY_RATES: { [service in ServiceType]?: { [crewSize: number]: number } } = {
  "Moving": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Packing": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Unpacking": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Moving and Packing": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "Full Service": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 },
  "White Glove": { 2: 199, 3: 274, 4: 349, 5: 424, 6: 499, 7: 574 },
  "Load Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Unload Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Labor Only": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Staging": { 2: 129, 3: 189, 4: 249, 5: 309, 6: 369, 7: 429 },
  "Commercial": { 2: 169, 3: 229, 4: 289, 5: 349, 6: 409, 7: 469 }
};
```

**Additional Mover & Truck Rates:**
```javascript
export const ADDITIONAL_MOVER_RATES: { [service in ServiceType]?: number } = {
  "Moving": 60, "Packing": 60, "Unpacking": 60, "Moving and Packing": 60,
  "Full Service": 60, "White Glove": 75, "Load Only": 60, "Unload Only": 60,
  "Labor Only": 60, "Staging": 60, "Commercial": 60
};

export const ADDITIONAL_RATES = {
  FUEL_RATE_PER_MILE: 2.00,        // Fuel surcharge per mile for long distance
  MILEAGE_RATE_PER_MILE: 4.29,     // Mileage fee per mile for long distance  
  ADDITIONAL_TRUCK_HOURLY: 30,      // Additional truck hourly rate (every 1500 cuft)
  EMERGENCY_SERVICE_HOURLY: 30      // Emergency service surcharge (within 24 hours)
};
```

**Drive Time & Mileage Logic:**
- **Under 30 miles**: Charge drive time, no gas/mileage fees
- **Over 30 miles**: No drive time charge, but $4.29/mile + $2.00/mile gas fees

**Emergency Service Surcharge:**
- **Within 24 hours**: +$30/hour for all crew members (urgent scheduling premium)

**Valuation Insurance (WIP - Future Implementation):**
- **Status**: Not currently implemented - pending insurance provider setup
- **Pricing Structure**: TBD - rates will be determined once insurance partnerships are established
- **Implementation Notes**: 
  - Will offer multiple coverage tiers (basic, standard, full replacement)
  - Pricing likely based on declared value or cubic feet
  - Integration required with insurance provider API
  - Customer opt-in/opt-out functionality needed
  - Claims process workflow to be defined

**Custom Crating Services:**
- **Pricing**: Case-by-case basis (custom quote required)
- **Items**: Fragile artwork, antiques, high-value electronics, custom furniture
- **Process**: On-site assessment required for accurate pricing

**Cancellation & Rescheduling Policies (WIP - Future Implementation):**
- **Same-Day Cancellation Fee**: TBD - penalty for cancelling on move day
- **24-Hour Rescheduling Fee**: TBD - fee for rescheduling within 24 hours
- **Deposit System**: TBD - potential deposit requirement to secure booking
- **Implementation Notes**:
  - Policies need to be clearly communicated during booking
  - Integration with scheduling system for automated fee calculation
  - Refund/credit processing workflow required

**Specialty Item Charges (Risk-Based Tiers):**
| Item Type | Price | Requirements |
|-----------|--------|-------------|
| **Tier 1 ($150)** | Upright/Console Pianos, Gun Safe < 350 lbs | Standard handling, straps, dolly, 2-3 men |
| **Tier 2 ($250)** | Gun Safe 350-500 lbs, Baby Grand Pianos, Oversized Items | Requires 3+ men, special bracing/dolly |
| **Tier 3 ($350)** | Gun Safe 500+ lbs, Grand Pianos, Hot Tubs, Large Machines | Piano board, safe dolly, moving sled, highest risk |

**Junk Removal (Fixed Pricing):**
| Load Size | Price |
|-----------|--------|
| Single Item Pickup | $150 |
| 25% Load | $260 |
| 50% Load | $475 |
| 75% Load | $695 |
| Full Load | $1000 |

**Storage Rates:**
- **Short-term** (overnight < 1 week): $150/night
- **Long-term** (monthly): $450/month

**Packing Materials (Purchase Prices):**

*Standard Boxes:*
- Small box: $1.85, Medium box: $2.66, Large box: $3.33, Extra large box: $4.68
- Wardrobe box: $29.03

*Specialty Boxes:*
- Medium TV box: $27.34, Large TV box: $40.49, Extra large TV box: $53.93
- Lamp box: $8.03, Mirror box: $9.38, Large mirror box: $11.14
- 4-way mirror box: $13.43, Dish pack: $10.94

*Protection Materials:*
- Twin mattress bag: $10.73, Full mattress bag: $11.46
- Queen mattress bag: $12.49, King mattress bag: $13.43
- Skin blanket: $12.00, Paper pad: $4.59

**TV Box Rentals:** All TV boxes available at 50% of purchase price

#### **Box Estimation System:**

**Supported Move Sizes (Complete List):**
```javascript
export const MOVE_SIZE_CUFT = {
  "Room or Less": 75,
  "Studio Apartment": 288,
  "1 Bedroom Apartment": 432,
  "2 Bedroom Apartment": 743,
  "3 Bedroom Apartment": 1296,
  "1 Bedroom House": 576,
  "1 Bedroom House (Large)": 720,
  "2 Bedroom House": 1008,
  "2 Bedroom House (Large)": 1152,
  "3 Bedroom House": 1440,
  "3 Bedroom House (Large)": 1584,
  "4 Bedroom House": 1872,
  "4 Bedroom House (Large)": 2016,
  "5 Bedroom House": 3168,
  "5 Bedroom House (Large)": 3816,
  "5 x 10 Storage Unit": 400,
  "5 x 15 Storage Unit": 600,
  "10 x 10 Storage Unit": 800,
  "10 x 15 Storage Unit": 1200,
  "10 x 20 Storage Unit": 1600,
  "Office (Small)": 1000,
  "Office (Medium)": 2000,
  "Office (Large)": 3000
};
```

**Packing Intensity Levels:**
- **Less than Normal**: 0.75x multiplier (minimal belongings)
- **Normal**: 1.0x multiplier (standard household)
- **More than Normal**: 1.5x multiplier (extensive belongings)

**Box Estimation Logic:**

*Room-Based Calculation by Property Type:*

**Apartment** (Basic rooms + bedrooms):
- Base rooms: Living room, kitchen
- Bedrooms added dynamically (0-5 bedrooms)

**Normal Home** (Standard house rooms + bedrooms):
- Base rooms: Living room, kitchen, dining room, garage
- Bedrooms added dynamically (1-5 bedrooms)

**Large Home** (Full house with all spaces + bedrooms):
- Base rooms: Living room, kitchen, dining room, garage, office, patio/shed, attic/basement
- Bedrooms added dynamically (1-5 bedrooms)

*Per-Room Box Allocation:*
- **Bedroom**: 4 small, 6 medium, 2 large, 2 wardrobe, 1 dish pack, 1 mattress bag, 1 TV box
- **Living Room**: 3 small, 5 medium, 3 large, 1 wardrobe, 1 dish pack, 1 TV box
- **Kitchen**: 4 small, 6 medium, 2 large, 3 dish pack
- **Dining Room**: 2 small, 3 medium, 2 large, 1 dish pack
- **Garage**: 5 small, 7 medium, 3 large, 1 dish pack
- **Office**: 3 small, 4 medium, 2 large, 1 dish pack, 1 TV box
- **Patio/Shed**: 2 small, 3 medium, 3 large, 1 dish pack
- **Attic/Basement**: 3 small, 5 medium, 3 large, 1 dish pack

*Fixed Estimates (Studios, Offices, Storage Units):*
- Predefined box counts based on space size and typical contents
- No room-by-room calculation needed

**Time Calculation (Minutes per Box per Worker):**

*Packing Time:*
- Small: 5 min, Medium: 7 min, Large: 9 min, Wardrobe: 10 min
- Dish Pack: 14 min, Mattress Bag: 5 min, TV Box: 6 min
- Extra time per room: 15 min (wrapping, labeling, setup)

*Unpacking Time:*
- Small: 4 min, Medium: 6 min, Large: 8 min, Wardrobe: 8 min  
- Dish Pack: 12 min, Mattress Bag: 4 min, TV Box: 5 min
- Extra time per room: 15 min (setup, disposal, organization)

**White Glove Service**: +20% time modifier for extra care and detail

**Material Cost Integration**: Automatically calculates total material costs based on estimated box quantities and current pricing

#### **Dashboard & Real-Time Business Overview:**

**Core Philosophy**: The entire 4-application ecosystem operates in **real-time** - no screen, system, or app is ever behind. Every action across website, CRM web, CRM mobile, and crew mobile instantly syncs across all platforms.

**Dashboard Purpose**: Main command center providing complete business pulse in one view for ownership and management oversight.

**Real-Time Activity Log (Business-Level)**:
Live feed of all major business activities:
- New leads received (source, contact info, estimated value)
- Quotes generated and sent to customers
- Jobs booked and confirmed
- Crew assignments and dispatch notifications
- Jobs completed and status updates
- Customer reviews received
- Payment processing and collections
- Emergency service requests
- Cancellations and rescheduling

**Customer-Level Audit Trail (Individual Records)**:
Complete historical record for each customer showing every action:
- Quote generated/modified/sent
- Quote re-rated (pricing adjustments)
- Inventory items added/removed/modified
- Charges added/removed/adjusted
- Addresses added/changed/verified
- Service dates changed/confirmed
- Crew assignments/reassignments
- Payment transactions/refunds
- Communication log (calls, emails, texts)
- Review submissions and responses
- Insurance claims and resolutions

**Key Performance Indicators (KPIs)**:

*Daily/Weekly Metrics:*
- New leads received (by source)
- Lead-to-opportunity conversion rate
- Opportunity-to-booking conversion rate
- Jobs completed vs scheduled
- Average job value and profit margins
- Customer satisfaction scores
- Crew utilization rates
- Revenue vs targets

*Monthly Business Health:*
- Total moves booked and completed
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Customer lifetime value (CLV)
- Seasonal trend analysis
- Market share and competitive positioning
- Operational efficiency metrics

*Financial Dashboard:*
- Daily/weekly/monthly revenue
- Outstanding invoices and collections
- Cash flow projections
- Cost per acquisition by marketing channel
- Profit margins by service type
- Emergency service premium revenue

*Operational Metrics:*
- Crew availability and scheduling efficiency
- Vehicle utilization rates
- Material inventory levels and costs
- Service area expansion opportunities
- Average job duration vs estimates

**Real-Time Notification System**:
- High-priority alerts (emergency bookings, crew issues, customer complaints)
- Business milestone notifications (daily/monthly targets hit)
- System health and integration status
- Competitive intelligence and market updates

**Visual Sales Pipeline Dashboard**:
Interactive funnel visualization showing lead progression through all status stages:

*Pipeline Status Flow:*
```
Hot Lead → Lead → Opportunity → Booked → Confirmed → Complete → Reviewed
```

*Visual Pipeline Features:*
- **Drag-and-Drop Interface**: Move customers between pipeline stages visually
- **Status Counts**: Live count of customers in each pipeline stage with values
- **Conversion Rates**: Percentage conversion between each stage
- **Pipeline Velocity**: Average time customers spend in each stage
- **Revenue Projection**: Total potential revenue visible in each pipeline stage
- **Bottleneck Identification**: Stages with highest drop-off or longest duration
- **Daily Pipeline Movement**: Visual arrows showing customers moving between stages

*Pipeline Stage Details (Click to Expand):*
- **Hot Lead**: Fresh leads under 5 minutes old with high urgency indicators
- **Lead**: Claimed leads being qualified by sales team
- **Opportunity**: Qualified prospects with quotes generated/sent
- **Booked**: Customers who accepted quotes with scheduled move dates
- **Confirmed**: Jobs with crew assigned and final details confirmed
- **Complete**: Finished moves awaiting final payment and review collection
- **Reviewed**: Completed jobs with customer feedback collected

**Role-Based Dashboard Views**:
- **Owner/Executive**: High-level KPIs, financial performance, strategic metrics + full pipeline overview
- **Operations Manager**: Crew scheduling, job progress, resource allocation + booked/confirmed pipeline focus
- **Sales Manager**: Lead pipeline, conversion rates, booking targets + detailed pipeline management
- **Customer Service**: Active issues, review responses, communication queue + complete/reviewed pipeline focus

#### **Calendar System:**

**Purpose**: Comprehensive scheduling overview with role-based access and visibility controls. Primary function is **viewing and coordination** rather than direct scheduling modifications.

**Role-Based Calendar Views**:

**Owner/Executive Calendar**:
- All scheduled jobs and their status
- Crew assignments and availability overview
- Revenue projections by day/week/month
- Business meetings and strategic events
- Holiday/blackout date planning
- High-level resource allocation view

**Operations Manager Calendar**:
- Detailed job schedules with crew assignments
- Truck and equipment allocation
- Crew availability and time-off requests
- Multi-day job coordination (regional/long-distance)
- Emergency service slots and availability
- Maintenance schedules for vehicles/equipment

**Sales Team Calendar**:
- Quote appointments and follow-ups
- Customer consultations and estimates
- Lead nurturing timeline and callbacks
- Booking confirmations and customer communication
- Territory planning and route optimization

**Customer Service Calendar**:
- Follow-up calls and review collection
- Customer issue resolution deadlines
- Insurance claim processing timelines
- Post-move communication schedule

**Crew Member Calendar** (Mobile App Access):
- Personal job assignments and schedules
- Check-in/check-out times and locations
- Multi-day job sequences
- Time-off requests and approval status

**Calendar Features**:

*Job Display Information:*
- Customer name and contact info
- Service type and estimated duration
- Crew size and specific team assignments
- Pickup and delivery addresses
- Special handling requirements (pianos, safes, etc.)
- Job status and progress indicators

*Color Coding System:*
- Confirmed jobs (green)
- Pending/unconfirmed jobs (yellow)
- Emergency services (red)
- Multi-day jobs (blue)
- Cancelled/rescheduled (gray)

*Integration Points:*
- Links to customer records and job details
- Real-time status updates from crew mobile apps
- Automatic rescheduling notifications
- Weather alerts and contingency planning

**Access Controls**:
- **Read-Only for Most Users**: Calendar serves as information display, not scheduling tool
- **Limited Edit Access**: Only authorized dispatchers can make schedule changes
- **Mobile Sync**: Crew members see their personal schedules on mobile devices
- **Customer Portal**: Limited view for customers to see their confirmed appointment details

#### **Task Management System:**

**Purpose**: Comprehensive task tracking for follow-ups, internal processes, and business operations with full CRUD functionality (Create, Read, Update, Delete).

**Task Types**:

*Customer Follow-Ups:*
- Quote follow-up calls (24hr, 48hr, 1week intervals)
- Post-move satisfaction check-ins
- Review collection and testimonial requests
- Insurance claim follow-ups
- Payment collection and overdue reminders
- Referral requests and relationship nurturing

*Sales Tasks:*
- Lead qualification and nurturing
- Estimate appointments and scheduling
- Quote generation and delivery deadlines
- Contract signing and deposit collection
- Customer onboarding and preparation calls

*Operational Tasks:*
- Crew scheduling and assignment confirmations
- Equipment maintenance and inspections
- Vehicle service appointments
- Material inventory restocking
- Facility maintenance and cleaning

*Administrative Tasks:*
- Permit applications and renewals
- Insurance documentation updates
- Compliance reporting and deadlines
- Staff training and certification tracking
- Vendor management and contract renewals

**Task Properties**:
- **Title and Description**: Clear, actionable task details
- **Priority Level**: High, Medium, Low with visual indicators
- **Due Date and Time**: Specific deadlines with overdue alerts
- **Assigned User**: Individual responsibility and accountability
- **Customer/Job Association**: Link to related records when applicable
- **Status Tracking**: Not Started, In Progress, Completed, Cancelled
- **Completion Notes**: Record outcomes and next steps

**Task Management Features**:

*Creation Methods:*
- Manual task creation by any authorized user
- Automated task generation from business rules (e.g., 24hr follow-up after quote)
- Template-based tasks for common workflows
- Bulk task creation for recurring processes

*Organization and Filtering:*
- My Tasks view (personal assignments)
- Team Tasks view (department/role-based)
- Customer-specific task history
- Priority-based sorting and filtering
- Due date and overdue task alerts

*Completion and Tracking:*
- One-click task completion with timestamp
- Required completion notes for accountability
- Task reassignment capabilities
- Recurring task automation (daily, weekly, monthly)
- Performance metrics and completion rates

**Integration Points**:
- **Customer Records**: Tasks automatically link to relevant customer/job records
- **Calendar System**: Important tasks appear on relevant role calendars
- **Dashboard**: Overdue and high-priority tasks show on dashboard alerts
- **Mobile Access**: Field teams can complete and create tasks on mobile devices
- **Notification System**: Email/SMS reminders for approaching deadlines

**Role-Based Task Access**:
- **Managers**: Can create, assign, and view all team tasks
- **Sales Team**: Focus on lead nurturing and quote follow-ups
- **Operations**: Equipment, scheduling, and logistics tasks
- **Customer Service**: Follow-ups, reviews, and issue resolution
- **Individual Users**: Personal task lists and assignments

#### **Leads Management (Sales Module):**

**Purpose**: Centralized lead management for incoming prospects who haven't received quotes yet. Focused on early-stage sales pipeline management and lead conversion.

**Access Control**: 
- **Sales Roles Only**: Sales Manager, Admin, Sales Team Members
- **Other roles cannot access this module** (leads become visible in other modules after quote generation)

**Lead Management Tabs**:

**Unclaimed Leads Tab**:
- **Purpose**: Pool of all new, unassigned leads available for sales team to claim
- **Lead Sources**: Website forms, phone calls, referrals, Thumbtack, marketing campaigns
- **Lead Information Display**:
  - Contact details (name, phone, email)
  - Lead source and acquisition date/time
  - **UTM Attribution Data**: Source, medium, campaign, content, term parameters
  - **Campaign Tracking**: Which ad/landing page generated the lead
  - Move details (size, addresses, preferred date)
  - Initial notes and special requirements
  - Lead score/priority (hot lead, warm lead, cold lead)
  - Time since lead was received (urgency indicators)

**My Leads Tab**:
- **Purpose**: Personal workspace for individually claimed leads
- **Lead Assignment**: Self-claimed or manager-assigned leads
- **Lead Status Tracking**:
  - New (just claimed, no contact yet)
  - Contacted (initial outreach completed)
  - Qualified (move details confirmed, genuine prospect)
  - Quote Pending (information gathered, ready for estimate)
  - Lost (declined service, no longer interested)

**Lead Management Actions**:

*Claim/Assignment Process:*
- **Self-Service Claiming**: Sales reps claim leads from unclaimed pool
- **Manager Assignment**: Sales managers can assign specific leads to team members
- **Lead Distribution Rules**: Round-robin, territory-based, or specialization-based assignment
- **Claim Time Limits**: Automatic return to unclaimed pool if no action taken within timeframe

*Lead Qualification Workflow:*
- **Initial Contact**: Phone call, email, or text outreach
- **Information Gathering**: Move size, dates, addresses, special requirements
- **Needs Assessment**: Service type determination, budget qualification
- **Quote Preparation**: Transition lead to quote generation process
- **Follow-up Scheduling**: Automated task creation for callback appointments

*Automated Sales Follow-Up System*:

**Initial Lead Follow-Up Sequence (Days 1-2)**:
- **Day 1**: Call lead twice (morning & afternoon), send text and email
- **Day 2**: One additional call if no response, follow-up text
- **Response Tracking**: If customer responds to any touchpoint, move to quote follow-up sequence

**Post-Quote Follow-Up System (Distance-Based Timing)**:
- **Same Day Quote**: Text follow-up same day, call next day if move is within 48 hours
- **Short Notice (2-7 days)**: Call next day, text day 3, final call day before move
- **Medium Range (1-4 weeks)**: 5 follow-up touchpoints over 2 weeks (call, text, call, text, call), then urgency sequence
- **Long Range (30+ days)**: Monthly nurture check-ins until 30 days out, then switch to urgency sequence

**5-Touch Follow-Up Sequence (After Quote Delivery)**:
1. **Same Day**: Text follow-up with quote recap and next steps
2. **Day 2**: Phone call to discuss questions and address concerns  
3. **Day 4**: Text with additional value points or customer testimonials
4. **Day 7**: Phone call with limited-time incentive or seasonal pricing
5. **Day 10**: Final follow-up call before switching to long-term nurture or urgency sequence

**Urgency Sequence (Final 30 Days Before Move)**:
- **30 Days Out**: "Hi [Name], your move is coming up in a month. Ready to secure your crew?"
- **14 Days Out**: "Only 2 weeks until your move date. Most dates book up 10-14 days ahead."
- **7 Days Out**: "Final week before your move! Last chance to guarantee crew availability."
- **3 Days Out**: "Your move is in 3 days. We may have last-minute availability if you need us."
- **Day Before**: Final outreach for emergency/last-minute bookings

**Custom Follow-Up Reasons & Scheduling**:
- **Waiting for Approval**: Set follow-up based on their timeline (spouse approval, company approval, etc.)
- **Budget Concerns**: Schedule follow-up with financing options or seasonal discounts
- **Comparing Options**: 1-week follow-up with competitive comparison points
- **Not Ready Yet**: Monthly nurture sequence until they indicate readiness
- **Wrong Timing**: Set specific follow-up date based on their preferred timeline

**Follow-Up Reason Tracking**:
- **Dropdown Options**: Budget, waiting for approval, comparing companies, wrong timing, need to think about it
- **Custom Notes**: Specific details about their situation and next steps
- **Automated Scheduling**: System calculates optimal next contact time based on reason selected
- **Personalized Messaging**: Next follow-up references previous conversation and addresses specific concern

**Smart Follow-Up Automation Features**:
- **Move Date Intelligence**: System automatically calculates follow-up timing based on customer's move date
- **Anti-Spam Protection**: Prevents over-communication by spacing touchpoints appropriately
- **Channel Rotation**: Alternates between calls, texts, and emails to avoid monotony
- **Urgency Escalation**: Automatically increases follow-up frequency as move date approaches
- **Response Triggers**: Pauses automated sequence when customer responds, resumes if no booking after 48 hours
- **Territory Coordination**: Ensures only assigned sales rep contacts customer to avoid confusion
- **Seasonal Adjustments**: Modifies messaging and timing based on peak/off-peak moving seasons

*Lead Status Management:*
- **Status Updates**: Real-time status changes with timestamp tracking
- **Activity Logging**: All calls, emails, texts automatically recorded
- **Notes and Comments**: Detailed prospect interaction history
- **Lead Scoring**: Dynamic scoring based on engagement and qualification factors

**Lead Information Panel**:
- **Contact Details**: Phone, email, preferred communication method
- **Move Information**: Origin/destination, move size, service type preferences
- **Timeline**: Preferred move date, flexibility, urgency level
- **Lead Source**: Attribution tracking for marketing ROI analysis
- **Interaction History**: Complete communication timeline
- **Special Requirements**: Pianos, safes, storage needs, etc.

**Integration Points**:
- **Quote Generation**: Seamless transition from qualified lead to quote creation
- **Task Creation**: Automatic follow-up tasks and callback reminders
- **Activity Logging**: All interactions sync with customer audit trail
- **Notification System**: New lead alerts and assignment notifications
- **Dashboard Metrics**: Lead conversion rates and sales performance tracking

**Performance Tracking**:
- **Individual Metrics**: Leads claimed, contacted, converted per sales rep
- **Team Performance**: Conversion rates, average time to quote, lead response times
- **Lead Source Analysis**: ROI and conversion rates by acquisition channel, UTM campaign performance, and DNI call tracking
- **Pipeline Velocity**: Time from lead to quote to booking measurements

#### **Customer Management Module:**

**Purpose**: Advanced pipeline management for prospects who have received quotes and progressed beyond initial lead stage. Handles opportunity nurturing through job completion and beyond.

**Access Control**: 
- **Broader Team Access**: Sales, Operations, Customer Service, Management
- **Role-based permissions** for different actions and visibility levels

**Customer Management Tabs**:

**Opportunities Tab**:
- **Status Scope**: Displays customers with status "Opportunity", "Booked", and "Confirmed"
- **Purpose**: Active sales pipeline management for prospects with quotes who haven't completed moves yet
- **Focus Areas**:
  - Quote follow-up and conversion efforts
  - Booking confirmations and scheduling coordination
  - Pre-move customer preparation and communication
  - Contract finalization and deposit collection

**All Customers Tab**:
- **Status Scope**: All customer statuses EXCEPT "Hot Lead" and "Lead"
- **Includes**: Opportunity, Booked, Confirmed, Complete, Reviewed, and any other advanced statuses
- **Purpose**: Comprehensive customer relationship management across entire lifecycle
- **Use Cases**:
  - Historical customer lookup and service history
  - Post-move follow-up and relationship maintenance
  - Repeat customer identification and targeting
  - Customer service issue resolution and support

**Customer Page Navigation (Status-Based Access Control)**:

**Lead Status - Single Page Access:**
- **customer/sales page ONLY**: Only accessible page when customer status is "Lead"
- **Restricted Navigation**: No access to quotes, accounting, or photos until status progresses
- **Sales Focus**: Lead qualification and conversion activities only

**Opportunity Status - Expanded Access:**
- **customer/quotes page**: View and manage quote details, pricing breakdown, modifications
- **customer/accounting page**: Financial information, payment tracking, invoicing
- **customer/photos page**: Job photos, before/after images, damage documentation
- **customer/sales page**: Continue sales activities and pipeline management

**Critical Modal Functionality Reference:**
- **Create Opportunity Modal**: The existing modal functionality is EXACTLY what we want replicated in the real app
- **Create Lead Modal**: The existing modal functionality is EXACTLY what we want replicated in the real app
- **Important**: These modals were specifically designed and should be used as the exact template for implementation

**Customer Information Display**:

*Contact and Basic Details:*
- Customer name, phone, email, preferred communication method
- Primary and secondary contact information
- Customer type (residential, commercial, repeat customer)
- Account creation date and last interaction timestamp

*Move Details and Service Information:*
- Move size, origin/destination addresses
- Service type and special requirements
- Estimated and actual move dates
- Crew assignments and equipment needs
- Current job status and progress indicators

*Financial and Quote Information:*
- Quote amount and pricing breakdown
- Payment status (deposit received, balance due, paid in full)
- Invoice history and payment transactions
- Outstanding balances and collection status

*Inventory Management:*
- **Comprehensive Furniture Database**: Complete cube sheet with every type of furniture item
- **Yembo AI Integration**: Automated inventory detection from customer photos
- **CRM Inventory Editor**: Full editing capabilities for adding/removing/modifying items
- **Customer Portal Access**: Customers can directly edit their inventory before move
- **Item Categorization**: Organized by room, size, weight, and special handling requirements
- **Visual Documentation**: Photo attachments for specialty items and custom furniture
- **Cube/Weight Calculations**: Automatic space and weight calculations for accurate pricing
- **Special Instructions**: Item-specific handling notes and requirements
- **Inventory History**: Track changes made by both staff and customers with timestamps
- **Real-Time Sync**: Inventory changes instantly update quote calculations and crew requirements

*Communication History:*
- Complete interaction timeline (calls, emails, texts, in-person meetings)
- Quote delivery and customer response tracking
- Follow-up scheduled and completion status
- Customer feedback and satisfaction scores

**Customer Management Actions**:

*Pipeline Progression:*
- **Status Updates**: Move customers through pipeline stages with proper approvals
- **Quote Modifications**: Re-rating, pricing adjustments, service changes
- **Booking Confirmation**: Convert opportunities to confirmed jobs
- **Scheduling Coordination**: Date confirmation and crew assignment

*Inventory Management Actions:*
- **Yembo Photo Processing**: Upload customer photos for automated inventory detection
- **Manual Inventory Entry**: Add items manually using comprehensive furniture database
- **Bulk Item Management**: Import/export inventory lists, copy from previous jobs
- **Customer Portal Generation**: Create secure links for customers to edit their inventory
- **Inventory Validation**: Review and approve customer-submitted inventory changes
- **Special Items Flagging**: Mark items requiring special handling, equipment, or crew
- **Quote Recalculation**: Automatic pricing updates when inventory changes
- **Crew Requirement Updates**: Adjust crew size and equipment based on inventory changes

*Communication Management:*
- **Outreach Campaigns**: Automated and manual follow-up sequences
- **Document Delivery**: Quote sharing, contract sending, receipt distribution
- **Appointment Scheduling**: In-home estimates, pre-move consultations
- **Issue Resolution**: Problem tracking and customer service ticket management

*Relationship Building:*
- **Post-Move Follow-up**: Satisfaction surveys and feedback collection
- **Review Generation**: Automated review request campaigns
- **Referral Programs**: Incentive tracking and reward management
- **Repeat Business**: Service reminders and loyalty program enrollment

**Integration Points**:
- **Task Management**: Automatic follow-up task creation based on customer status
- **Calendar System**: Customer appointments and service dates sync across all calendars
- **Job Management**: Seamless transition from customer record to operational job details
- **Financial System**: Payment tracking, invoicing, and accounts receivable integration
- **Communication Platform**: Email, SMS, and call logging with customer records

**Role-Based Customer Access**:
- **Sales Team**: Focus on opportunities and booking conversion
- **Operations**: Access to confirmed jobs and scheduling information
- **Customer Service**: Complete access for issue resolution and post-move support
- **Management**: Full visibility for oversight and strategic customer analysis

#### **Sales Pipeline Visualization & Management:**

**Purpose**: Dedicated visual pipeline management for tracking lead progression from initial contact through job completion. Advanced sales funnel with detailed analytics and conversion optimization tools.

**Access Control**: 
- **Sales Team**: Full pipeline management and lead progression tracking
- **Sales Management**: Advanced analytics, conversion optimization, and team performance
- **Executive**: High-level pipeline metrics and revenue forecasting
- **Operations**: Limited access to booked/confirmed stages for job preparation

**Main Pipeline Interface**:

**Visual Funnel Display**:
- **Kanban-Style Columns**: Each pipeline stage displays as a column with customer cards
- **Customer Cards**: Show name, quote value, days in stage, next action, and priority level
- **Drag-and-Drop Movement**: Visually move customers between pipeline stages
- **Color-Coded Priorities**: Hot (red), warm (orange), cold (blue), stalled (gray)
- **Quick Actions**: Call, email, text, schedule appointment directly from pipeline cards
- **Revenue Totals**: Sum of quote values displayed at top of each pipeline column

**Pipeline Status Columns**:

1. **Hot Lead Column**:
   - Fresh leads under 5 minutes old
   - Auto-highlighted with urgency indicators
   - Lead source and initial contact method displayed
   - Quick claim buttons for sales team members

2. **Lead Column**:
   - Claimed leads being actively qualified
   - Shows assigned sales rep and claim timestamp
   - Contact attempt counter and last interaction date
   - Status indicators: contacted, in progress, qualified

3. **Opportunity Column**:
   - Qualified prospects with quotes generated
   - Quote amount, send date, and follow-up status
   - Days since quote sent with color-coded aging
   - Re-quote and modification quick actions

4. **Booked Column**:
   - Accepted quotes with confirmed move dates
   - Service date, crew requirements, and special notes
   - Contract status and deposit collection indicators
   - Pre-move preparation task tracking

5. **Confirmed Column**:
   - Jobs with crew assigned and logistics finalized
   - Crew assignment, truck allocation, and final details
   - Pre-move customer communication status
   - Ready-to-go indicators for operations team

6. **Complete Column**:
   - Finished moves awaiting final steps
   - Payment status, invoice generation, and collection
   - Review request sent status and response tracking
   - Post-move follow-up task indicators

7. **Reviewed Column**:
   - Fully completed customer lifecycle
   - Customer satisfaction scores and feedback
   - Referral potential and repeat business indicators
   - Long-term relationship management status

**Advanced Pipeline Analytics**:

**Conversion Tracking**:
- **Stage-to-Stage Conversion Rates**: Percentage of customers progressing between each stage
- **Drop-off Analysis**: Identify stages where customers are lost and reasons
- **Time in Stage**: Average duration customers spend in each pipeline stage
- **Velocity Trends**: Speed of pipeline movement over time periods
- **Individual Performance**: Conversion rates per sales team member
- **Lead Source Performance**: Which sources produce highest converting leads

**Revenue Analytics**:
- **Pipeline Revenue**: Total potential revenue in each stage and overall pipeline
- **Weighted Revenue**: Revenue projections based on stage conversion probabilities
- **Monthly Forecasting**: Predicted bookings and revenue based on current pipeline
- **Average Deal Size**: Quote values by stage, lead source, and sales rep
- **Revenue Velocity**: Speed of revenue movement through pipeline stages

**Performance Optimization**:
- **Bottleneck Identification**: Stages with longest customer duration or highest drop-off
- **A/B Testing**: Test different follow-up sequences and measure conversion impact
- **Best Practice Analysis**: Identify actions that correlate with higher conversion rates
- **Coaching Insights**: Individual sales rep performance data for management feedback
- **Process Improvement**: Recommendations for pipeline stage optimization

**Pipeline Management Tools**:

**Bulk Actions**:
- **Mass Follow-up**: Send emails or texts to multiple customers in same stage
- **Batch Updates**: Move multiple customers between stages simultaneously
- **Campaign Creation**: Launch targeted campaigns for customers in specific stages
- **Task Assignment**: Create follow-up tasks for multiple customers at once

**Automation Rules**:
- **Auto-Progression**: Automatically move customers based on actions (e.g., quote sent → opportunity)
- **Stale Lead Alerts**: Notify sales reps when customers haven't been contacted within timeframes
- **Stage Duration Limits**: Automatic alerts when customers stay in stages too long
- **Priority Escalation**: Automatically elevate high-value leads that need attention

**Filtering and Search**:
- **Multi-Filter Options**: Filter by sales rep, lead source, quote value, date ranges, stage duration
- **Search Functionality**: Find specific customers across all pipeline stages
- **Saved Views**: Create and save custom pipeline views for different scenarios
- **Quick Filters**: One-click filters for common views (overdue follow-ups, high-value, etc.)

**Integration Points**:
- **CRM Data Sync**: Real-time sync with customer records and interaction history
- **Task Management**: Pipeline actions automatically create follow-up tasks
- **Calendar Integration**: Schedule appointments directly from pipeline interface
- **Communication Tracking**: All calls, emails, texts logged and visible in pipeline
- **Quote System**: Direct access to quote generation and modification tools
- **Dashboard Metrics**: Pipeline data feeds into main dashboard KPIs

**Mobile Pipeline Access**:
- **Responsive Interface**: Full pipeline management on mobile devices
- **Touch Gestures**: Swipe and tap actions for pipeline movement
- **Quick Actions**: One-tap calling, texting, and emailing from mobile pipeline
- **Offline Sync**: Pipeline updates sync when mobile connection is restored

#### **Dispatch Management System:**

**Purpose**: Operational command center combining calendar-based job scheduling with resource allocation (crews, trucks, equipment). Designed for maximum usability and efficient crew deployment.

**Access Control**: 
- **Operations Team Only**: Dispatchers, Operations Managers, Supervisors
- **Restricted Access**: Most critical operational module requiring specialized permissions

**Core Interface Design Philosophy**:
- **Simplicity First**: Minimize clicks and complexity for rapid decision-making
- **Visual Clarity**: Color-coded systems and intuitive layout for quick understanding
- **Mobile Responsive**: Field supervisors can access and modify assignments on mobile devices
- **Real-Time Updates**: Instant synchronization across all platforms and users

**Dispatch Calendar View**:

*Main Calendar Interface:*
- **Timeline View**: Day/week/month views with hour-by-hour job scheduling
- **Job Slots**: Visual blocks showing scheduled moves with key details
- **Availability Overlay**: Real-time crew and truck availability indicators
- **Drag-and-Drop Assignment**: Move jobs between time slots and crew assignments
- **Status Color Coding**: 
  - Green: Fully staffed and dispatched
  - Yellow: Partially assigned, needs completion
  - Red: Unassigned or emergency priority
  - Blue: Multi-day job sequences
  - Gray: Completed or cancelled

*Job Information Display (Per Calendar Slot):*
- Customer name and contact info
- Service type and estimated duration
- Pickup/delivery addresses with map integration
- Required crew size and specialization needs
- Special equipment requirements (dollies, straps, piano boards)
- Current assignment status and completion percentage

**Resource Management Panel**:

*Crew Availability Dashboard:*
- **Real-Time Status**: Available, assigned, on-break, off-duty, unavailable
- **Crew Profiles**: Names, specializations (piano, safe, white glove), experience levels
- **Location Tracking**: Current job sites and estimated completion times
- **Skills Matrix**: Special certifications and handling capabilities
- **Performance Metrics**: Recent job completion rates and customer feedback

*Truck and Equipment Allocation:*
- **Vehicle Status**: Available, assigned, in-use, maintenance, out-of-service
- **Truck Specifications**: Size, capacity, special equipment mounted
- **GPS Location Tracking**: Real-time position with address and estimated return times
- **Live Vehicle Data**: Fuel level, mileage, engine diagnostics, driver behavior alerts
- **Route Monitoring**: Current route vs planned route with traffic-adjusted ETAs
- **Geofence Alerts**: Automatic notifications when trucks arrive/depart job sites
- **Maintenance Alerts**: Scheduled service dates and inspection requirements
- **Equipment Inventory**: Dollies, straps, blankets, piano boards, safe equipment

*Quick Assignment Interface:*
- **Auto-Suggest Crews**: System recommends optimal crew combinations based on job requirements
- **Availability Filtering**: Only show available resources for selected time slots
- **Route Optimization**: Geographic clustering for efficient territory coverage
- **Skill Matching**: Automatic pairing of specialized jobs with qualified crews
- **Workload Balancing**: Even distribution of work across team members

**Dispatch Workflow Management**:

*Job Assignment Process:*
1. **Job Review**: Verify customer details, service requirements, and special needs
2. **Resource Matching**: Select appropriate crew size and truck capacity
3. **Schedule Placement**: Assign to optimal time slot considering travel time and job duration
4. **Confirmation**: Send crew notifications and customer confirmation
5. **Monitoring**: Track job progress and crew status throughout the day

*Emergency and Same-Day Dispatch:*
- **Priority Override**: Emergency jobs get preferential resource allocation
- **Crew Reassignment**: Ability to pull crews from lower-priority jobs
- **Overtime Management**: Automatic calculation of extended hour costs
- **Customer Communication**: Automated updates on crew arrival times

*Multi-Day Job Coordination:*
- **Sequential Planning**: Link related job days for regional and long-distance moves
- **Crew Continuity**: Maintain same crew across multi-day projects when possible
- **Equipment Tracking**: Ensure materials and trucks follow job progression
- **Progress Monitoring**: Daily status updates and completion verification

**Integration Features**:

*Real-Time Communication:*
- **Crew Mobile Sync**: Instant job assignment notifications to crew mobile apps
- **Customer Updates**: Automatic arrival time and crew information sharing
- **Status Broadcasting**: Job progress updates visible across all system modules
- **Emergency Alerts**: Immediate notification system for urgent situations

*Operational Intelligence:*
- **GPS Fleet Tracking**: Real-time vehicle locations with live dashboard monitoring
- **Route Optimization**: Integrate with Google Maps for efficient crew routing and actual vs planned route analysis
- **Customer Tracking Portal**: Secure links for customers to track assigned truck location and ETA
- **Vehicle Diagnostics**: Live fuel consumption, mileage, and engine health monitoring
- **Driver Behavior Analytics**: Speed monitoring, hard braking, and safe driving score tracking
- **Geofencing Automation**: Automatic job site arrival/departure notifications and time tracking
- **Weather Monitoring**: Weather alerts affecting job scheduling and safety
- **Traffic Integration**: Real-time traffic data for accurate arrival estimates
- **Performance Analytics**: Crew efficiency, route adherence, and customer satisfaction tracking

**Usability Enhancements**:
- **One-Click Actions**: Common assignments (standard crew + truck) with single click
- **Template Assignments**: Save and reuse common crew configurations
- **Bulk Operations**: Assign multiple jobs or crews simultaneously
- **Undo Functionality**: Quick reversal of assignment changes
- **Search and Filter**: Rapid location of specific jobs, crews, or equipment

#### **Customer Service Management:**

**Purpose**: Handle customer complaints, collect reviews, and resolve issues. Keep it simple and focused on day-to-day customer service operations.

**Access Control**: 
- **Customer Service Team**: Full access
- **Management**: Oversight and escalation
- **Sales Team**: Limited access for review collection

**Core Functions**:

**Claims Management**:
- Customer reports damage/issue with photos and description
- Assign to team member for resolution
- Track status (Open, In Progress, Resolved)
- Process refunds/credits when needed
- Simple notes and communication log

**Review Management**:

*Automated Review Campaign System*:
- **Bannerbear Integration**: Generate personalized review request images featuring crew holding custom poster with customer name
- **Multi-Channel Delivery**: Send via email and SMS with crew names mentioned in message text: "Hi [Customer Name], your crew ([Crew Names]) would love to hear about your moving experience!"
- **Link Tracking**: Monitor if customers open email/SMS and click review link with UTM parameters and pixel tracking
- **Sentiment Landing Page**: Custom review portal with thumbs up/middle/down rating system and company branding
- **Trigger Automation**: Automatically initiated upon job completion status change in CRM

*Review Routing & Response System*:
- **Positive Reviews (Thumbs Up)**: Direct redirect to Google Reviews for public posting
- **Negative/Neutral Reviews (Thumbs Down/Middle)**: Internal questionnaire for detailed feedback
- **Platform Monitoring**: Track Google Reviews, Yelp, Facebook, and other review platforms
- **Review Response Management**: Automated and manual responses to both positive and negative reviews

*Automated Follow-Up Campaigns*:
- **15-Minute Follow-Up**: If customer clicks positive (thumbs up) but doesn't return from Google redirect, send "Did you have any issues completing your review? We're here to help!" message
- **24-Hour Follow-Up**: Second reminder with direct Google review link: "Hi [Customer Name], we noticed you didn't finish leaving your review. Could you take 30 seconds to help future customers by sharing your experience?"
- **48-Hour Final Follow-Up**: Last courteous attempt: "This is our final reminder about your review. We'd really appreciate if you could share your moving experience to help others. [Google Review Link]"
- **Campaign Termination**: After final follow-up, customer is removed from review campaign sequence
- **Manual Review Verification**: Staff manually check Google Reviews periodically to mark campaigns as completed when reviews are found

*Review Completion Tracking & Agent Monitoring*:
- **Dedicated Review Agent**: Staff member assigned to monitor Google Reviews in real-time during business hours
- **Smart Matching System**: Agent matches new Google reviews to active campaigns using:
  - Customer name similarity matching (John Smith → J. Smith, John S., etc.)
  - Review timing correlation (reviews appearing within 24 hours of positive rating)
  - Review content keywords (mentions crew names, moving company specifics)
  - Sequential review analysis (next review in chronological order after redirect)
- **Campaign Completion Workflow**: Agent marks campaigns complete when review match is identified, stopping follow-up sequence
- **Google My Business Dashboard**: Real-time monitoring of new reviews with campaign cross-reference tools
- **Automated Alerts**: System notifies review agent when positive ratings are submitted for immediate monitoring
- **Backup Manual Process**: Weekly bulk review matching for any missed connections
- **Opt-Out Mechanism**: Customers can reply "STOP" to SMS or click unsubscribe to end follow-up sequence

*Review Analytics & Insights*:
- **Completion Funnel**: Track from initial send → open → click → sentiment → Google posting
- **Crew Performance**: Individual crew review ratings and customer feedback
- **Platform Performance**: Review distribution across Google, Yelp, Facebook platforms
- **Trend Analysis**: Overall rating trends, sentiment patterns, and issue identification

**Issue Resolution**:
- Customer complaints and problems intake
- Assign to appropriate team member
- Track resolution progress and timeline
- Follow up to confirm customer satisfaction
- Simple escalation to manager when needed

**Basic Analytics Tab**:
- Customer satisfaction trends
- Review ratings over time
- Issue resolution times
- Common complaint categories
- Customer service team performance metrics

**Simple Workflow**:
1. Issue comes in → Create ticket
2. Assign to team member → Work on resolution
3. Communicate with customer → Keep them updated
4. Resolve issue → Follow up for satisfaction
5. Close ticket → Document outcome

**Integration Points**:
- Links to customer records and job history
- Task creation for follow-ups
- Basic reporting and metrics tracking

#### **AI Voice Center & Automation Hub:**

**Purpose**: Centralized command center for AI-powered voice assistants, automated customer interactions, and future business automation agents. Manages voice AI call handling with monitoring and optimization capabilities.

**Access Control**: 
- **AI Operations Team**: Full voice AI management and monitoring
- **Management**: Performance oversight and automation strategy
- **Customer Service**: Escalation handling and AI training feedback
- **Sales Team**: Lead qualification AI configuration and monitoring

**Core AI Voice Assistant Features**:

**Voice AI Call Handling (Retell/Ultravox Integration)**:
- **Inbound Call Management**: AI answers calls 24/7 with natural conversation capabilities
- **Lead Qualification**: Automated collection of move details, dates, addresses, and contact info
- **Quote Scheduling**: AI schedules estimate appointments and captures customer availability
- **Customer Support**: Answer common questions about services, pricing, and process
- **Call Routing**: Smart transfer to human agents when needed with full context handoff
- **Multi-Language Support**: Spanish and English conversation capabilities
- **Voice Recognition**: Natural language processing for complex customer requests

**AI Voice Monitoring Dashboard**:

*Real-Time Call Activity:*
- **Live Call Status**: Currently active AI calls with conversation progress
- **Call Queue**: Incoming calls being handled by voice AI vs human agents
- **Conversation Flow**: Real-time transcript of ongoing AI conversations
- **Escalation Alerts**: Immediate notifications when AI transfers calls to humans
- **Performance Metrics**: AI success rate, call completion, and customer satisfaction
- **Response Time**: Average time to answer and handle customer inquiries

*Call Analytics & Insights:*
- **Daily Call Volume**: Total calls handled by AI vs human agents
- **Conversation Topics**: Most common customer questions and requests
- **Lead Conversion**: AI-generated leads that convert to bookings
- **Customer Satisfaction**: Voice AI interaction ratings and feedback
- **Script Performance**: Which conversation flows work best
- **Drop-off Analysis**: Where customers hang up during AI interactions

**Voice AI Configuration & Training**:

*Conversation Management:*
- **Script Builder**: Visual flow builder for conversation paths and responses
- **Knowledge Base**: Updatable information database for AI to reference
- **Business Rules**: Configure pricing mentions, service area boundaries, scheduling rules
- **Escalation Triggers**: Define when AI should transfer to human agents
- **Voice Settings**: Adjust AI personality, speaking speed, and communication style
- **A/B Testing**: Test different conversation approaches and measure effectiveness

*Training & Optimization:*
- **Call Review**: Review AI conversations and identify improvement opportunities
- **Response Training**: Update AI responses based on successful human agent interactions
- **Intent Recognition**: Improve AI understanding of customer needs and requests
- **Performance Tuning**: Optimize AI for better lead qualification and conversion
- **Integration Updates**: Sync AI knowledge with CRM data and business changes

**Customer Interaction History**:
- **Complete Call Logs**: Full transcripts of all AI conversations per customer
- **Conversation Context**: Previous AI interactions when human agents take over
- **Lead Attribution**: Track which AI conversations generated successful bookings
- **Follow-up Integration**: AI conversation data flows into task management and CRM
- **Customer Preferences**: Remember customer communication preferences and details

**Business Automation Expansion (Future Development)**:

*Planned AI Agent Types:*
```typescript
// Future automation agents to be integrated
interface BusinessAutomationAgents {
  // Customer-Facing Agents
  emailResponseAgent: "AI handles routine email inquiries and quote follow-ups";
  reviewResponseAgent: "Automated responses to Google/Yelp reviews with human oversight";
  chatbotAgent: "Website chat integration for instant lead qualification";
  
  // Internal Operations Agents
  schedulingAgent: "AI optimizes crew schedules based on constraints and preferences";
  inventoryAgent: "Automated material ordering and equipment maintenance scheduling";
  followUpAgent: "AI manages customer follow-up sequences and callback scheduling";
  
  // Business Intelligence Agents
  reportingAgent: "Automated report generation and performance insights";
  pricingAgent: "Dynamic pricing adjustments based on demand and market conditions";
  marketingAgent: "Campaign optimization and lead source attribution analysis";
  
  // Integration Capabilities
  crmDataSync: "All AI agents access and update CRM data in real-time";
  humanHandoff: "Seamless escalation to human team members with full context";
  performanceMonitoring: "Continuous optimization based on success metrics";
}
```

*Automation Strategy Framework:*
- **Phase 1**: Voice AI call handling and basic customer interaction automation
- **Phase 2**: Email automation and review management AI agents
- **Phase 3**: Internal operations automation (scheduling, inventory, follow-ups)
- **Phase 4**: Advanced AI agents for pricing, marketing, and business intelligence
- **Phase 5**: Full ecosystem automation with human oversight and strategic direction

**Voice AI Technology Integration Options**:

*Voice AI Platforms (To Evaluate):*
- **Retell AI**: Advanced conversational AI with CRM integration capabilities
- **Ultravox**: Real-time voice AI with natural conversation flow
- **Bland AI**: Phone call automation with lead qualification focus
- **Vapi**: Voice AI platform with customizable conversation flows
- **ElevenLabs**: Voice cloning and natural speech generation
- **Assembly AI**: Speech-to-text and conversation analysis

**AI Call Coaching & Human Agent Assistance**:

**Intelligent Call Routing & Transfer System**:
- **AI Transfer Context**: When AI transfers to human, full conversation summary and customer context provided
- **Transfer Reasons**: Clear categorization (escalation, complex request, customer preference, technical issue)
- **Warm Handoff**: AI introduces human agent by name and explains why transfer is happening
- **Call History**: Complete AI conversation transcript immediately available to human agent
- **Customer Mood**: AI sentiment analysis passed to human (frustrated, satisfied, confused, urgent)
- **Recommended Actions**: AI suggests next best steps based on conversation analysis

**Real-Time AI Call Coaching (Human Agents)**:
*Live Call Assistance Dashboard:*
- **Real-Time Transcription**: Live speech-to-text of both customer and agent conversation
- **AI Suggestions Panel**: Real-time suggestions for responses and next actions
- **Customer Context**: Live display of customer record, quote history, and previous interactions
- **Objection Handling**: AI detects objections and provides proven response templates
- **Sentiment Monitoring**: Real-time customer mood tracking with alerts for negative sentiment
- **Script Guidance**: AI highlights key talking points and information to cover

*AI Coaching Features:*
- **Response Suggestions**: AI provides 3-5 suggested responses based on customer statements
- **Information Prompts**: AI reminds agent of relevant customer details or business policies
- **Pricing Guidance**: Real-time pricing calculations and discount approval suggestions
- **Competitor Intelligence**: AI provides talking points when customer mentions competitors
- **Closing Techniques**: AI suggests when and how to ask for the sale based on conversation flow
- **Follow-up Reminders**: AI suggests creating tasks or scheduling callbacks during the call

**In-App Calling System (All Calls Through CRM)**:

*Unified Calling Interface:*
- **CRM Native Dialer**: All business calls made through CRM app (web and mobile)
- **Automatic Call Logging**: Every call automatically recorded and associated with customer record
- **Click-to-Call**: Call any customer directly from their record, pipeline, or task list
- **Conference Calling**: Add team members or managers to customer calls seamlessly
- **Call Transfer**: Transfer active calls between team members with full context handoff
- **Voicemail Integration**: Voicemails automatically transcribed and attached to customer records

*Call Analytics & Performance:*
- **Call Recording**: All calls recorded with customer consent for training and quality assurance
- **Conversation Analysis**: AI analyzes calls for conversion opportunities and coaching feedback
- **Talk Time Tracking**: Monitor call duration, talk ratio, and conversation effectiveness
- **Outcome Tracking**: Link call results to customer status changes and booking conversions
- **Performance Metrics**: Individual agent call performance with coaching recommendations
- **Best Practice Identification**: AI identifies high-converting conversation patterns

**Advanced AI Call Features**:

*Real-Time Call Intelligence:*
- **Live Competitor Mentions**: AI alerts when customer mentions competitor pricing or services
- **Budget Detection**: AI identifies when customer reveals budget information or price concerns
- **Decision Maker Identification**: AI helps identify if current contact is the decision maker
- **Urgency Indicators**: AI detects time-sensitive language and moving date urgency
- **Objection Patterns**: AI recognizes common objections and provides proven counter-responses
- **Closing Opportunities**: AI suggests optimal moments to ask for booking confirmation

*Post-Call AI Analysis:*
- **Call Summary Generation**: AI creates comprehensive call summary with key points and outcomes
- **Action Item Extraction**: AI identifies and creates follow-up tasks mentioned during call
- **Sentiment Analysis**: Overall customer satisfaction and likelihood to book assessment
- **Coaching Feedback**: Personalized coaching suggestions based on call performance
- **Conversion Probability**: AI predicts likelihood of customer booking based on conversation
- **Follow-up Recommendations**: AI suggests optimal timing and method for next customer contact

**Call Coaching Configuration & Training**:

*AI Coach Customization:*
- **Company Voice Training**: AI learns company-specific language, policies, and sales approaches
- **Individual Agent Profiles**: AI adapts coaching style to each agent's strengths and weaknesses
- **Performance Goals**: Set specific coaching objectives (conversion rate, call length, customer satisfaction)
- **Sensitivity Settings**: Adjust how frequently AI provides suggestions (minimal to comprehensive)
- **Industry Knowledge**: AI trained on moving industry specifics, regulations, and best practices

*Coaching Analytics & Improvement:*
- **Coaching Effectiveness**: Track improvement in agent performance with AI coaching vs without
- **Suggestion Acceptance**: Monitor which AI suggestions agents use most frequently
- **Learning Patterns**: Identify which coaching approaches work best for different agent types
- **Performance Correlation**: Link AI coaching usage to conversion rates and customer satisfaction
- **Continuous Learning**: AI improves suggestions based on successful call outcomes and agent feedback

*Integration Architecture:*
```typescript
// Voice AI system integration points
interface VoiceAIIntegration {
  // Core System Connections
  supabaseIntegration: "Real-time CRM data sync during calls";
  taskManagement: "Automatic task creation from AI conversations";
  calendarSync: "AI schedules appointments directly in dispatch calendar";
  customerRecords: "AI updates customer information and conversation history";
  
  // Communication Channels
  phoneSystem: "Integration with business phone numbers and routing";
  webChat: "Voice AI available through website chat interface";
  mobileApp: "Voice assistant in crew mobile apps for internal communication";
  
  // Analytics & Monitoring
  conversationAnalytics: "Call performance tracking and optimization";
  leadScoring: "AI assesses lead quality and priority";
  sentimentAnalysis: "Customer satisfaction detection during conversations";
  businessIntelligence: "Voice interactions feed into CRM analytics";
}
```

**Privacy & Compliance**:
- **Call Recording**: Secure storage of AI conversations with customer consent
- **Data Security**: Encrypted voice data transmission and storage
- **Compliance**: Adherence to telemarketing regulations and privacy laws
- **Customer Opt-out**: Easy process for customers to request human agents only
- **Quality Assurance**: Regular AI performance reviews and conversation audits

**ROI & Performance Tracking**:
- **Cost Savings**: Reduced need for 24/7 human call center staffing
- **Lead Generation**: Increased capture rate of after-hours and weekend inquiries
- **Response Time**: Immediate call answering vs previous wait times
- **Conversion Optimization**: A/B test different AI approaches for better booking rates
- **Scalability**: Handle higher call volumes without proportional staff increases

#### **Marketing Management:**

**Purpose**: Track marketing performance, manage referral programs, and monitor ROI across all marketing channels. Centralized view of advertising results and campaign effectiveness.

**Access Control**: 
- **Marketing Team**: Full access to campaigns and analytics
- **Management**: ROI oversight and budget performance
- **Sales Team**: Limited access to lead source attribution

**Marketing Tabs**:

**Advertising Campaigns Tab**:
- **Google Ads Performance**: Click-through rates, cost per lead, conversion tracking
- **Facebook/Meta Ads**: Campaign performance, audience insights, lead generation
- **Google Local Services**: Lead quality, booking rates, cost per acquisition
- **Other Platforms**: Yelp Ads, Nextdoor, Thumbtack performance tracking
- **Campaign ROI**: Revenue generated vs ad spend for each platform
- **Lead Attribution**: Track which campaigns generated specific customers

**Google Business Profile (GBP) Tab**:
- **Profile Performance**: Views, clicks, calls, direction requests
- **Review Management**: GBP review monitoring and response tracking
- **Post Performance**: Updates, offers, and announcement engagement
- **Photo Analytics**: Image views and customer engagement
- **Search Ranking**: Local search position tracking and optimization
- **Competitor Analysis**: Compare performance against local moving companies

**Social Media & Content Tab**:
- **Platform Performance**: Facebook, Instagram, TikTok, YouTube engagement
- **Content Analytics**: Post reach, engagement rates, follower growth
- **Social Lead Generation**: Inquiries and bookings from social channels
- **Influencer Collaborations**: Partnership tracking and performance
- **Brand Mention Monitoring**: Social listening and reputation management

**Social Media Chat Management**:
*Unified Social Messaging Dashboard:*
- **Facebook Messenger**: All customer messages from Facebook business page
- **Instagram Direct Messages**: Customer inquiries and responses from Instagram
- **TikTok Messages**: Direct messages and comments from TikTok business account
- **YouTube Comments**: Comments on videos that require business responses
- **Google Business Messages**: Customer messages through Google Business Profile
- **Yelp Messages**: Customer inquiries through Yelp business page

*Social Chat Features:*
- **Consolidated Inbox**: All social platform messages in one unified view
- **Platform Indicators**: Clear visual tags showing which platform each message came from
- **Response Templates**: Pre-written responses optimized for each social platform
- **Auto-Routing**: Route social messages to appropriate team members based on inquiry type
- **Lead Qualification**: Convert social media inquiries into formal leads in CRM
- **Response Time Tracking**: Monitor how quickly team responds to social media messages

*Social Media AI Integration:*
- **AI Social Responses**: Automated responses to common social media inquiries
- **Sentiment Monitoring**: AI detects negative comments/messages requiring immediate attention
- **Lead Scoring**: AI evaluates social media inquiries for conversion potential
- **Brand Voice Consistency**: AI ensures responses match brand personality across platforms
- **Language Detection**: Automatic translation for non-English social media messages
- **Escalation Alerts**: Notify managers of complaints or negative sentiment on social platforms

*Social Lead Conversion:*
- **Message to Lead**: Convert social media inquiries directly into CRM leads
- **Quote Generation**: Create and send quotes directly from social media conversations
- **Appointment Scheduling**: Schedule estimates from social media message threads
- **Customer Records**: Link social media profiles to customer records in CRM
- **Follow-up Automation**: Automated follow-up sequences for social media leads
- **Conversion Tracking**: Track which social media conversations result in bookings

**Referral Program Tab**:

*Referral Tracking System:*
- **Referral Source Management**: Track who referred each customer
- **Commission Structure**: Set referral payout amounts and tiers
- **Payment Tracking**: Outstanding referral payments and payment history
- **Referrer Performance**: Top referral sources and their conversion rates
- **Automated Payouts**: Schedule and process referral commission payments

*Referral Program Types:*
- **Customer Referrals**: Past customers referring new business
- **Business Partner Referrals**: Real estate agents, property managers, contractors
- **Employee Referrals**: Staff member referral bonuses
- **Affiliate Program**: External partners promoting services

*Referral Workflow:*
1. Customer books job and mentions referral source
2. System tracks referral attribution in customer record
3. Job completes successfully
4. Referral commission calculated automatically
5. Payment processed to referrer
6. Thank you communication sent

**Marketing Analytics Dashboard**:

*Key Performance Indicators:*
- **Cost Per Lead (CPL)** by marketing channel
- **Customer Acquisition Cost (CAC)** including all marketing expenses
- **Return on Ad Spend (ROAS)** for each advertising platform
- **Lead-to-Customer Conversion** rates by source
- **Customer Lifetime Value (CLV)** by acquisition channel

*Campaign Performance Metrics:*
- **Monthly Ad Spend** vs budget across all platforms
- **Lead Quality Scoring** based on booking and completion rates
- **Seasonal Performance** trends and optimal timing analysis
- **Geographic Performance** for targeted local advertising
- **Attribution Analysis** for multi-touch customer journeys

**Integration Features**:
- **Lead Source Attribution**: Automatic tracking from first touch to booking
- **CRM Connection**: Marketing data flows into customer records
- **Financial Integration**: Ad spend and referral payments sync with accounting
- **Task Automation**: Follow-up tasks for high-performing campaigns
- **Real-Time Alerts**: Budget overruns, campaign performance drops, high-value referrals

#### **Accounting & Financial Management:**

**Purpose**: Unified financial system with zero duplication across all platforms. Complete integration between Plaid, QuickBooks, Stripe, and CRM for seamless financial operations.

**Access Control**: 
- **Accounting Team**: Full access to all financial data and reconciliation
- **Management**: Revenue oversight and financial reporting
- **Operations**: Limited access to payroll and expense tracking

**Core Integration Philosophy**:
- **Single Source of Truth**: All platforms sync automatically with no duplicate entries
- **Real-Time Synchronization**: Every transaction flows between systems instantly
- **Zero Manual Entry**: Automatic data flow prevents human error and duplication
- **Complete Audit Trail**: Every financial transaction links back to originating customer/job

**Financial System Integration**:

**Plaid Integration (Day-to-Day Banking)**:
- **Real-Time Bank Account Monitoring**: Live balance and transaction tracking
- **Automatic Transaction Categorization**: Business expenses, customer payments, payroll
- **Cash Flow Forecasting**: Daily/weekly cash flow projections based on scheduled jobs
- **Payment Verification**: Automatic matching of customer payments to invoices
- **Expense Tracking**: Automatic categorization of fuel, materials, equipment purchases

**QuickBooks Integration (Long-Term Accounting)**:
- **Automatic Data Sync**: All CRM transactions flow into QuickBooks automatically
- **Chart of Accounts Mapping**: CRM categories automatically map to correct QuickBooks accounts
- **Financial Reporting**: P&L, balance sheet, cash flow statements with CRM job attribution
- **Tax Preparation**: Organized records for accountant and tax filing
- **Invoice Generation**: Professional invoices created from CRM job completion

**Stripe Integration (Payment Processing)**:
- **Customer Payment Processing**: Credit cards, ACH transfers, digital payments
- **Automatic Invoice Matching**: Payments automatically applied to correct customer invoices
- **Recurring Billing**: Automated monthly charges for storage or ongoing services
- **Refund Processing**: Seamless refunds that sync across all systems
- **Payment Status Tracking**: Real-time payment confirmation in CRM customer records

**CRM Financial Hub (Central Control)**:
- **Job-Based Accounting**: Every transaction links to specific customer and job
- **Revenue Recognition**: Track when services are performed vs when payment received
- **Customer Account Status**: Real-time balance and payment history per customer
- **Pricing Accuracy Tracking**: Compare quoted vs actual charges for estimation improvement

**Payroll Management System**:

*Employee Payment Processing:*
- **Hourly Tracking**: Integration with crew mobile check-in/check-out times
- **Overtime Calculations**: Automatic overtime rates for extended job hours
- **Commission Tracking**: Sales team commissions based on closed deals
- **Referral Payouts**: Automatic processing of referral commission payments
- **Tax Withholding**: Automatic payroll tax calculations and submissions

*Payroll Integration:*
- **Time Clock Integration**: Crew mobile app times sync directly to payroll
- **Job-Based Pay**: Track which jobs each crew member worked for cost analysis
- **Performance Bonuses**: Customer satisfaction-based bonus calculations
- **Direct Deposit**: Automated employee payment processing
- **Payroll Reporting**: Labor costs per job for profitability analysis

**Future Payment Solutions (WIP)**:

*Pay-in-4 Integration (Future Implementation):*
- **Customer Financing Options**: Partner with credit companies for payment plans
- **Upfront Payment Guarantee**: Company receives full payment immediately
- **Credit Processing**: Customer financing handled by third-party partner
- **Risk Management**: Credit approval and payment guarantee systems
- **Integration Planning**: Seamless checkout experience with financing options

**Financial Dashboard Overview**:

*Daily Financial Metrics:*
- **Today's Revenue**: Completed jobs and payments received
- **Outstanding Invoices**: Unpaid balances and aging analysis  
- **Cash Position**: Real-time bank balance across all accounts
- **Daily Expenses**: Fuel, materials, payroll, and operational costs
- **Profit Margins**: Job profitability analysis and trends

*Monthly Financial Health:*
- **Revenue vs Budget**: Performance against financial targets
- **Customer Payment Trends**: Average payment times and collection efficiency
- **Cost per Job**: Labor, materials, and overhead allocation
- **Seasonal Analysis**: Revenue patterns and cash flow planning
- **Growth Metrics**: Month-over-month revenue and customer acquisition

**Reconciliation and Accuracy Controls**:
- **Automatic Matching**: Bank transactions automatically match to CRM records
- **Exception Reporting**: Alert system for unmatched or duplicate transactions
- **Daily Reconciliation**: Automated daily balance verification across all systems
- **Audit Trail**: Complete transaction history with originating job/customer links
- **Error Prevention**: Validation rules prevent duplicate or incorrect entries

#### **Reports & Analytics:**

**Purpose**: Comprehensive business intelligence and reporting across all aspects of the moving company. Data-driven insights for strategic decision-making and operational optimization.

**Access Control**: 
- **Management**: Full access to all reports and analytics
- **Department Heads**: Access to relevant departmental reports
- **Team Leads**: Limited access to team performance metrics

**Sales & Marketing Reports**:

*Lead Generation & Conversion:*
- **Lead Source Performance**: Conversion rates and ROI by marketing channel
- **Sales Pipeline Analysis**: Lead-to-opportunity-to-booking progression
- **Sales Rep Performance**: Individual and team conversion metrics
- **Lead Response Times**: Speed of contact and follow-up effectiveness
- **Seasonal Lead Trends**: Monthly/yearly lead volume patterns
- **Geographic Lead Distribution**: Service area performance and expansion opportunities

*Marketing ROI Analysis:*
- **Cost Per Acquisition**: Customer acquisition cost by marketing channel
- **Campaign Performance**: Ad spend vs revenue generated per campaign
- **Return on Ad Spend (ROAS)**: Profitability analysis by platform
- **Customer Lifetime Value**: Long-term value by acquisition source
- **Referral Program Performance**: Referral conversion and commission tracking

**Operational Performance Reports**:

*Job Execution & Efficiency:*
- **Crew Utilization**: Daily/weekly crew productivity and availability
- **Job Completion Times**: Actual vs estimated duration analysis
- **Equipment Usage**: Truck and equipment efficiency tracking
- **Route Optimization**: Travel time and territory coverage analysis
- **Multi-Day Job Performance**: Regional and long-distance move efficiency

*Service Quality Metrics:*
- **Customer Satisfaction Scores**: Job completion ratings and feedback trends
- **Damage Claims Analysis**: Frequency, cost, and root cause identification
- **Service Issue Tracking**: Common problems and resolution effectiveness
- **Crew Performance**: Individual and team customer service ratings
- **On-Time Performance**: Schedule adherence and punctuality metrics

**Financial Performance Reports**:

*Revenue & Profitability:*
- **Daily/Weekly/Monthly Revenue**: Revenue trends and growth analysis
- **Profit Margins by Service**: Profitability comparison across service types
- **Job Profitability Analysis**: Individual job performance and cost tracking
- **Pricing Accuracy**: Quoted vs actual charges variance analysis
- **Revenue per Crew**: Productivity and profitability per team

*Financial Health Indicators:*
- **Cash Flow Analysis**: Daily/weekly cash position and forecasting
- **Accounts Receivable Aging**: Outstanding payment tracking and collection
- **Operating Expense Trends**: Cost category analysis and budget variance
- **Seasonal Revenue Patterns**: Peak/off-season performance planning
- **Customer Payment Analysis**: Payment time trends and collection efficiency

**Human Resources & Payroll Reports**:

*Workforce Analytics:*
- **Payroll Cost Analysis**: Labor costs per job and profitability impact
- **Overtime Tracking**: Overtime frequency and cost management
- **Employee Performance**: Individual productivity and customer satisfaction
- **Training Needs Assessment**: Skills gaps and development opportunities
- **Turnover Analysis**: Retention rates and hiring effectiveness

*Scheduling & Availability:*
- **Crew Scheduling Efficiency**: Optimal crew size and utilization
- **Employee Availability**: Time-off patterns and coverage analysis
- **Peak Season Staffing**: Resource planning for busy periods
- **Performance-Based Compensation**: Commission and bonus tracking

**Customer Relationship Reports**:

*Customer Analytics:*
- **Customer Acquisition Trends**: New customer growth and retention
- **Repeat Customer Analysis**: Loyalty and repeat business rates
- **Customer Segmentation**: Service preferences and spending patterns
- **Geographic Customer Distribution**: Service area coverage and density
- **Customer Feedback Trends**: Satisfaction scores and improvement areas

*Service History & Retention:*
- **Customer Service History**: Complete interaction and service timeline
- **Referral Generation**: Customer referral rates and program effectiveness
- **Review and Rating Trends**: Online reputation and customer sentiment
- **Complaint Resolution**: Issue resolution time and satisfaction recovery

**Industry-Specific Moving Reports**:

*Move Type Performance:*
- **Local vs Long-Distance**: Service type profitability and efficiency
- **Residential vs Commercial**: Market segment performance analysis
- **Service Tier Analysis**: Full Service vs White Glove vs Labor Only
- **Special Handling Jobs**: Piano, safe, and specialty item profitability

*Seasonal & Market Analysis:*
- **Peak Season Performance**: Summer moving season optimization
- **Market Share Analysis**: Competitive positioning and growth opportunities
- **Service Area Expansion**: New territory performance and viability
- **Economic Impact Analysis**: Local market conditions and business impact

**Compliance & Safety Reports**:

*DOT & Safety Compliance:*
- **Driver Hours Tracking**: DOT compliance and violation prevention
- **Vehicle Maintenance**: Inspection schedules and compliance status
- **Safety Incident Reports**: Accident frequency and prevention analysis
- **Insurance Claims**: Coverage utilization and risk management

*Quality Assurance:*
- **Service Standard Compliance**: Adherence to company procedures
- **Training Completion**: Employee certification and skill development
- **Customer Complaint Analysis**: Service quality trends and improvements
- **Audit Trail Reports**: Complete transaction and activity logging

**Custom Report Builder**:
- **Drag-and-Drop Interface**: Create custom reports without technical skills
- **Scheduled Reports**: Automated report generation and distribution
- **Export Options**: PDF, Excel, CSV formats for external analysis
- **Dashboard Integration**: Key metrics display on main dashboard
- **Real-Time Data**: Live reporting with current business data

#### **Enhanced Social Media Integration:**

**Multi-Platform Social Management**:

**Core Social Media Platforms**:
- **Facebook API Integration**: Page management, post scheduling, engagement tracking, lead generation campaigns
- **Instagram Graph API**: Content posting, story management, business profile analytics, hashtag performance
- **Twitter API v2**: Tweet scheduling, engagement metrics, brand mention monitoring, trending topics
- **LinkedIn API**: Company page management, professional content sharing, recruitment posting, business networking
- **YouTube Analytics API**: Video performance tracking, channel growth metrics, engagement analysis
- **Yelp Fusion API**: Business profile management, review monitoring, competitor analysis, local search optimization

**Unified Social Media Dashboard**:
- **Cross-Platform Posting**: Schedule and publish content across all platforms simultaneously
- **Engagement Tracking**: Unified view of likes, comments, shares, and mentions across all channels
- **Analytics Consolidation**: Combined performance metrics and ROI analysis from all social platforms
- **Content Calendar**: Visual calendar showing all scheduled posts across platforms
- **Brand Monitoring**: Real-time alerts for mentions, reviews, and customer interactions

**Platform-Specific Features**:

*Facebook Integration:*
- **Business Page Management**: Post scheduling, event promotion, service showcase
- **Facebook Ads Integration**: Campaign performance tracking, lead generation form sync
- **Messenger Integration**: Customer service chat integration with CRM records
- **Local Business Features**: Location-based promotions and service area targeting

*Instagram Integration:*
- **Visual Content Management**: Photo/video posting, story highlights, IGTV content
- **Business Profile Analytics**: Follower demographics, post performance, story insights
- **Hashtag Strategy**: Performance tracking and optimization recommendations
- **Instagram Shopping**: Service promotion and booking link integration

*LinkedIn Integration:*
- **Company Page Management**: Professional content sharing, industry thought leadership
- **Employee Advocacy**: Team member content sharing and company promotion
- **Recruitment Integration**: Job posting sync with HR module, candidate sourcing
- **B2B Lead Generation**: Commercial moving service promotion and networking

*YouTube Integration:*
- **Channel Management**: Video upload scheduling, playlist organization, thumbnail optimization
- **Performance Analytics**: View metrics, audience retention, subscriber growth tracking
- **SEO Optimization**: Video title, description, and tag optimization for search visibility
- **Content Strategy**: Trending topic identification and content planning

#### **HR & Hiring Management:**

**Purpose**: Complete recruitment pipeline from job posting to employee onboarding. Integrated applicant tracking system with external job board connections.

**Access Control**: 
- **HR Team**: Full recruitment pipeline management
- **Management**: Hiring oversight and approval workflows  
- **Department Heads**: Limited access for team-specific hiring needs

**Job Board Integrations**:

**Indeed Integration**:
- **Job Posting Sync**: Automatic job posting from CRM to Indeed platform
- **Application Management**: Indeed applications flow directly into CRM hiring pipeline
- **Performance Tracking**: Application volume, cost-per-application, quality metrics
- **Sponsored Job Management**: Budget allocation and performance optimization

**Multi-Platform Job Distribution**:
- **LinkedIn Jobs**: Professional network job posting and candidate sourcing
- **ZipRecruiter**: Broad reach job distribution and candidate screening
- **Glassdoor**: Employer brand management and salary benchmarking
- **Local Job Boards**: Regional job board integration for local candidate sourcing
- **Facebook Jobs**: Social media job promotion and community-based hiring

**Hiring Pipeline Management**:

**Candidate Sourcing**:
- **Active Job Postings**: Current openings with application tracking
- **Candidate Database**: Previous applicants and recruitment history
- **Employee Referrals**: Internal referral program with tracking and rewards
- **Talent Pool**: Qualified candidates for future opportunities

**Application Processing Workflow**:
1. **Application Received**: Automatic notification and initial screening
2. **Resume Review**: Qualification assessment and scoring
3. **Phone Screening**: Initial interview scheduling and notes
4. **In-Person Interview**: Comprehensive evaluation and team interviews
5. **Background Check**: Reference verification and screening process
6. **Job Offer**: Offer generation and negotiation tracking
7. **Onboarding**: New employee integration and training schedule

**Position-Specific Hiring**:

*Moving Crew Positions:*
- **Physical Requirements**: Lifting capacity, stamina, and safety awareness
- **Experience Assessment**: Previous moving experience and skill evaluation
- **Background Screening**: Clean driving record, criminal background check
- **Skills Testing**: Practical moving skills demonstration and evaluation

*Driver Positions:*
- **CDL Requirements**: Commercial driver's license verification
- **DOT Compliance**: Medical certification and driving record review
- **Vehicle Operation**: Truck handling skills and safety protocol knowledge
- **Route Experience**: Local area knowledge and navigation skills

*Sales Team Positions:*
- **Communication Skills**: Customer interaction and relationship building
- **Industry Knowledge**: Moving industry experience and service understanding
- **Performance Metrics**: Sales goal achievement and conversion tracking
- **CRM Proficiency**: System training and customer management skills

**Recruitment Analytics**:
- **Time-to-Hire**: Average recruitment cycle duration by position type
- **Cost-per-Hire**: Recruitment expenses and ROI analysis per position
- **Source Effectiveness**: Job board performance and candidate quality metrics
- **Retention Tracking**: New hire success rates and turnover analysis
- **Diversity Metrics**: Equal opportunity hiring and demographic tracking

**Employee Onboarding Integration**:
- **New Hire Documentation**: Digital forms, tax documents, and policy acknowledgments
- **Training Schedule**: Position-specific training programs and certification tracking
- **Equipment Assignment**: Uniform, tools, and technology provisioning
- **Performance Tracking**: 30/60/90-day review scheduling and goal setting
- **Payroll Integration**: Automatic employee setup in payroll system

#### **Fleet & Inventory Management:**

**Purpose**: Comprehensive asset management for vehicles, equipment, crew members, and inventory. Long-term resource planning and maintenance separate from daily dispatch operations.

**Access Control**: 
- **Fleet Managers**: Full vehicle and equipment management
- **Inventory Managers**: Equipment and supplies tracking
- **Operations**: Read-only access for resource planning
- **Maintenance Staff**: Vehicle service and repair tracking

**Fleet Management Tab**:

**Vehicle Management**:
- **Truck Profiles**: Make, model, year, VIN, capacity, specifications
- **Registration & Insurance**: Documentation tracking and renewal alerts
- **DOT Compliance**: Commercial vehicle inspections and certification status
- **Fuel Efficiency**: MPG tracking and cost analysis per vehicle
- **Vehicle History**: Complete service record and incident tracking

**Maintenance Scheduling**:
- **Preventive Maintenance**: Oil changes, tire rotations, brake inspections on schedule
- **Mileage Tracking**: Automatic odometer updates from crew mobile check-ins
- **Service Alerts**: Automated notifications for upcoming maintenance needs
- **Repair Tracking**: Work order management and vendor coordination
- **Cost Analysis**: Maintenance expenses per vehicle and total fleet costs

**Vehicle Performance Analytics**:
- **Utilization Rates**: Daily/weekly usage patterns and efficiency
- **Fuel Cost Tracking**: Per-mile fuel expenses and budget variance
- **Downtime Analysis**: Out-of-service time and impact on operations
- **Replacement Planning**: Age, mileage, and cost-based replacement schedules
- **Route Efficiency**: GPS data integration for optimization opportunities

**Crew Management Tab**:

**Mover Profiles & Skills Matrix**:
- **Personal Information**: Contact details, emergency contacts, employment history
- **Skill Certifications**: Piano moving, safe handling, white glove specializations
- **Physical Capabilities**: Lifting capacity, stamina ratings, injury history
- **Performance Ratings**: Customer satisfaction scores and job completion quality
- **Training Records**: Completed courses, certifications, ongoing development needs

**Training & Development System**:
- **Onboarding Programs**: New employee orientation and basic moving techniques
- **Specialty Training**: Piano, safe, antique, and fragile item handling
- **Safety Certification**: OSHA compliance, lifting techniques, accident prevention
- **Customer Service**: Communication skills and professional behavior training
- **Continuous Education**: Ongoing skill development and career advancement

**Availability & Scheduling Preferences**:
- **Work Availability**: Full-time, part-time, seasonal, weekend preferences
- **Skill-Based Assignment**: Automatic matching of specialized jobs to qualified movers
- **Performance History**: Job completion rates, customer feedback, reliability scores
- **Team Compatibility**: Crew chemistry and optimal team combinations
- **Location Preferences**: Territory assignments and travel willingness

**Equipment & Inventory Tab**:

**Real-Time Inventory Tracking**:
- **Moving Equipment**: Dollies, straps, blankets, piano boards, safe equipment
- **Packing Materials**: Boxes, tape, bubble wrap, paper, specialty containers
- **Tools & Supplies**: Hand trucks, ramps, furniture pads, shrink wrap
- **Location Tracking**: Equipment assigned to trucks, crews, or warehouse storage
- **Usage Analytics**: Equipment utilization rates and replacement needs

**Mobile App Integration**:
- **Check-Out System**: Crew members scan equipment when taking from inventory
- **Check-In Process**: Return tracking with condition assessment
- **Real-Time Updates**: Inventory levels update instantly across all systems
- **Location Services**: GPS tracking of equipment with crew assignments
- **Damage Reporting**: Mobile incident reporting for damaged equipment

**Amazon Integration & Auto-Ordering**:
- **Low Stock Alerts**: Automatic notifications when inventory drops below thresholds
- **Smart Reordering**: AI-driven reorder quantities based on usage patterns
- **One-Click Purchase**: Direct ordering from Amazon Business account
- **Delivery Tracking**: Package tracking and automatic inventory updates
- **Cost Optimization**: Price comparison and bulk ordering recommendations

**Inventory Analytics**:
- **Usage Patterns**: Seasonal demand forecasting and procurement planning
- **Cost per Job**: Equipment and material costs allocation to specific jobs
- **Waste Reduction**: Optimization recommendations to minimize unused supplies
- **Vendor Performance**: Supplier reliability and cost effectiveness analysis
- **ROI Tracking**: Equipment investment returns and replacement justification

**Equipment Lifecycle Management**:

**Asset Tracking**:
- **Equipment Registry**: Complete inventory with serial numbers, purchase dates, costs
- **Condition Monitoring**: Regular inspections and maintenance scheduling
- **Depreciation Tracking**: Asset value calculation for accounting and insurance
- **Replacement Planning**: Age-based and condition-based replacement strategies
- **Warranty Management**: Warranty tracking and claim processing

**Maintenance & Repairs**:
- **Preventive Maintenance**: Scheduled servicing for trucks, dollies, and power tools
- **Repair Work Orders**: Issue tracking and vendor coordination
- **Parts Inventory**: Replacement parts stocking and ordering
- **Service Vendor Management**: Preferred vendor relationships and performance tracking
- **Cost Control**: Maintenance budget tracking and variance analysis

**Integration Features**:

**Dispatch Integration**:
- **Real-Time Availability**: Dispatch sees current vehicle and equipment status
- **Automatic Assignment**: Available resources automatically populate dispatch options
- **Maintenance Conflicts**: Prevents assignment of vehicles scheduled for service
- **Crew Matching**: Skill-based crew suggestions for specialized jobs

**Financial Integration**:
- **Asset Accounting**: Equipment values and depreciation sync with accounting
- **Maintenance Costs**: Service expenses automatically categorized and tracked
- **Procurement Integration**: Purchase orders and invoices flow to accounting system
- **Budget Management**: Department budgets and variance tracking

**Mobile Workforce Connection**:
- **Equipment Scanning**: QR code scanning for check-out/check-in processes
- **Mileage Reporting**: Automatic odometer updates from crew mobile apps
- **Incident Reporting**: Real-time damage or maintenance issue reporting
- **Performance Feedback**: Crew performance data flows back to profiles

**GPS Vehicle Tracking & Fleet Monitoring**:
- **Real-Time Location Tracking**: Live GPS coordinates for all trucks and vehicles
- **Route Optimization**: Track actual routes vs planned routes for efficiency analysis
- **Geofencing**: Automatic alerts when vehicles enter/exit job sites or service areas
- **Speed Monitoring**: Track vehicle speeds and identify unsafe driving patterns
- **Idle Time Tracking**: Monitor excessive idling for fuel efficiency optimization
- **Maintenance Alerts**: GPS-based odometer tracking for scheduled maintenance
- **Emergency Location**: Instant vehicle location for roadside assistance or emergencies

**Live Vehicle Dashboard (Per Truck)**:
- **Current Location**: Real-time GPS position with address and map view
- **Vehicle Status**: In transit, on-site, parked, maintenance mode
- **Fuel Level**: Current fuel percentage and estimated range (if equipped)
- **Engine Diagnostics**: RPM, engine temperature, battery voltage (OBD-II integration)
- **Mileage Tracking**: Daily/weekly/monthly odometer readings and trip logs
- **Driver Behavior**: Hard braking, rapid acceleration, cornering alerts
- **Hours of Service**: Track driving time for DOT compliance (commercial vehicles)

**Customer GPS Tracking Portal**:
- **Truck Arrival Tracking**: Customer can see assigned truck approaching their location
- **ETA Updates**: Real-time arrival estimates based on current traffic and location
- **Secure Tracking Link**: Unique URL sent via SMS/email for customer access
- **Job Progress Updates**: "En route to pickup", "Loading in progress", "En route to delivery"
- **Driver Contact**: Direct contact info for assigned crew with truck location
- **Completion Notification**: Automatic alert when truck arrives at delivery location

**Fleet Analytics & Reporting**:
- **Route Efficiency**: Compare planned vs actual routes for optimization opportunities
- **Fuel Consumption**: Track MPG, fuel costs, and efficiency trends per vehicle
- **Driver Performance**: Safe driving scores, route adherence, on-time performance
- **Vehicle Utilization**: Track usage patterns and identify underutilized assets
- **Maintenance Optimization**: Predictive maintenance based on usage patterns and GPS data
- **Cost Per Mile**: Comprehensive vehicle operating costs including fuel, maintenance, insurance

**GPS Integration Options (Technology Stack - TBD)**:
```typescript
// Potential GPS tracking solutions to evaluate:
interface GPSTrackingOptions {
  // Commercial Fleet Tracking
  fleetComplete: "Full fleet management with OBD-II integration";
  verizonConnect: "Enterprise fleet tracking with driver behavior";
  geotab: "Comprehensive telematics and vehicle diagnostics";
  
  // Developer-Friendly APIs
  mapbox: "Custom tracking with route optimization APIs";
  googleMaps: "Maps Platform with Fleet Engine for customer tracking";
  here: "HERE Tracking API with geofencing capabilities";
  
  // Hardware Integration
  odbII: "Direct vehicle diagnostic port integration";
  dashcam: "AI-powered dashcam with GPS and driver monitoring";
  mobilePrimary: "Smartphone-based tracking via crew mobile apps";
  
  // Customer Portal Integration
  embeddedMap: "Embedded map widget on customer quote/booking pages";
  smsLink: "Text message with secure tracking link";
  emailUpdate: "Automated email updates with location and ETA";
}
```

**GPS Data Storage & Privacy**:
- **Location History**: 90-day GPS coordinate storage for route analysis
- **Customer Privacy**: Tracking only active during job hours, not 24/7 monitoring
- **Data Security**: Encrypted location data with secure customer access tokens
- **Driver Privacy**: Clear policies on personal vs business use tracking
- **Compliance**: DOT regulations for commercial vehicle tracking and hours of service

#### **Unified Communication Inbox (Full-Page Expansion):**

**Purpose**: Centralized communication hub accessible from top navigation bar that expands to full-page view. Consolidates all customer and internal communications without being a separate sidebar module.

**Access Method**: 
- **Top Bar Integration**: Inbox icon in header shows latest message count and preview
- **Click to Expand**: Opens full-page overlay or dedicated page view
- **Quick Preview**: Hover/click shows recent messages without leaving current page
- **Return to Work**: Easy close/minimize to return to previous CRM module

**Unified Inbox Full-Page Features**:

**All Communication Channels Combined**:
- **SMS/Text Messages**: All customer and internal text communications
- **Email Messages**: Business email integration with customer correspondence
- **AI Voice Call Logs**: Transcripts and summaries from voice AI interactions
- **Internal Messages**: Team communications and system notifications
- **Customer Portal Messages**: Communications from website contact forms
- **Review Notifications**: New review alerts from Google, Yelp, Facebook
- **System Alerts**: CRM notifications, task reminders, and business alerts

**Message Organization & Filtering**:

*Primary View Options:*
- **All Messages**: Combined view of all communication channels
- **Customer Communications**: Only external customer-facing messages
- **Internal Messages**: Team communications and system notifications
- **Unread Only**: Filter to show only unread/new messages
- **Priority Messages**: High-priority communications requiring immediate attention
- **By Channel**: Filter by SMS, Email, Voice AI, Reviews, etc.

*Advanced Filtering:*
- **By Customer**: See all communications with specific customer
- **By Date Range**: Filter messages by time period
- **By Team Member**: Messages assigned to or from specific staff
- **By Status**: Read, unread, replied, pending response
- **By Priority**: Emergency, high, normal, low priority levels

**Message Interface & Actions**:

*Message Display:*
- **Conversation Threading**: Group related messages by customer/topic
- **Contact Context**: Customer info and job details alongside messages
- **Read/Unread Status**: Clear visual indicators for message status
- **Response Time Tracking**: Show how long since customer message received
- **Message Source**: Clear indication of communication channel (SMS, email, etc.)

*Quick Actions (Per Message):*
- **Reply Options**: Respond via same channel or choose different channel
- **Forward to Team**: Route message to appropriate team member
- **Create Task**: Generate follow-up task from message content
- **Link to Customer**: Associate message with customer record
- **Mark Priority**: Flag important messages for attention
- **Archive/Delete**: Message management and organization

**Response & Communication Tools**:

*Multi-Channel Response:*
- **Unified Reply Interface**: Respond to any message type from same interface
- **Channel Selection**: Choose to reply via SMS, email, or phone call
- **Template Responses**: Pre-written responses for common inquiries
- **Signature Integration**: Automatic signatures based on selected communication channel
- **File Attachments**: Add documents, photos, or quotes to responses

*Advanced Communication Features:*
- **Bulk Messaging**: Send messages to multiple customers simultaneously
- **Scheduled Sending**: Schedule messages to be sent at optimal times
- **Message Templates**: Library of common responses and follow-ups
- **Auto-Responders**: Automated acknowledgment messages for after-hours
- **Escalation Rules**: Automatically route urgent messages to managers

**AI-Powered Response System**:

*AI Auto-Responses (Full Automation):*
- **After-Hours Auto-Reply**: AI automatically responds to customer messages outside business hours
- **Common Question Handling**: AI provides instant answers to frequently asked questions
- **Appointment Confirmation**: AI confirms/reschedules appointments automatically via text/email
- **Quote Follow-up**: Automated follow-up sequences for customers who received quotes
- **Review Requests**: AI sends personalized review collection messages post-job completion
- **Payment Reminders**: Automated payment due notifications with personalized messaging
- **Emergency Response**: AI detects urgent keywords and provides immediate acknowledgment + escalation

*AI-Assisted Responses (Human + AI Collaboration):*
- **Smart Suggestions**: AI suggests 3-5 response options based on customer message context
- **Tone Matching**: AI adapts response style to match customer communication preferences
- **Context Integration**: AI pulls customer history, job details, and previous conversations into suggested responses
- **Grammar & Spelling**: Real-time correction and enhancement of team member responses
- **Translation Support**: AI translates customer messages and suggests responses in appropriate language
- **Sentiment Analysis**: AI detects customer mood (frustrated, happy, confused) and suggests appropriate response tone
- **Quick Facts**: AI provides relevant customer/job information while composing responses

*AI Response Configuration:*
- **Response Rules**: Set triggers for when AI should auto-respond vs suggest responses
- **Brand Voice Settings**: Configure AI personality to match company communication style
- **Escalation Triggers**: Define keywords/situations that require immediate human intervention
- **Learning Mode**: AI learns from human responses to improve future suggestions
- **A/B Testing**: Test different AI response approaches and measure customer satisfaction
- **Approval Workflows**: Route AI-generated responses through team leads before sending

*AI Performance Monitoring:*
- **Response Accuracy**: Track how often AI suggestions are used vs modified
- **Customer Satisfaction**: Monitor customer reactions to AI-generated vs human responses
- **Response Speed**: Measure improvement in team response times with AI assistance
- **Conversion Impact**: Track how AI-assisted responses affect lead conversion and customer retention

**Integration with CRM Modules**:

*Customer Record Integration:*
- **Message History**: All inbox communications sync to customer records
- **Context Switching**: Click customer name to open their full CRM record
- **Job Association**: Link messages to specific jobs and quotes
- **Activity Timeline**: Messages appear in customer interaction timeline

*Task & Follow-up Integration:*
- **Auto-Task Creation**: System suggests tasks based on message content
- **Reminder Integration**: Set follow-up reminders directly from messages
- **Calendar Integration**: Schedule appointments mentioned in messages
- **Pipeline Updates**: Messages can trigger customer status changes

**Analytics & Performance Tracking**:

*Response Metrics:*
- **Average Response Time**: Track team performance in responding to messages
- **Channel Performance**: Which communication methods get best response rates
- **Customer Satisfaction**: Ratings on communication quality and speed
- **Volume Trends**: Message volume patterns by time, day, season

*Team Performance:*
- **Individual Response Times**: Track each team member's communication speed
- **Message Load**: Distribute communication workload evenly across team
- **Customer Feedback**: Track communication-related compliments and complaints
- **Efficiency Metrics**: Messages resolved vs escalated or requiring follow-up

**Mobile & Accessibility**:
- **Mobile Responsive**: Full inbox functionality on mobile devices
- **Push Notifications**: Real-time alerts for new high-priority messages
- **Voice-to-Text**: Dictate responses using mobile voice input
- **Offline Draft**: Compose responses offline and send when connection restored

**Privacy & Compliance**:
- **Message Retention**: Automatic archiving and deletion based on retention policies
- **Data Security**: Encrypted message storage and transmission
- **Audit Trail**: Complete log of who accessed and responded to messages
- **Customer Consent**: Proper opt-in/opt-out management for communications

#### **Settings & Configuration Management:**

**Purpose**: Frontend-configurable system settings for business rules, pricing, and operational parameters. Allows non-technical users to modify CRM behavior without code changes.

**Access Control**: 
- **System Administrators**: Full access to all configuration settings
- **Management**: Business rule and pricing modifications
- **Department Heads**: Limited access to relevant departmental settings
- **Regular Users**: Personal preferences and display settings only

**Business Configuration Settings**:

**Pricing & Estimation Configuration**:
- **Base Hourly Rates**: Modify service type rates and crew size pricing tiers
- **Additional Mover Rates**: Adjust per-hour rates for extra crew members
- **Service Speed Modifiers**: Update cuft/hr/mover rates for different service types
- **Handicap Modifiers**: Adjust percentage increases for stairs, elevators, walk distance
- **Emergency Service Rates**: Configure surcharge amounts and time thresholds
- **Fuel & Mileage Rates**: Update per-mile charges and fuel surcharges
- **Specialty Item Pricing**: Modify piano, safe, and specialty handling charges

**Move Size & Crew Configuration**:
- **Cubic Feet Mapping**: Edit move size to cubic feet conversions
- **Crew Size Thresholds**: Adjust cuft ranges for crew size determination
- **Handicap Crew Thresholds**: Modify when additional crew members are added
- **Service Type Definitions**: Add, edit, or remove service offerings
- **Box Estimation Parameters**: Update per-room box counts and packing time estimates

**Business Rules & Workflow Settings**:

**Lead Management Rules**:
- **Hot Lead Duration**: Configure auto-downgrade timer (currently 5 minutes)
- **Lead Assignment Rules**: Round-robin, territory-based, or manual assignment
- **Follow-up Intervals**: Set automatic task creation timelines (24hr, 48hr, 1week)
- **Lead Scoring Parameters**: Adjust qualification criteria and point values
- **Source Attribution**: Configure lead source tracking and marketing attribution

**Job Scheduling & Dispatch Rules**:
- **Working Hours**: Set business operating hours and availability windows
- **Time Slot Intervals**: Configure scheduling increment sizes (15min, 30min, 1hr)
- **Travel Time Calculations**: Adjust buffer times between jobs
- **Crew Break Scheduling**: Set mandatory break intervals and durations
- **Overtime Thresholds**: Configure when overtime rates apply

**Financial & Payment Settings**:

**Payment Processing Configuration**:
- **Payment Terms**: Net 15, Net 30, immediate payment requirements
- **Late Fee Structure**: Automatic late fee calculation and application
- **Deposit Requirements**: Percentage or fixed deposit amounts by service type
- **Refund Policies**: Automated refund rules and approval workflows
- **Tax Configuration**: Sales tax rates by service area and exemptions

**Accounting Integration Settings**:
- **Chart of Accounts Mapping**: Connect CRM categories to QuickBooks accounts
- **Revenue Recognition Rules**: When to recognize income (booking vs completion)
- **Cost Allocation**: How to distribute overhead and indirect costs
- **Reporting Periods**: Fiscal year settings and period definitions

**System Integration Settings**:

**Third-Party API Configuration**:
- **Google Maps API**: Distance calculation settings and route optimization
- **Stripe Payment Settings**: Processing fees, settlement timing, fraud protection
- **Email/SMS Providers**: Twilio, SendBlue, Resend configuration and templates
- **Marketing Platform APIs**: Google Ads, Facebook Ads, Yelp integration settings
- **Social Media Connections**: Platform authentication and posting permissions

**Database & Performance Settings**:
- **Data Retention Policies**: How long to keep customer records and transaction data
- **Backup Scheduling**: Automated backup frequency and retention periods
- **Performance Monitoring**: System health alerts and threshold settings
- **User Session Management**: Timeout periods and concurrent login policies

**User Management & Security Settings**:

**Role-Based Access Control**:
- **Permission Templates**: Pre-configured role permissions (Admin, Manager, Sales, etc.)
- **Custom Role Creation**: Build custom roles with specific permission sets
- **Department Access**: Restrict module access by department or team
- **Data Visibility Rules**: Customer data access restrictions and territory assignments

**Security & Compliance Settings**:
- **Password Requirements**: Complexity rules, expiration periods, history restrictions
- **Two-Factor Authentication**: Mandatory 2FA for sensitive roles and operations
- **Audit Logging**: Configure what actions are logged and retention periods
- **Data Encryption**: Encryption settings for sensitive customer information
- **GDPR Compliance**: Data privacy settings and customer consent management

**Notification & Communication Settings**:

**Automated Notification Rules**:
- **Customer Communications**: Booking confirmations, arrival notifications, follow-up sequences
- **Internal Alerts**: Job assignments, schedule changes, emergency notifications
- **Email Templates**: Customizable templates for quotes, invoices, and communications
- **SMS Configuration**: Message templates and sending rules
- **Escalation Procedures**: When and how to escalate issues or overdue tasks

**Dashboard & Display Preferences**:
- **Default Views**: Set default dashboard layouts by role
- **KPI Selections**: Choose which metrics display on main dashboard
- **Color Coding**: Customize status colors and visual indicators
- **Report Scheduling**: Automated report generation and distribution
- **Mobile App Settings**: Push notification preferences and offline sync rules

**Inventory & Equipment Settings**:

**Inventory Management Rules**:
- **Reorder Points**: Set low stock thresholds for automatic ordering
- **Safety Stock Levels**: Minimum inventory levels to maintain
- **Vendor Preferences**: Default suppliers and ordering preferences
- **Equipment Check-out Rules**: How long equipment can be assigned to crews
- **Maintenance Scheduling**: Preventive maintenance intervals and reminders

**Fleet Management Configuration**:
- **Vehicle Assignment Rules**: How trucks are assigned to crews and jobs
- **Fuel Efficiency Targets**: MPG goals and performance tracking
- **Maintenance Intervals**: Service schedules based on mileage or time
- **DOT Compliance Rules**: Inspection schedules and certification tracking

**Advanced Configuration Options**:

**Custom Field Management**:
- **Customer Fields**: Add custom data fields for specific business needs
- **Job Properties**: Create custom job attributes and tracking fields
- **Lead Qualification**: Custom qualification questions and scoring
- **Reporting Fields**: Additional data points for custom reports

**Workflow Automation**:
- **Trigger Events**: Define when automated actions should occur
- **Action Rules**: What happens when triggers are activated
- **Approval Workflows**: Multi-step approval processes for pricing or scheduling
- **Integration Triggers**: When to sync data with external systems

**Regional & Localization Settings**:
- **Service Areas**: Define geographic boundaries and coverage zones
- **Time Zones**: Multi-location time zone handling
- **Currency Settings**: Regional currency and formatting preferences
- **Language Options**: Multi-language support for customer communications
- **Holiday Calendars**: Regional holidays and business closure dates

**Configuration Management Features**:
- **Change Tracking**: Log all configuration changes with user and timestamp
- **Version Control**: Ability to rollback configuration changes
- **Testing Environment**: Sandbox mode for testing configuration changes
- **Bulk Updates**: Mass update similar settings across categories
- **Export/Import**: Configuration backup and transfer capabilities

---

## **CRM MOBILE APPLICATION PLANNING**

### **Mobile CRM App Overview (`packages/crm-mobile/`)**

**Core Philosophy**: Complete feature parity with web CRM, optimized for mobile workflows and touch interaction. The mobile app provides full CRM access for managers and sales staff who need to work on-the-go.

**Target Users & Use Cases**:
- **Sales Managers**: Pipeline management, lead review, team performance monitoring (field visits, commute, home)
- **Sales Representatives**: Lead claiming, customer calls, quote follow-ups, appointment scheduling (customer visits, car)  
- **Operations Managers**: Job monitoring, crew coordination, dispatch oversight (job sites, field supervision)
- **Customer Service**: Issue resolution, review management, customer communication (remote work, field support)
- **Executives**: Business KPIs, financial dashboards, strategic oversight (travel, off-site meetings)

**Key Mobile Advantages Over Web**:
- **Location Context**: GPS awareness for nearby customers, job sites, and crew locations
- **Push Notifications**: Instant alerts for hot leads, emergency jobs, and critical updates
- **Voice Input**: Voice-to-text for notes, customer interactions, and quick data entry
- **Camera Integration**: Photo capture for job documentation, damage claims, and document scanning
- **Phone Integration**: One-tap calling with automatic call logging to CRM
- **Offline Capability**: Core functions work without internet, sync when connection restored
- **Native Performance**: Smooth touch interactions and optimized mobile UI/UX

### **Mobile-Optimized Module Design**

#### **Mobile Dashboard**:
**Optimized for Quick Glances & Touch Navigation**

*Key Metrics Cards (Swipeable):*
- **Today's Performance**: Leads claimed, calls made, quotes sent, jobs booked
- **Pipeline Overview**: Visual pipeline with touch-friendly status movement
- **My Metrics**: Personal performance vs targets with progress bars
- **Urgent Actions**: Hot leads, overdue follow-ups, emergency notifications
- **Team Status**: Crew locations, job progress, immediate issues requiring attention

*Mobile Dashboard Features:*
- **Widget Customization**: Drag-and-drop dashboard widgets for personalized views
- **Voice Commands**: "Show me today's hot leads" or "Call my next follow-up"
- **Quick Actions Bar**: One-tap access to create lead, add task, make call, send text
- **Notification Center**: All alerts and updates accessible with swipe-down gesture
- **Offline Indicators**: Clear visual indicators when app is working offline

#### **Mobile Pipeline Management**:
**Touch-Optimized Visual Pipeline**

*Mobile Pipeline Interface:*
- **Horizontal Scrolling**: Swipe through pipeline stages (Hot Lead → Lead → Opportunity → Booked → etc.)
- **Card-Based View**: Customer cards optimized for thumb navigation and one-handed use
- **Drag-and-Drop**: Intuitive touch gestures to move customers between pipeline stages
- **Quick Actions**: Swipe gestures on customer cards for call, text, email, view details
- **Status Badges**: Color-coded priority indicators and urgency flags clearly visible

*Mobile-Specific Pipeline Features:*
- **Voice Search**: "Show me John Smith" or "Find customers with quotes over $2000"
- **Location Filtering**: "Show customers near my current location" for efficient route planning
- **Quick Dial**: Tap phone number to call immediately with automatic CRM call logging
- **Voice Notes**: Record voice memos attached to customer records during/after calls
- **Photo Attachment**: Add photos to customer records (damage documentation, estimates)

#### **Mobile Leads Management**:
**Optimized for Fast Lead Response**

*Unclaimed Leads (Mobile Priority):*
- **Push Notification**: Instant alerts for new hot leads with customer details preview
- **One-Tap Claiming**: Claim leads immediately from notification or leads list
- **Quick Call**: Auto-dial customer phone number directly from lead card
- **Voice-to-Text Notes**: Record lead qualification notes during call using voice input
- **GPS Context**: See lead location relative to current position for scheduling efficiency

*My Leads Mobile Workflow:*
- **Call Queue**: Prioritized list of leads to call with estimated contact times
- **Swipe Actions**: Swipe left for "Call", swipe right for "Text", long press for "Details"
- **Call Integration**: Native phone app integration with automatic call duration and outcome logging
- **Follow-up Scheduling**: Quick calendar integration for callback appointments
- **Lead Status Updates**: One-tap status changes with optional voice notes

#### **Mobile Customer Management**:
**Touch-Friendly Customer Interaction**

*Customer Cards Optimized for Mobile:*
- **Essential Info First**: Name, phone, quote amount, status prominently displayed
- **Expandable Details**: Tap to reveal full customer information and interaction history
- **Communication Hub**: Quick access to call, text, email with conversation history
- **Job Timeline**: Visual timeline of customer journey with key milestones
- **Photo Gallery**: Customer photos, job site images, damage documentation

*Mobile Customer Actions:*
- **One-Tap Communication**: Call, text, or email customer with single touch
- **Voice Memos**: Record follow-up notes during or after customer interactions
- **Photo Documentation**: Camera integration for adding images to customer records
- **GPS Navigation**: Get directions to customer address with preferred navigation app
- **Quick Quote Updates**: Simple interface for re-rating and price adjustments

#### **Mobile Communication Inbox**:
**Unified Mobile Messaging Experience**

*Mobile Inbox Interface:*
- **Conversation View**: WhatsApp-style conversation threading for customer communications
- **Channel Indicators**: Visual badges showing SMS, email, social media, voice AI source
- **Swipe Gestures**: Swipe to archive, mark important, or create follow-up task
- **Voice Replies**: Voice-to-text for quick responses during travel or hands-free situations
- **Smart Suggestions**: AI-powered response suggestions optimized for mobile quick-replies

*Mobile Communication Features:*
- **Push Notifications**: Instant alerts for customer messages with response previews
- **Offline Drafts**: Compose responses offline, send automatically when connection restored
- **Quick Responses**: One-tap replies for common responses ("Thanks, I'll call you back")
- **Photo Sharing**: Send photos directly from camera or photo library
- **Location Sharing**: Share current location with customers for arrival updates

#### **Mobile Calendar & Scheduling**:
**Touch-Optimized Calendar Management**

*Mobile Calendar Views:*
- **Day View**: Hour-by-hour schedule with job details and customer contact info
- **Week View**: Swipeable week overview with color-coded appointments and jobs
- **Agenda View**: List format optimized for mobile scrolling with key details
- **Map View**: Calendar appointments plotted on map for efficient route planning
- **Crew Schedule**: See crew assignments and availability on mobile dashboard

*Mobile Scheduling Features:*
- **Quick Add**: Voice input for creating appointments ("Schedule estimate with John tomorrow at 2 PM")
- **Travel Time**: GPS-based travel time calculation between appointments
- **Traffic Integration**: Real-time traffic alerts and route optimization suggestions
- **Appointment Reminders**: Push notifications with customer contact info before appointments
- **One-Tap Actions**: Call customer, get directions, or reschedule directly from calendar

#### **Mobile Task Management**:
**Thumb-Friendly Task Organization**

*Mobile Task Interface:*
- **Today's Tasks**: Prioritized list of tasks due today with completion checkboxes
- **Swipe Actions**: Swipe to complete, postpone, or delegate tasks
- **Voice Task Creation**: "Remind me to follow up with Sarah tomorrow at 10 AM"
- **Photo Tasks**: Attach photos to tasks for visual reference (damage claims, inventory needs)
- **Location-Based Tasks**: Tasks automatically sorted by proximity to current location

*Mobile Task Features:*
- **Quick Complete**: One-tap task completion with optional voice note
- **Smart Reminders**: Location-based reminders when near customer addresses
- **Voice Notes**: Record task completion details hands-free
- **Photo Documentation**: Add before/after photos for completed tasks
- **Integration**: Tasks created from calls, messages, or calendar events automatically

#### **Mobile Fleet & GPS Tracking**:
**Real-Time Fleet Management on Mobile**

*Mobile Fleet Dashboard:*
- **Live Map View**: Real-time truck locations with driver info and job status
- **Truck Details**: Tap truck icon for fuel level, diagnostics, and driver contact
- **Geofence Alerts**: Push notifications when trucks arrive/depart job sites
- **Route Monitoring**: Compare planned vs actual routes with traffic conditions
- **Emergency Locations**: Instant access to all truck locations for roadside assistance

*Mobile Fleet Features:*
- **Driver Communication**: Direct calling/texting to drivers from fleet map
- **Customer Sharing**: Share truck location with customers via SMS with tracking link
- **Photo Reports**: Drivers can submit photos directly from trucks (damage, completion)
- **Fuel Tracking**: Manual fuel entry with photo receipt capture
- **Maintenance Alerts**: Push notifications for scheduled maintenance and inspections

### **Mobile-Specific Features & Capabilities**

#### **Native Mobile Integration**:

**Phone & Contacts Integration**:
- **CRM Native Dialer**: All business calls made through CRM mobile app (not native phone app)
- **Automatic Call Logging**: Every call automatically recorded and associated with customer record
- **Call History Sync**: Complete call history with recordings accessible across all devices
- **Conference Calling**: Multi-party calls with customers and team members
- **Voicemail Integration**: Voicemail transcriptions automatically attached to customer records

**AI Call Coaching on Mobile**:
- **Real-Time Call Assistance**: AI coaching dashboard available during mobile calls
- **Live Transcription**: Real-time speech-to-text overlay during customer calls
- **Smart Suggestions**: AI provides response suggestions directly on mobile screen
- **Customer Context**: Full customer history and notes displayed during call
- **Objection Handling**: AI detects objections and provides counter-response templates
- **Closing Prompts**: AI suggests optimal moments to ask for booking confirmation
- **Post-Call Summary**: AI generates call summary and suggested follow-up actions
- **Performance Feedback**: Real-time coaching feedback to improve call effectiveness

**Camera & Photo Management**:
- **Document Scanning**: Use camera to scan contracts, permits, receipts with OCR text extraction
- **Before/After Photos**: Job site documentation with automatic customer record attachment
- **Damage Claims**: Photo evidence capture with GPS location and timestamp metadata
- **Business Card Scanning**: Scan business cards to create new customer records

**GPS & Location Services**:
- **Automatic Mileage Tracking**: Log business travel miles for expense reporting
- **Proximity Alerts**: Notifications when near customer locations or job sites  
- **Territory Management**: Visual territory boundaries with customer density mapping
- **Route Optimization**: Multi-stop route planning for sales visits and follow-ups

**Push Notifications & Alerts**:
- **Hot Lead Alerts**: Instant notifications for new leads requiring immediate attention
- **Customer Responses**: Real-time alerts when customers reply to quotes or messages
- **Job Status Updates**: Crew check-ins, job completions, and emergency situations
- **Performance Milestones**: Daily/weekly goal achievements and team performance updates

#### **Offline Capability & Data Sync**:

**Offline-First Design**:
- **Core Data Cache**: Customer records, pipeline, tasks, and calendar cached for offline access
- **Offline Actions**: Create leads, update statuses, add notes, schedule tasks without internet
- **Smart Sync**: Automatic background sync when connection restored with conflict resolution
- **Data Priority**: Critical customer information syncs first, followed by analytics and reports

**Battery & Performance Optimization**:
- **Background App Refresh**: Intelligent sync scheduling to preserve battery life
- **Selective Sync**: Choose which data types to sync on cellular vs WiFi connections
- **Image Compression**: Automatic photo compression for faster upload and reduced data usage
- **Cache Management**: Automatic cleanup of old cached data to preserve device storage

#### **Mobile Security & Access Control**:

**Device Security**:
- **Biometric Authentication**: Face ID, Touch ID, or Android biometric login options
- **Remote Wipe**: Administrative ability to remotely clear CRM data from lost/stolen devices
- **App Locking**: Automatic app lock after inactivity with PIN/biometric unlock
- **Screenshot Prevention**: Disable screenshots for sensitive customer financial information

**Data Protection**:
- **Encrypted Storage**: All cached CRM data encrypted using device-level security
- **VPN Support**: Corporate VPN integration for secure data transmission
- **Certificate Pinning**: Enhanced security for API communications with CRM backend
- **Audit Logging**: Complete log of mobile access, actions, and data modifications

### **Mobile User Experience Design**

#### **Navigation & Interface**:

**Mobile-First UI Patterns**:
- **Bottom Tab Navigation**: Primary CRM modules accessible via bottom tab bar
- **Gesture Navigation**: Swipe gestures for common actions (call, text, complete, archive)
- **Pull-to-Refresh**: Standard mobile pattern for refreshing data and syncing updates
- **Infinite Scroll**: Smooth scrolling through customer lists, pipeline, and communication history
- **Modal Workflows**: Full-screen modals for complex tasks like quote generation and customer details

**Responsive Design Elements**:
- **Thumb-Friendly Targets**: All touch targets optimized for one-handed mobile operation
- **Progressive Disclosure**: Show essential information first, reveal details on demand
- **Context-Sensitive Actions**: Different action buttons based on customer status and location
- **Dark Mode Support**: System-level dark mode with OLED optimization for battery savings
- **Accessibility**: Full VoiceOver/TalkBack support with semantic markup and voice control

#### **Performance & User Experience**:

**App Performance Optimization**:
- **Native Rendering**: Expo/React Native with native modules for smooth performance
- **Image Optimization**: Lazy loading, WebP format, and automatic sizing for mobile screens
- **Network Efficiency**: GraphQL queries optimized for mobile bandwidth and battery life
- **Background Processing**: Smart background tasks for data sync and push notification preparation

**User Experience Enhancements**:
- **Haptic Feedback**: Tactile feedback for important actions (lead claimed, task completed)
- **Voice Control**: Siri/Google Assistant integration for hands-free CRM operations
- **Widget Support**: iOS/Android home screen widgets for quick CRM status overview
- **Shortcuts**: Customizable quick actions accessible from home screen and search

### **Mobile Testing & Quality Assurance**

**Device & Platform Testing**:
- **Multi-Device Testing**: iPhone SE to iPhone Pro Max, Android phones and tablets
- **OS Version Support**: iOS 14+ and Android 8+, with testing on latest and previous versions
- **Network Condition Testing**: Performance testing on 3G, 4G, 5G, and WiFi connections
- **Battery Impact Testing**: Monitor battery drain and optimize background processes

**User Acceptance Testing**:
- **Field Testing**: Real-world testing with sales reps and managers in typical work environments
- **Usability Testing**: One-handed operation, driving safety, and accessibility compliance
- **Performance Benchmarking**: App launch time, data sync speed, and response time metrics
- **Feedback Integration**: Built-in feedback system for continuous mobile experience improvement

This comprehensive mobile CRM provides complete feature parity with the web application while taking full advantage of mobile device capabilities and optimizing for on-the-go workflows.

---

## **CREW MOBILE APPLICATION PLANNING**

### **Crew Mobile App Overview (`packages/crew-mobile/`)**

**Core Philosophy**: Specialized field operations app designed specifically for moving crews and drivers. Focused on job execution, customer interaction, and real-time job management from pickup to delivery completion.

**Target Users & Role-Based Access**:
- **Crew Leaders/Foremen**: Full job management, payment collection, customer signatures, job modifications
- **Experienced Movers**: Job viewing, photo documentation, customer communication, equipment check-out
- **New/Junior Movers**: Job viewing only, basic documentation, no payment or contract access
- **Drivers**: Vehicle management, route optimization, fuel tracking, mileage logging

### **Core Crew Mobile Features**

#### **Job Management Dashboard**:
**Role-Based Job Access & Visibility**

*Job Overview Interface:*
- **Today's Jobs**: Current assignments with time, location, and crew member details
- **Upcoming Jobs**: Future scheduled jobs with preparation requirements
- **Past Jobs**: Completed job history with photos, signatures, and notes
- **Job Status Pipeline**: Visual progress tracking (Assigned → En Route → Loading → In Transit → Unloading → Complete)
- **Crew Assignment Display**: "Working with: Mike (Lead), Sarah (Mover), John (Driver)"

*Job Details View:*
- **Customer Information**: Name, phone, addresses (pickup/delivery), special instructions
- **Job Type & Service**: Local, long-distance, packing, white glove, specialty items
- **Equipment Required**: Dollies, straps, piano boards, safe equipment, blankets
- **Inventory List**: Pre-loaded items to move with quantities and special handling notes
- **Time Estimates**: Scheduled start time, estimated duration, expected completion
- **Crew Requirements**: Number of movers needed, specializations required

#### **Navigation & Route Management**:
**Integrated Mapping & GPS Features**

*Smart Navigation Integration:*
- **One-Tap Navigation**: Tap address to open in Google Maps or Apple Maps instantly
- **Route Optimization**: Multiple stops optimized for efficiency (pickup → storage → delivery)
- **Real-Time Traffic**: Live traffic updates and alternative route suggestions
- **Arrival Notifications**: Automatic customer notifications when crew is 15-30 minutes away
- **Location Sharing**: Send live GPS location and ETA to customers via SMS

*Mileage & Vehicle Tracking:*
- **Automatic Mileage Logging**: GPS-based trip tracking for payroll and expense reporting
- **Fuel Tracking**: Photo-based receipt capture with odometer readings
- **Vehicle Pre-Trip Inspection**: Digital checklist with photo documentation
- **Maintenance Alerts**: Reminders for scheduled vehicle service and inspections

#### **Customer Communication & Updates**:
**Automated Customer Notification System**

*Job Progress Communications:*
1. **Crew Assigned**: "Your crew has been assigned: Mike (Lead), Sarah, John. Contact: (555) 123-4456"
2. **En Route**: "Your crew is on the way! Track their location: [GPS Link] ETA: 2:30 PM"
3. **Arrival**: "We've arrived at your location and are setting up equipment"
4. **Loading Started**: "We've begun loading your items. Estimated loading time: 2 hours"
5. **Loading Complete**: "Loading finished! En route to delivery location. ETA: 4:30 PM"
6. **Delivery Arrival**: "We've arrived at your delivery location"
7. **Unloading Started**: "Unloading your items now. Estimated completion: 1 hour"
8. **Job Complete**: "Move completed! Please review and sign completion documents"

*Communication Features:*
- **One-Tap Messaging**: Pre-written templates for common updates
- **Custom Messages**: Voice-to-text for personalized customer communication
- **Photo Sharing**: Send progress photos to customers during move
- **Emergency Contact**: Direct line to dispatch for issues or changes

#### **Job Execution Workflow**:
**Step-by-Step Job Management**

*Pre-Move Setup (Crew Lead Only):*
- **Job Acceptance**: Accept or decline job assignments with reason codes
- **Equipment Check-Out**: Scan QR codes to check out required equipment
- **Vehicle Assignment**: Confirm truck assignment and complete pre-trip inspection
- **Crew Briefing**: Review job details, special requirements, and safety considerations

*Pickup Phase:*
- **Customer Meet & Greet**: Digital customer information and special instructions
- **Walkthrough Documentation**: Photos of items, existing damage, access challenges
- **Inventory Verification**: Confirm items match pre-move inventory with photos
- **Contract Signing**: Customer signs Bill of Lading (BOL) on mobile device
- **Loading Documentation**: Before/during/after loading photos with timestamps

*Transit Phase:*
- **Route Tracking**: GPS monitoring with real-time location sharing
- **Inventory Security**: Photo documentation of secured load
- **Stop Management**: Add fuel stops, meal breaks, overnight stays (long-distance)
- **Issue Reporting**: Report vehicle problems, traffic delays, or route changes

*Delivery Phase:*
- **Delivery Confirmation**: Verify correct delivery address and customer contact
- **Unloading Documentation**: Photo documentation of items being unloaded
- **Inventory Check**: Customer verification of items received in good condition
- **Damage Reporting**: Document any issues discovered during unloading
- **Final Walkthrough**: Customer signs completion documents and BOL

#### **Payment & Contract Management**:
**Role-Based Financial Operations (Crew Leads Only)**

*Payment Collection:*
- **Final Invoice Display**: Show customer final charges with breakdown
- **Payment Methods**: Credit card processing, cash, check acceptance
- **Tip Processing**: Separate tip collection and distribution tracking
- **Receipt Generation**: Automatic receipt generation and customer email/SMS delivery
- **Payment Confirmation**: Real-time payment verification and CRM sync

#### **Time Clock & Incident Reporting System**:
**Accurate Time Tracking & Documentation**

*Time Clock Management:*
- **Clock In/Out**: GPS-verified time tracking for accurate payroll
- **Break Tracking**: Automatic break time logging with location verification
- **Lunch Break Timer**: Required break periods tracked and logged
- **Overtime Monitoring**: Track hours worked beyond standard shift limits
- **Late Arrivals**: Document tardiness with GPS timestamp (no pay deduction)
- **Early Departures**: Log early clock-outs with reason codes

*Incident Documentation & Reporting:*
- **Equipment Damage**: Photo documentation of damaged equipment with crew member involved
- **Lost Equipment**: Report missing equipment with last known user and location
- **Safety Incidents**: Document safety violations or accidents with photos and details
- **Customer Issues**: Log customer complaints or service problems for management review
- **Vehicle Problems**: Report vehicle damage, accidents, or maintenance issues
- **Job Quality Issues**: Document workmanship problems or unprofessional behavior

*Time Adjustment Features:*
- **Break Time Deductions**: Automatically subtract break time from total work hours
- **Unauthorized Time**: Flag time periods when crew member was not on-site or working
- **Manual Time Adjustments**: Crew leads can adjust time for legitimate reasons (bathroom, equipment setup)
- **Overtime Calculations**: Automatic overtime hour calculations based on daily/weekly limits
- **Job-Specific Time**: Track time spent on specific jobs vs travel/setup time

*Reporting & Documentation:*
- **Incident Reports**: Crew leads create incident reports with photos, GPS location, and details
- **Management Notifications**: Automatic alerts to management for serious incidents
- **Employee Acknowledgment**: Crew members acknowledge incidents and time adjustments
- **Payroll Integration**: Accurate time data automatically syncs to payroll system
- **Performance Records**: All incidents and time issues maintained in employee records

*Time Clock Categories:*
```typescript
// Time tracking and adjustment system
interface CrewTimeTracking {
  clockEvents: {
    clockIn: "GPS-verified start time";
    clockOut: "GPS-verified end time";
    breakStart: "Break period begins";
    breakEnd: "Break period ends";
    lunchStart: "Lunch break begins";
    lunchEnd: "Lunch break ends";
  };
  
  timeAdjustments: {
    unauthorizedBreak: "Time deducted from total hours";
    excessiveLunch: "Time beyond allowed lunch period";
    offSiteTime: "Time away from job site without authorization";
    setupTime: "Equipment setup and preparation time";
    cleanupTime: "Job cleanup and equipment return time";
  };
  
  incidentTypes: {
    equipmentDamage: "Photo documentation required";
    customerComplaint: "Details and resolution needed";
    safetyViolation: "Immediate management notification";
    vehicleIssue: "Location and damage photos required";
    jobQualityIssue: "Description and corrective action taken";
  };
}
```

*Time Management Workflow:*
1. **Clock In**: GPS-verified arrival at job site or company location
2. **Work Period**: Active work time with location tracking
3. **Break Periods**: Timed breaks with automatic deduction from work hours
4. **Incident Documentation**: Real-time reporting of any issues or problems
5. **Clock Out**: GPS-verified departure with total hours calculated
6. **Management Review**: Daily review of time records and incident reports
7. **Payroll Processing**: Accurate time data sent to payroll system

*Management Oversight Features:*
- **Real-Time Monitoring**: Live view of crew time status and locations
- **Daily Time Reports**: Summary of each crew member's hours and incidents
- **Pattern Analysis**: Identify recurring issues or performance problems
- **Coaching Opportunities**: Use incident data for employee training and improvement
- **Compliance Tracking**: Ensure adherence to labor laws and company policies

*Digital Signatures & Contracts:*
- **Bill of Lading (BOL)**: Digital signing at pickup and delivery
- **Service Agreement**: Customer signature on terms and conditions
- **Damage Claims**: Customer acknowledgment of any issues or damage
- **Completion Certificate**: Final job completion signature and satisfaction rating
- **Contract Delivery**: Automatic email/SMS of signed documents to customer

#### **Inventory & Equipment Management**:
**Real-Time Asset Tracking**

*Equipment Check-Out System:*
- **QR Code Scanning**: Scan equipment QR codes for check-out/check-in
- **Equipment Status**: Available, checked out, in use, needs maintenance
- **Damage Reporting**: Photo documentation of equipment damage with GPS location
- **Maintenance Requests**: Submit equipment repair requests with photos and descriptions
- **Inventory Alerts**: Low stock notifications for supplies (blankets, straps, boxes)

*Job Supplies Management:*
- **Supply Usage Tracking**: Log materials used per job (boxes, tape, bubble wrap)
- **Additional Supply Requests**: Request additional materials during job
- **Supply Photography**: Document supply usage with before/after photos
- **Cost Tracking**: Automatic supply cost allocation to customer jobs

#### **Photo Documentation System**:
**Comprehensive Visual Job Documentation**

*Required Photo Categories:*
- **Pre-Move**: Items to be moved, existing damage, access points
- **Loading Process**: Items being loaded, truck organization, protective wrapping
- **Transit**: Secured load, any stops or issues during transport
- **Delivery Process**: Items being unloaded, placement, customer verification
- **Post-Move**: Completed delivery setup, customer satisfaction
- **Damage/Issues**: Any problems discovered with GPS location and timestamp

*Photo Management Features:*
- **Automatic Organization**: Photos automatically tagged by job phase and category
- **GPS & Timestamp**: All photos include location data and accurate timestamps
- **Customer Sharing**: Selected photos can be shared with customers in real-time
- **CRM Integration**: All photos automatically sync to customer records
- **Storage Optimization**: Automatic photo compression and cloud backup

#### **Notes & Communication Log**:
**Comprehensive Job Documentation**

*Note-Taking Features:*
- **Voice-to-Text**: Hands-free note recording during job execution
- **Pre-Written Templates**: Common notes for typical situations and issues
- **Customer Conversations**: Log important customer requests or concerns
- **Internal Crew Notes**: Communication between crew members and dispatch
- **Issue Documentation**: Detailed problem reporting with photos and solutions

*Communication History:*
- **Customer Messages**: Complete SMS/call history with customer
- **Dispatch Communication**: Messages with operations team and management
- **Crew Coordination**: Internal crew member communication and coordination
- **Vendor Contacts**: Communication with storage facilities, suppliers, partners

### **Role-Based Access Control**

#### **Crew Leader/Foreman Permissions**:
**Full Job Management Authority**
- ✅ **Complete Job Control**: Start, pause, modify, and complete jobs
- ✅ **Payment Processing**: Collect payments, process tips, handle refunds
- ✅ **Contract Management**: Customer signatures, BOL, damage claims
- ✅ **Crew Coordination**: Assign tasks, manage team, communicate with dispatch
- ✅ **Supply Management**: Order additional supplies, report equipment issues
- ✅ **Job Modifications**: Add charges, stops, services during job execution
- ✅ **Customer Problem Resolution**: Handle complaints, negotiate solutions

#### **Experienced Mover Permissions**:
**Operational Support Role**
- ✅ **Job Viewing**: See all job details, customer info, requirements
- ✅ **Photo Documentation**: Take and upload photos throughout job
- ✅ **Equipment Check-Out**: Scan and manage equipment usage
- ✅ **Customer Communication**: Send updates, share photos, answer questions
- ✅ **Inventory Tracking**: Log items moved, supplies used, damage found
- ❌ **Payment Processing**: Cannot collect payments or handle contracts
- ❌ **Job Control**: Cannot start/stop jobs or make modifications

#### **New/Junior Mover Permissions**:
**Limited Observation & Learning Role**
- ✅ **Job Viewing**: See basic job information and crew assignments
- ✅ **Basic Documentation**: Take photos under supervision
- ✅ **Equipment Viewing**: See required equipment but cannot check out
- ❌ **Customer Communication**: Cannot directly contact customers
- ❌ **Payment/Contracts**: No access to financial or legal functions
- ❌ **Job Control**: Cannot make any job modifications or decisions

#### **Driver Permissions**:
**Vehicle & Route Management Focus**
- ✅ **Vehicle Management**: Pre-trip inspection, fuel tracking, maintenance
- ✅ **Route Optimization**: Navigation, traffic updates, delivery coordination
- ✅ **Mileage Tracking**: GPS logging, expense reporting, fuel receipts
- ✅ **Loading Coordination**: Organize truck loading for safety and efficiency
- ✅ **Customer Location Updates**: Share GPS tracking and arrival times
- ❌ **Payment Processing**: Cannot handle financial transactions
- ❌ **Contract Signing**: Cannot manage customer signatures or BOL

### **Mobile-Specific Features**

#### **Push Notifications & Alerts**:
**Real-Time Job & System Updates**
- **New Job Assignments**: Instant notification when assigned to new jobs
- **Schedule Changes**: Alerts for job time changes, cancellations, or additions
- **Emergency Alerts**: Urgent messages from dispatch or customer issues
- **Weather Warnings**: Severe weather alerts affecting job safety
- **Equipment Recalls**: Immediate notification of equipment safety issues
- **Payment Confirmations**: Success/failure notifications for payment processing

#### **Offline Capability**:
**Field-Ready Offline Operations**
- **Job Data Cache**: All assigned job information available offline
- **Photo Storage**: Images saved locally until internet connection restored
- **Note Recording**: Voice notes and text saved offline with auto-sync
- **Signature Capture**: Digital signatures stored locally until sync
- **GPS Tracking**: Location data cached for mileage and route reconstruction

#### **Battery & Performance Optimization**:
**All-Day Field Usage**
- **Power Management**: Optimized GPS usage to preserve battery life
- **Background Processing**: Intelligent sync scheduling for minimal battery drain
- **Photo Compression**: Automatic image optimization for storage and upload
- **Network Efficiency**: Smart data usage on cellular connections

### **Integration Points**

#### **CRM System Integration**:
**Real-Time Business System Sync**
- **Job Status Updates**: Automatic CRM updates as jobs progress through stages
- **Customer Communication Log**: All messages and calls logged to customer records
- **Photo Documentation**: All job photos automatically attached to customer files
- **Payment Processing**: Payment confirmations sync to accounting and invoicing
- **Time Tracking**: Crew hours automatically logged for payroll processing

#### **Dispatch Coordination**:
**Live Operations Communication**
- **Real-Time Location**: Crew locations visible on dispatch dashboard
- **Job Progress**: Live updates on loading, transit, and delivery progress
- **Issue Escalation**: One-tap escalation to dispatch for problems
- **Resource Requests**: Request additional crew, equipment, or supplies
- **Emergency Communication**: Direct line to operations for urgent situations

#### **Fleet Management Integration**:
**Vehicle & Equipment Coordination**
- **Vehicle Diagnostics**: Integration with truck GPS and diagnostic systems
- **Fuel Efficiency**: Automatic MPG calculation and efficiency reporting
- **Maintenance Scheduling**: Usage-based maintenance alerts and scheduling
- **Equipment Tracking**: Real-time equipment location and usage monitoring

### **User Experience Design**

#### **Field-Optimized Interface**:
**Designed for Work Environment Usage**
- **Large Touch Targets**: Optimized for gloved hands and outdoor use
- **High Contrast Display**: Readable in bright sunlight and various lighting
- **One-Handed Operation**: Critical functions accessible with thumb navigation
- **Voice Control**: Hands-free operation during loading and moving activities
- **Weather Resistance**: Interface designed for use in various weather conditions

#### **Workflow Efficiency**:
**Streamlined Job Execution**
- **Step-by-Step Guidance**: Clear workflow progression with visual indicators
- **Quick Actions**: Common tasks accessible with minimal taps
- **Smart Defaults**: Pre-populated information based on job type and history
- **Error Prevention**: Built-in validation to prevent common mistakes
- **Undo Functionality**: Ability to correct mistakes without starting over

This comprehensive Crew Mobile App provides specialized functionality for field operations while maintaining seamless integration with the broader CRM ecosystem. The role-based access ensures appropriate permissions while the mobile-optimized design enables efficient job execution from pickup to completion.

---

## **MARKETING WEBSITE PLANNING**

### **Marketing Website Overview (`packages/website/`)**

**Core Philosophy**: Customer-facing marketing website with integrated quote system, customer portal, and lead generation. Serves as the primary customer acquisition channel while providing self-service capabilities for existing customers.

**Primary Goals**:
- **Lead Generation**: Convert website visitors into qualified leads in CRM
- **Service Education**: Comprehensive information about all moving services offered
- **Trust Building**: Reviews, testimonials, team information, and company credibility
- **Customer Self-Service**: Quote tracking, GPS tracking, payments, and support
- **SEO Optimization**: Rank for local moving keywords and service-specific searches
- **Conversion Optimization**: Streamlined quote process with multiple entry points

### **Complete Sitemap & Information Architecture**

#### **Global Navigation Structure**
**Mega-menu on desktop, accordion on mobile with strategic CTAs throughout**

**About Us**
- **Our Story** - Company history, mission, values, and founding story
- **Why Us** - Competitive advantages, guarantees, and unique value propositions  
- **Reviews** - Customer testimonials, Google reviews, before/after photos
- **Our Team** - Meet the crew leaders, office staff, and company leadership
- **FAQ** - Common questions about moving process, pricing, and policies

**Moving Services** *(Primary SEO category with individual landing pages)*
- **Local Movers** - Same-city moves, hourly rates, crew size options
- **Residential Movers** - Home moving services, family-focused approach
- **Commercial Movers** - Business relocations, office furniture, minimal downtime
- **Office Movers** - Corporate moves, IT equipment, cubicle systems
- **Medical / Dental Movers** - Specialized medical equipment, HIPAA compliance
- **Long Distance Movers** - Interstate moves, cross-country relocations
- **Moving Labor** - Labor-only services, customer provides truck
- **Staging Services** - Home staging for real estate, furniture arrangement
- **PODs Movers** - Loading/unloading portable storage containers
- **Full Service Movers** - Complete moving solution, packing to unpacking
- **White Glove Movers** - Premium service, extra care, high-value items
- **Gun Safe Movers** - Specialized safe moving, security equipment
- **Bulky Item Movers** - Large furniture, appliances, exercise equipment
- **Piano Movers** - Piano specialists, proper equipment and training
- **Hot Tub Movers** - Spa relocation, plumbing disconnection/reconnection
- **Senior Movers** - Elderly-focused service, downsizing assistance
- **Apartment Movers** - Multi-story moves, elevator reserves, tight spaces
- **Condo Movers** - High-rise moves, building regulations compliance
- **Same Day Movers** - Emergency moves, last-minute relocations
- **Junk Removal** - Unwanted item disposal, donation coordination
- **Donation Dropoff** - Charitable donation delivery service
- **Overnight / Longterm Storage** - Temporary storage solutions
- **Appliance Services** - Installation, removal, recycling of appliances
- **Antique / Heirloom Movers** - Valuable item specialists, custom crating
- **Estate Movers** - Estate sale coordination, family heirloom handling

**Packing Services**
- **Packing & Unpacking** - Professional packing service, room-by-room unpacking
- **Moving Supplies** - Boxes, tape, bubble wrap, specialty packing materials
- **Crating** - Custom wooden crates for artwork, antiques, fragile items

**Service Areas** *(Local SEO landing pages)*
- **Edmond** - Local moving services, neighborhood-specific information
- **Norman** - University of Oklahoma area, student moving specialists
- **Moore** - Post-tornado rebuilding moves, community involvement
- **Oklahoma City** - Metro area moves, downtown high-rise expertise
- **Guthrie** - Historic home moves, antique handling specialists
- **Midwest City** - Military family moves, Tinker AFB relocations
- **Del City** - Affordable local moves, senior-friendly services
- **Mustang** - Suburban family moves, school district transitions
- **Yukon** - Growing community moves, new construction homes
- **(+ expandable for future cities and neighborhoods)**

**Contact Us**
- **Get a Quote** - Primary CTA leading to quote flow with Yembo AI integration
- **Submit a Claim** - Damage claim form, photo upload, insurance process
- **Join the Team (Careers)** - Job applications, crew member recruitment

**Optional: Blog** *(SEO long-tail keyword capture)*
- Moving tips and guides
- Local area information
- Company news and updates
- Customer success stories

### **Customer-Facing Features & Integration**

#### **Quote System Integration**:
**Seamless CRM Pipeline Entry**

*Multi-Channel Quote Entry Points:*
- **Homepage Hero CTA** - Primary quote button above the fold
- **Service Page CTAs** - Service-specific quote forms with pre-populated service type
- **Floating Quote Button** - Persistent quote access on all pages
- **Exit-Intent Popup** - Last chance quote capture before visitor leaves
- **Phone Click-to-Call** - One-tap calling that creates lead in CRM
- **Chat Widget** - AI-powered chat leading to quote form completion

*Yembo AI Visual Survey Integration:*
- **Photo-Based Estimates** - Customers upload room photos for instant quotes
- **AI Item Recognition** - Automatic inventory generation from photos
- **Pricing Calculator** - Real-time quote generation based on AI analysis
- **Accuracy Guarantees** - AI-generated quotes backed by company guarantee
- **Schedule Integration** - Available dates shown during quote process

### **Complete Quote Form Process (EXACT IMPLEMENTATION REQUIRED)**

**CRITICAL**: This form flow must be implemented exactly as specified - no freestyle modifications allowed.

**Flow Structure**: Service Type > Move Type > Move Size > Moving From > Moving To > Additional Services > Loader > Email > Name > Phone

#### **Step 1: Service Type Selection**
- **Moving**
- **Full Service**
- **Moving Labor**
- **White Glove**
- **Commercial**
- **Junk Removal**

#### **Step 2: Move Type & Property Type (Conditional Logic)**

**If Commercial Selected:**
- Property Type: Office | Retail | Warehouse | Medical
- Move Size: Small Space | Medium Space | Large Space | Few Items

**If Moving, Full Service, or White Glove Selected:**
*(All three service types follow the same flow)*
- Property Type: Apartment-Condo | House | Townhouse | Storage
  - **Apartment-Condo** → Move Size: Studio | 1-2 Bed | 3-4 Bed | Few Items
  - **House-Townhouse** → Move Size: 1-2 Bed | 3-4 Bed | 5 Bed+ | Few Items
    - **Additional Checkboxes**: Office, Patio, Garage, Shed
  - **Storage** → Unit Size: 5×5 | 5×10 | 10×10 | 10×15 | 10×20 | Few Items

**If Moving Labor Selected:**
- Property Type: Apartment-Condo | House | Townhouse | Storage
- Labor Type: Load-Only | Unload-Only | Both | Restaging / In-Home
- *(Then follow same size path as Moving, Full Service, White Glove)*

**If Junk Removal Selected:**
- Property Type: House | Apartment | Storage | Commercial
- Junk Volume: Single Item | ¼ Truck | ½ Truck | ¾ Truck | Full Truck | 2+ Trucks

#### **Step 3: Location Details**
*(All services except single-location jobs)*

**Moving FROM Address:**
- Google autocomplete address field
- Stairs/Elevator options
- Walk Distance selection

**Moving TO Address:**
- Google autocomplete address field  
- Stairs/Elevator options
- Walk Distance selection

**Additional Locations:**
- "Add more address slides" functionality
- **Single Address Only**: If job type is Load-Only, Unload-Only, Restaging, or Junk-Removal

#### **Step 4: Additional Info (Multi-Select)**
- Piano
- Gun Safe
- Bulky Item (Hot Tub, Exercise Machine, Play Set, etc.)
- Antique / Artwork (>$2k)
- Packing Needed?
- Need Help Within 24 hrs?
- Storage Needed?

#### **Step 5: Conditional Questions (Based on Step 4 Selections)**
- **If Packing** → Minimalist | Normal | Pack Rat
- **If Piano** → Upright | Baby Grand | Grand
- **If Gun Safe** → Weight <350 | 350-500 | 500+
- **If Antique** → Text box + "Need custom crate?" checkbox
- **If Storage** → Overnight (days?) | Long-term (weeks?)
- **If Bulky** → Describe item (text field)

#### **Step 6: Contact Info Collection**
1. **Email** (collected first)
2. **Name** 
3. **Phone**

#### **Step 7: Loader (Manual Review Trigger)**
**If conditions met**: 5 Bed+, Commercial, 24-hr Assist, or Crating needed
- **Show**: "We'll reach out shortly for a few extra details."
- **Action**: Route to manual review queue

**Otherwise**: Generate instant quote and display

#### **Critical Implementation Requirements:**

**Conditional Logic:**
- **Service-Specific Flows**: Each service type follows different property/size paths
- **Single vs Multi-Location**: Certain job types show only one address field
- **Dynamic Follow-Up Questions**: Additional questions appear based on previous selections
- **Manual Review Triggers**: Complex jobs routed to staff review

**Address Management:**
- **Multiple Address Support**: Add unlimited pickup/delivery/stop locations
- **Google Autocomplete**: All address fields with API integration
- **Access Details**: Stairs, elevator, walk distance for each location
- **Service Area Validation**: Verify addresses are within coverage area

**Technical Integration:**
- **Tile-Based Interface**: All selections use clickable tiles, no dropdowns
- **Real-Time Pricing**: Quote updates with each selection (except manual review cases)
- **CRM Pipeline Integration**: Form data creates leads with proper categorization
- **Auto-Save**: Progress maintained throughout form completion

*Quote Form Optimization:*
- **Multi-Step Form** - Progressive disclosure to reduce abandonment
- **Mobile-First Design** - Thumb-friendly inputs and clear progression
- **Smart Defaults** - Pre-populate common options and service types
- **Real-Time Validation** - Immediate feedback on form inputs
- **Save & Resume** - Allow customers to complete quotes later

#### **Customer Self-Service Portal**:
**Integrated with CRM Customer Records**

*Customer Dashboard Access:*
- **Quote Tracking** - View all quotes (pending, accepted, expired)
- **Job Status Updates** - Real-time job progress from CRM pipeline
- **GPS Truck Tracking** - Live location of assigned moving crew
- **Digital Documents** - Access contracts, BOL, receipts, photos
- **Payment Management** - View invoices, make payments, payment history
- **Review Requests** - Easy review submission with photo uploads

*Self-Service Features:*
- **Reschedule Request** - Request date changes with calendar availability
- **Add Services** - Upgrade to packing, storage, or additional services
- **Address Changes** - Update pickup/delivery addresses
- **Crew Communication** - Direct messaging with assigned crew
- **Damage Claims** - Submit damage reports with photo evidence
- **Referral Tracking** - Track referral bonuses and payouts

*Account Management:*
- **Profile Management** - Update contact info, preferences, communication settings
- **Move History** - Complete history of all moves with ratings and feedback
- **Saved Addresses** - Store frequently used addresses for easy booking
- **Family/Business Accounts** - Multiple users under one account
- **Notification Preferences** - Choose how and when to receive updates

#### **Trust & Credibility Elements**:

*Social Proof Integration:*
- **Live Review Feed** - Real-time Google, Yelp, Facebook review display
- **Customer Photos** - Before/after photos from completed moves
- **Testimonial Videos** - Customer success stories with video testimonials
- **Move Counter** - Live counter of completed moves and happy customers
- **Crew Spotlights** - Individual crew member profiles and customer feedback

*Credibility Indicators:*
- **License & Insurance** - Display DOT numbers, insurance certificates
- **Industry Associations** - BBB rating, moving association memberships
- **Awards & Recognition** - Industry awards, local business recognition
- **Guarantee Information** - Clear explanation of service guarantees
- **Transparent Pricing** - No hidden fees, clear pricing breakdowns

### **Technical Architecture & CRM Integration**

#### **Lead Generation & CRM Sync**:
**Real-Time Customer Data Flow**

*Lead Capture Integration:*
- **Form Submissions** - All quote forms instantly create leads in CRM
- **Phone Calls** - Click-to-call creates leads with call tracking
- **Chat Interactions** - AI chat conversations sync to customer records
- **Email Captures** - Newsletter/guide downloads create nurture leads
- **Social Media** - Facebook/Instagram lead ads sync to CRM pipeline

*Customer Journey Tracking:*
- **UTM Parameter Tracking** - Source attribution for all marketing channels
- **Page View Analytics** - Track customer behavior and conversion paths
- **Session Recording** - Understand user experience and optimization opportunities
- **A/B Testing Platform** - Test different CTAs, forms, and conversion elements
- **Conversion Funnel Analysis** - Identify drop-off points and optimization opportunities

#### **Performance & SEO Optimization**:

*Local SEO Strategy:*
- **Google My Business** - Integration with review management and posting
- **Local Schema Markup** - Rich snippets for services, reviews, and business info
- **Service Area Pages** - Individual landing pages for each city/neighborhood
- **Local Directory Listings** - Consistent NAP across all local directories
- **Geo-Targeted Content** - City-specific content and service information

*Technical SEO:*
- **Core Web Vitals** - Optimized loading speed, interactivity, visual stability
- **Mobile-First Indexing** - Responsive design with mobile performance priority
- **Structured Data** - Rich snippets for services, reviews, pricing, availability
- **XML Sitemaps** - Dynamic sitemaps with service and location pages
- **Internal Linking** - Strategic linking between service and location pages

*Content Strategy:*
- **Service-Specific Landing Pages** - Detailed pages for each moving service
- **Location-Based Content** - City guides, neighborhood information, local tips
- **Moving Guides** - Comprehensive guides for different types of moves
- **FAQ Content** - Address common concerns and questions
- **Blog Content** - Regular content for long-tail keyword capture

### **Website User Experience & Design**

#### **Homepage Design Strategy**:
**Optimized for Conversion with Trust Elements**

*Above-the-Fold Elements:*
- **Clear Value Proposition** - "Oklahoma's Most Trusted Moving Company"
- **Hero Image/Video** - Professional crew in action, happy customers
- **Primary CTA** - "Get Free Quote" prominently displayed
- **Trust Indicators** - Years in business, moves completed, star rating
- **Phone Number** - Large, clickable phone number with local area code

*Homepage Sections:*
- **Service Overview** - Grid of primary services with icons and descriptions
- **Why Choose Us** - Key differentiators with supporting evidence
- **Service Areas** - Map of coverage area with city links
- **Customer Reviews** - Rotating testimonials with photos and star ratings
- **Moving Process** - Step-by-step explanation with timeline
- **Get Quote CTA** - Secondary quote section with different entry point

#### **Service Page Templates**:
**Consistent Structure for All Moving Services**

*Service Page Structure:*
- **Service Hero** - Large image, service name, brief description
- **Service Details** - Comprehensive information about the specific service
- **Why Choose Us** - Service-specific benefits and advantages
- **Process Overview** - Step-by-step process for this type of move
- **Pricing Information** - Transparent pricing structure and factors
- **Customer Stories** - Testimonials specific to this service type
- **Related Services** - Cross-sell opportunities and complementary services
- **FAQ Section** - Service-specific frequently asked questions
- **Quote CTA** - Service-specific quote form with pre-populated service type

#### **Mobile Optimization**:
**Mobile-First Design for On-the-Go Customers**

*Mobile UX Priorities:*
- **Thumb-Friendly Navigation** - Easy one-handed operation
- **Fast Loading** - Optimized images and minimal render-blocking resources
- **Click-to-Call** - Prominent phone number with tap-to-call functionality
- **Simplified Forms** - Minimal fields with smart input types
- **GPS Integration** - Auto-populate addresses using device location
- **Progressive Web App** - App-like experience with offline capability

### **Analytics & Conversion Optimization**

#### **Conversion Tracking & Analytics**:
**Data-Driven Optimization Strategy**

*Key Performance Indicators:*
- **Lead Conversion Rate** - Percentage of visitors who submit quote forms
- **Phone Call Conversion** - Click-to-call engagement and call duration
- **Quote-to-Booking Rate** - CRM integration to track full funnel
- **Page Performance** - Individual page conversion rates and optimization opportunities
- **Source Attribution** - ROI tracking for different marketing channels

*A/B Testing Framework:*
- **CTA Testing** - Different button colors, text, and placement
- **Form Optimization** - Field reduction, step optimization, mobile improvements
- **Landing Page Variants** - Different layouts and value propositions
- **Pricing Display** - Transparent vs. contact-for-pricing approaches
- **Trust Element Testing** - Different review displays and credibility indicators

This comprehensive marketing website serves as the customer acquisition engine for the entire CRM ecosystem while providing valuable self-service capabilities for existing customers.

### **Landing Page Recreation (Exact Design)**

#### **Page 1: Hero Section**
**Header Navigation & Trust Bar**
- **Top Trust Bar**: "Local & Family-Owned | Licensed and Insured | Meals Donated With Every Move | Award-Winning Team"
- **Main Navigation**: Clean header with High Quality Moving logo, phone number (580) 595-1262
- **5-Star Reviews Badge**: "5.0 ⭐⭐⭐⭐⭐ Read our 136 reviews"

**Hero Section Layout**
- **Left Side Content**:
  - **Trust Badge**: "✓ Trusted by thousands of families around the OKC Metro"
  - **Main Headline**: "Ready to Move in OKC? Start Your Free Quote!"
  - **Subheading**: "I need a quote For..."
  
- **Quote CTA Button**: Single "Get Quote" or "Start Quote" button replacing the 6 service cards
- **Hero Image Fade**: When quote button is clicked, mover photo and surrounding content fades away
- **Form Transition**: Quote form appears with back button navigation

- **Value Propositions** (with icons):
  - 👑 **100% Satisfaction Guarantee** – Your belongings, treated with care.
  - ⌛ **Seamless Process** – Fast quotes and a smooth moving experience.
  - 💲 **No Hidden Fees, Ever** – What you see is what you pay.

**Right Side**: Professional photo of smiling mover in High Quality Moving uniform holding boxes

#### **Page 2: Social Proof & Reviews**
**Section Header**: "OKC's Most Trusted, Award-Winning Movers"
**Subheading**: "Trusted by locals, recognized with awards, and loved by customers."

**Awards & Badges Row**:
- A+ Top Mover badge
- Local Movers badge
- BBB Accredited Business 
- Google 5-star reviews
- Best Movers in Oklahoma City award
- Yelp 5-star rating
- Thumbtack Top Pro 2024

**Elfsight Review Widget Integration**:
- **Overall Rating**: 5.0 ⭐⭐⭐⭐⭐ (170 reviews)
- **Platform Breakdown**: Google 5.0 | Facebook 5.0 | Yelp 5.0
- **"Write a review" CTA button**

**Elfsight Customer Review Widget** (8 review cards):
- **Integration**: Elfsight review widget pulls live reviews from Google, Facebook, Yelp
- **Real-Time Updates**: Reviews automatically sync from all platforms
- **Individual Reviews** showing customer names, photos, 5-star ratings, and review text
- **Sample Reviews**:
  - "High quality movers did an amazing job! Very hard-working. Helped us pack and move..."
  - "The gentleman that came to move refrigerator were here on time did job efficiently in no..."
  - "Wanting to Thank Cameron and D for doing an excellent job with moving my furniture..."
  - And 5 more similar authentic customer reviews
- **Load More Button**: "Load More" at bottom to show additional reviews

**Elfsight Setup Notes**:
```typescript
// Elfsight review widget integration
interface ElfsightConfig {
  widget: "elfsight-app-reviews";
  sources: ["google", "facebook", "yelp"];
  displayCount: 8;
  layout: "grid";
  showLoadMore: true;
  customStyling: "match brand colors (gold #D4A855)";
}
```

#### **Page 3: Pricing & Quote Section**
**Animated Header**: "➜ BOOK NOW ➜ BOOK NOW ➜ BOOK NOW" (scrolling text)

**Quote CTA Section** (Gold background):
- **Headline**: "Get Your Instant Moving Quote Less than 60 Seconds"
- **Subheading**: "No Stress, No Hidden Fees, Just Quick and Accurate Estimates!"
- **Description**: "Our seamless online system takes less than a minute to give you a personalized moving quote tailored to your needs."
- **CTA**: "Click Below and See for Yourself:"
- **Primary Button**: "Get Your Free Moving Quote Now!" (large black button)

**Pricing Section** (Dark background):
- **Section Title**: "Simple and Transparent Moving Rates in Oklahoma City"
- **Subtitle**: "Affordable hourly rates with no surprises – pay only for the time you need."

**Pricing Cards** (3 gold cards with icons):
1. **2 Movers + Truck** (No Hidden Fees) - $169/hour* - "→ BOOK NOW"
2. **3 Movers + Truck** (No Hidden Fees) - $229/hour* - "→ BOOK NOW" 
3. **4 Movers + Truck** (No Hidden Fees) - $289/hour* - "→ BOOK NOW"

**Fine Print**: "*conditions apply" | "*All jobs have a 2-hour minimum and include a 30-mile radius. Additional time is charged in 15-minute increments."

#### **Page 4: Moving Process**
**Section Title**: "Our Stress-Free Moving Process, Step by Step"

**5-Step Process** (with circular photos and arrows):

1. **On Moving Day 🚚**
   - Photo: Moving truck at house
   - Description: Highly trained team arrives on time with clean, fully stocked 26-ft truck
   - **Why It Matters**: Professional, organized start ensures smooth moving day

2. **Preparation 🛡**
   - Photo: Floor protection setup
   - Description: Floor runners, door pads, door jamb protectors, specialty padding
   - **Why It Matters**: Home deserves care and respect—meticulous preparation

3. **Protection 📦**
   - Photo: Furniture wrapping
   - Description: Quilted moving blankets, shrink wrap, bands, disassembly/reassembly
   - **Why It Matters**: Belongings stay secure, delicate items handled with care

4. **Transport & Placement 🪑**
   - Photo: Loading truck efficiently
   - Description: Expert truck loading, secure items, place furniture exactly where wanted
   - **Why It Matters**: Hassle-free settling in, everything in right spot

5. **Final Walkthrough & Completion 🎉**
   - Photo: Final walkthrough with customer
   - Description: Final walkthrough, secure payment (cash/debit/credit), job completion
   - **Why It Matters**: Your happiness is our top priority

**Bottom CTA**: "Get Your Free Moving Quote!" (gold button)

#### **Page 5: What Sets Us Apart**
**Section Title**: "What Sets High Quality Moving Apart"

**6 Key Differentiators** (dark cards with gold icons):

1. **Instant Quotes & Seamless Booking** 📋✓
   - Get quote in minutes and book instantly
   - Process tailored to unique needs
   - Prioritize your time, seamless experience

2. **No Hidden Fees, Ever** 🏷️⚡
   - Transparent pricing, no surprise charges
   - What you see on estimate is what you pay
   - Honest, upfront pricing, confident decision

3. **Highly Trained, Award-Winning Team** 🏆
   - Award-winning experts, professional and skilled
   - Personal touch to every move
   - Meet your team before move day

4. **We Donate 5 Meals for Every Move** 🗨️💬
   - For every job, donate 5 meals to local families
   - Strengthen community we all share
   - Your move is part of something bigger

5. **Top-Tier Customer Care** 💬👥
   - More than movers—effortless, stress-free experience
   - First call to final walkthrough support
   - Dedicated to satisfaction at every step

6. **Family-Owned & Local to OKC** 🏠
   - Family-owned business rooted in OKC community
   - Personal, neighborly touch with every move
   - Supporting local business that truly cares

#### **Page 6: Final CTA**
**Gold Background Section**:
- **Headline**: "Ready to experience the royal treatment? Get your free quote in minutes!"
- **Subheading**: "Don't wait—secure your spot for a stress-free move today!"
- **Primary CTA**: "Start Your Free Quote Now!" (large black button)

#### **Page 7: Footer**
**Three-Column Footer Layout**:

**Column 1: Licensed & Insured**
- DOT#: 382190382193821
- OK License #: 0231980291
- Award badges row (6 certification badges)

**Column 2: Payment Methods**
- MasterCard, Apple Pay, American Express, Visa icons
- "100% Satisfaction Guaranteed"

**Column 3: Contact Information**
- Phone: (580) 595-1262
- Email: admin@highqualitymoving.net
- Hours: Mon-Sat: 8 AM - 6 PM

**Copyright**: "© 2025 High Quality Moving. All rights reserved. | Privacy Policy."

### **Technical Implementation Notes**

**Color Scheme**:
- **Primary Gold**: #D4A855 (buttons, accents, cards)
- **Dark Background**: #1F1F1F (sections, cards)
- **White Text**: #FFFFFF (primary text)
- **Black**: #000000 (CTA buttons)

**Typography**:
- **Headlines**: Bold, large font for impact
- **Body Text**: Clean, readable sans-serif
- **CTAs**: Bold, contrasting button text

**CTA Integration Points**:
- Hero section service cards → Direct to quote form with pre-selected service
- Multiple "Get Free Quote" buttons → Lead capture form
- "Book Now" pricing buttons → Quote form with crew size pre-selected
- Phone number → Click-to-call with lead creation
- All CTAs funnel into CRM pipeline as "Hot Lead" status

**Mobile Optimization**:
- Service grid converts to scrollable cards
- Pricing cards stack vertically
- Process steps become vertical timeline
- All buttons thumb-friendly size
- Phone number prominent and clickable

This landing page design is perfectly optimized for conversion with multiple quote entry points, strong social proof, transparent pricing, and clear value propositions that align with the comprehensive CRM system we've planned.

### **Quote Form Flow Process (Tile-Based Navigation)**

**Form Interaction Design**:
- **Hero Section**: Single "Get Quote" button replaces 6 service cards
- **Fade Transition**: Mover photo and background content fade away when form starts
- **Tile-Based Steps**: Each form step displayed as interactive tiles
- **Back Button**: Always visible for easy navigation between steps
- **Progress Indicator**: Visual progress bar showing completion status

**Quote Form Flow Steps** (Based on Flowchart):

**Step 1: Contact Information**
- **Options**: Contact Info tile
- **Fields**: Name, phone, email
- **Validation**: Real-time validation with error states

**Step 2: Move Type Selection**
- **Tiles Available**:
  - **Commercial Move** → Business/office relocation
  - **Furniture Only Move/Packing/Unpacking** → Specific services
  - **Residence** → Home/apartment moves
  - **Just Delivery** → Delivery-only services

**Step 3: Service Type (Based on Move Type)**
*If Commercial Move selected:*
- **Packing Type**: Full packing, partial packing, no packing
- **Move Details**: Office size, equipment, timeline

*If Furniture Only/Packing selected:*
- **Service Options**: Moving only, packing only, unpacking only, combination
- **Item Details**: Specific furniture pieces, quantity

*If Residence selected:*
- **Property Type**: House, apartment, condo, other
- **Size Selection**: Studio, 1-bed, 2-bed, 3-bed, 4-bed, 5+ bed

*If Just Delivery selected:*
- **Delivery Type**: Single item, multiple items, appliances
- **Special Requirements**: Heavy items, stairs, assembly

**Step 4: Property Details** (For Residence)
- **Current Home**: Property type, size, special considerations
- **New Home**: Property type, accessibility, parking

**Step 5: Move Details**
- **Move Date**: Preferred date with calendar picker
- **Flexibility**: Flexible dates, specific date only
- **Timing**: Morning, afternoon, anytime
- **Distance**: Local, long-distance options

**Step 6: Special Services & Add-ons**
- **Packing Services**: Full service, partial, supplies only
- **Special Items**: Piano, safe, artwork, antiques
- **Storage**: Temporary storage needs
- **Additional Services**: Cleaning, handyman, staging

**Step 7: Access & Logistics**
- **Pickup Location**: Stairs, elevator, walk distance, parking
- **Delivery Location**: Similar access questions
- **Special Instructions**: Gates, codes, timing restrictions

**Step 8: Budget & Preferences**
- **Budget Range**: Approximate budget expectations
- **Communication**: Preferred contact method and times
- **Priority**: Schedule priority, service level preferences

**Step 9: Review & Submit**
- **Summary Review**: All selections displayed for confirmation
- **Edit Options**: Quick links to modify any step
- **Terms Agreement**: Service terms and conditions
- **Submit Button**: "Get My Free Quote" final CTA

**Step 10: Thank You & Next Steps**
- **Confirmation**: Quote submitted successfully
- **Timeline**: When to expect quote response
- **Immediate Options**: Call now, schedule consultation
- **Account Creation**: Optional customer portal signup

**Technical Implementation Notes**:

**Form State Management**:
```typescript
interface QuoteFormState {
  step: number;
  data: {
    contact: ContactInfo;
    moveType: MoveType;
    serviceDetails: ServiceDetails;
    timeline: Timeline;
    specialServices: SpecialServices[];
    logistics: LogisticsInfo;
    preferences: CustomerPreferences;
  };
  validation: ValidationState;
  progress: number; // 0-100%
}
```

**CRM Integration Points**:
- **Step 1 Complete**: Create "Hot Lead" in CRM with contact info
- **Step 3 Complete**: Update lead with move type and service classification
- **Step 9 Submit**: Convert to "Opportunity" status with complete quote request
- **Step 10**: Trigger automated follow-up sequence and task creation

**Form Optimization Features**:
- **Save & Resume**: Allow customers to save progress and return later
- **Smart Defaults**: Pre-populate common selections based on previous choices
- **Conditional Logic**: Show/hide steps based on previous selections
- **Mobile Optimization**: Thumb-friendly tiles and navigation
- **Progress Persistence**: Maintain form state across browser sessions
- **Abandon Recovery**: Email follow-up for incomplete forms with resume link

**Visual Design Elements & Input Types**:
- **Tile Design**: Card-based selection with hover states and visual feedback
- **Clickable Only**: All main options are clickable tiles/buttons, NO dropdowns for primary selections
- **Limited Dropdowns**: Only for secondary/additional questions within a step
- **Text Inputs**: Only for specific fields:
  - **Name, Email, Phone**: Contact information fields
  - **Addresses**: Google Autocomplete textboxes for pickup/delivery addresses
  - **Additional Options**: Text fields only when "Other" or custom option is selected
- **Animation**: Smooth transitions between steps with fade/slide effects
- **Typography**: Clear, readable text with proper hierarchy
- **Color Coding**: Consistent gold accent color (#D4A855) for CTAs and progress
- **Icons**: Visual icons for each selection to improve usability

**Input Field Specifications**:
```typescript
// Form input types by category
interface FormInputTypes {
  // PRIMARY SELECTIONS - Always clickable tiles
  moveType: "clickable-tiles"; // Commercial, Residence, etc.
  serviceType: "clickable-tiles"; // Based on move type
  propertySize: "clickable-tiles"; // Studio, 1-bed, 2-bed, etc.
  moveDate: "clickable-tiles"; // Date picker tiles
  specialServices: "clickable-tiles"; // Packing, piano, etc.
  
  // TEXT INPUTS ONLY
  contactInfo: {
    name: "text-input";
    email: "text-input-email";
    phone: "text-input-phone";
  };
  addresses: {
    pickup: "google-autocomplete-textbox";
    delivery: "google-autocomplete-textbox";
  };
  
  // DROPDOWNS - Limited use only
  additionalQuestions: "dropdown"; // Only for secondary/follow-up questions
  customOptions: "text-input"; // Only when "Other" tile is selected
}
```

**Google Autocomplete Integration**:
- **Address Fields**: Both pickup and delivery addresses use Google Places API
- **Auto-completion**: Real-time address suggestions as user types
- **Validation**: Ensure addresses are within service area
- **Formatting**: Standardized address format for CRM integration

### **Sales Page (Quote Results & Booking)**

**Page Purpose**: After form completion, customer is directed to personalized quote results page with instant booking capability and CRM calendar integration.

#### **Quote Display Section**

**Main Quote Header**:
- **"Here is your quote:"**

**Quote Breakdown Display**:
- **Range Estimate**: "Quote breakdown with the average time it takes to move a [property type] from (X)hours to (Y)hours with [Z] movers and costs between $[low] - $[high]."
- **Refined Estimate**: "Based on the details you provided, your estimate will take closer to **[final hours]** with **[final movers]** and **[final trucks]**"

**Visual Quote Display** (Icons with values):
```
⏰ [final hours] Hours    👥 [final movers] Movers    🚛 [final trucks] Trucks
```

**Pricing Summary**:
- **"At a hourly rate of $[rate] you should budget for about"**
- **Final Price Display**: **$[final estimate]** (large, prominent)

**Estimate Disclaimer**:
"This is just an estimate assuming averages on the number of furniture and box count. Also accounting for drive time, stairs, elevators."

#### **About Our Rates Section**

**Rate Breakdown**:
- "Our base rate is **$169 per hour** for 2 men and the truck"
- "Each additional man is **$60/hr**"
- "Each additional truck is **$30/hr**"
- "We charge you in **15 min increments**"
- "The time starts once we pick the first item up and **you have us for as long as you need**"

**No Hidden Fees Promise**:
- "**There are no hidden fees**"

**What's Included** (Enhanced value proposition):
- ✅ **Truck gas and mileage all included**
- ✅ **Door and floor protection**
- ✅ **Blankets, tape, wrap, and bands**
- ✅ **Professional Crew Background Checked and Highly Trained**
- ✅ **We donate 5 meals for every move completed**
- ✅ **Furniture Assembly and Disassembly** offers hassle-free setup in your new home
- ✅ **100% Satisfaction Guarantee** - Your belongings, treated with care
- ✅ **Licensed and Insured** - Full protection for your peace of mind
- ✅ **Local & Family-Owned** - Supporting your OKC community
- ✅ **Award-Winning Team** - Recognized excellence in moving services
- ✅ **Real-Time GPS Tracking** - Know exactly where your belongings are
- ✅ **Same-Day Availability** - Flexible scheduling for your convenience

#### **Calendar Booking Section**

**Booking Header**:
- **"What day would you be needing help?"**

**Calendar Integration**:
- **Full Month Calendar**: Current month displayed with clickable dates
- **CRM Integration**: Connected to in-house CRM system for real-time availability
- **Date Selection**: Customer clicks on available date
- **Unavailable Dates**: Grayed out or marked as unavailable based on CRM scheduling

**Time Selection** (After date selection):
- **Available Hours**: Show hourly time slots for selected date
- **Business Hours**: Display only when company is open/available
- **Real-Time Availability**: Connected to CRM dispatch calendar
- **Time Slot Display**: 
  ```
  Morning:    8:00 AM  |  9:00 AM  |  10:00 AM  |  11:00 AM
  Afternoon:  12:00 PM |  1:00 PM  |  2:00 PM   |  3:00 PM
  Evening:    4:00 PM  |  5:00 PM  |  6:00 PM
  ```

#### **Booking Actions Section**

**Primary CTA**:
- **"Book My Move"** (Large gold button)
- **Action**: Creates confirmed booking in CRM, moves customer to "Booked" status

**Enhanced Quote Option**:
- **"Get a more accurate quote with Yembo"** (Secondary button)
- **Visual**: GIF or animation showing photo upload process

**Estimate Disclaimer**:
- "*This estimate is calculated based on room sizes, item quantities, distance, drive time, stairs, elevator access, walk distance, and bulky items. Final pricing may vary based on actual conditions during the move."

#### **FAQ & Additional Actions**

**Frequently Asked Questions**:
- **"What if my move takes longer than estimated?"** - You only pay for the time we actually work
- **"Can I reschedule my booking?"** - Yes, with 24-hour notice (no fees)
- **"What if I have more items than estimated?"** - We'll adjust on moving day, transparent pricing
- **"Do you provide packing materials?"** - Yes, all materials included in service
- **"What areas do you serve?"** - Full OKC metro area coverage
- **"Are you licensed and insured?"** - Fully licensed (DOT#: 382190382193821) and insured

**Additional Actions**:
- **"Start Over"** - Return to beginning of quote form
- **"Go Back"** - Return to previous form step
- **"Call Us"** - Direct phone contact (580) 595-1262
- **"Live Chat"** - Immediate assistance

#### **Technical Implementation**

**CRM Integration Points**:
```typescript
interface SalesPageIntegration {
  // Quote calculation using CRM estimation engine
  quoteGeneration: {
    basedOn: "form responses + CRM estimation algorithms";
    factors: ["property size", "service type", "logistics", "special items"];
    pricing: "real-time calculation using CRM pricing engine";
  };
  
  // Calendar integration
  calendarSync: {
    availability: "real-time from CRM dispatch calendar";
    booking: "creates confirmed job in CRM system";
    notifications: "automatic crew assignment and customer confirmation";
  };
  
  // Customer status progression
  statusUpdates: {
    quoteViewed: "update lead status to 'Quote Viewed'";
    dateSelected: "update to 'Scheduling in Progress'";
    bookingConfirmed: "convert to 'Booked' status";
    yemboUpgrade: "flag for enhanced quote with photos";
  };
}
```

**Yembo AI Integration**:
- **Photo Upload Interface**: Simple drag-and-drop or camera upload
- **AI Processing**: Automatic item recognition and count
- **Enhanced Quote**: More accurate pricing based on actual items
- **CRM Update**: Enhanced quote replaces initial estimate

**Mobile Optimization**:
- **Responsive Calendar**: Touch-friendly date and time selection
- **Thumb-friendly Buttons**: Large, easy-to-tap booking actions
- **Simplified FAQ**: Expandable/collapsible sections
- **One-tap Actions**: Call, text, or live chat options

This sales page serves as the conversion point where leads become booked customers, with seamless CRM integration and multiple paths to booking.

**LONG-DISTANCE MOVES (301–500 miles):**
1. Attempt Single-Day Load-Drive-Unload within 14-hour DOT duty window
2. If single-day fails → Default 2-Day Sequence:
   - Day-1: Pack (crew − 1)
   - Day-2: Load + Drive (+ Unload if fits <14 hr, else schedule Day-3 Unload)
3. Unpack Handling: If Unpack pushes Day-3 beyond 9 hr → schedule Day-4 Unpack (crew − 1)
4. Overnight Costs: Each overnight leg flags hotel/per-diem

**CROSS-COUNTRY MOVES (> 500 miles):**
1. Day-1: Pack (crew − 1)
2. Day-2: Load + Depart
3. Drive Legs: Max 11 hr drive per day + breaks, overnight each leg with hotel/per-diem
4. Final Leg: Unload when arrival + unload fit within 14 hr window
5. Return Trip: Drive back to HQ with same DOT limits, crew marked unavailable until return

## EXAMPLES:

The `examples/` folder contains practical implementation examples for the CRM application:

**Note: All components, utilities, and application routes are currently work in progress and subject to change, additions, and refactoring as the CRM system evolves.**

### Core Utilities
- **`actions.ts`** - Comprehensive server actions library implementing Next.js 14 server actions pattern. Contains reusable functions for CRUD operations on leads, customers, and opportunities with Supabase integration. Includes error handling, validation, revalidation strategies, and proper TypeScript typing. Examples include createLead(), updateOpportunityStatus(), and assignLeadToUser() with optimistic updates and rollback mechanisms.

- **`chargeUtils.ts`** - Business logic engine for moving company pricing calculations. Implements complex algorithms for hourly rates, distance-based pricing, seasonal adjustments, and service add-ons (packing, storage, specialty items). Handles different move types (local, long-distance, commercial) with configurable pricing tiers, tax calculations, and discount applications. Includes validation for minimum charges and business rule compliance.

- **`formatters.ts`** - Comprehensive data formatting library ensuring consistent presentation across the application. Includes currency formatting with localization, date/time formatting with timezone awareness, phone number standardization, address normalization, and data sanitization. Implements input masking, validation helpers, and display transformations for forms and data tables.

- **`notifications.ts`** - Multi-channel notification system supporting toast notifications, email campaigns, SMS alerts, and in-app messaging. Integrates with third-party services (Twilio) and implements queuing, retry logic, and delivery tracking. Includes templates for common notifications (quote ready, appointment reminders, status updates) with personalization and scheduling capabilities.

### Estimation & Business Logic  
- **`boxEstimator.ts`** - Sophisticated estimation algorithm that analyzes room inventories, customer-provided lists, and historical data to predict packing material needs. Implements machine learning-inspired calculations for box quantities, packing paper, bubble wrap, and specialty containers. Accounts for item fragility, customer packing preferences, and service level variations with accuracy tracking and continuous improvement.

- **`databaseEstimation.ts`** - Database-driven pricing engine that pulls real-time pricing data, applies business rules, and generates accurate moving estimates. Integrates with inventory management, resource availability, and market pricing data. Implements dynamic pricing based on demand, seasonality, and capacity utilization with audit trails and pricing approval workflows.

- **`estimationUtils.ts`** - Supporting utilities for quote calculations including labor hour estimation, travel time calculations, equipment requirements, and service add-on pricing. Implements complex algorithms for crew size optimization, time-of-day adjustments, and multi-stop calculations with geographic and logistical considerations.

### Third-Party Integrations
- **`googleMapsUtils.ts`** - Comprehensive Google Maps API integration providing distance matrix calculations, route optimization, geocoding services, and address validation. Handles complex multi-stop routes, traffic-aware timing, and cost-effective path planning. Includes error handling for API limits, fallback strategies, and caching mechanisms for frequently accessed locations.

- **`middleware.ts`** - Next.js 14 middleware implementation providing authentication checks, role-based access control, request logging, and security headers. Handles session management, route protection based on user roles (admin, sales, dispatch), and API rate limiting with proper error responses and redirect logic.

### Supabase Integration
- **`supabase/client.ts`** - Client-side Supabase configuration with TypeScript type generation, authentication state management, and real-time subscription handling. Implements connection pooling, error recovery, and offline support with proper type safety for all database operations.

- **`supabase/middleware.ts`** - Middleware for Supabase session management, JWT token validation, and secure cookie handling. Provides session refresh logic, role-based routing, and integration with Next.js middleware pipeline.

- **`supabase/server.ts`** - Server-side Supabase client optimized for API routes and server components. Implements connection reuse, query optimization, and secure credential management with proper error handling and logging.

### React Components

#### Lead Management Components
- **`CreateLeadButton.tsx`** & **`CreateLeadModal.tsx`** - Modal-based lead creation system with multi-step form validation, address autocomplete, and service type selection. Implements optimistic updates, error handling, and integration with Google Places API for address validation.

- **`AssignLeadDialog.tsx`** - Role-based lead assignment interface allowing managers to distribute leads among sales representatives. Includes user filtering, workload balancing suggestions, and automated notification triggers.

- **`ClaimLeadDialog.tsx`** - Self-service lead claiming interface for sales representatives with territory validation, capacity checks, and conflict resolution for competing claims.

- **`LeadsTable.tsx`** & **`LeadsPageTabs.tsx`** - Advanced data table with sorting, filtering, pagination, and real-time updates. Implements virtual scrolling for performance, bulk actions, and customizable column layouts with persistent user preferences.

#### Opportunity Management  
- **`CreateOpportunityButton.tsx`** & **`CreateOpportunityModal.tsx`** - Opportunity creation workflow from qualified leads with pipeline stage management, probability scoring, and revenue forecasting integration.

- **`AssignOpportunityDialog.tsx`** - Opportunity reassignment system with handoff procedures, note transfers, and customer communication management to ensure seamless transitions.

#### Customer Management
- **`CustomerTable.tsx`** & **`CustomersPageTabs.tsx`** - Comprehensive customer data management with relationship tracking, communication history, and service timeline visualization.

- **`CustomerLayout.tsx`** & **`CustomerTabs.tsx`** - Customer detail page layout with tabbed navigation for contact info, service history, billing, and communication logs.

- **`LeadInfoHeader.tsx`** - Customer/lead information header component displaying key metrics, status indicators, and quick action buttons with real-time status updates.

#### Search and Navigation
- **`SearchBar.tsx`** - Global search component with fuzzy matching, recent searches, and smart suggestions across leads, customers, and opportunities.

- **`StatusFilterDropdown.tsx`** & **`UserFilterDropdown.tsx`** - Advanced filtering components with multi-select capabilities, saved filter sets, and dynamic option loading based on user permissions.

- **`PaginationControl.tsx`** - Reusable pagination component with configurable page sizes, jump-to-page functionality, and performance optimization for large datasets.

#### Real-time Features
- **`activity/ActivityFeed.tsx`** & **`activity/ActivityRealTimeSubscription.tsx`** - Live activity feed showing system-wide updates, user actions, and automated notifications with filtering and notification management.

- **`leads/LeadsRealTimeSubscription.tsx`** & **`customers/CustomerRealTimeSubscription.tsx`** - Real-time data synchronization components ensuring all users see live updates without manual refresh.

#### Authentication & Layout
- **`auth/auth-form.tsx`** - Comprehensive authentication form with social login, password recovery, and multi-factor authentication support.

- **`layout/AppShell.tsx`** - Main application shell providing consistent navigation, user context, and responsive layout management.

- **`dashboard/`** - Complete dashboard suite including sidebar navigation (`sidebar.tsx`), stats cards (`stats-card.tsx`), loading states (`loading.tsx`), and responsive header (`dashboard-header.tsx`) with role-based content visibility.

#### Specialized Features
- **`dispatch/DispatchCalendar.tsx`**, **`dispatch/DispatchEventModal.tsx`**, **`dispatch/DispatchResourceList.tsx`** - Dispatch management components including calendar scheduling, resource allocation, and event management for coordinating moving crews and equipment.

- **`customer-service/ClaimsPanel.tsx`**, **`customer-service/ReviewsPanel.tsx`**, **`customer-service/CustomerServiceTabs.tsx`** - Customer service tools including claims processing, review management, and service ticket handling with escalation workflows.

- **`marketing/MarketingDashboard.tsx`**, **`marketing/MarketingCampaignsList.tsx`** - Marketing campaign management and dashboard components for tracking lead generation, campaign performance, and ROI analysis.

- **`GooglePlacesAutocomplete.tsx`** - Enhanced Google Places autocomplete with address validation, formatting, and integration with the CRM's address standardization system.

- **`NotificationDropdown.tsx`** - In-app notification center with categorization, mark-as-read functionality, and integration with external notification channels.

- **`TestNotificationButton.tsx`** - Development utility for testing notification systems and debugging communication workflows.

- **`CreateQuoteButton.tsx`** - Quote generation interface that integrates with estimation utilities and pricing engines to create accurate moving quotes.

#### Page-Level Components
- **`leads/ClientLeadsPage.tsx`**, **`leads/LeadsPageClientWrapper.tsx`** - Client-side lead management pages with state management, filtering, and real-time updates.

- **`customers/ClientCustomersPage.tsx`**, **`customers/CustomersPageClientWrapper.tsx`** - Customer management interfaces with comprehensive customer lifecycle tracking.

#### UI Foundation
- **`ui/`** - Complete Shadcn/UI component library with custom styling, accessibility features, and CRM-specific enhancements. Includes all foundational components with consistent theming and responsive design patterns:
  - Form components: `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `form.tsx`, `label.tsx`, `switch.tsx`
  - Layout components: `card.tsx`, `sheet.tsx`, `dialog.tsx`, `popover.tsx`, `tabs.tsx`, `accordion.tsx`, `separator.tsx`, `scroll-area.tsx`
  - Data display: `table.tsx`, `badge.tsx`, `avatar.tsx`, `calendar.tsx`, `skeleton.tsx`
  - Feedback: `alert.tsx`, `alert-dialog.tsx`, `sonner.tsx`, `tooltip.tsx`
  - Navigation: `command.tsx`, `dropdown-menu.tsx`

### Next.js App Directory Structure

#### Authentication & Account Management
- **`auth/page.tsx`** - Unified authentication page handling both login and signup workflows with form switching, social auth integration, and password recovery. Includes progressive enhancement and accessibility features.

- **`auth/callback/route.ts`** - OAuth callback handler for third-party authentication providers (Google, GitHub). Manages token exchange, user creation/linking, and redirect handling with proper error recovery.

- **`email-verification/`** - Email verification flow with layout and page components for confirming user email addresses, resending verification emails, and handling verification failures with user-friendly messaging.

#### Core Business Management

##### Dashboard & Analytics
- **`dashboard/`** - Main dashboard with comprehensive layout, loading states, and homepage displaying key metrics, activity feeds, task summaries, and role-specific KPIs with interactive charts and real-time updates.

##### Customer Management
- **`customers/`** - Customer management system with main listing page, layout wrapper, and loading states. Includes advanced filtering, search, bulk operations, and export capabilities with customer lifecycle tracking.

- **`customers/[id]/accounting/page.tsx`** - Customer-specific accounting interface showing billing history, payment tracking, outstanding balances, and financial relationship management with invoice generation capabilities.

- **`customers/[id]/photos/page.tsx`** - Photo management for customer properties, before/after documentation, damage claims, and visual inventory tracking with upload, categorization, and sharing features.

- **`customers/[id]/quotes/page.tsx`** - Customer quote history and management showing all estimates, revisions, approvals, and conversion tracking with quote comparison and renewal capabilities.

- **`customers/[id]/sales/page.tsx`** - Sales relationship management for specific customers including opportunity tracking, upselling opportunities, renewal management, and sales performance metrics.

##### Lead Management
- **`leads/`** - Lead management dashboard with layout and main page featuring pipeline visualization, lead scoring, assignment workflows, and conversion tracking with territory management and real-time updates.

#### Specialized Modules

##### Accounting & Financial Management
- **`accounting/`** - Complete accounting module with layout, loading states, and main interface for financial reporting, invoice management, payment processing, and revenue tracking with integration to customer billing.

##### Administrative Functions
- **`admin-approval/`** - Administrative approval workflows with layout and page for managing pending approvals, user permissions, system changes, and business rule modifications with audit trails.

- **`admin/setup/`** - System setup and configuration interface for administrative users to configure business rules, user roles, system integrations, and operational parameters.

##### Customer Service
- **`customer-service/`** - Customer service module with layout and main interface for ticket management, claims processing, customer communication, and service quality tracking with escalation workflows.

##### Dispatch & Operations
- **`dispatch/`** - Dispatch management system with layout and main interface for crew scheduling, resource allocation, route optimization, and real-time job tracking with mobile integration.

##### Marketing & Lead Generation
- **`marketing/`** - Marketing campaign management with layout and main interface for campaign creation, lead source tracking, ROI analysis, and marketing automation with integration to lead pipeline.

##### Reporting & Analytics
- **`reports/`** - Business intelligence and reporting module with layout, loading states, and main interface for generating custom reports, analytics dashboards, and performance metrics across all business functions.

##### Task Management
- **`tasks/`** - Task and project management system with layout and main interface for assignment tracking, deadline management, team collaboration, and productivity monitoring with notification integration.

#### Settings & Configuration
- **`settings/`** - User and system settings with comprehensive layout, loading states, and main configuration page.

- **`settings/notifications/page.tsx`** - Notification preferences management allowing users to configure email, SMS, and in-app notification settings with granular control over notification types and frequency.

- **`settings/profile/page.tsx`** - User profile management for personal information, contact details, role information, and account preferences with avatar upload and password management.

- **`settings/security/page.tsx`** - Security settings including password changes, two-factor authentication setup, session management, and security audit logs with breach notifications.

#### Development & Testing
- **`estimation-test/page.tsx`** - Development utility for testing estimation algorithms, pricing calculations, and quote generation with various scenarios and validation tools for accuracy improvement.

#### API Routes (`api/`)

##### Core Business APIs
- **`leads/route.ts`** - Lead management API with comprehensive CRUD operations, assignment workflows, status updates, and conversion tracking. Handles lead scoring, territory validation, automated follow-up scheduling, and integration with CRM pipeline.

- **`activity-logs/`** - Activity logging system API for tracking user actions, system events, and business process workflows. Supports activity creation, retrieval with filtering and pagination, and real-time activity feeds across the application.

- **`setup-activity-log/`** - Setup and configuration API for activity logging preferences, retention policies, and activity categorization. Manages system-wide activity tracking configuration and audit trail settings.

##### Job & Scheduling Management
- **`jobs/[id]/scheduling-type/`** - Job-specific scheduling configuration API managing different scheduling types (immediate, recurring, date-specific) for moving jobs with resource allocation and crew assignment capabilities.

- **`jobs/schedule/`** - Job scheduling API handling crew assignments, equipment allocation, time slot management, and scheduling conflict resolution with integration to dispatch and customer notification systems.

##### Integration & External Services
- **`maps/route/route.ts`** - Google Maps integration API providing geocoding, distance calculations, route optimization, and address validation services. Handles API key management, rate limiting, and fallback strategies for mapping services.

##### System Configuration
- **`setup/notifications/route.ts`** - Notification system configuration API managing email templates, SMS settings, notification triggers, and delivery preferences. Handles integration with external notification services and user preference management.

#### Application Foundation
- **`layout.tsx`** - Root application layout providing global context providers, theme management, authentication wrapper, and consistent styling. Handles application-wide state management and provider composition.

- **`page.tsx`** - Application homepage with landing content, feature highlights, and navigation to authenticated areas. Includes responsive design, SEO optimization, and conversion tracking for marketing purposes.

- **`loading.tsx`** - Global loading state component with skeleton screens, progress indicators, and user feedback during async operations. Provides consistent loading experience across the application.

- **`globals.css`** - Global stylesheet with Tailwind CSS configuration, custom CSS variables, design system tokens, and responsive breakpoints. Includes accessibility enhancements and dark mode support.

## DOCUMENTATION:

### Core Framework & Language Documentation

**Next.js 14**
- Official Documentation: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**React 18**
- Official Documentation: https://react.dev/reference/react
- Hooks Reference: https://react.dev/reference/react/hooks
- Components Reference: https://react.dev/reference/react/components
- Rules of React: https://react.dev/reference/rules

**TypeScript**
- Official Documentation: https://www.typescriptlang.org/docs/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- TypeScript with Next.js: https://nextjs.org/docs/app/building-your-application/configuring/typescript

### Styling & UI Components

**Tailwind CSS**
- Official Documentation: https://tailwindcss.com/docs
- Installation Guide: https://tailwindcss.com/docs/installation
- Utility Classes: https://tailwindcss.com/docs/styling-with-utility-classes
- Responsive Design: https://tailwindcss.com/docs/responsive-design

**Shadcn/UI**
- Official Documentation: https://ui.shadcn.com/docs
- Installation Guide: https://ui.shadcn.com/docs/installation
- Components: https://ui.shadcn.com/docs/components
- GitHub Repository: https://github.com/shadcn-ui/ui

### Backend & Database

**Supabase**
- Official Documentation: https://supabase.com/docs
- Architecture Overview: https://supabase.com/docs/guides/getting-started/architecture
- Database Guide: https://supabase.com/docs/guides/database
- Authentication: https://supabase.com/docs/guides/auth
- Realtime: https://supabase.com/docs/guides/realtime
- JavaScript Client: https://supabase.com/docs/reference/javascript

### Data Visualization

**Tremor**
- Official Website: https://www.tremor.so/
- Documentation: https://www.tremor.so/docs
- GitHub Repository: https://github.com/tremorlabs/tremor
- Components Gallery: https://www.tremor.so/components

### Payment & Financial Integration

**Stripe**
- Official Documentation: https://stripe.com/docs
- React Stripe.js: https://stripe.com/docs/stripe-js/react
- GitHub Repository: https://github.com/stripe/react-stripe-js
- Payment Intents API: https://stripe.com/docs/api/payment_intents

**Plaid**
- Official Documentation: https://plaid.com/docs/
- Quickstart Guide: https://plaid.com/docs/quickstart/
- GitHub Quickstart: https://github.com/plaid/quickstart
- Link Integration: https://plaid.com/docs/link/

**QuickBooks**
- Intuit Developer Documentation: https://developer.intuit.com/app/developer/qbo/docs/get-started
- QuickBooks Online API: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities
- OAuth 2.0 Guide: https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
- JavaScript SDK: https://github.com/intuit/oauth-jsclient

### Google APIs

**Google Maps Platform**
- Maps JavaScript API: https://developers.google.com/maps/documentation/javascript
- Distance Matrix Service: https://developers.google.com/maps/documentation/javascript/distancematrix
- Geocoding API: https://developers.google.com/maps/documentation/geocoding

**Google Places API**
- Places API Documentation: https://developers.google.com/maps/documentation/places/web-service
- Autocomplete Service: https://developers.google.com/maps/documentation/javascript/place-autocomplete
- Address Validation API: https://developers.google.com/maps/documentation/addressvalidation

### Testing & Quality Assurance

**Jest**
- Official Documentation: https://jestjs.io/docs/getting-started
- Jest with React: https://jestjs.io/docs/tutorial-react
- Jest with TypeScript: https://jestjs.io/docs/getting-started#using-typescript
- Testing Asynchronous Code: https://jestjs.io/docs/asynchronous
- Mocking: https://jestjs.io/docs/mock-functions
- Configuration: https://jestjs.io/docs/configuration

**React Testing Library**
- Official Documentation: https://testing-library.com/docs/react-testing-library/intro/
- API Reference: https://testing-library.com/docs/react-testing-library/api
- Common Mistakes: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- Testing Practices: https://testing-library.com/docs/guiding-principles

**Next.js Testing**
- Jest Setup with Next.js: https://nextjs.org/docs/app/building-your-application/testing/jest
- Testing Pages: https://nextjs.org/docs/app/building-your-application/testing
- Testing API Routes: https://nextjs.org/docs/app/building-your-application/testing/jest#testing-api-routes

### Monorepo & Build Tools

**Turborepo**
- Official Documentation: https://turbo.build/repo/docs
- Getting Started: https://turbo.build/repo/docs/getting-started
- Configuration: https://turbo.build/repo/docs/reference/configuration
- GitHub Repository: https://github.com/vercel/turbo

**pnpm Workspaces**
- Official Documentation: https://pnpm.io/workspaces
- Package Management: https://pnpm.io/cli/add
- Configuration: https://pnpm.io/pnpm-workspace_yaml
- Monorepo Guide: https://pnpm.io/using-changesets

**TypeScript Project References**
- Official Documentation: https://www.typescriptlang.org/docs/handbook/project-references.html
- Configuration: https://www.typescriptlang.org/tsconfig#references
- Monorepo Setup: https://www.typescriptlang.org/docs/handbook/project-references.html#guidance-for-monorepos

### Mobile Development

**Expo**
- Official Documentation: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Installation: https://docs.expo.dev/get-started/installation/
- Development Build: https://docs.expo.dev/develop/development-builds/introduction/
- EAS Build: https://docs.expo.dev/build/introduction/

**React Native**
- Official Documentation: https://reactnative.dev/docs/getting-started
- Components: https://reactnative.dev/docs/components-and-apis
- Navigation: https://reactnavigation.org/docs/getting-started/
- Performance: https://reactnative.dev/docs/performance

**NativeWind**
- Official Documentation: https://www.nativewind.dev/
- Setup Guide: https://www.nativewind.dev/quick-starts/expo
- Styling: https://www.nativewind.dev/core-concepts/styling
- GitHub Repository: https://github.com/nativewind/nativewind

### State Management & Data

**Zustand**
- Official Documentation: https://github.com/pmndrs/zustand
- Getting Started: https://github.com/pmndrs/zustand#first-create-a-store
- TypeScript Guide: https://github.com/pmndrs/zustand#typescript-usage
- Persist Middleware: https://github.com/pmndrs/zustand#persist-middleware

**TanStack Query (React Query)**
- Official Documentation: https://tanstack.com/query/latest
- Quick Start: https://tanstack.com/query/latest/docs/framework/react/quick-start
- TypeScript: https://tanstack.com/query/latest/docs/framework/react/typescript
- React Native: https://tanstack.com/query/latest/docs/framework/react/react-native

### Mobile-Specific Libraries

**React Native Chart Kit**
- GitHub Repository: https://github.com/indiespirit/react-native-chart-kit
- Documentation: https://github.com/indiespirit/react-native-chart-kit#documentation
- Examples: https://github.com/indiespirit/react-native-chart-kit#example

**Victory Native**
- Official Documentation: https://formidable.com/open-source/victory/docs/native/
- Getting Started: https://formidable.com/open-source/victory/docs/native/#getting-started
- Chart Types: https://formidable.com/open-source/victory/docs/native/victory-chart/

**Expo Vector Icons**
- Documentation: https://docs.expo.dev/guides/icons/
- Icon Directory: https://icons.expo.fyi/
- Usage Guide: https://docs.expo.dev/guides/icons/#icon-libraries

**React Native Elements**
- Official Documentation: https://reactnativeelements.com/docs/
- Components: https://reactnativeelements.com/docs/components/overview
- Theming: https://reactnativeelements.com/docs/customizing

### Mobile Testing

**Detox**
- Official Documentation: https://wix.github.io/Detox/
- Getting Started: https://wix.github.io/Detox/docs/introduction/getting-started
- React Native Setup: https://wix.github.io/Detox/docs/introduction/project-setup
- GitHub Repository: https://github.com/wix/Detox

**Storybook**
- React Native Storybook: https://storybook.js.org/docs/react-native/get-started/introduction
- Setup Guide: https://storybook.js.org/docs/react-native/get-started/install
- Configuration: https://storybook.js.org/docs/react-native/configure/overview

### Development Tools & Resources

**GitHub Repositories**
- Next.js Examples: https://github.com/vercel/next.js/tree/canary/examples
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples
- React Patterns: https://github.com/reactpatterns/reactpatterns.com
- Expo Examples: https://github.com/expo/examples
- React Native Directory: https://reactnative.directory/

**Community Resources**
- Next.js Discord: https://discord.com/invite/bUG2bvbtHy
- Supabase Discord: https://discord.supabase.com/
- Tailwind UI: https://tailwindui.com/
- Shadcn/UI GitHub Discussions: https://github.com/shadcn-ui/ui/discussions

### Communication & Messaging

**SendBlue (iMessage/SMS)**
- Official Documentation: https://docs.sendblue.com/docs/
- API Reference: https://docs.sendblue.com/docs/outbound/
- Official Website: https://www.sendblue.com/api
- GitHub SDKs: https://github.com/sendblue-api

**Twilio (Voice/SMS/SIP)**
- Official Documentation: https://www.twilio.com/docs
- Voice API: https://www.twilio.com/docs/voice
- SIP Trunking: https://www.twilio.com/docs/sip-trunking
- Call Recording: https://www.twilio.com/docs/voice/api/recording
- Programmable Messaging: https://www.twilio.com/docs/messaging

**Resend (Transactional Email)**
- Official Documentation: https://resend.com/docs
- Email API: https://resend.com/features/email-api
- Getting Started: https://resend.com/docs/send-with-nextjs
- API Reference: https://resend.com/docs/api-reference
- React Email Integration: https://resend.com/docs/send-with-react-email
- Knowledge Base: https://resend.com/docs/knowledge-base
- SDKs and Libraries: https://resend.com/docs/sdks

### Voice AI Agents

**Retell AI**
- Official Documentation: https://docs.retellai.com/general/introduction
- API Reference: https://docs.retellai.com/api-references/
- Official Website: https://www.retellai.com/
- Voice API Integration: https://www.retellai.com/blog/how-to-integrate-phone-ai-agents-with-your-existing-api-systems

**Ultravox AI**
- Official Documentation: https://docs.ultravox.ai/introduction
- API Reference: https://docs.ultravox.ai/api-reference/introduction
- Quickstart Guide: https://fixie-ai.github.io/ultradox/guides/quickstart/
- GitHub Repository: https://github.com/fixie-ai/ultravox
- Web Integration: https://github.com/fixie-ai/ultravox-web-quickstart


### AI Visual Inventory

**Yembo AI**
- Official Website: https://yembo.ai/
- Visual Inventory: https://yembo.ai/moving/visual-inventory
- AI Surveys: https://yembo.ai/moving/ai-surveys
- Developer Hub: https://hub.yembo.ai/
- Education Center: https://help.yembo.ai/en/
- Quick Start Guide: https://help.yembo.ai/en/articles/3480227-yembo-quick-start-guide

### Marketing & Advertising APIs

**Meta Marketing API (Facebook Ads)**
- Official Documentation: https://developers.facebook.com/docs/marketing-apis
- API Reference: https://developers.facebook.com/docs/marketing-api/reference/
- Getting Started: https://developers.facebook.com/docs/marketing-api/get-started/
- Insights API: https://developers.facebook.com/docs/marketing-api/insights/
- Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api/
- Postman Collection: https://www.postman.com/meta/facebook-marketing-api/overview

**Google Ads API**
- Official Documentation: https://developers.google.com/google-ads/api/docs/start
- Introduction Guide: https://developers.google.com/google-ads/api/docs/get-started/introduction
- API Reference (v20): https://developers.google.com/google-ads/api/reference/rpc/v20/overview
- Developer Token Guide: https://developers.google.com/google-ads/api/docs/get-started/dev-token
- API Structure: https://developers.google.com/google-ads/api/docs/concepts/api-structure
- Release Notes: https://developers.google.com/google-ads/api/docs/release-notes

**Google Business Profile API (GBP)**
- Official Documentation: https://developers.google.com/my-business
- API Reference: https://developers.google.com/my-business/reference/rest
- Prerequisites: https://developers.google.com/my-business/content/prereqs
- Basic Setup: https://developers.google.com/my-business/content/basic-setup
- Performance API: https://developers.google.com/my-business/reference/performance/rest
- Overview Guide: https://developers.google.com/my-business/content/overview

**Google Local Services Ads API (LSA)**
- Official Documentation: https://developers.google.com/local-services-ads/guides/local-services-api-overview
- Google Ads API Integration: https://developers.google.com/google-ads/api/docs/campaigns/local-service-campaigns
- Cloud Console: https://console.cloud.google.com/marketplace/product/google/localservices.googleapis.com
- API Library: https://console.cloud.google.com/apis/library/localservices.googleapis.com

**Bannerbear (Automated Image/Video Generation)**
- Official Documentation: https://developers.bannerbear.com/
- Official Website: https://www.bannerbear.com/
- Image Generation API: https://www.bannerbear.com/product/image-generation-api/
- Social Media Automation: https://www.bannerbear.com/use-cases/scenarios/auto-generate-social-media-posts-via-api/
- Banner Ads Generation: https://www.bannerbear.com/use-cases/scenarios/auto-generate-banner-ads-via-api/
- Marketing Automation Guide: https://www.bannerbear.com/blog/7-social-media-processes-you-can-automate-with-bannerbear/
- API Introduction: https://www.bannerbear.com/blog/introducing-the-bannerbear-api/

**Bannerbear Review Template System**:
- **Stock Image Template**: Crew holding poster/board for personalized review requests
- **Dynamic Text Overlay**: Customer name insertion on poster via API
- **Template Variables**: `{{customer_name}}`, `{{crew_names}}`, `{{company_logo}}`
- **Image Delivery**: Automated generation and attachment to review request emails/SMS
- **Campaign Integration**: Seamless integration with review follow-up automation sequences

### Marketing Website Structure & Sales Page Functionality

**Website Architecture**:
- **Static Content**: All marketing pages (About, Services, Contact, etc.) are static for optimal performance
- **Dynamic Quote Form**: Interactive form flow with tile-based navigation and Google autocomplete
- **Sales Page Integration**: Dynamic quote results page with CRM booking integration
- **Ad Landing Pages**: UTM-based dynamic phone number insertion (DNI) for campaign tracking

**UTM Parameter & DNI System**:
- **Dynamic Number Insertion**: Each ad campaign gets unique tracking phone number based on UTM parameters
- **Campaign Attribution**: UTM parameters capture source, medium, campaign, content, and term data
- **Form Tracking**: UTM data automatically passed to CRM when customer submits quote form
- **Call Tracking**: DNI numbers route to main line but track which campaign generated the call
- **CRM Integration**: All UTM parameters stored in customer record for ROI analysis and attribution
- **Multi-Touch Attribution**: Track customer journey across multiple touchpoints and campaigns

**Sales Page Features**:
- **Persistent Quote URLs**: Each completed quote generates a unique, bookmarkable URL
- **Quote Link Distribution**: Automatic email delivery of sales page URL upon form completion
- **Edit Quote Functionality**: Customers can modify their original form selections before booking
- **Inventory Management**: Direct customer access to edit inventory items through secure portal
- **Calendar Booking**: Integrated scheduling system connects to CRM dispatch calendar
- **Real-Time Availability**: Live calendar slots synchronized with crew and equipment availability
- **Quote Recalculation**: Automatic pricing updates when customers modify selections or inventory
- **CRM Integration**: Seamless data flow from website quote to CRM customer record

**Customer Experience Flow**:
1. **Form Completion** → **Quote Generation** → **Sales Page URL** → **Email Delivery**
2. **Customer Returns** → **Review Quote** → **Edit Selections/Inventory** → **Book Appointment**
3. **Booking Confirmation** → **CRM Job Creation** → **Crew Assignment** → **Customer Notification**

**Technical Implementation**:
- **URL Structure**: `/quote/[unique-id]` for each generated quote
- **Session Persistence**: Customer selections saved across browser sessions
- **Security**: Secure customer portal access for inventory editing
- **Responsive Design**: Mobile-optimized interface for all devices
- **Performance**: Fast loading with optimized static content delivery

### Weather Integration & Route Optimization Enhancements

**Weather Intelligence System**:
- **CRM Weather Dashboard**: Real-time weather alerts affecting scheduled jobs with automatic rescheduling suggestions
- **Crew App Weather Integration**: Live weather warnings, safety alerts, and equipment recommendations for field crews
- **Customer Communication**: Automatic weather-related notifications for potential delays or rescheduling needs
- **Job Planning**: Weather-based crew size and equipment adjustments (extra tarps, delays for rain/snow)
- **Safety Protocols**: Automatic safety alerts for dangerous weather conditions affecting moving operations

**Advanced Route Optimization**:
- **Multi-Stop Route Planning**: Optimize crew routes for multiple pickups/deliveries in single day
- **Real-Time Traffic Integration**: Dynamic route adjustments based on live traffic conditions
- **Fuel Cost Optimization**: Route planning that considers fuel efficiency and costs
- **Crew Territory Optimization**: Geographic clustering for efficient crew territory coverage
- **Time Window Optimization**: Balance customer time preferences with operational efficiency

## OTHER CONSIDERATIONS:

### **AI Development Standards & Expectations**

**Modularity & Flexibility Requirements**:
- **No Large Code Blobs**: Break down complex functionality into smaller, manageable pieces
- **Easy Future Changes**: Design architecture to allow modifications without breaking existing functionality
- **Modular Design**: Create reusable components and utilities that can be easily maintained and extended
- **Loose Coupling**: Minimize dependencies between different parts of the system

**Implementation Expectations**:
- **Complete Specification Coverage**: Every requirement in this comprehensive specification must be implemented - no shortcuts or skipped features
- **Attention to Detail**: Pay close attention to every detail, even if it requires more time and resources
- **Quality Over Speed**: Take the necessary time to implement features correctly the first time rather than rushing
- **Comprehensive Implementation**: Address every aspect of the specification thoroughly and completely

**Development Approach**:
- **Large Codebase Awareness**: Recognize this is a substantial enterprise-level system requiring careful planning and execution
- **Systematic Implementation**: Work through requirements methodically to ensure nothing is missed
- **Future-Proof Design**: Build with scalability and long-term maintenance in mind
- **Business Logic Priority**: Focus on correctly implementing the complex business workflows and rules outlined in this specification

### **Code Quality & Architecture Standards**

**Modularity & Flexibility Requirements**:
- **No Large Code Blobs**: Keep all functions, components, and modules under 200 lines max
- **Single Responsibility Principle**: Each module, component, and function should have one clear purpose
- **Easy Future Modifications**: Code structure must allow for easy feature additions and changes without breaking existing functionality
- **Loose Coupling**: Minimize dependencies between modules to allow independent updates and testing
- **High Cohesion**: Related functionality should be grouped together logically

**Development Standards**:
- **Attention to Detail**: Every requirement in this specification must be implemented completely - no shortcuts or skipped features
- **Quality Over Speed**: Take the time needed to implement features correctly the first time rather than rushing
- **Comprehensive Implementation**: Address every detail in the specification, even if it requires more development time and resources
- **Future-Proof Architecture**: Design with scalability and maintainability in mind for long-term success

**Code Organization Principles**:
- **Feature-Based Structure**: Organize code by business features rather than technical layers
- **Shared Logic Isolation**: Keep all business logic in shared packages to ensure consistency across applications
- **Clear Separation of Concerns**: Separate UI, business logic, data access, and external integrations
- **Consistent Patterns**: Use established patterns throughout the codebase for predictability and maintainability
- **Documentation**: Every complex business rule and integration should be clearly documented

**Technical Debt Prevention**:
- **Refactor Early**: Address code quality issues immediately rather than accumulating technical debt
- **Test Coverage**: Comprehensive testing for all business logic and critical user flows
- **Code Reviews**: All significant changes should be reviewed for architectural consistency
- **Performance Monitoring**: Track and optimize performance bottlenecks proactively
- **Security First**: Implement security best practices from the beginning, not as an afterthought
