# Firestore Schema Design - FarmsCraft E-commerce

## Overview
This document defines the Firestore database schema for the FarmsCraft e-commerce application, focusing on carts and orders management.

---

## 1. Carts Collection

### Collection Path
```
carts/{userId}
```

### Document Structure

```json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "productSlug": "string",
      "quantity": "number",
      "price": "number",
      "imageUrl": "string",
      "variant": {
        "size": "string (optional)",
        "color": "string (optional)",
        "weight": "string (optional)"
      },
      "addedAt": "timestamp"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "shippingCost": "number",
  "discount": "number",
  "total": "number",
  "couponCode": "string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Unique identifier for the user (matches Firebase Auth UID) |
| `items` | array | Array of cart items |
| `items[].productId` | string | Reference to product document ID |
| `items[].productName` | string | Product name (denormalized for quick access) |
| `items[].productSlug` | string | Product URL slug for navigation |
| `items[].quantity` | number | Quantity of this item in cart |
| `items[].price` | number | Price per unit at time of adding to cart |
| `items[].imageUrl` | string | Primary product image URL |
| `items[].variant` | object | Product variant details (size, color, weight, etc.) |
| `items[].addedAt` | timestamp | When item was added to cart |
| `subtotal` | number | Sum of all items (price × quantity) |
| `tax` | number | Calculated tax amount |
| `shippingCost` | number | Shipping charges |
| `discount` | number | Discount amount applied |
| `total` | number | Final total (subtotal + tax + shipping - discount) |
| `couponCode` | string | Applied coupon code (if any) |
| `createdAt` | timestamp | Cart creation timestamp |
| `updatedAt` | timestamp | Last modification timestamp |

### Example Document

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
      "variant": {
        "weight": "1kg"
      },
      "addedAt": "2025-12-01T10:30:00Z"
    },
    {
      "productId": "prod_002",
      "productName": "Fresh Spinach",
      "productSlug": "fresh-spinach",
      "quantity": 1,
      "price": 80,
      "imageUrl": "https://cloudinary.com/...",
      "variant": {
        "weight": "500g"
      },
      "addedAt": "2025-12-01T10:35:00Z"
    }
  ],
  "subtotal": 380,
  "tax": 19,
  "shippingCost": 50,
  "discount": 0,
  "total": 449,
  "couponCode": null,
  "createdAt": "2025-12-01T10:30:00Z",
  "updatedAt": "2025-12-01T10:35:00Z"
}
```

---

## 2. Orders Collection

### Collection Path
```
orders/{orderId}
```

### Document Structure

