# 📦 Cart & Orders System - Quick Reference

## 🎯 What's Been Created

I've designed a complete Firestore schema and implementation guide for your FarmsCraft e-commerce app with:

### 📄 Documentation Files

1. **FIRESTORE_SCHEMA.md** - Complete database schema
   - Detailed field definitions
   - Example documents
   - Security rules
   - Helper functions

2. **IMPLEMENTATION_GUIDE.md** - Practical implementation examples
   - Step-by-step code examples
   - React/Next.js components
   - Admin dashboard examples
   - Custom hooks

3. **SCHEMA_VISUAL.md** - Visual diagrams
   - Collection structure
   - Data flow diagrams
   - Relationship maps
   - Query patterns

### 💻 Code Files

4. **src/types/firestore.ts** - TypeScript definitions
   - All type interfaces
   - Helper functions
   - Type conversion utilities
   - Status formatters

5. **src/services/firestore.service.ts** - Database operations
   - Cart CRUD operations
   - Order management
   - Status updates
   - Analytics functions

---

## 🗂️ Collections Overview

### 1. Carts Collection (`carts/{userId}`)

**Purpose**: Store user shopping carts

**Key Features**:
- One cart per user (document ID = userId)
- Auto-calculated totals (subtotal, tax, shipping, total)
- Coupon support
- Product details denormalized for performance

**Example Usage**:
```typescript
import { addToCart, getCart, updateCartItemQuantity } from '@/services/firestore.service';

// Add item to cart
await addToCart(userId, {
  productId: 'prod_001',
  productName: 'Organic Tomatoes',
  quantity: 2,
  price: 150,
  imageUrl: 'https://...',
});

// Get cart
const cart = await getCart(userId);

// Update quantity
await updateCartItemQuantity(userId, 'prod_001', 3);
```

---

### 2. Orders Collection (`orders/{orderId}`)

**Purpose**: Store all customer orders

**Key Features**:
- Auto-generated order numbers (e.g., "ORD-2025-001234")
- Complete order lifecycle tracking
- Multiple status support
- COD payment support
- Shipping address & tracking
- Timeline tracking (placed, confirmed, shipped, delivered)

**Order Statuses**:
- `pending` → Order placed, awaiting confirmation
- `confirmed` → Order confirmed by admin
- `processing` → Items being prepared
- `shipped` → Order dispatched
- `delivered` → Successfully delivered
- `cancelled` → Order cancelled
- `failed` → Delivery/payment failed

**Payment Statuses**:
- `pending` → Payment not received (COD)
- `paid` → Payment received
- `failed` → Payment failed
- `refunded` → Payment refunded

**Example Usage**:
```typescript
import { createOrder, updateOrderStatus, getOrder } from '@/services/firestore.service';

// Create order
const orderId = await createOrder({
  userId: user.uid,
  userEmail: user.email,
  userPhone: '+919876543210',
  status: 'pending',
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  items: orderItems,
  pricing: { subtotal, tax, shippingCost, discount, total },
  shippingAddress: { /* address details */ },
  billingAddress: { /* address details */ },
  timeline: { placedAt: Timestamp.now() },
});

// Update order status (admin)
await updateOrderStatus(orderId, {
  status: 'shipped',
  tracking: {
    carrier: 'Delhivery',
    trackingNumber: 'DELV123456789',
  },
});

// Get order
const order = await getOrder(orderId);
```

---

## 🔑 Key Design Decisions

### 1. **Data Denormalization**
Product details are copied to cart/order items instead of storing just IDs.

**Why?**
- ✅ Preserves historical accuracy (prices, names may change)
- ✅ Faster reads (no need to fetch product details separately)
- ✅ Shows what customer actually bought

### 2. **One Cart Per User**
Cart document ID = User ID

**Why?**
- ✅ Simple to query: `getDoc(db, 'carts', userId)`
- ✅ No duplicate carts possible
- ✅ Automatic cleanup when user logs out

### 3. **Comprehensive Order Timeline**
Separate timestamps for each status change

**Why?**
- ✅ Track exact time of each status change
- ✅ Calculate processing times
- ✅ Better customer communication
- ✅ Analytics and reporting

### 4. **COD-First Payment**
Initial support for Cash on Delivery

**Why?**
- ✅ Most common in India
- ✅ No payment gateway integration needed initially
- ✅ Easy to add online payments later
- ✅ Payment marked as "paid" on delivery

---

## 🚀 Quick Start Guide

### Step 1: Set Up Firebase Indexes

Go to Firebase Console → Firestore → Indexes and create:

```
Collection: orders
Fields: userId (Ascending), createdAt (Descending)

Collection: orders
Fields: status (Ascending), createdAt (Descending)

Collection: orders
Fields: userId (Ascending), status (Ascending), createdAt (Descending)
```

### Step 2: Add Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Carts - users can only access their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders - users can read their own, admins can do everything
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
                               request.auth.token.admin == true;
    }
  }
}
```

### Step 3: Import Types and Services

```typescript
// In your components
import { 
  Cart, 
  Order, 
  CartItem, 
  OrderStatus 
} from '@/types/firestore';

