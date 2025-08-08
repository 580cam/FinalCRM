# CRM Mobile App PRP - Full CRM Access for Mobile Users

## Goal
Create a comprehensive React Native/Expo mobile application that provides complete CRM functionality optimized for mobile devices. This app gives sales teams, managers, and office staff full access to all CRM features while on-the-go, with touch-optimized interfaces and mobile-specific features like GPS, camera, and offline capability.

## Why
- **Mobile-First Business**: Sales teams and managers need full CRM access while traveling and meeting customers
- **Field Operations**: On-site customer visits require instant access to quotes, schedules, and customer data
- **Real-Time Coordination**: Mobile teams need live updates on leads, jobs, and schedule changes
- **Enhanced Productivity**: Native mobile features (camera, GPS, voice-to-text) streamline data entry
- **Offline Capability**: Critical functionality must work without internet connection

## What
Complete React Native/Expo mobile application with feature parity to the web CRM, optimized for mobile workflows, including native device integrations, offline synchronization, and touch-optimized user interfaces.

### Success Criteria
- [ ] Complete feature parity with web CRM across all 12 modules
- [ ] Touch-optimized interfaces for mobile interaction patterns
- [ ] Native device integrations (camera, GPS, contacts, voice)
- [ ] Offline capability with intelligent sync when reconnected
- [ ] Push notifications for real-time business updates
- [ ] Voice-to-text for hands-free data entry
- [ ] Mobile-optimized data visualization and charts
- [ ] Cross-platform performance (iOS and Android)
- [ ] Biometric authentication and security features

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.expo.dev/
  why: Expo framework for React Native development and deployment
  
- url: https://reactnative.dev/docs/getting-started
  why: React Native core concepts and component patterns
  
- url: https://docs.expo.dev/guides/using-supabase/
  why: Supabase integration patterns for React Native
  
- url: https://nativewind.dev/
  why: Tailwind CSS for React Native styling
  
- url: https://docs.expo.dev/versions/latest/sdk/sqlite/
  why: Local database for offline functionality
  
- url: https://docs.expo.dev/push-notifications/overview/
  why: Push notification implementation
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/CreateLeadModal.tsx
  why: Complex form patterns to adapt for mobile
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/components/dashboard/dashboard-content.tsx
  why: Dashboard data patterns to optimize for mobile
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/examples/supabase/client.ts
  why: Database client patterns for React Native
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/INITIAL.md
  why: Complete business requirements and mobile-specific features
  
- file: /mnt/c/Users/killa/OneDrive/Desktop/FinalCRM/context_engineering/CLAUDE.md
  why: Cross-platform development standards and shared code patterns
```

### Current Codebase Tree
```bash
packages/shared/                # Shared business logic (80%+ reuse)
├── api/                       # Business logic functions
├── types/                     # TypeScript definitions
├── utils/                     # Calculation and validation utilities
└── integrations/              # Third-party service integrations

