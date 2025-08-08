# Crew Mobile App PRP - Field Operations for Moving Crews

## Goal
Create a specialized React Native/Expo mobile application designed specifically for field crews performing moving services. This app focuses on job execution workflows, time tracking, photo documentation, customer interaction, and real-time communication with dispatch, optimized for the unique needs of moving crew operations.

## Why
- **Field-Specific Workflows**: Moving crews need specialized tools for job execution, not general CRM features
- **Role-Based Functionality**: Different access levels for Crew Leaders, Experienced Movers, New Movers, and Drivers
- **Real-Time Job Updates**: Crews need to update job status and communicate progress instantly
- **Documentation Requirements**: Photo documentation, damage reports, and customer signatures are critical
- **Offline Reliability**: Field locations may have poor connectivity, requiring robust offline capability
- **Time Tracking Accuracy**: GPS-verified time tracking with detailed job phase breakdown

## What
Specialized React Native/Expo application with crew-focused workflows including job execution phases, GPS time tracking with adjustment capabilities, photo documentation, payment processing, digital contracts, real-time communication, and equipment management.

### Success Criteria
- [ ] Role-based access for crew hierarchy (Leader, Experienced, New, Driver)
- [ ] Complete job execution workflow from pre-move to completion
- [ ] GPS-verified time tracking with manual adjustment capability
- [ ] Comprehensive photo documentation system
- [ ] Digital contract signing and payment processing (Crew Leaders only)
- [ ] Real-time communication with dispatch and customers
- [ ] Equipment check-out system with QR code scanning
- [ ] Incident reporting with photo and GPS evidence
- [ ] Offline capability with intelligent sync
- [ ] Customer interaction tools and satisfaction surveys

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.expo.dev/
  why: Expo framework for React Native development with GPS and camera
  
- url: https://docs.expo.dev/versions/latest/sdk/location/
  why: GPS tracking and location services for time verification
  
- url: https://docs.expo.dev/versions/latest/sdk/camera/
  why: Photo and video documentation capabilities
  
- url: https://docs.expo.dev/versions/latest/sdk/signature-pad/
  why: Digital signature capture for contracts
  
- url: https://docs.expo.dev/versions/latest/sdk/sqlite/
  why: Local database for offline job data
  
- url: https://stripe.dev/stripe-terminal
  why: Mobile payment processing for field transactions
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/estimationUtils.ts
  why: Job pricing and calculation logic for crew reference
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/supabase/client.ts
  why: Real-time database integration patterns
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/INITIAL.md
  why: Complete crew app specifications and business requirements
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/CLAUDE.md
  why: Shared business logic patterns and development standards
```

### Current Codebase Tree
```bash
packages/shared/                # Shared business logic (reuse 80%+)
├── api/                       # Job management and crew operations
├── types/                     # Crew and job type definitions
├── utils/                     # Time calculations and validation
└── integrations/              # Real-time communication services

