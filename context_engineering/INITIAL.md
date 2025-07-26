## FEATURE:

### Cross-Platform CRM with Monorepo Architecture

This moving company CRM is designed from the ground up as a **cross-platform application** using a **monorepo architecture** to support both web and mobile experiences with maximum code sharing.

#### **Architecture Overview:**
```
packages/
├── shared/           # Business logic & integrations (80%+ of codebase)
│   ├── api/         # Supabase clients, all API integrations
│   ├── utils/       # Business utilities (pricing, estimation, formatting)
│   ├── hooks/       # Custom React hooks
│   ├── stores/      # State management & real-time subscriptions
│   └── types/       # TypeScript definitions & database schemas
├── web/             # Next.js web application (UI layer)
├── mobile/          # Expo mobile application (UI layer)
└── components/      # Shared component logic
```

#### **Key Benefits:**
- **Write Once, Deploy Everywhere**: Business logic, API integrations, and data models work identically across web and mobile
- **Consistent Experience**: Same validation rules, calculations, and real-time sync across all platforms
- **Faster Development**: New features automatically work on both platforms
- **Mobile-First Moving Operations**: Field crews use mobile apps, office staff use web dashboard
- **Real-Time Sync**: Live updates between all users regardless of platform

#### **Platform-Specific Features:**
**Web Dashboard (Next.js):**
- Comprehensive admin interface with advanced reporting
- Complex data visualization with Tremor charts
- Multi-window workflow management
- Advanced filtering and bulk operations

**Mobile App (Expo):**
- On-site estimate creation with camera integration
- GPS tracking and route optimization
- Offline-capable lead capture
- Voice-to-text note taking
- Crew dispatch and real-time updates

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
1. **Shared Logic First**: Build business rules, API clients, and data models in shared packages
2. **UI Layer Implementation**: Create platform-specific interfaces that consume shared logic
3. **Feature Parity**: Ensure core functionality works across all platforms
4. **Platform Optimization**: Leverage platform-specific capabilities where beneficial

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

### Development Tools & Resources

**GitHub Repositories**
- Next.js Examples: https://github.com/vercel/next.js/tree/canary/examples
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples
- React Patterns: https://github.com/reactpatterns/reactpatterns.com

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