packages/crm-web/              # Web patterns to adapt for mobile
├── components/                # UI components to translate
├── hooks/                     # React hooks to reuse
└── lib/                       # Utilities and constants
```

### Desired Codebase Tree (CRM Mobile App)
```bash
packages/crm-mobile/           # React Native/Expo mobile app
├── app/                       # Expo Router file-based routing
│   ├── (auth)/               # Authentication flow
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── biometric-setup.tsx
│   ├── (tabs)/               # Main tabbed navigation
│   │   ├── dashboard/
│   │   │   ├── index.tsx
│   │   │   └── analytics.tsx
│   │   ├── leads/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── create.tsx
│   │   ├── customers/
│   │   │   ├── index.tsx
│   │   │   ├── [id]/
│   │   │   └── search.tsx
│   │   ├── pipeline/
│   │   │   ├── index.tsx
│   │   │   └── kanban.tsx
│   │   └── more.tsx          # Additional modules menu
│   ├── dispatch/             # Dispatch and scheduling
│   │   ├── calendar.tsx
│   │   ├── fleet-map.tsx
│   │   └── crew-assignment.tsx
│   ├── customer-service/     # Customer service module
│   │   ├── index.tsx
│   │   ├── claims.tsx
│   │   └── reviews.tsx
│   ├── voice-center/         # AI voice center
│   │   ├── index.tsx
│   │   ├── active-calls.tsx
│   │   └── call-coaching.tsx
│   ├── marketing/            # Marketing management
│   │   ├── index.tsx
│   │   ├── campaigns.tsx
│   │   └── social-media.tsx
│   ├── accounting/           # Financial management
│   │   ├── index.tsx
│   │   ├── invoices.tsx
│   │   └── payments.tsx
│   ├── reports/              # Business intelligence
│   │   ├── index.tsx
│   │   ├── analytics.tsx
│   │   └── custom-reports.tsx
│   ├── fleet/                # Fleet management
│   │   ├── index.tsx
│   │   ├── vehicles.tsx
│   │   └── qr-scanner.tsx
│   ├── settings/             # App settings
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   ├── notifications.tsx
│   │   └── sync.tsx
│   ├── inbox/                # Communication inbox
│   │   ├── index.tsx
│   │   ├── conversations.tsx
│   │   └── compose.tsx
│   ├── _layout.tsx           # Root layout with providers
│   └── +not-found.tsx       # 404 page
├── components/               # React Native components
│   ├── ui/                   # Base UI components (adapted from web)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── charts/               # Mobile-optimized charts
│   │   ├── LineChart.tsx
│   │   ├── PieChart.tsx
│   │   └── BarChart.tsx
│   ├── forms/                # Form components
│   │   ├── LeadForm.tsx
│   │   ├── CustomerForm.tsx
│   │   └── AddressInput.tsx
│   ├── lists/                # List and table components
│   │   ├── LeadsList.tsx
│   │   ├── CustomersList.tsx
│   │   └── InfiniteScrollList.tsx
│   ├── maps/                 # Map components
│   │   ├── FleetMap.tsx
│   │   ├── CustomerMap.tsx
│   │   └── RouteMap.tsx
│   ├── camera/               # Camera integration
│   │   ├── PhotoCapture.tsx
│   │   ├── QRScanner.tsx
│   │   └── DocumentScanner.tsx
│   └── offline/              # Offline functionality
│       ├── SyncIndicator.tsx
│       ├── OfflineManager.tsx
│       └── DataQueue.tsx
├── hooks/                    # Custom React Native hooks
│   ├── useAuth.ts            # Authentication with biometrics
│   ├── useOffline.ts         # Offline state management
│   ├── useLocation.ts        # GPS and location services
│   ├── useCamera.ts          # Camera and photo management
│   ├── usePushNotifications.ts # Push notification handling
│   ├── useVoiceToText.ts     # Voice input functionality
│   └── useRealtime.ts        # Real-time subscriptions
├── lib/                      # Mobile-specific utilities
│   ├── database.ts           # SQLite for offline storage
│   ├── sync.ts               # Data synchronization logic
│   ├── permissions.ts        # Device permission management
│   ├── biometrics.ts         # Biometric authentication
│   ├── notifications.ts      # Push notification handling
│   └── constants.ts          # Mobile app constants
├── stores/                   # State management
│   ├── authStore.ts          # Authentication state
│   ├── dataStore.ts          # Business data state
│   ├── offlineStore.ts       # Offline queue management
│   └── settingsStore.ts      # App settings and preferences
├── types/                    # Mobile-specific types
│   ├── navigation.ts         # Navigation param types
│   ├── components.ts         # Component prop types
│   └── native.ts             # Native feature types
├── app.json                  # Expo configuration
├── package.json              # Dependencies
└── tailwind.config.js        # NativeWind configuration
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: React Native vs React differences
// Example: Different navigation patterns (Expo Router vs React Router)
// Example: Platform-specific code for iOS vs Android differences
// Example: Native modules require different initialization patterns

// GOTCHA: Offline functionality requires careful state management
// Example: SQLite for local storage with sync queue
// Example: Optimistic updates with rollback on sync failure
// Example: Network state monitoring and automatic retry logic

// GOTCHA: Performance optimization for mobile devices
// Example: FlatList for large data sets instead of ScrollView
// Example: Image optimization and lazy loading patterns
// Example: Memory management for background processing

// GOTCHA: Platform permissions and security
// Example: Camera, location, contacts permissions
// Example: Biometric authentication setup
// Example: Secure storage for sensitive data
```

## Implementation Blueprint

### Data Models and Structure

Mobile-optimized interfaces extending the shared backend types:

```typescript
// Navigation types for Expo Router
export type RootTabParamList = {
  dashboard: undefined;
  leads: undefined;
  customers: undefined;
  pipeline: undefined;
  more: undefined;
};