packages/crm-mobile/           # Patterns to adapt for crew-specific needs
├── components/ui/             # Base UI components to reuse
├── hooks/                     # Location and camera hooks
└── lib/                       # Mobile utilities and constants
```

### Desired Codebase Tree (Crew Mobile App)
```bash
packages/crew-mobile/          # React Native/Expo crew application
├── app/                       # Expo Router file-based routing
│   ├── (auth)/               # Crew authentication
│   │   ├── login.tsx
│   │   ├── crew-selection.tsx
│   │   └── permissions.tsx
│   ├── (tabs)/               # Main crew navigation
│   │   ├── jobs/
│   │   │   ├── index.tsx     # Today's jobs list
│   │   │   ├── [id]/
│   │   │   │   ├── index.tsx # Job overview
│   │   │   │   ├── pre-move.tsx
│   │   │   │   ├── pickup.tsx
│   │   │   │   ├── transit.tsx
│   │   │   │   ├── delivery.tsx
│   │   │   │   └── completion.tsx
│   │   │   └── history.tsx
│   │   ├── time-clock/
│   │   │   ├── index.tsx     # Time tracking dashboard
│   │   │   ├── clock-in.tsx
│   │   │   ├── break.tsx
│   │   │   └── adjustments.tsx
│   │   ├── equipment/
│   │   │   ├── index.tsx     # Equipment status
│   │   │   ├── checkout.tsx
│   │   │   ├── checkin.tsx
│   │   │   └── inventory.tsx
│   │   ├── communication/
│   │   │   ├── index.tsx     # Messages with dispatch
│   │   │   ├── customer.tsx  # Customer communication
│   │   │   └── emergency.tsx
│   │   └── profile.tsx       # Crew member profile
│   ├── payment/              # Payment processing (Crew Leaders)
│   │   ├── index.tsx
│   │   ├── process.tsx
│   │   └── history.tsx
│   ├── contracts/            # Digital contracts
│   │   ├── review.tsx
│   │   ├── sign.tsx
│   │   └── customer-sign.tsx
│   ├── incidents/            # Incident reporting
│   │   ├── index.tsx
│   │   ├── report.tsx
│   │   └── damage-claims.tsx  
│   ├── photos/               # Photo documentation
│   │   ├── index.tsx
│   │   ├── before.tsx
│   │   ├── during.tsx
│   │   ├── after.tsx
│   │   └── damage.tsx
│   ├── customer-interaction/ # Customer-facing features
│   │   ├── check-in.tsx
│   │   ├── updates.tsx
│   │   ├── satisfaction.tsx
│   │   └── final-walkthrough.tsx
│   ├── _layout.tsx           # Root layout with crew context
│   └── +not-found.tsx       # 404 page
├── components/               # Crew-specific components
│   ├── ui/                   # Base UI components
│   │   ├── CrewButton.tsx
│   │   ├── JobCard.tsx
│   │   ├── TimeDisplay.tsx
│   │   ├── StatusBadge.tsx
│   │   └── PhaseIndicator.tsx
│   ├── job-execution/        # Job workflow components
│   │   ├── JobOverview.tsx
│   │   ├── PhaseNavigation.tsx
│   │   ├── TaskChecklist.tsx
│   │   ├── TimeTracker.tsx
│   │   └── ProgressIndicator.tsx
│   ├── time-tracking/        # Time management components
│   │   ├── ClockInOut.tsx
│   │   ├── BreakTimer.tsx
│   │   ├── GPSVerification.tsx
│   │   ├── TimeAdjustment.tsx
│   │   └── DailyTimesheet.tsx
│   ├── photo-documentation/  # Photo and documentation
│   │   ├── PhotoCapture.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── PhotoAnnotation.tsx
│   │   ├── DamageReport.tsx
│   │   └── BeforeAfterView.tsx
│   ├── equipment/            # Equipment management
│   │   ├── QRScanner.tsx
│   │   ├── EquipmentList.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── ConditionReport.tsx
│   │   └── InventorySearch.tsx
│   ├── customer/             # Customer interaction
│   │   ├── CustomerInfo.tsx
│   │   ├── ContactMethods.tsx
│   │   ├── SatisfactionSurvey.tsx
│   │   ├── SignaturePad.tsx
│   │   └── FinalWalkthrough.tsx
│   ├── communication/        # Communication components
│   │   ├── DispatchChat.tsx
│   │   ├── CustomerUpdates.tsx
│   │   ├── EmergencyContacts.tsx
│   │   ├── VoiceMessage.tsx
│   │   └── StatusUpdates.tsx
│   ├── payment/              # Payment processing
│   │   ├── PaymentTerminal.tsx
│   │   ├── InvoiceDisplay.tsx
│   │   ├── PaymentMethods.tsx
│   │   ├── ReceiptPrinter.tsx
│   │   └── PaymentHistory.tsx
│   └── offline/              # Offline functionality
│       ├── SyncStatus.tsx
│       ├── OfflineIndicator.tsx
│       ├── DataQueue.tsx
│       └── ConflictResolver.tsx
├── hooks/                    # Crew-specific hooks
│   ├── useJobExecution.ts    # Job workflow management
│   ├── useTimeTracking.ts    # GPS time tracking
│   ├── usePhotoDoc.ts        # Photo documentation
│   ├── useEquipment.ts       # Equipment check-in/out
│   ├── useCustomerComms.ts   # Customer communication
│   ├── usePaymentTerminal.ts # Payment processing
│   ├── useOfflineJobs.ts     # Offline job management
│   └── useCrewPermissions.ts # Role-based access
├── lib/                      # Crew app utilities
│   ├── job-phases.ts         # Job execution phase logic
│   ├── time-calculations.ts  # Time tracking calculations
│   ├── gps-verification.ts   # Location verification
│   ├── photo-storage.ts      # Photo management
│   ├── equipment-tracking.ts # Equipment management
│   ├── payment-processing.ts # Stripe Terminal integration
│   ├── offline-storage.ts    # SQLite for offline jobs
│   └── crew-constants.ts     # Crew app constants
├── stores/                   # Crew state management
│   ├── jobStore.ts           # Current job state
│   ├── timeStore.ts          # Time tracking state
│   ├── equipmentStore.ts     # Equipment status
│   ├── photoStore.ts         # Photo documentation
│   ├── customerStore.ts      # Customer information
│   └── crewStore.ts          # Crew member data
├── types/                    # Crew-specific types
│   ├── job-execution.ts      # Job workflow types
│   ├── time-tracking.ts      # Time management types
│   ├── equipment.ts          # Equipment types
│   ├── crew-roles.ts         # Permission types
│   └── customer-interaction.ts # Customer interface types
├── app.json                  # Expo configuration for crew app
├── package.json              # Crew app dependencies
└── tailwind.config.js        # NativeWind styling
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: GPS accuracy and battery management
// Example: Background location tracking requires special permissions
// Example: GPS verification must handle indoor/poor signal scenarios
// Example: Battery optimization for all-day field use

