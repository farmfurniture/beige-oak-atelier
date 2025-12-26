# Admin Order Management - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FarmsCraft E-commerce                        │
│                   Admin Order Management System                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐         ┌──────────────────────┐          │
│  │  Admin Orders List  │         │  Order Detail Page   │          │
│  │  /admin/orders      │────────▶│  /admin/orders/[id]  │          │
│  │                     │         │                      │          │
│  │  - View all orders  │         │  - Full order info   │          │
│  │  - Filter & search  │         │  - Update status     │          │
│  │  - Statistics       │         │  - Add tracking      │          │
│  │  - Quick actions    │         │  - Timeline view     │          │
│  └─────────────────────┘         └──────────────────────┘          │
│           │                                   │                      │
│           └───────────────┬───────────────────┘                      │
│                           │                                          │
│                           ▼                                          │
│              ┌────────────────────────┐                             │
│              │  OrdersSection         │                             │
│              │  Component             │                             │
│              │                        │                             │
│              │  - Table rendering     │                             │
│              │  - Filter logic        │                             │
│              │  - State management    │                             │
│              └────────────────────────┘                             │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Service Layer                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Firestore Service (firestore.service.ts)                  │    │
│  │                                                             │    │
│  │  Order Operations:                                          │    │
│  │  • getAllOrders(filters?)      → Get all orders            │    │
│  │  • getOrder(id)                → Get single order           │    │
│  │  • updateOrderStatus(id, data) → Update status             │    │
│  │  • updateOrderTracking(id, data) → Update tracking         │    │
│  │  • cancelOrder(id, reason)     → Cancel order              │    │
│  │  • getOrderStatistics()        → Get stats                 │    │
│  │  • getOrdersByStatus(status)   → Filter by status          │    │
│  │  • bulkUpdateOrderStatus()     → Bulk operations           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Firebase/Firestore Layer                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │  orders/        │    │  admins/        │    │  users/        │  │
│  │  {orderId}      │    │  {userId}       │    │  {userId}      │  │
│  │                 │    │                 │    │                │  │
│  │  - orderId      │    │  - role: admin  │    │  - profile     │  │
│  │  - orderNumber  │    │  - email        │    │  - settings    │  │
│  │  - userId       │    │  - createdAt    │    │  - addresses   │  │
│  │  - status       │    └─────────────────┘    └────────────────┘  │
│  │  - items[]      │                                                │
│  │  - pricing      │                                                │
│  │  - addresses    │                                                │
│  │  - tracking     │                                                │
│  │  - timeline     │                                                │
│  │  - notes        │                                                │
│  └─────────────────┘                                                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. View Orders (Read)

```
User Request
    │
    ▼
/admin/orders page loads
    │
    ▼
OrdersSection component
    │
    ▼
getAllOrders() service call
    │
    ▼
Firestore query with filters
    │
    ▼
Security rules check (isAdmin?)
    │
    ├─ Yes → Return all orders
    │
    └─ No → Permission denied
    │
    ▼
Display orders in table
```

### 2. Update Order Status (Write)

```
Admin clicks "Update Status"
    │
    ▼
Validate status transition
    │
    ├─ Invalid → Show error
    │
    └─ Valid ▼
    │
updateOrderStatus() service call
    │
    ▼
Firestore update operation
    │
    ▼
Security rules check (isAdmin?)
    │
    ├─ Yes → Update order
    │         │
    │         ▼
    │    Update timeline
    │         │
    │         ▼
    │    Auto-update payment (if COD + delivered)
    │         │
    │         ▼
    │    Return success
    │
    └─ No → Permission denied
    │
    ▼
Optimistic UI update
    │
    ▼
Show success toast
```

### 3. Add Tracking Information

```
Admin enters tracking details
    │
    ▼
updateOrderTracking() service call
    │
    ▼
Firestore update operation
    │
    ▼
Security rules check (isAdmin?)
    │
    ├─ Yes → Update tracking
    │         │
    │         ▼
    │    Update updatedAt timestamp
    │         │
    │         ▼
    │    Return success
    │
    └─ No → Permission denied
    │
    ▼
Reload order data
    │
    ▼
Show success toast
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Layers                            │
└──────────────────────────────────────────────────────────────┘

Layer 1: Authentication
├─ Firebase Authentication
├─ User must be signed in
└─ Valid session token required

Layer 2: Admin Authorization
├─ Check admins collection
├─ Verify role === "admin"
└─ Validate on every request

Layer 3: Firestore Security Rules
├─ isAuthenticated() check
├─ isAdmin() check
├─ Resource ownership validation
└─ Operation-specific rules

Layer 4: Application Logic
├─ Status transition validation
├─ Input validation
├─ Business rule enforcement
└─ Error handling
```