export type LeadsStackParamList = {
  index: undefined;
  create: undefined;
  [id: string]: { leadId: string };
};

// Mobile-specific features
export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

export interface DeviceCapabilities {
  hasCamera: boolean;
  hasGPS: boolean;
  hasBiometrics: boolean;
  hasVoiceRecognition: boolean;
  supportsPushNotifications: boolean;
}

export interface MobileSettings {
  biometricEnabled: boolean;
  offlineModeEnabled: boolean;
  pushNotificationsEnabled: boolean;
  autoSyncEnabled: boolean;
  dataUsageOptimized: boolean;
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: Expo App Foundation
CREATE packages/crm-mobile/app.json:
  - CONFIGURE Expo app settings and build configuration
  - ADD required permissions (camera, location, contacts)
  - SETUP push notification configuration
  - CONFIGURE app icons and splash screens
  - INCLUDE platform-specific settings

Task 2: Authentication & Biometric Setup
CREATE packages/crm-mobile/app/(auth)/:
  - CREATE login.tsx with Supabase auth integration
  - ADD biometric authentication option
  - CREATE signup.tsx adapted for mobile
  - IMPLEMENT secure token storage
  - ADD offline authentication capability

Task 3: Core Navigation & Layout
CREATE packages/crm-mobile/app/_layout.tsx:
  - SETUP Expo Router with tab navigation
  - ADD authentication providers and context
  - IMPLEMENT theme and styling providers
  - CREATE offline status monitoring
  - ADD push notification handlers

Task 4: Dashboard Module (Mobile-Optimized)
CREATE packages/crm-mobile/app/(tabs)/dashboard/:
  - CREATE index.tsx with mobile-optimized KPI cards
  - ADD touch-friendly chart interactions
  - IMPLEMENT pull-to-refresh functionality
  - CREATE quick action buttons for common tasks
  - INCLUDE real-time data updates

Task 5: Lead Management (Touch-Optimized)
CREATE packages/crm-mobile/app/(tabs)/leads/:
  - CREATE index.tsx with searchable lead list
  - ADD create.tsx with mobile-optimized form
  - IMPLEMENT swipe actions for quick operations
  - CREATE voice-to-text for note taking
  - ADD photo capture for lead documentation

Task 6: Customer Management Module
CREATE packages/crm-mobile/app/(tabs)/customers/:
  - CREATE index.tsx with infinite scroll list
  - ADD customer detail pages with tabbed interface
  - IMPLEMENT contact integration (call, text, email)
  - CREATE GPS navigation to customer locations
  - ADD photo gallery for customer documentation

Task 7: Visual Sales Pipeline (Mobile)
CREATE packages/crm-mobile/app/(tabs)/pipeline/:
  - CREATE index.tsx with horizontal scrolling columns
  - ADD touch-friendly drag-and-drop functionality
  - IMPLEMENT quick status updates
  - CREATE filtering and search capabilities
  - ADD haptic feedback for interactions

Task 8: Dispatch & Fleet Management
CREATE packages/crm-mobile/app/dispatch/:
  - CREATE calendar.tsx with touch-friendly scheduling
  - ADD fleet-map.tsx with real-time GPS tracking
  - IMPLEMENT crew assignment interface
  - CREATE route optimization display
  - ADD push notifications for schedule changes

Task 9: Customer Service Module
CREATE packages/crm-mobile/app/customer-service/:
  - CREATE index.tsx with claims management
  - ADD photo capture for damage documentation
  - IMPLEMENT quick response templates
  - CREATE customer communication tools
  - ADD review management interface

Task 10: AI Voice Center (Mobile)
CREATE packages/crm-mobile/app/voice-center/:
  - CREATE index.tsx with active call monitoring
  - ADD call coaching interface with real-time suggestions
  - IMPLEMENT hands-free operation modes
  - CREATE voice command recognition
  - ADD call recording and playback

Task 11: Marketing Management
CREATE packages/crm-mobile/app/marketing/:
  - CREATE index.tsx with campaign overview
  - ADD social media posting interface
  - IMPLEMENT photo editing for social content
  - CREATE referral tracking dashboard
  - ADD quick campaign performance metrics

Task 12: Mobile Accounting Interface
CREATE packages/crm-mobile/app/accounting/:
  - CREATE index.tsx with financial overview
  - ADD invoice management with photo capture
  - IMPLEMENT payment processing interface
  - CREATE expense tracking with receipt scanning
  - ADD financial reporting dashboards

Task 13: Business Intelligence (Mobile)
CREATE packages/crm-mobile/app/reports/:
  - CREATE index.tsx with mobile-optimized charts
  - ADD interactive data visualization
  - IMPLEMENT report sharing functionality
  - CREATE custom report builder
  - ADD offline report viewing

Task 14: Fleet & QR Code Management
CREATE packages/crm-mobile/app/fleet/:
  - CREATE index.tsx with vehicle status overview
  - ADD qr-scanner.tsx for inventory management
  - IMPLEMENT equipment check-in/out process
  - CREATE maintenance scheduling interface
  - ADD photo documentation for inspections

Task 15: Unified Communication Inbox
CREATE packages/crm-mobile/app/inbox/:
  - CREATE index.tsx with unified message list
  - ADD conversation threading interface
  - IMPLEMENT voice message recording
  - CREATE quick response templates
  - ADD customer context display

Task 16: Offline Functionality & Sync
CREATE packages/crm-mobile/lib/database.ts:
  - SETUP SQLite for offline data storage
  - CREATE sync queue for offline actions
  - IMPLEMENT optimistic updates with rollback
  - ADD conflict resolution for data sync
  - CREATE background sync scheduling

Task 17: Native Device Integrations
CREATE packages/crm-mobile/hooks/:
  - CREATE useCamera.ts for photo/video capture
  - ADD useLocation.ts for GPS functionality
  - IMPLEMENT useBiometrics.ts for secure auth
  - CREATE useVoiceToText.ts for hands-free input
  - ADD useContacts.ts for device integration

Task 18: Push Notifications & Real-Time
CREATE packages/crm-mobile/lib/notifications.ts:
  - SETUP Expo push notification handling
  - CREATE notification categorization and routing
  - IMPLEMENT custom notification actions
  - ADD notification scheduling and management
  - CREATE real-time data push integration
```

### Per Task Pseudocode

```typescript
// Task 1: Expo App Configuration
{
  "expo": {
    "name": "Moving Company CRM",
    "slug": "moving-crm-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "permissions": [
      "CAMERA",
      "LOCATION",
      "CONTACTS",
      "NOTIFICATIONS",
      "BIOMETRIC"
    ],
    "plugins": [
      "expo-camera",
      "expo-location",
      "expo-local-authentication",
      "expo-contacts",
      "@react-native-async-storage/async-storage"
    ]
  }
}

