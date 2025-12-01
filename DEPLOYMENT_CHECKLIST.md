# 🚀 Deployment Checklist - Cart & Orders System

## ✅ Completed Steps

- [x] Environment variables configured (`.env.local`)
- [x] Firestore schema designed
- [x] TypeScript types created (`src/types/firestore.ts`)
- [x] Service functions created (`src/services/firestore.service.ts`)
- [x] Security rules prepared (`firestore.rules`)
- [x] Indexes configuration created (`firestore.indexes.json`)
- [x] Firebase configuration created manually (`firebase.json`, `.firebaserc`)

---

## 📋 Next Steps to Execute

### Step 1: Deploy Firestore Security Rules

**Option A: Using Firebase Console (Recommended for now)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **farmscraft-fed87**
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

**Option B: Using Firebase CLI (Requires Login)**

Since `firebase init` was skipped, you can directly deploy if you login:

```bash
# Login to Firebase
firebase login

# Deploy rules and indexes
firebase deploy --only firestore
```

---

### Step 2: Deploy Firestore Indexes

**Option A: Using Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **farmscraft-fed87**
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add Index** for each of the following:

#### Index 1: User Orders
- Collection ID: `orders`
- Fields to index:
  - `userId` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

#### Index 2: Orders by Status
- Collection ID: `orders`
- Fields to index:
  - `status` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

#### Index 3: User Orders by Status
- Collection ID: `orders`
- Fields to index:
  - `userId` - Ascending
  - `status` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

#### Index 4: Orders by Payment Status
- Collection ID: `orders`
- Fields to index:
  - `paymentStatus` - Ascending
  - `createdAt` - Descending
- Query scope: Collection

**Option B: Using Firebase CLI**

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

---

### Step 3: Set Up Admin Collection (Optional but Recommended)

To enable admin functionality, you need to create an `admins` collection:

1. Go to Firebase Console → Firestore Database
2. Click **Start collection**
3. Collection ID: `admins`
4. Add your first admin document:
   - Document ID: `{your-user-uid}` (get this from Firebase Auth)
   - Fields:
     - `role`: `admin` (string)
     - `email`: `your-email@example.com` (string)
     - `createdAt`: (timestamp - use server timestamp)

**How to get your User UID:**
- Go to Firebase Console → Authentication
- Find your user in the list
- Copy the UID

---

### Step 4: Test the Implementation

Create a simple test to verify everything works:

#### Test 1: Add Item to Cart

```typescript
// In your browser console or a test page
import { addToCart } from '@/services/firestore.service';
import { Timestamp } from 'firebase/firestore';

// Replace with your actual user ID
const userId = 'your-user-id';

await addToCart(userId, {
  productId: 'test_prod_001',
  productName: 'Test Product',
  productSlug: 'test-product',
  quantity: 1,
  price: 100,
  imageUrl: 'https://via.placeholder.com/150',
});

console.log('Item added to cart!');
```

#### Test 2: Get Cart

```typescript
import { getCart } from '@/services/firestore.service';

const userId = 'your-user-id';
const cart = await getCart(userId);
console.log('Cart:', cart);
```

#### Test 3: Create Order

```typescript
import { createOrder } from '@/services/firestore.service';
import { Timestamp } from 'firebase/firestore';

const orderInput = {
  userId: 'your-user-id',
  userEmail: 'test@example.com',
  userPhone: '+919876543210',
  status: 'pending' as const,
  paymentMethod: 'cod' as const,
  paymentStatus: 'pending' as const,
  items: [
    {
      productId: 'test_prod_001',
      productName: 'Test Product',
      productSlug: 'test-product',
      quantity: 1,
      price: 100,
      imageUrl: 'https://via.placeholder.com/150',
    }
  ],
  pricing: {
    subtotal: 100,
    tax: 5,
    shippingCost: 50,
    discount: 0,
    total: 155,
  },
  shippingAddress: {
    fullName: 'Test User',
    phone: '+919876543210',
    addressLine1: '123 Test Street',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    country: 'India',
  },
  billingAddress: {
    fullName: 'Test User',
    phone: '+919876543210',
    addressLine1: '123 Test Street',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    country: 'India',
  },
  timeline: {
    placedAt: Timestamp.now(),
  },
};

const orderId = await createOrder(orderInput);
console.log('Order created:', orderId);
```

