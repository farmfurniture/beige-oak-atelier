# Troubleshooting: Orders Not Showing in Admin Panel

## Quick Fix Steps

### Step 1: Set Up Admin Access

**Option A: Use the Setup Page (Easiest)**
1. Navigate to: `http://localhost:3000/admin/setup`
2. Sign in if not already signed in
3. Click "Create Admin Access" button
4. Go back to `/admin/orders`

**Option B: Manual Setup in Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click **Start collection** or navigate to collections
5. Create collection named: `admins`
6. Click **Add document**
7. Set **Document ID** to your Firebase User UID (get from Authentication tab)
8. Add these fields:
   - `role` (string): `"admin"`
   - `email` (string): your email address
   - `createdAt` (timestamp): click "Set to current time"
9. Click **Save**
10. Refresh the admin orders page

### Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Common errors and solutions below

---

## Common Issues and Solutions

### Issue 1: "Permission Denied" Error

**Symptoms:**
- Console shows: `permission-denied`
- Orders page shows "No orders found"
- Toast notification: "Permission denied"

**Solutions:**

1. **Check Admin Document Exists**
   ```javascript
   // Run in browser console
   import { doc, getDoc } from 'firebase/firestore';
   import { db } from '@/config/firebase';
   import { auth } from '@/config/firebase-client';
   
   const user = auth.currentUser;
   const adminDoc = await getDoc(doc(db, 'admins', user.uid));
   console.log('Admin doc exists:', adminDoc.exists());
   console.log('Admin data:', adminDoc.data());
   ```

2. **Verify Firestore Rules Are Deployed**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Check Rule Syntax**
   - Open `firestore.rules`
   - Look for syntax errors
   - Ensure `isAdmin()` function is correct

### Issue 2: No Orders in Database

**Symptoms:**
- No error messages
- Page loads successfully
- Shows "No orders found"

**Solutions:**

1. **Check if Orders Exist**
   - Go to Firebase Console → Firestore Database
   - Look for `orders` collection
   - Check if any documents exist

2. **Create Test Order**
   - Go to your website as a regular user
   - Add items to cart
   - Complete checkout
   - Check if order appears in Firestore

### Issue 3: Orders Exist But Not Showing

**Symptoms:**
- Orders visible in Firebase Console
- Admin document exists
- Still no orders showing in admin panel

**Solutions:**

1. **Check Firestore Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Check Console for Index Errors**
   - Look for messages about missing indexes
   - Click the link in error to create index
   - Or deploy indexes as above

3. **Verify Query Permissions**
   - Check `firestore.rules` has:
   ```javascript
   match /orders/{orderId} {
     allow list: if isAdmin();
   }
   ```

### Issue 4: "Failed to Load Orders" Error

**Symptoms:**
- Generic error message
- Console shows network error or timeout

**Solutions:**

1. **Check Firebase Configuration**
   - Verify `.env.local` has correct Firebase config
   - Check `src/config/firebase.ts` is initialized

2. **Check Network Connection**
   - Ensure internet connection is working
   - Check if Firebase is accessible

3. **Check Firebase Project Status**
   - Go to Firebase Console
   - Verify project is active
   - Check billing status (if applicable)

### Issue 5: User Not Signed In

**Symptoms:**
- Redirected to login page
- "Not signed in" message

**Solutions:**

1. **Sign In First**
   - Go to `/sign-in`
   - Sign in with your account
   - Then go to `/admin/orders`

2. **Check Auth State**
   ```javascript
   // Run in browser console
   import { auth } from '@/config/firebase-client';
   console.log('Current user:', auth.currentUser);
   ```

---

## Diagnostic Tools

### Tool 1: Admin Setup Page

Navigate to: `/admin/setup`

This page will:
- Show your current user info
- Check if you're an admin
- Allow you to create admin access
- Provide troubleshooting steps

### Tool 2: Browser Console Diagnostic

Run this in browser console:

