# Firestore Schema - Visual Overview

## Collections Structure

```
📁 Firestore Database
│
├── 📂 carts/
│   └── {userId}                    # Document ID is the user's UID
│       ├── userId: string
│       ├── items: array
│       │   └── [
│       │       {
│       │         productId: string
│       │         productName: string
│       │         quantity: number
│       │         price: number
│       │         imageUrl: string
│       │         variant: object
│       │         addedAt: timestamp
│       │       }
│       │     ]
│       ├── subtotal: number
│       ├── tax: number
│       ├── shippingCost: number
│       ├── discount: number
│       ├── total: number
│       ├── couponCode: string?
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── 📂 orders/
│   └── {orderId}                   # Auto-generated document ID
│       ├── orderId: string
│       ├── orderNumber: string     # e.g., "ORD-2025-001234"
│       ├── userId: string
│       ├── userEmail: string
│       ├── userPhone: string
│       ├── status: string          # pending | confirmed | processing | shipped | delivered | cancelled | failed
│       ├── paymentMethod: string   # cod | online | upi | card | wallet
│       ├── paymentStatus: string   # pending | paid | failed | refunded
│       ├── items: array
│       │   └── [
│       │       {
│       │         productId: string
│       │         productName: string
│       │         quantity: number
│       │         price: number
│       │         imageUrl: string
│       │         variant: object
│       │       }
│       │     ]
│       ├── pricing: object
│       │   ├── subtotal: number
│       │   ├── tax: number
│       │   ├── shippingCost: number
│       │   ├── discount: number
│       │   └── total: number
│       ├── couponCode: string?
│       ├── shippingAddress: object
│       │   ├── fullName: string
│       │   ├── phone: string
│       │   ├── addressLine1: string
│       │   ├── addressLine2: string?
│       │   ├── city: string
│       │   ├── state: string
│       │   ├── pinCode: string
│       │   ├── country: string
│       │   └── landmark: string?
│       ├── billingAddress: object  # Same structure as shippingAddress
│       ├── tracking: object?
│       │   ├── carrier: string
│       │   ├── trackingNumber: string
│       │   ├── trackingUrl: string
│       │   └── estimatedDelivery: timestamp
│       ├── timeline: object
│       │   ├── placedAt: timestamp
│       │   ├── confirmedAt: timestamp?
│       │   ├── shippedAt: timestamp?
│       │   ├── deliveredAt: timestamp?
│       │   └── cancelledAt: timestamp?
│       ├── notes: object?
│       │   ├── customerNote: string
│       │   └── adminNote: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── 📂 products/                    # Your existing collection
    └── {productId}
        ├── name: string
        ├── slug: string
        ├── price: number
        ├── images: array
        └── ... (other product fields)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. BROWSE PRODUCTS
   │
   ├─→ View Product Details
   │
   └─→ Add to Cart
       │
       ▼
   ┌──────────────────┐
   │  carts/{userId}  │  ← Cart document created/updated
   └──────────────────┘
       │
       ├─→ Update Quantity
       ├─→ Remove Items
       ├─→ Apply Coupon
       │
       ▼
2. CHECKOUT
   │
   ├─→ Enter Shipping Address
   ├─→ Review Order
   ├─→ Select Payment Method (COD)
   │
   └─→ Place Order
       │
       ▼
   ┌───────────────────┐
   │ orders/{orderId}  │  ← Order document created
   └───────────────────┘
       │
       ├─→ status: "pending"
       ├─→ paymentStatus: "pending"
       └─→ timeline.placedAt: now
       │
       ▼
   ┌──────────────────┐
   │  Cart Cleared    │  ← carts/{userId} deleted
   └──────────────────┘

3. ORDER TRACKING
   │
   └─→ View Order Status
       │
       ▼
   ┌─────────────────────────────────────────┐
   │         ORDER STATUS FLOW               │
   ├─────────────────────────────────────────┤
   │  pending → confirmed → processing       │
   │           → shipped → delivered         │
   │                                         │
   │  Alternative paths:                     │
   │  pending → cancelled                    │
   │  shipped → failed                       │
   └─────────────────────────────────────────┘

4. ADMIN ACTIONS
   │
   ├─→ View All Orders
   ├─→ Update Order Status
   ├─→ Add Tracking Info
   └─→ View Analytics
```

---

## Order Status Lifecycle

```
┌──────────┐
│ PENDING  │  ← Order placed by customer
└────┬─────┘
     │
     ├─→ Admin confirms order
     │
     ▼
┌───────────┐
│ CONFIRMED │  ← Order confirmed, preparing items
└────┬──────┘
     │
     ├─→ Admin starts processing
     │
     ▼
┌────────────┐
│ PROCESSING │  ← Items being packed
└────┬───────┘
     │
     ├─→ Admin ships order + adds tracking
     │
     ▼
┌──────────┐
│ SHIPPED  │  ← Order dispatched
└────┬─────┘
     │
     ├─→ Delivery confirmed
     │
     ▼
┌───────────┐
│ DELIVERED │  ← Order delivered (COD payment marked as paid)
└───────────┘

Alternative paths:
┌──────────┐     ┌───────────┐
│ PENDING  │────→│ CANCELLED │  ← User/Admin cancels
└──────────┘     └───────────┘

┌──────────┐     ┌────────┐
│ SHIPPED  │────→│ FAILED │  ← Delivery failed
└──────────┘     └────────┘
```

---

## Payment Status Flow (COD)