---

## Component Hierarchy

```
AdminDashboardLayout
│
├─ AdminAuthProvider (Context)
│   │
│   └─ Provides: isAuthenticated, logout
│
└─ AdminLayout
    │
    ├─ Sidebar Navigation
    │   └─ Orders link
    │
    └─ Main Content Area
        │
        ├─ /admin/orders (Orders List)
        │   │
        │   └─ OrdersSection
        │       │
        │       ├─ Statistics Cards
        │       │   ├─ Total Orders
        │       │   ├─ Pending
        │       │   ├─ Delivered
        │       │   └─ Revenue
        │       │
        │       ├─ Filters & Search
        │       │   ├─ Search Input
        │       │   ├─ Status Filter
        │       │   ├─ Payment Filter
        │       │   └─ Date Range Filter
        │       │
        │       └─ OrdersTable
        │           └─ Order Rows
        │               ├─ Order Info
        │               ├─ Status Badge
        │               ├─ Payment Info
        │               └─ Actions
        │
        └─ /admin/orders/[id] (Order Detail)
            │
            ├─ Header
            │   ├─ Back Button
            │   ├─ Order Number
            │   └─ Status Badges
            │
            ├─ Left Column
            │   ├─ Order Items Card
            │   │   ├─ Item List
            │   │   └─ Pricing Summary
            │   │
            │   └─ Customer Info Card
            │       ├─ Contact Details
            │       ├─ Shipping Address
            │       ├─ Payment Method
            │       └─ Customer Note
            │
            └─ Right Column
                ├─ Update Status Card
                │   ├─ Status Dropdown
                │   ├─ Payment Dropdown
                │   ├─ Admin Note
                │   └─ Update Button
                │
                ├─ Tracking Card
                │   ├─ Carrier Input
                │   ├─ Tracking Number
                │   ├─ Tracking URL
                │   └─ Update Button
                │
                └─ Timeline Card
                    └─ Status Events
                        ├─ Placed
                        ├─ Confirmed
                        ├─ Shipped
                        ├─ Delivered
                        └─ Cancelled
```

---

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    State Architecture                        │
└─────────────────────────────────────────────────────────────┘

Global State (Context)
├─ AdminAuthContext
│   ├─ isAuthenticated: boolean
│   └─ logout: () => Promise<void>
│
└─ AuthContext (User)
    ├─ user: FirebaseUser | null
    ├─ isAuthenticated: boolean
    └─ isLoading: boolean

Component State (Orders List)
├─ orders: Order[]
├─ loading: boolean
├─ stats: OrderStatistics
├─ statusFilter: string
├─ paymentFilter: string
├─ dateRangeFilter: string
├─ searchTerm: string
├─ startDate: string
└─ endDate: string

Component State (Order Detail)
├─ order: Order | null
├─ loading: boolean
├─ updating: boolean
├─ newStatus: OrderStatus
├─ newPaymentStatus: PaymentStatus
├─ adminNote: string
├─ trackingCarrier: string
├─ trackingNumber: string
└─ trackingUrl: string

Derived State (Computed)
└─ filteredOrders: Order[]
    └─ Computed from: orders + filters + search
```

---

## API Endpoints (Firestore Operations)

```
┌─────────────────────────────────────────────────────────────┐
│                    Firestore Operations                      │
└─────────────────────────────────────────────────────────────┘

Read Operations
├─ GET /orders (collection)
│   └─ getAllOrders(filters?)
│       ├─ Query: where, orderBy, limit
│       └─ Returns: Order[]
│
├─ GET /orders/{id} (document)
│   └─ getOrder(id)
│       └─ Returns: Order | null
│
└─ GET /orders (aggregation)
    └─ getOrderStatistics()
        └─ Returns: OrderStatistics

Write Operations
├─ UPDATE /orders/{id}
│   ├─ updateOrderStatus(id, data)
│   │   ├─ Updates: status, paymentStatus, timeline
│   │   └─ Validates: status transitions
│   │
│   ├─ updateOrderTracking(id, data)
│   │   └─ Updates: tracking info
│   │
│   └─ cancelOrder(id, reason)
│       └─ Updates: status, timeline, notes
│
└─ BATCH UPDATE /orders
    └─ bulkUpdateOrderStatus(ids[], status)
        └─ Updates: multiple orders
