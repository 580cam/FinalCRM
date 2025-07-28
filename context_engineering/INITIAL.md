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
- **Features**:
  - Complete feature parity with web CRM
  - Mobile-optimized interface for touch interaction
  - Push notifications for important updates
  - Offline capability for core functions
  - Camera integration for document capture
  - GPS integration for location-based features
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

**Role-Based Dashboard Views**:
- **Owner/Executive**: High-level KPIs, financial performance, strategic metrics
- **Operations Manager**: Crew scheduling, job progress, resource allocation
- **Sales Manager**: Lead pipeline, conversion rates, booking targets
- **Customer Service**: Active issues, review responses, communication queue

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
- **Lead Source Analysis**: ROI and conversion rates by acquisition channel
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
- **Location Tracking**: Current position and estimated return times
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
- **Route Optimization**: Integrate with Google Maps for efficient crew routing
- **Weather Monitoring**: Weather alerts affecting job scheduling and safety
- **Traffic Integration**: Real-time traffic data for accurate arrival estimates
- **Performance Analytics**: Crew efficiency and customer satisfaction tracking

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
- Send automated review requests after completed jobs (email/SMS)
- Monitor Google Reviews, Yelp, Facebook, and other platforms
- Respond to reviews (both positive and negative)
- Track overall rating trends and identify issues

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

## OTHER CONSIDERATIONS:

[Any other considerations or specific requirements - great place to include gotchas that you see AI coding assistants miss with your projects a lot]
