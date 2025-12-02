# Admin Order Management System

## Overview

This document describes the admin order management system for FarmsCraft e-commerce platform. The system allows administrators to view, filter, and manage customer orders with full control over order status, payment status, and shipping tracking.

---

## Features

### 1. Admin Orders List (`/admin/orders`)

**Location:** `src/app/admin/(dashboard)/orders/page.tsx`

**Features:**
- View all orders in a paginated table
- Real-time order statistics dashboard
- Advanced filtering options:
  - **Status Filter:** Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled, failed)
  - **Payment Filter:** Filter by payment status (pending, paid, failed, refunded)
  - **Date Range Filter:** Filter by date (today, this week, this month, custom range)
  - **Search:** Search by order number, customer name, or email
- Quick status updates directly from the table
- Click-through to detailed order view
- Refresh functionality to reload data

**Statistics Cards:**
- Total Orders
- Pending Orders
- Delivered Orders
- Total Revenue (from paid orders only)

### 2. Admin Order Detail Page (`/admin/orders/[id]`)

**Location:** `src/app/admin/(dashboard)/orders/[id]/page.tsx`

**Features:**

#### Order Information Display
- Order number and placement date
- Current status and payment status badges
- Complete order items list with images, quantities, and prices
- Pricing breakdown (subtotal, tax, shipping, discount, total)
- Customer contact information (email, phone)
- Shipping address with all details
- Billing address
- Payment method
- Customer notes (if provided)
- Admin notes (internal)

#### Status Management
- Update order status with validation
- Update payment status
- Add/edit admin notes
- Status transition validation (prevents invalid status changes)

#### Tracking Management
- Add/update shipping carrier
- Add/update tracking number
- Add/update tracking URL
- View tracking link (opens in new tab)

#### Order Timeline
- Visual timeline showing order progression
- Timestamps for each status change:
  - Order Placed
  - Confirmed
  - Shipped
  - Delivered
  - Cancelled (if applicable)

---

## Admin Access Control

### Method 1: Firestore Admin Collection (Recommended)

Create an `admins` collection in Firestore:

```
admins/{userId}
  - role: "admin"
  - email: "admin@example.com"
  - createdAt: timestamp
```

**To add an admin:**

```javascript
// Run this in Firebase Console or Cloud Functions
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

async function addAdmin(userId: string, email: string) {
  await setDoc(doc(db, 'admins', userId), {
    role: 'admin',
    email: email,
    createdAt: Timestamp.now()
  });
}

// Example usage:
addAdmin('user-uid-here', 'admin@farmscraft.com');
```

### Method 2: Firebase Custom Claims (Alternative)

Set custom claims using Firebase Admin SDK (server-side only):

```javascript
// Cloud Function or Admin SDK
import * as admin from 'firebase-admin';

async function setAdminClaim(uid: string) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
}
```

**Note:** The current Firestore rules use Method 1 (admin collection). To use Method 2, update the `isAdmin()` function in `firestore.rules`:

```javascript
function isAdmin() {
  return isAuthenticated() && request.auth.token.admin == true;
}
```

---

## Firestore Security Rules

### Current Rules Summary

**For Normal Users:**
- ✅ Can read their own orders
- ✅ Can create orders for themselves
- ❌ Cannot update orders
- ❌ Cannot delete orders
- ❌ Cannot read other users' orders

**For Admins:**
- ✅ Can read all orders
- ✅ Can list all orders
- ✅ Can update any order
- ✅ Can delete any order
- ✅ Can create orders (if needed)

### Key Security Rules

```javascript
// Check if user is admin
function isAdmin() {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
}

// Orders collection rules
match /orders/{orderId} {
  // Users can read their own orders, admins can read all
  allow read: if isAuthenticated() && 
                 (request.auth.uid == resource.data.userId || isAdmin());
  
  // Admins can list all orders
  allow list: if isAdmin();
  
  // Users can create orders for themselves
  allow create: if isAuthenticated() && 
                   request.auth.uid == request.resource.data.userId &&
                   validateOrderCreation();
  
  // Only admins can update orders
  allow update: if isAdmin() && validateOrderUpdate();
  
  // Only admins can delete orders
  allow delete: if isAdmin();
}
```

---

## Order Status Flow

### Valid Status Transitions

```
pending → confirmed, cancelled, failed
confirmed → processing, cancelled
processing → shipped, cancelled
shipped → delivered, failed
delivered → (terminal state)
cancelled → (terminal state)
failed → pending (retry)
```

### Status Descriptions

| Status | Description | Admin Actions |
|--------|-------------|---------------|
| `pending` | Order placed, awaiting confirmation | Confirm, Cancel |
| `confirmed` | Order confirmed by admin | Start Processing, Cancel |
| `processing` | Order being prepared | Mark as Shipped, Cancel |
| `shipped` | Order dispatched | Mark as Delivered |
| `delivered` | Order successfully delivered | None (terminal) |
| `cancelled` | Order cancelled | None (terminal) |
| `failed` | Order/delivery failed | Retry (back to pending) |

### Automatic Actions