```

---

## Type System

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Definitions                          │
└─────────────────────────────────────────────────────────────┘

Core Types
├─ Order
│   ├─ orderId: string
│   ├─ orderNumber: string
│   ├─ userId: string
│   ├─ status: OrderStatus
│   ├─ paymentStatus: PaymentStatus
│   ├─ items: OrderItem[]
│   ├─ pricing: OrderPricing
│   ├─ shippingAddress: Address
│   ├─ billingAddress: Address
│   ├─ tracking?: ShippingTracking
│   ├─ timeline: OrderTimeline
│   ├─ notes?: OrderNotes
│   ├─ createdAt: Timestamp
│   └─ updatedAt: Timestamp
│
├─ OrderStatus (enum)
│   ├─ pending
│   ├─ confirmed
│   ├─ processing
│   ├─ shipped
│   ├─ delivered
│   ├─ cancelled
│   └─ failed
│
├─ PaymentStatus (enum)
│   ├─ pending
│   ├─ paid
│   ├─ failed
│   └─ refunded
│
└─ Helper Types
    ├─ UpdateOrderStatusInput
    ├─ OrderFilters
    ├─ OrderDisplay
    └─ OrderStatistics
```

---

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling Flow                       │
└─────────────────────────────────────────────────────────────┘

Try-Catch Blocks
├─ Service Layer
│   ├─ Catch Firestore errors
│   ├─ Log to console
│   └─ Re-throw with context
│
├─ Component Layer
│   ├─ Catch service errors
│   ├─ Show toast notification
│   └─ Update UI state
│
└─ Validation Layer
    ├─ Status transition validation
    ├─ Input validation
    └─ Business rule validation

Error Types
├─ Permission Denied
│   └─ User not admin
│
├─ Not Found
│   └─ Order doesn't exist
│
├─ Invalid Operation
│   └─ Invalid status transition
│
└─ Network Error
    └─ Firestore unavailable
```

---

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Features                      │
└─────────────────────────────────────────────────────────────┘

Client-Side
├─ Memoized filter logic (useMemo)
├─ Optimistic UI updates
├─ Lazy loading of order details
└─ Debounced search input

Server-Side
├─ Firestore composite indexes
├─ Efficient query constraints
├─ Batch operations for bulk updates
└─ Server-side timestamps

Caching
├─ Component state caching
├─ Filter state persistence
└─ Optimistic updates
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Stack                          │
└─────────────────────────────────────────────────────────────┘

Frontend
├─ Next.js 14 (App Router)
├─ React 18
├─ TypeScript
└─ Tailwind CSS + shadcn/ui

Backend
├─ Firebase Authentication
├─ Cloud Firestore
├─ Firestore Security Rules
└─ Firestore Indexes

Hosting
├─ Vercel / Firebase Hosting
└─ CDN for static assets

Development
├─ Local development server
├─ Firebase Emulators (optional)
└─ Hot module replacement
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    System Integrations                       │
└─────────────────────────────────────────────────────────────┘

Current Integrations
├─ Firebase Authentication
│   └─ User authentication
│
├─ Cloud Firestore
│   └─ Data storage
│
└─ Admin Collection
    └─ Admin authorization

Future Integrations (Optional)
├─ Email Service
│   └─ Order notifications
│
├─ SMS Service
│   └─ Shipping updates
│
├─ Shipping Carriers
│   └─ Tracking APIs
│
├─ Payment Gateways
│   └─ Payment webhooks
│
└─ Analytics
    └─ Order analytics
```

---

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Strategy                       │
└─────────────────────────────────────────────────────────────┘

Application Logs
├─ Console.log for development
├─ Error logging in catch blocks
└─ Service operation logs

Firestore Monitoring
├─ Firebase Console metrics
├─ Query performance
└─ Security rule violations

User Actions
├─ Status updates logged
├─ Admin actions tracked
└─ Error notifications via toast

Future Enhancements
├─ Sentry for error tracking
├─ Google Analytics for usage
└─ Custom admin audit log
```

---

## Summary

This architecture provides:

✅ **Scalability** - Efficient Firestore queries and indexes
✅ **Security** - Multi-layer security with rules and validation
✅ **Maintainability** - Clean separation of concerns
✅ **Performance** - Optimized queries and client-side caching
✅ **Extensibility** - Easy to add new features
✅ **Type Safety** - Full TypeScript coverage
✅ **User Experience** - Responsive design and optimistic updates

The system is production-ready and follows Next.js and Firebase best practices.