// Task 4: Mobile Dashboard
export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 space-y-4">
        <StatsGrid stats={stats} />
        <QuickActions />
        <RecentActivity />
      </View>
    </ScrollView>
  );
}

// Task 5: Lead Management with Voice Input
export default function CreateLeadScreen() {
  const [formData, setFormData] = useState<LeadFormData>({});
  const [recording, setRecording] = useState(false);
  
  const handleVoiceInput = async (field: string) => {
    const transcript = await startVoiceRecognition();
    setFormData(prev => ({ ...prev, [field]: transcript }));
  };

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollView className="p-4">
        <View className="space-y-4">
          <View className="flex-row">
            <TextInput
              placeholder="Customer Name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              className="flex-1"
            />
            <TouchableOpacity onPress={() => handleVoiceInput('name')}>
              <MicrophoneIcon />
            </TouchableOpacity>
          </View>
          
          <CameraButton onPhotoTaken={handlePhotoCapture} />
          <LocationInput onLocationSelected={handleLocationSelect} />
          <SubmitButton onSubmit={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Task 16: Offline Sync Management
export class OfflineManager {
  private database: SQLiteDatabase;
  private syncQueue: OfflineAction[] = [];
  
  async addToSyncQueue(action: OfflineAction) {
    // Store action locally
    await this.database.insert('sync_queue', action);
    this.syncQueue.push(action);
    
    // Attempt immediate sync if online
    if (this.isOnline()) {
      await this.processSyncQueue();
    }
  }
  
  async processSyncQueue() {
    const pendingActions = this.syncQueue.filter(a => !a.synced);
    
    for (const action of pendingActions) {
      try {
        await this.syncAction(action);
        action.synced = true;
        await this.database.update('sync_queue', action);
      } catch (error) {
        console.error('Sync failed:', error);
        // Will retry on next sync attempt
      }
    }
  }
}
```

### Integration Points
```yaml
SHARED_BACKEND:
  - consume: packages/shared/api/* for all business logic
  - reuse: 80%+ of business logic from shared packages
  - integrate: same third-party services as web app
  
NATIVE_FEATURES:
  - camera: Photo capture and QR code scanning
  - gps: Location services and mapping
  - biometrics: Secure authentication
  - contacts: Device contact integration
  
DATA_SYNC:
  - offline: SQLite local storage with sync queue
  - realtime: Supabase subscriptions for live updates
  - conflict: Resolution strategies for data conflicts
  
PERFORMANCE:
  - lazy: Component lazy loading and code splitting
  - memory: Efficient list rendering with FlatList
  - battery: Background task optimization
```

## Validation Loop

### Level 1: App Installation & Setup
```bash
# Test app installation and configuration
npx expo install
npx expo run:ios
npx expo run:android

# Verify all dependencies installed correctly
# Test app launches without crashes on both platforms
# Check permissions are requested and granted

# Expected: App installs and launches successfully
```

### Level 2: Core Functionality Testing
```typescript
// CREATE __tests__/mobile.test.tsx
describe('Mobile App Core Functions', () => {
  test('authentication flow works with biometrics', async () => {
    render(<LoginScreen />);
    
    fireEvent.press(screen.getByText('Use Biometric Login'));
    await waitFor(() => {
      expect(mockBiometricAuth).toHaveBeenCalled();
    });
  });

  test('offline functionality stores data locally', async () => {
    const mockAction: OfflineAction = {
      type: 'create',
      table: 'leads',
      data: { name: 'John Doe' }
    };
    
    await offlineManager.addToSyncQueue(mockAction);
    const stored = await database.query('sync_queue');
    
    expect(stored).toContainEqual(mockAction);
  });

  test('camera integration captures photos', async () => {
    render(<PhotoCapture />);
    
    fireEvent.press(screen.getByText('Take Photo'));
    await waitFor(() => {
      expect(mockCamera.takePictureAsync).toHaveBeenCalled();
    });
  });
});
```

### Level 3: Device Integration Testing
```bash
# Test native device features
# Camera: Take photos and scan QR codes
# GPS: Get current location and navigation
# Voice: Record voice notes and voice-to-text
# Biometrics: Authenticate with fingerprint/face
# Contacts: Access device contacts for customer info

# Expected: All native features work properly
```

### Level 4: Offline & Sync Testing
```bash
# Test offline functionality
# Turn off internet connection
# Create leads, update customers, modify data
# Turn internet back on
# Verify all changes sync to server correctly
# Test conflict resolution with simultaneous edits

# Expected: Complete offline capability with reliable sync
```

## Final Validation Checklist
- [ ] App installs on iOS and Android: Platform testing
- [ ] All CRM modules accessible and functional: Feature parity testing
- [ ] Touch interfaces optimized for mobile: UX testing
- [ ] Native features working properly: Device integration testing
- [ ] Offline functionality complete: Network disconnection testing
- [ ] Real-time updates functioning: Multi-device testing
- [ ] Push notifications working: Notification testing
- [ ] Performance optimized for mobile: Load testing
- [ ] Data sync reliable and conflict-free: Sync testing
- [ ] Security and biometrics working: Authentication testing

---

## Anti-Patterns to Avoid
- ❌ Don't ignore platform differences - test on both iOS and Android
- ❌ Don't use web components directly - adapt for touch interfaces  
- ❌ Don't ignore offline scenarios - users expect mobile apps to work anywhere
- ❌ Don't forget performance optimization - mobile devices have limited resources
- ❌ Don't skip permission handling - respect user privacy and system security
- ❌ Don't ignore battery usage - optimize background processes
- ❌ Don't create inconsistent navigation - follow platform conventions
- ❌ Don't skip accessibility - ensure app is usable by all users

**Confidence Level: 8/10** - Comprehensive mobile development context with React Native patterns, offline functionality, and native integrations clearly defined for successful implementation.