**When status changes to `delivered`:**
- If payment method is COD, automatically set `paymentStatus` to `paid`
- Set `timeline.deliveredAt` timestamp

**When status changes to `shipped`:**
- Set `timeline.shippedAt` timestamp
- Tracking information should be added

**When status changes to `confirmed`:**
- Set `timeline.confirmedAt` timestamp

**When status changes to `cancelled`:**
- Set `timeline.cancelledAt` timestamp
- Admin note should explain reason

---

## Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet received (COD) or awaiting confirmation |
| `paid` | Payment successfully received |
| `failed` | Payment failed |
| `refunded` | Payment refunded to customer |

---

## API Functions

### Order Service Functions

**Location:** `src/services/firestore.service.ts`

#### Admin Functions

```typescript
// Get all orders (with optional filters)
getAllOrders(filters?: OrderFilters): Promise<Order[]>

// Get order by ID
getOrder(orderId: string): Promise<Order | null>

// Update order status
updateOrderStatus(orderId: string, statusUpdate: UpdateOrderStatusInput): Promise<void>

// Update tracking information
updateOrderTracking(orderId: string, tracking: TrackingInfo): Promise<void>

// Cancel order
cancelOrder(orderId: string, reason?: string): Promise<void>

// Get order statistics
getOrderStatistics(): Promise<OrderStats>

// Get orders by status
getOrdersByStatus(status: OrderStatus): Promise<Order[]>

// Bulk update order statuses
bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<void>
```

#### Usage Examples

```typescript
// Update order status
await updateOrderStatus('order_123', {
  status: 'shipped',
  paymentStatus: 'paid',
  adminNote: 'Shipped via Delhivery'
});

// Add tracking information
await updateOrderTracking('order_123', {
  carrier: 'Delhivery',
  trackingNumber: 'DELV123456789',
  trackingUrl: 'https://www.delhivery.com/track/package/DELV123456789'
});

// Cancel order
await cancelOrder('order_123', 'Customer requested cancellation');

// Get all pending orders
const pendingOrders = await getOrdersByStatus('pending');

// Get orders with filters
const orders = await getAllOrders({
  status: 'shipped',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});
```

---

## Required Firestore Indexes

For optimal performance, create these composite indexes:

```javascript
// Collection: orders
// Fields:
orders: [userId, createdAt DESC]
orders: [status, createdAt DESC]
orders: [userId, status, createdAt DESC]
orders: [paymentStatus, createdAt DESC]
orders: [orderNumber] // Single field index
```

**To create indexes:**

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add the fields as specified above
4. Or deploy using `firestore.indexes.json`

---

## Testing Admin Access

### 1. Create Test Admin User

```javascript
// In Firebase Console or Cloud Functions
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Get your user ID from Firebase Authentication
const userId = 'your-firebase-user-id';

await setDoc(doc(db, 'admins', userId), {
  role: 'admin',
  email: 'your-email@example.com',
  createdAt: Timestamp.now()
});
```

### 2. Verify Admin Access

1. Sign in with the admin user
2. Navigate to `/admin/orders`
3. You should see all orders from all users
4. Try updating an order status
5. Try viewing order details

### 3. Test User Access

1. Sign in with a regular user (not in admins collection)
2. Try to access `/admin/orders` - should be blocked by middleware
3. User can only see their own orders at `/orders`

---

## Troubleshooting

### Issue: "Permission Denied" when loading orders

**Solution:**
- Verify the user is in the `admins` collection
- Check Firestore rules are deployed
- Ensure admin session cookie is set

### Issue: Orders not loading

**Solution:**
- Check browser console for errors
- Verify Firestore indexes are created
- Check network tab for failed requests

### Issue: Cannot update order status

**Solution:**
- Verify status transition is valid (see Status Flow)
- Check admin permissions
- Ensure order exists

### Issue: Tracking information not saving

**Solution:**
- Verify carrier and tracking number are provided
- Check Firestore rules allow updates
- Ensure admin is authenticated

---

## Future Enhancements

- [ ] Bulk order actions (bulk status update, bulk export)
- [ ] Order export to CSV/Excel
- [ ] Email notifications on status changes
- [ ] SMS notifications for shipping updates
- [ ] Order analytics and reports
- [ ] Refund processing
- [ ] Return/exchange management
- [ ] Integration with shipping carriers API
- [ ] Automated status updates from carrier webhooks
- [ ] Order notes history/audit log
- [ ] Customer communication from admin panel

---

## Related Files

- **Admin Orders List:** `src/app/admin/(dashboard)/orders/page.tsx`
- **Admin Order Detail:** `src/app/admin/(dashboard)/orders/[id]/page.tsx`
- **Orders Section Component:** `src/components/admin/sections/OrdersSection.tsx`
- **Firestore Service:** `src/services/firestore.service.ts`
- **Type Definitions:** `src/types/firestore.ts`
- **Security Rules:** `firestore.rules`
- **Schema Documentation:** `FIRESTORE_SCHEMA.md`

---

## Support

For issues or questions:
1. Check this documentation
2. Review Firestore rules and indexes
3. Check browser console for errors
4. Verify admin permissions are set correctly
