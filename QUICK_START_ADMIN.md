# Quick Start - Simple Admin System

## 🎯 What Changed

The admin system is now **super simple**:
- ✅ Static credentials (no Firestore admin collection)
- ✅ Simple login page
- ✅ One admin user
- ✅ Session-based authentication

---

## 🚀 Get Started (2 Minutes)

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Login

Go to: **http://localhost:3000/admin/login**

**Default Credentials:**
- Email: `admin@farmscraft.com`
- Password: `admin123`

### 4. Access Admin Panel

After login, you'll be redirected to: **http://localhost:3000/admin/orders**

**Done!** 🎉

---

## 🔐 Change Admin Password

Open `src/config/admin-config.ts`:

```typescript
export const ADMIN_CONFIG = {
  email: "admin@farmscraft.com",      // Your email
  password: "your-secure-password",    // Your password
  sessionDuration: 24 * 60 * 60 * 1000,
};
```

Save and restart the server.

---

## 📋 What You Can Do

✅ View all orders
✅ Update order status  
✅ Add tracking information
✅ Filter and search orders
✅ View order statistics
✅ Manage order details

---

## 🐛 Troubleshooting

**Can't see orders?**
1. Make sure you deployed Firestore rules
2. Check if orders exist in Firestore
3. Check browser console for errors

**Can't login?**
1. Check credentials in `admin-config.ts`
2. Make sure email and password match exactly
3. Clear browser cache and try again

**Session expired?**
- Just login again at `/admin/login`
- Session lasts 24 hours by default

---

## 📚 More Info

- **Full Setup Guide**: `SIMPLE_ADMIN_SETUP.md`
- **Order Management**: `ADMIN_ORDER_MANAGEMENT.md`
- **Quick Reference**: `ADMIN_QUICK_REFERENCE.md`

---

## ✨ That's It!

No complex setup, no Firestore admin collection, just simple static credentials.

**Login URL**: http://localhost:3000/admin/login

**Default Credentials**:
- Email: `admin@farmscraft.com`
- Password: `admin123`

**⚠️ Change the password in production!**