```javascript
// Check current user
import { auth } from '@/config/firebase-client';
console.log('User:', auth.currentUser?.email);

// Check admin status
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
console.log('Is Admin:', adminDoc.exists() && adminDoc.data().role === 'admin');

// Check orders
import { collection, getDocs, query, limit } from 'firebase/firestore';
const ordersQuery = query(collection(db, 'orders'), limit(5));
const ordersSnapshot = await getDocs(ordersQuery);
console.log('Orders count:', ordersSnapshot.size);
```

### Tool 3: Check Firestore Rules

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Verify rules are deployed
5. Check last deployment time

---

## Step-by-Step Verification

### ✅ Checklist

- [ ] User is signed in
- [ ] User UID is known
- [ ] Admin document exists in Firestore
- [ ] Admin document has `role: "admin"` field
- [ ] Firestore rules are deployed
- [ ] Firestore indexes are deployed
- [ ] Orders collection exists
- [ ] At least one order exists in database
- [ ] Browser console shows no errors
- [ ] Network requests are successful

### Verification Commands

```bash
# 1. Check Firebase project
firebase projects:list

# 2. Deploy rules
firebase deploy --only firestore:rules

# 3. Deploy indexes
firebase deploy --only firestore:indexes

# 4. Check deployment status
firebase deploy:list
```

---

## Manual Admin Creation (Failsafe Method)

If all else fails, create admin manually:

### Using Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click **Start collection** (if no collections exist)
5. Collection ID: `admins`
6. Click **Next**
7. Document ID: `[YOUR_USER_UID]` (get from Authentication tab)
8. Add fields:
   ```
   Field: role
   Type: string
   Value: admin

   Field: email
   Type: string
   Value: your@email.com

   Field: createdAt
   Type: timestamp
   Value: [click "Set to current time"]
   ```
9. Click **Save**
10. Refresh admin orders page

### Get Your User UID

1. Go to Firebase Console → Authentication
2. Find your user in the list
3. Copy the **User UID** column value
4. Use this as the Document ID in admins collection

---

## Still Not Working?

### Check These Files

1. **firestore.rules**
   - Ensure no syntax errors
   - Verify `isAdmin()` function exists
   - Check `allow list: if isAdmin();` is present

2. **src/config/firebase.ts**
   - Verify Firebase is initialized
   - Check `db` is exported

3. **src/services/firestore.service.ts**
   - Verify `getAllOrders()` function exists
   - Check import path for `db`

### Enable Debug Logging

Add to `src/components/admin/sections/OrdersSection.tsx`:

```typescript
const loadData = async () => {
  try {
    console.log('=== LOADING ORDERS DEBUG ===');
    console.log('User:', auth.currentUser?.email);
    
    const ordersData = await getAllOrders();
    console.log('Orders loaded:', ordersData.length);
    console.log('First order:', ordersData[0]);
    
    setOrders(ordersData);
  } catch (error) {
    console.error('=== ERROR LOADING ORDERS ===');
    console.error('Error:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
  }
};
```

---

## Contact Support

If you've tried everything and it still doesn't work:

1. **Check Browser Console**
   - Copy all error messages
   - Take screenshots

2. **Check Firebase Console**
   - Verify admin document exists
   - Check orders collection exists
   - Look for any error messages

3. **Provide Information**
   - Browser and version
   - Error messages from console
   - Screenshots of Firebase Console
   - Steps you've already tried

---

## Quick Reference

### Important URLs

- Admin Setup: `/admin/setup`
- Admin Orders: `/admin/orders`
- Firebase Console: https://console.firebase.google.com
- Sign In: `/sign-in`

### Important Commands

```bash
# Deploy everything
firebase deploy

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Check deployment
firebase deploy:list
```

### Important Files

- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes
- `src/config/firebase.ts` - Firebase config
- `src/services/firestore.service.ts` - Order functions
- `src/components/admin/sections/OrdersSection.tsx` - Orders display

---

## Success Indicators

You'll know it's working when:

✅ No errors in browser console
✅ Orders page loads without errors
✅ Statistics cards show numbers
✅ Orders table displays data
✅ Can click on orders to view details
✅ Can update order status
✅ Filters work correctly

---

**Last Updated:** December 2, 2025
