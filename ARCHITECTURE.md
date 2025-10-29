# 🏗️ Multi-College Platform Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE (/)                          │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │  Join with Code      │        │   Get Started        │      │
│  │  [Enter: ABC123]     │        │  [Create College]    │      │
│  └──────────┬───────────┘        └──────────┬───────────┘      │
└─────────────┼──────────────────────────────┼──────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐          ┌─────────────────────┐
    │  COLLEGE BOOKING │          │  COLLEGE SETUP      │
    │  /college/{ID}   │          │  /setup             │
    └─────────┬────────┘          └──────────┬──────────┘
              │                               │
              │                               ▼
              │                    ┌─────────────────────┐
              │                    │  Generate Code      │
              │                    │  Initialize Bogies  │
              │                    │  Create Routes      │
              │                    └──────────┬──────────┘
              │                               │
              │                               ▼
              │                    ┌─────────────────────┐
              │                    │  SUCCESS SCREEN     │
              │                    │  Code: ABC123       │
              │                    └─────────────────────┘
              │
              ▼
    ┌─────────────────────────────────────────┐
    │         BOOKING INTERFACE                │
    │  ┌────────────┐  ┌────────────┐        │
    │  │ Select     │→ │ Select     │→       │
    │  │ Route      │  │ Bogie      │        │
    │  └────────────┘  └────────────┘        │
    │         │               │               │
    │         └───────┬───────┘               │
    │                 ▼                       │
    │         ┌────────────┐                  │
    │         │ Select     │                  │
    │         │ Seat       │                  │
    │         └─────┬──────┘                  │
    │               ▼                         │
    │         ┌────────────┐                  │
    │         │ Fill Form  │                  │
    │         │ & Confirm  │                  │
    │         └─────┬──────┘                  │
    │               ▼                         │
    │         ┌────────────┐                  │
    │         │ BOOKED! ✓  │                  │
    │         └────────────┘                  │
    └─────────────────────────────────────────┘
              │
              │ Admin Access
              ▼
    ┌─────────────────────────────────────────┐
    │      ADMIN PANEL (/college/{ID}/admin)   │
    │  ┌────────────┐  ┌────────────┐         │
    │  │ Password   │→ │ Dashboard  │         │
    │  │ Login      │  │ & Stats    │         │
    │  └────────────┘  └────────────┘         │
    │         │               │                │
    │         └───────┬───────┘                │
    │                 ▼                        │
    │  ┌──────────────────────────────┐       │
    │  │  View/Search/Filter Bookings │       │
    │  │  Cancel Bookings             │       │
    │  │  Export CSV                  │       │
    │  │  Real-time Statistics        │       │
    │  └──────────────────────────────┘       │
    └─────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION                         │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │           CollegeContext (State)                 │      │
│  │  - collegeId                                     │      │
│  │  - collegeData                                   │      │
│  │  - loading                                       │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐      │
│  │              PAGES LAYER                         │      │
│  │  - LandingPage                                   │      │
│  │  - CollegeSetupPage                              │      │
│  │  - CollegeBookingPage                            │      │
│  │  - CollegeAdminPage                              │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐      │
│  │           COMPONENTS LAYER                       │      │
│  │  - BogieSelector                                 │      │
│  │  - SleeperSeatMap                                │      │
│  │  - BookingModal                                  │      │
│  │  - RouteSelector                                 │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────┐      │
│  │            SERVICES LAYER                        │      │
│  │  - collegeService.js                             │      │
│  │  - multiCollegeService.js                        │      │
│  │  - realtimeService.js (legacy)                   │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE REALTIME DATABASE                      │
│                                                              │
│  colleges/                                                   │
│    ABC123/                                                   │
│      ├── name                                                │
│      ├── logoUrl                                             │
│      ├── adminPassword                                       │
│      ├── settings/                                           │
│      │   ├── bogies: ["s1", "s2", "s3"]                     │
│      │   ├── seatsPerBogie: 80                              │
│      │   └── routes: [...]                                  │
│      └── routes/                                             │
│          └── route1/                                         │
│              ├── bogies/                                     │
│              │   └── s1/                                     │
│              │       ├── seats: [...]                        │
│              │       ├── totalSeats: 80                      │
│              │       └── bookedSeats: 15                     │
│              └── bookings/                                   │
│                  └── booking1/                               │
│                      ├── userName                            │
│                      ├── email                               │
│                      ├── phone                               │
│                      └── seatNumber                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT COMPONENTS                            │
│                                                              │
│  CollegeBookingPage                                          │
│    │                                                         │
│    ├─→ RouteSelector ──→ handleRouteChange()                │
│    │                                                         │
│    ├─→ BogieSelector ──→ handleBogieChange()                │
│    │                                                         │
│    ├─→ SleeperSeatMap ─→ handleSeatClick()                  │
│    │                                                         │
│    └─→ BookingModal ───→ handleConfirmBooking()             │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE FUNCTIONS                           │
│                                                              │
│  multiCollegeService.bookCollegeSeat()                       │
│    │                                                         │
│    ├─→ checkCollegeUserExists()                             │
│    │     └─→ Query: colleges/{id}/routes/{rid}/bookings     │
│    │                                                         │
│    ├─→ runTransaction()                                      │
│    │     └─→ Update: colleges/{id}/routes/{rid}/bogies/{bid}│
│    │                                                         │
│    └─→ createBooking()                                       │
│          └─→ Write: colleges/{id}/routes/{rid}/bookings     │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  FIREBASE DATABASE                           │
│                                                              │
│  Transaction ensures:                                        │
│    ✓ Seat is available                                      │
│    ✓ No duplicate bookings                                  │
│    ✓ Atomic updates                                         │
│    ✓ Race condition prevention                              │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  REAL-TIME UPDATES                           │
│                                                              │
│  onValue() listeners trigger:                                │
│    → Update UI instantly                                     │
│    → Refresh seat availability                               │
│    → Update statistics                                       │
│    → Notify all connected clients                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE SECURITY RULES                         │
│                                                              │
│  colleges/{collegeId}/                                       │
│    .read: true              ← Anyone can read                │
│    .write: false            ← No direct write               │
│                                                              │
│    routes/{routeId}/                                         │
│      bogies/{bogieId}/                                       │
│        .read: true          ← Anyone can read                │
│        .write: auth != null ← Only authenticated (admin)     │
│                                                              │
│      bookings/{bookingId}/                                   │
│        .read: true          ← Anyone can read                │
│        .write:              ← Create OR admin                │
│          !data.exists() ||                                   │
│          auth != null                                        │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│                                                              │
│  Admin Functions:                                            │
│    ✓ Check localStorage: college_{id}_admin                 │
│    ✓ Verify password with college document                  │
│    ✓ Allow admin operations if authenticated                │
│                                                              │
│  User Functions:                                             │
│    ✓ Check email/phone uniqueness                           │
│    ✓ Validate seat availability                             │
│    ✓ Prevent duplicate bookings                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-College Isolation