// GOTCHA: Role-based functionality restrictions
// Example: Only Crew Leaders can process payments
// Example: New Movers have limited access to certain features
// Example: Driver-specific functionality for transportation phases

// GOTCHA: Offline reliability in field conditions
// Example: Jobs must be fully functional without internet
// Example: Photo storage and sync optimization
// Example: Time tracking must work in all conditions

// GOTCHA: Hardware integration complexity
// Example: Payment terminal integration with Stripe
// Example: QR code scanning for equipment management
// Example: Digital signature capture and storage
```

## Implementation Blueprint

### Data Models and Structure

Crew-specific interfaces extending shared backend types:

```typescript
// Job execution workflow types
export interface JobPhase {
  id: string;
  name: 'pre-move' | 'pickup' | 'transit' | 'delivery' | 'completion';
  status: 'pending' | 'in-progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  tasks: JobTask[];
  photos: PhotoDoc[];
  notes: string;
}

export interface JobTask {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  photoRequired: boolean;
  assignedRole?: CrewRole;
}

// Time tracking with GPS verification
export interface TimeEntry {
  id: string;
  crewMemberId: string;
  jobId: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
  timestamp: Date;
  gpsLocation: GPSLocation;
  gpsVerified: boolean;
  adjustedTime?: Date;  
  adjustmentReason?: string;
  approvedBy?: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  verified: boolean;
}

// Equipment management
export interface EquipmentItem {
  id: string;
  qrCode: string;
  name: string;
  category: 'truck' | 'dolly' | 'blanket' | 'strap' | 'tool';
  status: 'available' | 'checked-out' | 'in-use' | 'maintenance';
  checkedOutBy?: string;
  checkedOutAt?: Date;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  lastInspection: Date;
}

