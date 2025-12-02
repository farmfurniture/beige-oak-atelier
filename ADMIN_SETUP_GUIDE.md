# Admin Setup Guide

This guide will help you set up admin users for the FarmsCraft order management system.

---

## Quick Setup (Firebase Console)

### Step 1: Get User ID

1. Sign in to your Firebase Console: https://console.firebase.google.com
2. Go to **Authentication** → **Users**
3. Find the user you want to make an admin
4. Copy their **User UID** (it looks like: `abc123xyz789...`)

### Step 2: Add Admin Document

1. Go to **Firestore Database** in Firebase Console
2. Click **Start collection** (or navigate to existing collections)
3. Create a new collection called `admins` (if it doesn't exist)
4. Click **Add document**
5. Set **Document ID** to the User UID you copied
6. Add these fields:

```
Field: role
Type: string
Value: admin

Field: email
Type: string
Value: admin@farmscraft.com (the user's email)

Field: createdAt
Type: timestamp
Value: (click "Set to current time")
```

7. Click **Save**

### Step 3: Verify Access

1. Sign in to your app with the admin user
2. Navigate to `/admin/orders`
3. You should now see all orders!

---

## Method 2: Using Firebase Admin SDK (Production)

For production environments, use Firebase Admin SDK:

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Create Admin Script

Create `scripts/setup-admin.js`:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addAdmin(uid, email) {
  try {
    await db.collection('admins').doc(uid).set({
      role: 'admin',
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Admin added: ${email}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add your admin
addAdmin('USER_UID_HERE', 'admin@farmscraft.com')
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

### 3. Run the Script

```bash
node scripts/setup-admin.js
```

---

## Method 3: Using Custom Claims (Alternative)

If you prefer using Firebase Custom Claims instead of Firestore:

### 1. Update Firestore Rules

Change the `isAdmin()` function in `firestore.rules`:

```javascript
function isAdmin() {
  return isAuthenticated() && request.auth.token.admin == true;
}
```

### 2. Set Custom Claim (Server-side only)

```javascript
const admin = require('firebase-admin');

async function setAdminClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ Admin claim set for user: ${uid}`);
}

setAdminClaim('USER_UID_HERE');
```

### 3. User Must Re-login

After setting custom claims, the user must sign out and sign back in for the claims to take effect.

---

## Verify Admin Setup

### Check in Firebase Console

1. Go to **Firestore Database**
2. Navigate to `admins` collection
3. Verify your admin document exists with correct fields

### Check in Application

1. Sign in with the admin user
2. Open browser console (F12)
3. Run this code:

```javascript
// Check if user is in admins collection
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';

const checkAdmin = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Not signed in');
    return;
  }
  
  const adminDoc = await getDoc(doc(db, 'admins', user.uid));
  if (adminDoc.exists()) {
    console.log('✅ User is admin:', adminDoc.data());
  } else {
    console.log('❌ User is not admin');
  }
};

checkAdmin();
```

---

## Remove Admin Access

To remove admin access from a user:

### Using Firebase Console

1. Go to **Firestore Database**
2. Navigate to `admins` collection
3. Find the user's document
4. Click the three dots → **Delete document**

### Using Script

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function removeAdmin(uid) {
  await db.collection('admins').doc(uid).delete();
  console.log(`✅ Admin removed: ${uid}`);
}

removeAdmin('USER_UID_HERE');
```

---

## Security Best Practices

1. **Limit Admin Users**: Only give admin access to trusted users
2. **Use Strong Passwords**: Ensure admin accounts have strong passwords
3. **Enable 2FA**: Enable two-factor authentication for admin accounts
4. **Monitor Access**: Regularly review who has admin access
5. **Audit Logs**: Consider implementing audit logs for admin actions
6. **Separate Environments**: Use different admin users for dev/staging/production

---

## Troubleshooting

### "Permission Denied" Error

**Cause:** User is not in admins collection or Firestore rules not deployed

**Solution:**
1. Verify user document exists in `admins` collection
2. Check document has `role: "admin"` field
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. Clear browser cache and sign in again

### Admin Panel Not Loading

**Cause:** Admin middleware blocking access

**Solution:**
1. Check admin session cookie is set
2. Verify admin authentication in `AdminAuthContext`
3. Check browser console for errors

### Cannot See All Orders

**Cause:** Firestore rules not allowing admin access

**Solution:**
1. Verify `isAdmin()` function in firestore.rules
2. Check user is in admins collection
3. Deploy rules: `firebase deploy --only firestore:rules`

---

## Next Steps

After setting up admin access:

1. ✅ Test admin login
2. ✅ Verify you can see all orders at `/admin/orders`
3. ✅ Test updating an order status
4. ✅ Test adding tracking information
5. ✅ Review the [Admin Order Management Documentation](./ADMIN_ORDER_MANAGEMENT.md)

---

## Support

If you encounter issues:

1. Check this guide
2. Review [ADMIN_ORDER_MANAGEMENT.md](./ADMIN_ORDER_MANAGEMENT.md)
3. Check Firebase Console for errors
4. Verify Firestore rules are deployed
5. Check browser console for JavaScript errors