```
┌──────────────────────────────────────────────────────────────┐
│                    FIREBASE DATABASE                          │
│                                                               │
│  colleges/                                                    │
│    │                                                          │
│    ├── ABC123/  ◄──── College 1 (Isolated)                   │
│    │   ├── settings/                                          │
│    │   └── routes/                                            │
│    │       ├── route1/                                        │
│    │       │   ├── bogies/                                    │
│    │       │   └── bookings/                                  │
│    │       └── route2/                                        │
│    │                                                          │
│    ├── XYZ789/  ◄──── College 2 (Isolated)                   │
│    │   ├── settings/                                          │
│    │   └── routes/                                            │
│    │       └── route1/                                        │
│    │           ├── bogies/                                    │
│    │           └── bookings/                                  │
│    │                                                          │
│    └── DEF456/  ◄──── College 3 (Isolated)                   │
│        ├── settings/                                          │
│        └── routes/                                            │
│            ├── route1/                                        │
│            └── route2/                                        │
│                                                               │
│  ✓ No data sharing between colleges                          │
│  ✓ Independent admin access                                  │
│  ✓ Separate booking systems                                  │
│  ✓ Isolated statistics                                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   CollegeContext                             │
│                                                              │
│  State:                                                      │
│    - collegeId: "ABC123"                                     │
│    - collegeData: { name, settings, ... }                   │
│    - loading: false                                          │
│    - error: null                                             │
│                                                              │
│  Methods:                                                    │
│    - setCollegeId(id)                                        │
│    - setCollegeData(data)                                    │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ useCollege() hook
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Booking  │ │  Admin   │ │  Setup   │
│   Page   │ │   Page   │ │   Page   │
└──────────┘ └──────────┘ └──────────┘
      │            │            │
      └────────────┼────────────┘
                   │
                   ▼
      ┌────────────────────────┐
      │  Shared College State  │
      │  - No prop drilling    │
      │  - Consistent data     │
      │  - Easy access         │
      └────────────────────────┘
```

---

## Booking Transaction Flow

```
1. USER CLICKS SEAT
   │
   ▼
2. OPEN BOOKING MODAL
   │
   ▼
3. USER FILLS FORM
   │
   ▼
4. SUBMIT BOOKING
   │
   ▼
5. CHECK USER EXISTS
   ├─→ YES → Error: "Already booked"
   └─→ NO  → Continue
       │
       ▼
6. START TRANSACTION
   │
   ▼
7. READ CURRENT SEAT DATA
   │
   ▼
8. VALIDATE SEAT AVAILABLE
   ├─→ NO  → Error: "Seat not available"
   └─→ YES → Continue
       │
       ▼
9. UPDATE SEAT STATUS
   │
   ▼
10. INCREMENT BOOKED COUNT
    │
    ▼
11. COMMIT TRANSACTION
    ├─→ FAIL → Retry or Error
    └─→ SUCCESS → Continue
        │
        ▼
12. CREATE BOOKING DOCUMENT
    │
    ▼
13. SHOW SUCCESS MESSAGE
    │
    ▼
14. REAL-TIME UPDATE
    └─→ All clients see new status
```

