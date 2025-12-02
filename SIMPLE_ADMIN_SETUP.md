# Simple Admin Setup Guide

## Overview

The admin system now uses **static credentials** instead of Firestore-based authentication. This is much simpler and perfect for a single admin user.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Set Admin Credentials

Open `src/config/admin-config.ts` and change the credentials:

```typescript
export const ADMIN_CONFIG = {
  email: "admin@farmscraft.com",      // Change this
  password: "admin123",                // Change this to a secure password
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
};
```

**⚠️ Important:** Change the password to something secure!

### Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 3: Login

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   ```
   http://localhost:3000/admin/login
   ```

3. Enter your credentials (from Step 1)

4. You're in! Go to:
   ```
   http://localhost:3000/admin/orders
   ```

**That's it!** No Firestore admin collection needed.

---

## 📋 How It Works

### Authentication Flow

```
1. User visits /admin/login
2. Enters email and password
3. System checks against ADMIN_CONFIG
4. If valid, creates session in localStorage
5. User can access all admin pages
6. Session expires after 24 hours
```

### Session Management

- **Storage**: localStorage (client-side)
- **Duration**: 24 hours (configurable)
- **Auto-check**: Every minute
- **Logout**: Clears session and redirects to login

### Security

- Credentials stored in `admin-config.ts` (server-side)
- Session stored in browser localStorage
- Auto-logout after session expires
- Protected routes redirect to login if not authenticated

---

## 🔒 Changing Admin Credentials

### Method 1: Edit Config File (Recommended)

1. Open `src/config/admin-config.ts`
2. Change `email` and `password`
3. Save the file
4. Restart dev server
5. Login with new credentials

### Method 2: Environment Variables (More Secure)

1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_ADMIN_EMAIL=admin@farmscraft.com
   NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
   ```

2. Update `src/config/admin-config.ts`:
   ```typescript
   export const ADMIN_CONFIG = {
     email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@farmscraft.com",
     password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123",
     sessionDuration: 24 * 60 * 60 * 1000,
   };
   ```

3. Restart dev server

---

## 🎯 Admin Features

With admin access, you can:

✅ View all customer orders
✅ Update order status
✅ Add tracking information
✅ Manage order details
✅ Filter and search orders
✅ View order statistics
✅ Manage products (if implemented)
✅ Manage all site content

---

## 🔐 Security Best Practices

### For Development

- Use simple credentials like `admin@farmscraft.com` / `admin123`
- Keep credentials in `admin-config.ts`

### For Production

1. **Use Environment Variables**
   ```
   NEXT_PUBLIC_ADMIN_EMAIL=your-email@domain.com
   NEXT_PUBLIC_ADMIN_PASSWORD=very-secure-password-here
   ```

2. **Use Strong Password**
   - At least 12 characters
   - Mix of letters, numbers, symbols
   - Not a common word or phrase

3. **Enable HTTPS**
   - Always use HTTPS in production
   - Credentials are sent over the network

4. **Consider Additional Security**
   - Add rate limiting to login endpoint
   - Add CAPTCHA to prevent brute force
   - Add IP whitelisting if possible
   - Use 2FA for extra security (future enhancement)

---

## 📱 Admin Pages

### Available Routes

- `/admin/login` - Login page
- `/admin/orders` - Orders list
- `/admin/orders/[id]` - Order details
- `/admin/products` - Products management (if implemented)
- `/admin/customers` - Customers list (if implemented)
- `/admin/analytics` - Analytics dashboard (if implemented)

### Protected Routes

All `/admin/*` routes (except `/admin/login`) are protected and require authentication.

---

## 🐛 Troubleshooting

### Issue: Can't Login

**Solution:**
1. Check credentials in `admin-config.ts`
2. Make sure email and password match exactly
3. Check browser console for errors
4. Clear localStorage and try again

### Issue: Redirected to Login After Logging In

**Solution:**
1. Check browser console for errors
2. Make sure localStorage is enabled
3. Try in incognito mode
4. Clear browser cache

### Issue: Session Expires Too Quickly

**Solution:**
1. Open `admin-config.ts`
2. Increase `sessionDuration`:
   ```typescript
   sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
   ```

### Issue: Orders Still Not Showing

**Solution:**
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Check if orders exist in Firestore
3. Check browser console for errors
4. Make sure you're logged in

---

## 🔄 Migrating from Old System

If you had the old Firestore-based admin system:

1. **No migration needed!** The new system is completely separate
2. Old admin documents in Firestore are ignored
3. Just login with the new static credentials
4. Everything else works the same

---

## 📝 Files Changed

### New Files
- `src/app/admin/login/page.tsx` - Login page
- `src/config/admin-config.ts` - Admin credentials
- `src/middleware/admin-auth.ts` - Auth middleware
- `SIMPLE_ADMIN_SETUP.md` - This guide

### Modified Files
- `src/context/AdminAuthContext.tsx` - Simplified auth context
- `src/app/admin/(dashboard)/layout.tsx` - Removed cookie check
- `firestore.rules` - Simplified admin check
- `src/services/firestore.service.ts` - Better error handling

---

## ✅ Checklist

- [ ] Changed admin credentials in `admin-config.ts`
- [ ] Deployed Firestore rules
- [ ] Tested login at `/admin/login`
- [ ] Can access `/admin/orders`
- [ ] Orders are showing correctly
- [ ] Can update order status
- [ ] Session persists after page refresh

---

## 🎉 You're Done!

The admin system is now much simpler:

1. **One admin user** with static credentials
2. **No Firestore admin collection** needed
3. **Simple login page** at `/admin/login`
4. **Session-based** authentication
5. **Easy to change** credentials

Just login and start managing your orders!

---

**Default Credentials:**
- Email: `admin@farmscraft.com`
- Password: `admin123`

**⚠️ Remember to change these in production!**
