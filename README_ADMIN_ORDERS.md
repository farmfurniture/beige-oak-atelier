# Admin Order Management System

A comprehensive order management system for FarmsCraft e-commerce platform, built with Next.js 14, TypeScript, and Firebase.

---

## 🚀 Quick Start

### 1. Setup Admin User

```bash
# Go to Firebase Console → Firestore Database
# Create collection: admins
# Add document with your user UID:
{
  "role": "admin",
  "email": "your-email@example.com",
  "createdAt": <current timestamp>
}
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 4. Access Admin Panel

```
https://your-domain.com/admin/orders
```

---

## 📋 Features

### Orders List (`/admin/orders`)
- ✅ View all customer orders
- ✅ Real-time statistics (Total, Pending, Delivered, Revenue)
- ✅ Advanced filtering:
  - Status (pending, confirmed, processing, shipped, delivered, cancelled, failed)
  - Payment status (pending, paid, failed, refunded)
  - Date range (today, this week, this month, custom)
  - Search (order number, customer name, email)
- ✅ Quick status updates
- ✅ Responsive design

### Order Detail (`/admin/orders/[id]`)
- ✅ Complete order information
- ✅ Update order status
- ✅ Update payment status
- ✅ Add tracking information
- ✅ Add admin notes
- ✅ View order timeline
- ✅ Customer contact details
- ✅ Shipping address

---

## 🔒 Security

### Admin Access Control

Admins are identified by documents in the `admins` collection:

```typescript
// Firestore structure
admins/{userId}
  - role: "admin"
  - email: "admin@example.com"
  - createdAt: timestamp
```

### Firestore Security Rules

```javascript
// Users can only read their own orders
allow read: if request.auth.uid == resource.data.userId;

// Admins can read/update all orders
allow read, update: if isAdmin();

// isAdmin() checks admins collection
function isAdmin() {
  return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

---

## 📊 Order Status Flow

```
pending → confirmed → processing → shipped → delivered
   ↓          ↓           ↓
cancelled  cancelled  cancelled
```

### Valid Transitions

| From | To |
|------|-----|
| pending | confirmed, cancelled, failed |
| confirmed | processing, cancelled |
| processing | shipped, cancelled |
| shipped | delivered, failed |
| delivered | (terminal) |
| cancelled | (terminal) |
| failed | pending (retry) |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Firebase Authentication, Cloud Firestore
- **State:** React Context, React Hooks

---

## 📁 File Structure

```
src/
├── app/
│   └── admin/
│       └── (dashboard)/
│           └── orders/
│               ├── page.tsx              # Orders list
│               └── [id]/
│                   └── page.tsx          # Order detail
├── components/
│   └── admin/
│       └── sections/
│           └── OrdersSection.tsx         # Orders table component
├── services/
│   └── firestore.service.ts             # Firestore operations
├── types/
│   └── firestore.ts                     # Type definitions
└── context/
    └── AdminAuthContext.tsx             # Admin auth context

firestore.rules                          # Security rules
firestore.indexes.json                   # Database indexes
```

---

## 🔧 API Functions

### Order Operations

```typescript
// Get all orders (with optional filters)
getAllOrders(filters?: OrderFilters): Promise<Order[]>

// Get single order
getOrder(orderId: string): Promise<Order | null>

// Update order status
updateOrderStatus(orderId: string, data: UpdateOrderStatusInput): Promise<void>

// Update tracking
updateOrderTracking(orderId: string, tracking: TrackingInfo): Promise<void>

// Cancel order
cancelOrder(orderId: string, reason?: string): Promise<void>

// Get statistics
getOrderStatistics(): Promise<OrderStats>
```

### Usage Example

```typescript
import { updateOrderStatus } from '@/services/firestore.service';

// Update order to shipped
await updateOrderStatus('order_123', {
  status: 'shipped',
  paymentStatus: 'paid',
  adminNote: 'Shipped via Delhivery'
});
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ADMIN_ORDER_MANAGEMENT.md](./ADMIN_ORDER_MANAGEMENT.md) | Complete system documentation |
| [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) | Step-by-step setup instructions |
| [ADMIN_QUICK_REFERENCE.md](./ADMIN_QUICK_REFERENCE.md) | Quick reference for daily tasks |
| [ADMIN_ARCHITECTURE.md](./ADMIN_ARCHITECTURE.md) | System architecture diagrams |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Implementation details |
| [DEPLOYMENT_CHECKLIST_ADMIN.md](./DEPLOYMENT_CHECKLIST_ADMIN.md) | Deployment checklist |

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Admin user created in Firestore

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your Firebase config to .env.local
```

### Development

```bash
# Run development server
npm run dev

# Open admin panel
http://localhost:3000/admin/orders
```

### Deployment

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Build and deploy application
npm run build
vercel --prod
```

---

## 🧪 Testing

### Manual Testing Checklist

**Admin Access:**
- [ ] Admin can access `/admin/orders`
- [ ] Non-admin cannot access admin routes
- [ ] Admin can see all orders

**Orders List:**
- [ ] View all orders
- [ ] Filter by status
- [ ] Filter by payment
- [ ] Filter by date range
- [ ] Search orders

**Order Detail:**
- [ ] View order details
- [ ] Update status
- [ ] Add tracking
- [ ] Add notes

**Status Transitions:**
- [ ] Valid transitions work
- [ ] Invalid transitions blocked
- [ ] Timestamps update correctly

---

## 🐛 Troubleshooting

### "Permission Denied" Error

**Cause:** User not in admins collection

**Solution:**
1. Check Firestore `admins` collection
2. Verify user document exists
3. Ensure `role: "admin"` field is set

### Orders Not Loading

**Cause:** Missing Firestore indexes

**Solution:**
```bash
firebase deploy --only firestore:indexes
```

### Cannot Update Status

**Cause:** Invalid status transition

**Solution:** Check valid transitions in [Status Flow](#-order-status-flow)

---

## 📞 Support

- **Documentation:** See docs folder
- **Issues:** Create GitHub issue
- **Email:** tech@farmscraft.com

---

## 🎯 Roadmap

### Current Features (v1.0)
- ✅ View all orders
- ✅ Filter and search
- ✅ Update status
- ✅ Add tracking
- ✅ Order timeline

### Planned Features (v2.0)
- [ ] Bulk operations
- [ ] Export to CSV/Excel
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Order analytics
- [ ] Refund processing
- [ ] Return management

---

## 📄 License

This project is part of FarmsCraft e-commerce platform.

---

## 👥 Contributors

- Admin Order Management System
- Built with ❤️ for FarmsCraft

---

## 🔗 Related Links

- [Firebase Console](https://console.firebase.google.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 📝 Changelog

### v1.0.0 (2025-12-02)
- ✅ Initial release
- ✅ Orders list with filters
- ✅ Order detail page
- ✅ Status management
- ✅ Tracking management
- ✅ Admin access control
- ✅ Complete documentation

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