---

## Admin Operations Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN ACCESS                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PASSWORD VERIFICATION                           │
│                                                              │
│  1. Admin enters password                                    │
│  2. Fetch college document                                   │
│  3. Compare passwords                                        │
│  4. If match:                                                │
│     - Set localStorage flag                                  │
│     - Grant admin access                                     │
│  5. If no match:                                             │
│     - Show error                                             │
│     - Deny access                                            │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN OPERATIONS                            │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  View Bookings                             │             │
│  │  - Subscribe to real-time updates          │             │
│  │  - Filter by route/bogie                   │             │
│  │  - Search by name/email/phone              │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  Cancel Booking                            │             │
│  │  1. Verify admin authentication            │             │
│  │  2. Start transaction                      │             │
│  │  3. Update seat status to available        │             │
│  │  4. Delete booking document                │             │
│  │  5. Commit transaction                     │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  Export CSV                                │             │
│  │  1. Get filtered bookings                  │             │
│  │  2. Format as CSV                          │             │
│  │  3. Download file                          │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  View Statistics                           │             │
│  │  - Total bookings                          │             │
│  │  - Available seats                         │             │
│  │  - Booked seats                            │             │
│  │  - Reserved seats                          │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                               │
│                                                              │
│  Local Machine                                               │
│    ├── npm run dev                                           │
│    ├── http://localhost:5173                                 │
│    └── Firebase Emulator (optional)                          │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ npm run build
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUILD PROCESS                             │
│                                                              │
│  Vite Build                                                  │
│    ├── Bundle React app                                      │
│    ├── Optimize assets                                       │
│    ├── Generate dist/ folder                                 │
│    └── Tree-shake unused code                                │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ firebase deploy
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                │
│                                                              │
│  Firebase Hosting                                            │
│    ├── Static files served via CDN                           │
│    ├── HTTPS enabled                                         │
│    ├── Custom domain support                                 │
│    └── https://your-project.web.app                          │
│                                                              │
│  Firebase Realtime Database                                  │
│    ├── Real-time sync                                        │
│    ├── Security rules enforced                               │
│    ├── Automatic scaling                                     │
│    └── Global distribution                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│                                                              │
│  React 18                 ← UI Framework                     │
│  React Router DOM v6      ← Routing                          │
│  TailwindCSS             ← Styling                           │
│  Lucide React            ← Icons                             │
│  React Toastify          ← Notifications                     │
│  Vite                    ← Build Tool                        │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                             │
│                                                              │
│  Firebase Realtime DB    ← Database                          │
│  Firebase Hosting        ← Static Hosting                    │
│  Firebase Security Rules ← Access Control                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│                  OPTIMIZATION STRATEGIES                     │
│                                                              │
│  1. Real-time Subscriptions                                  │
│     ✓ Subscribe only to needed data                          │
│     ✓ Unsubscribe on component unmount                       │
│     ✓ Prevent memory leaks                                   │
│                                                              │
│  2. Transaction-based Updates                                │
│     ✓ Atomic operations                                      │
│     ✓ Race condition prevention                              │
│     ✓ Data consistency                                       │
│                                                              │
│  3. Component Reusability                                    │
│     ✓ Shared components                                      │
│     ✓ Smaller bundle size                                    │
│     ✓ Consistent UI                                          │
│                                                              │
│  4. Lazy Loading                                             │
│     ✓ Code splitting                                         │
│     ✓ Route-based chunks                                     │
│     ✓ Faster initial load                                    │
│                                                              │
│  5. Caching Strategy                                         │
│     ✓ College data cached in context                         │
│     ✓ Reduce database reads                                  │
│     ✓ Faster page loads                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
│                                                              │
│  1. College Not Found                                        │
│     → Show error page                                        │
│     → Provide "Back to Home" button                          │
│                                                              │
│  2. Duplicate Booking                                        │
│     → Check before transaction                               │
│     → Show clear error message                               │
│     → Suggest alternative                                    │
│                                                              │
│  3. Seat Not Available                                       │
│     → Transaction fails gracefully                           │
│     → Show updated seat map                                  │
│     → Suggest other seats                                    │
│                                                              │
│  4. Network Error                                            │
│     → Show retry option                                      │
│     → Cache last known state                                 │
│     → Reconnect automatically                                │
│                                                              │
│  5. Admin Auth Failed                                        │
│     → Clear error message                                    │
│     → Allow retry                                            │
│     → No sensitive info leaked                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ **Scalability** - Unlimited colleges
- ✅ **Security** - Complete data isolation
- ✅ **Performance** - Real-time updates
- ✅ **Reliability** - Transaction-based operations
- ✅ **Maintainability** - Modular code structure
- ✅ **User Experience** - Intuitive flows