import { 
  addToCart, 
  getCart, 
  createOrder, 
  getUserOrders 
} from '@/services/firestore.service';
```

### Step 4: Implement Cart Functionality

See `IMPLEMENTATION_GUIDE.md` for complete examples of:
- Product page with "Add to Cart"
- Cart page with quantity updates
- Checkout page with order creation
- Order details page
- Admin orders management

---

## 📊 Example Documents

### Cart Document
```json
{
  "userId": "abc123xyz789",
  "items": [
    {
      "productId": "prod_001",
      "productName": "Organic Tomatoes",
      "productSlug": "organic-tomatoes",
      "quantity": 2,
      "price": 150,
      "imageUrl": "https://cloudinary.com/...",
      "variant": { "weight": "1kg" },
      "addedAt": "2025-12-01T10:30:00Z"
    }
  ],
  "subtotal": 300,
  "tax": 15,
  "shippingCost": 50,
  "discount": 0,
  "total": 365,
  "couponCode": null,
  "createdAt": "2025-12-01T10:30:00Z",
  "updatedAt": "2025-12-01T10:30:00Z"
}
```

### Order Document
```json
{
  "orderId": "order_abc123xyz",
  "orderNumber": "ORD-2025-001234",
  "userId": "abc123xyz789",
  "userEmail": "customer@example.com",
  "userPhone": "+919876543210",
  "status": "shipped",
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "items": [
    {
      "productId": "prod_001",
      "productName": "Organic Tomatoes",
      "quantity": 2,
      "price": 150,
      "imageUrl": "https://cloudinary.com/...",
      "variant": { "weight": "1kg" }
    }
  ],
  "pricing": {
    "subtotal": 300,
    "tax": 15,
    "shippingCost": 50,
    "discount": 0,
    "total": 365
  },
  "shippingAddress": {
    "fullName": "Rajesh Kumar",
    "phone": "+919876543210",
    "addressLine1": "123, Green Park",
    "city": "New Delhi",
    "state": "Delhi",
    "pinCode": "110016",
    "country": "India"
  },
  "tracking": {
    "carrier": "Delhivery",
    "trackingNumber": "DELV123456789",
    "trackingUrl": "https://www.delhivery.com/track/..."
  },
  "timeline": {
    "placedAt": "2025-12-01T10:40:00Z",
    "confirmedAt": "2025-12-01T11:00:00Z",
    "shippedAt": "2025-12-02T09:30:00Z",
    "deliveredAt": null
  },
  "createdAt": "2025-12-01T10:40:00Z",
  "updatedAt": "2025-12-02T09:30:00Z"
}
```

---

## 🛠️ Available Functions

### Cart Functions
- `getCart(userId)` - Get user's cart
- `saveCart(userId, items, couponCode?)` - Save/update cart
- `addToCart(userId, item)` - Add item to cart
- `updateCartItemQuantity(userId, productId, quantity)` - Update quantity
- `removeFromCart(userId, productId)` - Remove item
- `clearCart(userId)` - Clear entire cart
- `applyCoupon(userId, couponCode)` - Apply coupon

### Order Functions
- `createOrder(orderInput)` - Create new order
- `getOrder(orderId)` - Get order by ID
- `getOrderByNumber(orderNumber)` - Get order by number
- `getUserOrders(userId)` - Get user's orders
- `getAllOrders(filters?)` - Get all orders (admin)
- `updateOrderStatus(orderId, statusUpdate)` - Update status
- `cancelOrder(orderId, reason?)` - Cancel order
- `updateOrderTracking(orderId, tracking)` - Add tracking
- `getOrdersByStatus(status)` - Get orders by status
- `getPendingOrders()` - Get pending orders
- `getOrderStatistics()` - Get analytics

### Utility Functions
- `generateOrderNumber()` - Generate unique order number
- `calculatePricing(items, shipping, discount)` - Calculate totals
- `cartToDisplay(cart)` - Convert to display format
- `orderToDisplay(order)` - Convert to display format
- `formatOrderStatus(status)` - Format for UI
- `canCancelOrder(order)` - Check if cancellable
- `canUpdateOrderStatus(current, new)` - Validate transition

---

## 🎨 UI Helper Functions

```typescript
import { 
  getOrderStatusColor, 
  formatOrderStatus,
  canCancelOrder 
} from '@/types/firestore';

// Get color for status badge
const color = getOrderStatusColor(order.status); // 'green', 'yellow', etc.

// Format status for display
const displayStatus = formatOrderStatus('shipped'); // 'Shipped'

// Check if order can be cancelled
const canCancel = canCancelOrder(order); // true/false
```

---

## 📈 Next Steps

1. **Implement Cart UI** - Build cart page and components
2. **Create Checkout Flow** - Address form + order creation
3. **Build Order Tracking** - User order history and details
4. **Admin Dashboard** - Order management interface
5. **Add Email Notifications** - Order confirmations
6. **Integrate Payment Gateway** - Razorpay/Stripe for online payments
7. **Implement Coupons** - Discount code system
8. **Add Reviews** - Product review system

---

## 📚 Documentation Files

- **FIRESTORE_SCHEMA.md** - Complete schema reference
- **IMPLEMENTATION_GUIDE.md** - Code examples and tutorials
- **SCHEMA_VISUAL.md** - Visual diagrams and flows
- **src/types/firestore.ts** - TypeScript types
- **src/services/firestore.service.ts** - Database functions

---

## 🤝 Support

If you need help implementing any part of this system:

1. Check the implementation guide for examples
2. Review the type definitions for available fields
3. Look at the service functions for available operations
4. Refer to the visual diagrams for data flow

---

## ✅ Summary

You now have:
- ✅ Complete Firestore schema for carts and orders
- ✅ TypeScript type definitions for type safety
- ✅ Service functions for all database operations
- ✅ Implementation examples for common use cases
- ✅ Visual diagrams for understanding data flow
- ✅ Security rules for protecting data
- ✅ Helper functions for UI formatting

**Ready to start building! 🚀**