```json
{
  "orderId": "string",
  "orderNumber": "string",
  "userId": "string",
  "userEmail": "string",
  "userPhone": "string",
  "status": "string",
  "paymentMethod": "string",
  "paymentStatus": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "productSlug": "string",
      "quantity": "number",
      "price": "number",
      "imageUrl": "string",
      "variant": {
        "size": "string (optional)",
        "color": "string (optional)",
        "weight": "string (optional)"
      }
    }
  ],
  "pricing": {
    "subtotal": "number",
    "tax": "number",
    "shippingCost": "number",
    "discount": "number",
    "total": "number"
  },
  "couponCode": "string (optional)",
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "addressLine1": "string",
    "addressLine2": "string (optional)",
    "city": "string",
    "state": "string",
    "pinCode": "string",
    "country": "string",
    "landmark": "string (optional)"
  },
  "billingAddress": {
    "fullName": "string",
    "phone": "string",
    "addressLine1": "string",
    "addressLine2": "string (optional)",
    "city": "string",
    "state": "string",
    "pinCode": "string",
    "country": "string"
  },
  "tracking": {
    "carrier": "string (optional)",
    "trackingNumber": "string (optional)",
    "trackingUrl": "string (optional)",
    "estimatedDelivery": "timestamp (optional)"
  },
  "timeline": {
    "placedAt": "timestamp",
    "confirmedAt": "timestamp (optional)",
    "shippedAt": "timestamp (optional)",
    "deliveredAt": "timestamp (optional)",
    "cancelledAt": "timestamp (optional)"
  },
  "notes": {
    "customerNote": "string (optional)",
    "adminNote": "string (optional)"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | string | Unique order identifier (Firestore document ID) |
| `orderNumber` | string | Human-readable order number (e.g., "ORD-2025-001234") |
| `userId` | string | Reference to user who placed the order |
| `userEmail` | string | User's email address |
| `userPhone` | string | User's phone number |
| `status` | string | Order status: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `failed` |
| `paymentMethod` | string | Payment method: `cod`, `online`, `upi`, `card`, `wallet` |
| `paymentStatus` | string | Payment status: `pending`, `paid`, `failed`, `refunded` |
| `items` | array | Array of ordered items (snapshot from cart) |
| `items[].productId` | string | Product reference |
| `items[].productName` | string | Product name at time of order |
| `items[].productSlug` | string | Product URL slug |
| `items[].quantity` | number | Quantity ordered |
| `items[].price` | number | Price per unit at time of order |
| `items[].imageUrl` | string | Product image URL |
| `items[].variant` | object | Product variant details |
| `pricing` | object | Pricing breakdown |
| `pricing.subtotal` | number | Sum of all items |
| `pricing.tax` | number | Tax amount |
| `pricing.shippingCost` | number | Shipping charges |
| `pricing.discount` | number | Discount applied |
| `pricing.total` | number | Final amount to be paid |
| `couponCode` | string | Applied coupon code |
| `shippingAddress` | object | Delivery address |
| `shippingAddress.fullName` | string | Recipient's full name |
| `shippingAddress.phone` | string | Contact phone number |
| `shippingAddress.addressLine1` | string | Street address line 1 |
| `shippingAddress.addressLine2` | string | Street address line 2 (optional) |
| `shippingAddress.city` | string | City name |
| `shippingAddress.state` | string | State/Province |
| `shippingAddress.pinCode` | string | Postal/ZIP code |
| `shippingAddress.country` | string | Country (default: "India") |
| `shippingAddress.landmark` | string | Nearby landmark (optional) |
| `billingAddress` | object | Billing address (same structure as shipping) |
| `tracking` | object | Shipment tracking information |
| `tracking.carrier` | string | Shipping carrier name |
| `tracking.trackingNumber` | string | Tracking number |
| `tracking.trackingUrl` | string | Tracking URL |
| `tracking.estimatedDelivery` | timestamp | Expected delivery date |
| `timeline` | object | Order status timeline |
| `timeline.placedAt` | timestamp | When order was placed |
| `timeline.confirmedAt` | timestamp | When order was confirmed |
| `timeline.shippedAt` | timestamp | When order was shipped |
| `timeline.deliveredAt` | timestamp | When order was delivered |
| `timeline.cancelledAt` | timestamp | When order was cancelled |
| `notes` | object | Additional notes |
| `notes.customerNote` | string | Customer's note/instructions |
| `notes.adminNote` | string | Internal admin notes |
| `createdAt` | timestamp | Order creation timestamp |
| `updatedAt` | timestamp | Last update timestamp |

### Example Document

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
      "productSlug": "organic-tomatoes",
      "quantity": 2,
      "price": 150,
      "imageUrl": "https://cloudinary.com/...",
      "variant": {
        "weight": "1kg"
      }
    },
    {
      "productId": "prod_002",
      "productName": "Fresh Spinach",
      "productSlug": "fresh-spinach",
      "quantity": 1,
      "price": 80,
      "imageUrl": "https://cloudinary.com/...",
      "variant": {
        "weight": "500g"
      }
    }
  ],
  "pricing": {
    "subtotal": 380,
    "tax": 19,
    "shippingCost": 50,
    "discount": 0,
    "total": 449
  },
  "couponCode": null,
  "shippingAddress": {
    "fullName": "Rajesh Kumar",
    "phone": "+919876543210",
    "addressLine1": "123, Green Park",
    "addressLine2": "Sector 15",
    "city": "New Delhi",
    "state": "Delhi",
    "pinCode": "110016",
    "country": "India",
    "landmark": "Near Metro Station"
  },
  "billingAddress": {
    "fullName": "Rajesh Kumar",
    "phone": "+919876543210",
    "addressLine1": "123, Green Park",
    "addressLine2": "Sector 15",
    "city": "New Delhi",
    "state": "Delhi",
    "pinCode": "110016",
    "country": "India"
  },
  "tracking": {
    "carrier": "Delhivery",
    "trackingNumber": "DELV123456789",
    "trackingUrl": "https://www.delhivery.com/track/package/DELV123456789",
    "estimatedDelivery": "2025-12-05T18:00:00Z"
  },
  "timeline": {
    "placedAt": "2025-12-01T10:40:00Z",
    "confirmedAt": "2025-12-01T11:00:00Z",
    "shippedAt": "2025-12-02T09:30:00Z",
    "deliveredAt": null,
    "cancelledAt": null
  },
  "notes": {
    "customerNote": "Please call before delivery",
    "adminNote": "Priority customer - handle with care"
  },
  "createdAt": "2025-12-01T10:40:00Z",
  "updatedAt": "2025-12-02T09:30:00Z"
}
```