// Crew member roles and permissions
export type CrewRole = 'crew-leader' | 'experienced-mover' | 'new-mover' | 'driver';

export interface CrewPermissions {
  canProcessPayments: boolean;
  canSignContracts: boolean;
  canAdjustTime: boolean;
  canReportIncidents: boolean;
  canManageEquipment: boolean;
  canCommunicateWithCustomer: boolean;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Crew App Foundation & Authentication
CREATE packages/crew-mobile/app.json:
  - CONFIGURE Expo app for crew-specific permissions
  - ADD GPS background tracking permissions
  - SETUP camera and signature capture capabilities
  - CONFIGURE offline storage and sync
  - INCLUDE crew app branding and icons

Task 2: Role-Based Authentication System
CREATE packages/crew-mobile/app/(auth)/:
  - CREATE login.tsx with crew member authentication
  - ADD crew-selection.tsx for multi-crew device support
  - IMPLEMENT role-based permission assignment
  - CREATE GPS permission request flow
  - ADD offline authentication capability

Task 3: Job Management & Execution Flow
CREATE packages/crew-mobile/app/(tabs)/jobs/:
  - CREATE index.tsx with today's assigned jobs
  - ADD job detail pages with phase navigation
  - IMPLEMENT job status progression workflow
  - CREATE task checklist with completion tracking
  - ADD real-time job updates to dispatch

Task 4: GPS Time Tracking System
CREATE packages/crew-mobile/app/(tabs)/time-clock/:
  - CREATE index.tsx with time tracking dashboard
  - ADD GPS-verified clock in/out functionality
  - IMPLEMENT break tracking with location verification
  - CREATE time adjustment requests for crew leaders
  - ADD daily timesheet view with GPS verification

Task 5: Photo Documentation System
CREATE packages/crew-mobile/app/photos/:
  - CREATE comprehensive photo capture interface
  - ADD before/during/after move documentation
  - IMPLEMENT damage reporting with photo evidence
  - CREATE photo annotation and markup tools
  - ADD automatic photo organization by job phase

Task 6: Equipment Management & QR Scanning
CREATE packages/crew-mobile/app/(tabs)/equipment/:
  - CREATE equipment status dashboard
  - ADD QR code scanning for check-in/out
  - IMPLEMENT equipment condition reporting
  - CREATE inventory search and management
  - ADD maintenance alert system

Task 7: Customer Interaction Interface
CREATE packages/crew-mobile/app/customer-interaction/:
  - CREATE customer check-in process
  - ADD progress updates and communication tools
  - IMPLEMENT customer satisfaction surveys
  - CREATE final walkthrough checklist
  - ADD customer signature capture

Task 8: Digital Contracts & Signatures
CREATE packages/crew-mobile/app/contracts/:
  - CREATE contract review interface
  - ADD digital signature capture for crew
  - IMPLEMENT customer signature workflow
  - CREATE contract modification handling
  - ADD signed document storage and sync

Task 9: Payment Processing (Crew Leaders Only)
CREATE packages/crew-mobile/app/payment/:
  - CREATE Stripe Terminal integration
  - ADD payment processing interface
  - IMPLEMENT receipt generation and printing
  - CREATE payment history tracking
  - ADD refund and adjustment capabilities

Task 10: Real-Time Communication System
CREATE packages/crew-mobile/app/(tabs)/communication/:
  - CREATE dispatch communication interface
  - ADD customer messaging tools
  - IMPLEMENT emergency contact system
  - CREATE voice message recording
  - ADD automatic status update notifications

Task 11: Incident Reporting System
CREATE packages/crew-mobile/app/incidents/:
  - CREATE incident report form
  - ADD photo documentation for incidents
  - IMPLEMENT GPS-stamped incident locations
  - CREATE damage claim workflow
  - ADD emergency escalation procedures

Task 12: Job Phase Workflow Management
CREATE packages/crew-mobile/hooks/useJobExecution.ts:
  - IMPLEMENT phase-based job progression
  - ADD task completion tracking
  - CREATE phase validation and requirements
  - IMPLEMENT automatic phase transitions
  - ADD progress reporting to dispatch

Task 13: Offline Job Management
CREATE packages/crew-mobile/lib/offline-storage.ts:
  - SETUP SQLite for complete job data storage
  - CREATE offline job execution capability
  - IMPLEMENT photo storage with compression
  - ADD sync queue with conflict resolution
  - CREATE offline time tracking backup

Task 14: GPS Verification & Location Services
CREATE packages/crew-mobile/lib/gps-verification.ts:
  - IMPLEMENT background GPS tracking
  - ADD location verification for time entries
  - CREATE geofencing for job sites
  - IMPLEMENT route tracking for transit
  - ADD GPS accuracy monitoring

Task 15: Equipment Tracking Integration
CREATE packages/crew-mobile/hooks/useEquipment.ts:
  - CREATE QR code scanning functionality
  - ADD equipment check-in/out workflows
  - IMPLEMENT condition reporting system
  - CREATE equipment location tracking
  - ADD maintenance scheduling integration

Task 16: Customer Communication Tools
CREATE packages/crew-mobile/hooks/useCustomerComms.ts:
  - CREATE customer notification system
  - ADD progress update automation
  - IMPLEMENT customer feedback collection
  - CREATE service quality monitoring
  - ADD customer preference tracking

Task 17: Crew Performance Analytics
CREATE packages/crew-mobile/components/analytics/:
  - CREATE individual performance metrics
  - ADD time efficiency tracking
  - IMPLEMENT quality score monitoring
  - CREATE improvement recommendations
  - ADD peer comparison analytics

Task 18: Offline Sync & Conflict Resolution
CREATE packages/crew-mobile/lib/sync-manager.ts:
  - IMPLEMENT intelligent sync prioritization
  - ADD conflict resolution for overlapping edits
  - CREATE batch upload optimization
  - IMPLEMENT partial sync for large data sets
  - ADD sync status monitoring and reporting
```

### Per Task Pseudocode

```typescript
// Task 3: Job Execution Workflow
export default function JobDetailScreen({ jobId }: { jobId: string }) {
  const [currentPhase, setCurrentPhase] = useState<JobPhase>('pre-move');
  const [jobData, setJobData] = useState<Job | null>(null);
  
  const phases: JobPhase[] = [
    { id: 'pre-move', name: 'Pre-Move Setup', tasks: preMoveTasks },
    { id: 'pickup', name: 'Pickup', tasks: pickupTasks },
    { id: 'transit', name: 'Transit', tasks: transitTasks },
    { id: 'delivery', name: 'Delivery', tasks: deliveryTasks },
    { id: 'completion', name: 'Completion', tasks: completionTasks }
  ];

  return (
    <View className="flex-1">
      <JobHeader job={jobData} />
      <PhaseNavigation 
        phases={phases} 
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
      />
      <TaskChecklist 
        tasks={phases.find(p => p.id === currentPhase)?.tasks}
        onTaskComplete={handleTaskComplete}
      />
      <PhaseActions 
        phase={currentPhase}
        onNextPhase={advanceToNextPhase}
      />
    </View>
  );
}

// Task 4: GPS Time Tracking
export function useTimeTracking() {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  
  const clockIn = async (jobId: string) => {
    const currentLocation = await getCurrentLocation();
    const timeEntry: TimeEntry = {
      id: generateId(),
      crewMemberId: getCurrentCrewMember().id,
      jobId,
      type: 'clock-in',
      timestamp: new Date(),
      gpsLocation: currentLocation,
      gpsVerified: currentLocation.accuracy < 50 // 50 meter accuracy
    };
    
    await saveTimeEntry(timeEntry);
    setClockedIn(true);
    
    // Start background location tracking
    await startLocationTracking();
  };
  
  const clockOut = async () => {
    const currentLocation = await getCurrentLocation();
    const timeEntry: TimeEntry = {
      id: generateId(),
      crewMemberId: getCurrentCrewMember().id,
      jobId: getCurrentJob().id,
      type: 'clock-out',
      timestamp: new Date(),
      gpsLocation: currentLocation,
      gpsVerified: currentLocation.accuracy < 50
    };
    
    await saveTimeEntry(timeEntry);
    setClockedIn(false);
    
    // Stop background location tracking
    await stopLocationTracking();
  };
  
  return { clockIn, clockOut, clockedIn, location };
}

// Task 9: Payment Processing (Crew Leaders Only)
export default function PaymentScreen({ jobId }: { jobId: string }) {
  const [terminal, setTerminal] = useState<StripeTerminal | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const { permissions } = useCrewPermissions();
  
  if (!permissions.canProcessPayments) {
    return <UnauthorizedAccess />;
  }
  
  const processPayment = async (amount: number, method: PaymentMethod) => {
    try {
      // Initialize Stripe Terminal
      const terminal = await initializeStripeTerminal();
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent(amount, jobId);
      
      // Collect payment
      const result = await terminal.collectPaymentMethod(paymentIntent);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Process payment
      const confirmation = await confirmPayment(result.paymentIntent);
      
      // Generate receipt
      const receipt = await generateReceipt(confirmation);
      
      // Update job status
      await updateJobPaymentStatus(jobId, 'paid');
      
      return { success: true, receipt };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  return (
    <ScrollView className="p-4">
      <InvoiceDisplay invoice={invoice} />
      <PaymentMethods onPaymentProcess={processPayment} />
      <PaymentTerminal terminal={terminal} />
    </ScrollView>
  );
}

// Task 13: Offline Job Management
export class OfflineJobManager {
  private database: SQLiteDatabase;
  private syncQueue: OfflineAction[] = [];
  
  async storeJobOffline(job: Job) {
    // Store complete job data locally
    await this.database.insert('offline_jobs', {
      id: job.id,
      data: JSON.stringify(job),
      lastModified: new Date(),
      synced: false
    });
    
    // Cache related data (customer, addresses, equipment)
    await this.cacheJobDependencies(job);
  }
  
  async executeJobOffline(jobId: string) {
    const job = await this.database.query('offline_jobs', { id: jobId });
    
    if (!job) {
      throw new Error('Job not available offline');
    }
    
    // Allow full job execution without network
    return {
      phases: job.phases,
      tasks: job.tasks,
      customer: job.customer,
      equipment: job.equipment,
      canExecute: true
    };
  }
  
  async syncWhenOnline() {
    if (!this.isOnline()) return;
    
    const pendingJobs = await this.database.query('offline_jobs', { synced: false });
    
    for (const job of pendingJobs) {
      try {
        await this.syncJobToServer(job);
        await this.database.update('offline_jobs', { id: job.id, synced: true });
      } catch (error) {
        console.error('Job sync failed:', job.id, error);
      }
    }
  }
}
```

### Integration Points
```yaml
SHARED_BACKEND:
  - consume: packages/shared/api/* for job and crew operations
  - realtime: Job status updates and dispatch communication
  - sync: Offline job data with intelligent conflict resolution
  
NATIVE_HARDWARE:
  - gps: Background location tracking and verification
  - camera: Photo documentation and QR code scanning
  - signature: Digital signature capture for contracts
  - payment: Stripe Terminal for card processing
  
ROLE_PERMISSIONS:
  - crew-leader: Full access including payments and contracts
  - experienced-mover: Most features except financial operations
  - new-mover: Limited access with supervision requirements
  - driver: Transportation-focused features only
  
OFFLINE_CAPABILITY:
  - jobs: Complete job execution without internet
  - photos: Local storage with background sync
  - time: GPS-verified time tracking offline
  - equipment: QR scanning and tracking offline
```

## Validation Loop

### Level 1: Role-Based Access Testing
```bash
# Test different crew member roles
# Log in as crew leader - verify payment processing access
# Log in as new mover - verify limited feature access
# Log in as driver - verify transportation-focused features
# Test permission enforcement across all features

# Expected: Proper role-based access control working
```

### Level 2: Job Execution Workflow Testing
```typescript
// CREATE __tests__/job-execution.test.tsx
describe('Job Execution Workflow', () => {
  test('job phases progress in correct order', async () => {
    const { result } = renderHook(() => useJobExecution(mockJobId));
    
    expect(result.current.currentPhase).toBe('pre-move');
    
    await act(async () => {
      await result.current.completePhase('pre-move');
    });
    
    expect(result.current.currentPhase).toBe('pickup');
  });

  test('GPS time tracking records accurate location', async () => {
    const mockLocation = { latitude: 40.7128, longitude: -74.0060, accuracy: 5 };
    mockGeolocation.getCurrentPosition.mockResolvedValue(mockLocation);
    
    const { result } = renderHook(() => useTimeTracking());
    
    await act(async () => {
      await result.current.clockIn(mockJobId);
    });
    
    expect(mockDatabase.insert).toHaveBeenCalledWith(
      'time_entries',
      expect.objectContaining({
        gpsLocation: mockLocation,
        gpsVerified: true
      })
    );
  });

  test('photo documentation stores with job context', async () => {
    render(<PhotoCapture jobId={mockJobId} phase="pickup" />);
    
    fireEvent.press(screen.getByText('Take Photo'));
    
    await waitFor(() => {
      expect(mockPhotoStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: mockJobId,
          phase: 'pickup',
          timestamp: expect.any(Date)
        })
      );
    });
  });
});
```

### Level 3: Offline Functionality Testing
```bash
# Test complete offline job execution
# Turn off internet connection
# Execute full job workflow from start to finish
# Take photos, track time, complete tasks
# Turn internet back on
# Verify all data syncs correctly to server

# Expected: Complete job execution works offline
```

### Level 4: Hardware Integration Testing
```bash
# Test all hardware integrations
# GPS: Verify location accuracy and background tracking
# Camera: Test photo capture and QR code scanning
# Payment Terminal: Process test payments with Stripe
# Signature Pad: Capture and store digital signatures
# Contacts: Access device contacts for emergency situations

# Expected: All hardware features work reliably
```

## Final Validation Checklist
- [ ] Role-based access working properly: Permission testing across crew types
- [ ] Complete job execution workflow: End-to-end job testing
- [ ] GPS time tracking accurate: Location verification testing
- [ ] Photo documentation organized: Image storage and retrieval testing
- [ ] Equipment management functional: QR code and inventory testing
- [ ] Customer interaction tools working: Communication and survey testing
- [ ] Payment processing secure: Transaction testing for crew leaders
- [ ] Offline functionality complete: Network disconnection testing
- [ ] Real-time sync reliable: Multi-device synchronization testing
- [ ] Performance optimized for field use: Battery and resource testing

---

## Anti-Patterns to Avoid
- ❌ Don't ignore GPS accuracy issues - handle poor signal scenarios gracefully
- ❌ Don't skip role permission checks - enforce crew hierarchy properly
- ❌ Don't forget offline reliability - crews work in areas with poor connectivity
- ❌ Don't ignore battery optimization - crews need all-day usage
- ❌ Don't skip data validation - field data entry is prone to errors
- ❌ Don't forget photo compression - minimize data usage and storage
- ❌ Don't ignore security - protect customer data and payment information
- ❌ Don't skip hardware testing - payment terminals and scanners must work reliably

**Confidence Level: 8/10** - Comprehensive crew-focused functionality with detailed hardware integration, offline capability, and role-based workflows for successful field operations.