---

### Step 5: Verify in Firebase Console

1. Go to Firebase Console → Firestore Database
2. You should see:
   - `carts` collection with your test cart
   - `orders` collection with your test order
3. Verify the data structure matches the schema

---

## 🔧 Implementation Roadmap

### Phase 1: Basic Cart Functionality (Week 1)
- [ ] Create cart context/provider
- [ ] Build cart page UI
- [ ] Implement add to cart button on product pages
- [ ] Add quantity update functionality
- [ ] Add remove from cart functionality
- [ ] Show cart total in header/navbar

### Phase 2: Checkout Flow (Week 2)
- [ ] Create checkout page
- [ ] Build address form component
- [ ] Implement address validation
- [ ] Add order review step
- [ ] Implement order creation
- [ ] Create order confirmation page

### Phase 3: Order Management (Week 3)
- [ ] Build user order history page
- [ ] Create order details page
- [ ] Add order tracking UI
- [ ] Implement order status display
- [ ] Add cancel order functionality

### Phase 4: Admin Dashboard (Week 4)
- [ ] Create admin orders list page
- [ ] Build order details admin view
- [ ] Add status update functionality
- [ ] Implement tracking number input
- [ ] Create order statistics dashboard
- [ ] Add bulk actions (if needed)

### Phase 5: Enhancements (Week 5+)
- [ ] Add email notifications
- [ ] Implement coupon system
- [ ] Add product reviews
- [ ] Create analytics dashboard
- [ ] Add export functionality
- [ ] Implement search and filters

---

## 🐛 Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution:** Make sure you've deployed the security rules from `firestore.rules`

### Issue: "The query requires an index"
**Solution:** Deploy the indexes from `firestore.indexes.json` or click the link in the error message to create the index automatically

### Issue: "Cannot find module '@/config/firebase'"
**Solution:** Check your `tsconfig.json` has the correct path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "auth is not defined"
**Solution:** Import auth from the correct location:
```typescript
import { auth } from '@/config/firebase-client';
```

### Issue: TypeScript errors in service functions
**Solution:** Make sure you've installed Firebase:
```bash
npm install firebase
```

---

## 📊 Monitoring & Analytics

Once deployed, monitor these metrics:

1. **Firestore Usage**
   - Document reads/writes
   - Storage size
   - Index usage

2. **User Behavior**
   - Cart abandonment rate
   - Average order value
   - Time to checkout

3. **Order Metrics**
   - Orders per day
   - Revenue per day
   - Order status distribution

---

## 🔐 Security Checklist

- [x] Security rules deployed
- [ ] Admin users configured in `admins` collection
- [ ] Environment variables secured (not committed to git)
- [ ] API keys restricted in Firebase Console
- [ ] CORS configured for your domain
- [ ] Rate limiting considered (Firebase App Check)

---

## 📝 Notes

- **Indexes take time to build**: After creating indexes, they may take a few minutes to become active
- **Test in development first**: Always test new features in development before deploying to production
- **Backup your data**: Consider setting up automated backups for Firestore
- **Monitor costs**: Keep an eye on Firestore usage to avoid unexpected costs

---

## 🎯 Quick Commands

```bash
# Check if Firebase CLI is installed
firebase --version

# Login to Firebase
firebase login

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore

# Check current project
firebase projects:list

# Switch project
firebase use farmscraft-fed87
```

---

## ✅ Verification Checklist

Before going to production:

- [ ] Security rules deployed and tested
- [ ] All indexes created and active
- [ ] Admin users configured
- [ ] Cart functionality tested
- [ ] Order creation tested
- [ ] Order status updates tested
- [ ] Email notifications working (if implemented)
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Mobile responsive design
- [ ] Cross-browser testing completed

---

## 🚀 You're Ready!

Once you've completed the steps above, your cart and orders system will be fully operational!

**Next**: Start implementing the UI components using the examples in `IMPLEMENTATION_GUIDE.md`

Good luck! 🎉