---

## 3. Order Status Flow

### Status Definitions

| Status | Description | Next Possible Status |
|--------|-------------|---------------------|
| `pending` | Order placed, awaiting confirmation | `confirmed`, `cancelled`, `failed` |
| `confirmed` | Order confirmed by admin/system | `processing`, `cancelled` |
| `processing` | Order is being prepared | `shipped`, `cancelled` |
| `shipped` | Order dispatched for delivery | `delivered`, `failed` |
| `delivered` | Order successfully delivered | - (terminal state) |
| `cancelled` | Order cancelled by user/admin | - (terminal state) |
| `failed` | Order failed (payment/delivery) | `pending` (retry) |

### Payment Status Flow

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet received (COD) or awaiting confirmation |
| `paid` | Payment successfully received |
| `failed` | Payment failed |
| `refunded` | Payment refunded to customer |

---

## 4. Indexes Required

### For Carts Collection
- No additional indexes needed (single document per user)

### For Orders Collection

```javascript
// Composite indexes
orders: [userId, createdAt DESC]
orders: [status, createdAt DESC]
orders: [userId, status, createdAt DESC]
orders: [paymentStatus, createdAt DESC]
orders: [orderNumber] // for quick lookup
```

---

## 5. Security Rules (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Carts Collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders Collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Users can create orders
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Only admins can update/delete orders
      allow update, delete: if request.auth != null && 
                               request.auth.token.admin == true;
    }
  }
}
```

---

## 6. Helper Functions & Utilities

### Generate Order Number

```javascript
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}-${timestamp}${random}`;
}
```

### Calculate Pricing

```javascript
function calculatePricing(items, shippingCost = 50, couponDiscount = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const discount = couponDiscount;
  const total = subtotal + tax + shippingCost - discount;
  
  return {
    subtotal,
    tax,
    shippingCost,
    discount,
    total
  };
}
```

---

## 7. Additional Collections (Future Considerations)

### Users Collection
```
users/{userId}
- profile information
- saved addresses
- order history references
```

### Coupons Collection
```
coupons/{couponCode}
- discount percentage/amount
- validity dates
- usage limits
```

### Reviews Collection
```
reviews/{reviewId}
- productId
- userId
- rating
- comment
- createdAt
```

---

## Notes

1. **Denormalization**: Product details are denormalized in carts and orders to maintain historical accuracy even if product details change later.

2. **Timestamps**: Use Firebase server timestamps (`serverTimestamp()`) for consistency.

3. **Phone Numbers**: Store in international format with country code.

4. **Pricing**: Store all prices in smallest currency unit (paise for INR) or as decimal numbers.

5. **COD Support**: Payment status remains `pending` until delivery confirmation for COD orders.

6. **Scalability**: Consider subcollections for order items if orders can have 100+ items.

7. **Backup**: Implement Cloud Functions to backup completed orders to a separate collection for analytics.