```
┌──────────┐
│ PENDING  │  ← Order placed with COD
└────┬─────┘
     │
     │ Order goes through lifecycle...
     │
     ▼
┌───────────┐
│ DELIVERED │  ← Order delivered
└────┬──────┘
     │
     │ Auto-update payment status
     │
     ▼
┌──────┐
│ PAID │  ← Payment collected on delivery
└──────┘

Alternative:
┌──────────┐     ┌────────┐
│ PENDING  │────→│ FAILED │  ← Payment not collected
└──────────┘     └────────┘
```

---

## Relationships

```
┌──────────────┐
│    users     │  (Firebase Auth)
│   {userId}   │
└──────┬───────┘
       │
       │ 1:1
       │
       ▼
┌──────────────┐
│    carts     │
│   {userId}   │  ← One cart per user
└──────────────┘

┌──────────────┐
│    users     │
│   {userId}   │
└──────┬───────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│    orders    │
│  {orderId}   │  ← Multiple orders per user
└──────────────┘

┌──────────────┐
│   products   │
│  {productId} │
└──────┬───────┘
       │
       │ N:M (denormalized)
       │
       ▼
┌──────────────┐
│ cart.items[] │  ← Product data copied to cart
└──────────────┘
       │
       │ Snapshot on checkout
       │
       ▼
┌──────────────┐
│order.items[] │  ← Product data frozen at order time
└──────────────┘
```

---

## Query Patterns

### Common User Queries

```javascript
// Get user's cart
GET /carts/{userId}

// Get user's orders (most recent first)
GET /orders
WHERE userId == {userId}
ORDER BY createdAt DESC

// Get specific order
GET /orders/{orderId}

// Get order by order number
GET /orders
WHERE orderNumber == "ORD-2025-001234"
LIMIT 1
```

### Common Admin Queries

```javascript
// Get all orders
GET /orders
ORDER BY createdAt DESC

// Get pending orders
GET /orders
WHERE status == "pending"
ORDER BY createdAt DESC

// Get orders by status
GET /orders
WHERE status == {status}
ORDER BY createdAt DESC

// Get orders by payment status
GET /orders
WHERE paymentStatus == "pending"
ORDER BY createdAt DESC

// Get user's orders (admin view)
GET /orders
WHERE userId == {userId}
ORDER BY createdAt DESC
```

---

## Data Size Estimates

### Cart Document
- **Average size**: ~2-5 KB
- **Max items**: Recommended 50 items
- **Total users with carts**: Varies (active shoppers)

### Order Document
- **Average size**: ~5-10 KB
- **Growth rate**: Depends on sales volume
- **Retention**: Keep all orders (historical data)

### Indexes
- Composite indexes required for efficient queries
- See IMPLEMENTATION_GUIDE.md for index setup

---

## Best Practices

### 1. Data Denormalization
✅ **DO**: Copy product details to cart/order items
- Preserves historical accuracy
- Faster reads (no joins needed)
- Order shows what customer actually bought

❌ **DON'T**: Store only product IDs
- Product details may change
- Requires additional reads
- Historical data lost

### 2. Timestamps
✅ **DO**: Use server timestamps
```javascript
import { serverTimestamp } from 'firebase/firestore';
createdAt: serverTimestamp()
```

❌ **DON'T**: Use client timestamps
```javascript
createdAt: new Date() // ❌ Client time may be wrong
```

### 3. Security
✅ **DO**: Validate on server-side
- Use Firestore Security Rules
- Validate in Cloud Functions
- Check user permissions

❌ **DON'T**: Trust client data
- Always verify user identity
- Validate all inputs
- Check business logic server-side

### 4. Pricing Calculations
✅ **DO**: Calculate on server
- Use Cloud Functions for pricing
- Validate coupon codes server-side
- Prevent price manipulation

❌ **DON'T**: Trust client calculations
- Client can modify prices
- Security vulnerability
- Revenue loss risk

---

## Future Enhancements

### Phase 2 - Additional Collections

```
📁 Firestore Database
│
├── 📂 users/
│   └── {userId}
│       ├── profile info
│       ├── savedAddresses: array
│       └── preferences: object
│
├── 📂 coupons/
│   └── {couponCode}
│       ├── discountType: "percentage" | "fixed"
│       ├── discountValue: number
│       ├── minOrderValue: number
│       ├── validFrom: timestamp
│       ├── validUntil: timestamp
│       └── usageLimit: number
│
├── 📂 reviews/
│   └── {reviewId}
│       ├── productId: string
│       ├── userId: string
│       ├── orderId: string
│       ├── rating: number (1-5)
│       ├── comment: string
│       └── createdAt: timestamp
│
└── 📂 notifications/
    └── {notificationId}
        ├── userId: string
        ├── type: string
        ├── title: string
        ├── message: string
        ├── read: boolean
        └── createdAt: timestamp
```

---

## Performance Tips

1. **Use Pagination**: Limit queries to 20-50 results
2. **Cache Cart Data**: Use React state/context to minimize reads
3. **Batch Writes**: Use batch operations for multiple updates
4. **Optimize Images**: Store optimized image URLs in cart/orders
5. **Index Strategically**: Only create indexes you actually use

---

## Monitoring & Analytics

Track these metrics:
- Cart abandonment rate
- Average order value
- Orders by status
- Revenue by time period
- Popular products (from order items)
- Delivery success rate

Use Firebase Analytics or build custom dashboard with Firestore queries.
