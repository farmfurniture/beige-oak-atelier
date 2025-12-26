# Admin Order Management - Deployment Checklist

Use this checklist to ensure proper deployment of the admin order management system.

---

## Pre-Deployment Checklist

### 1. Code Review
- [x] All TypeScript files compile without errors
- [x] No console errors in development
- [x] All components render correctly
- [x] Responsive design tested on mobile/tablet/desktop
- [x] All imports are correct
- [x] No unused imports or variables

### 2. Firebase Configuration
- [ ] Firebase project is set up
- [ ] Firebase config is in `src/config/firebase.ts`
- [ ] Environment variables are set (`.env.local`)
- [ ] Firebase SDK is initialized correctly

### 3. Firestore Setup
- [ ] Firestore database is created
- [ ] Collections exist: `orders`, `admins`, `users`
- [ ] Sample data is available for testing

---

## Deployment Steps

### Step 1: Deploy Firestore Security Rules

```bash
# Review the rules first
cat firestore.rules

# Deploy to Firebase
firebase deploy --only firestore:rules
```

**Verify:**
- [ ] Rules deployed successfully
- [ ] No syntax errors in rules
- [ ] Admin access control is working

### Step 2: Deploy Firestore Indexes

```bash
# Review indexes
cat firestore.indexes.json

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Verify:**
- [ ] Indexes are created
- [ ] Composite indexes for orders collection
- [ ] No index errors in console

**Required Indexes:**
```
orders: [userId, createdAt DESC]
orders: [status, createdAt DESC]
orders: [userId, status, createdAt DESC]
orders: [paymentStatus, createdAt DESC]
```

### Step 3: Create Admin Users

**Option A: Firebase Console**
1. [ ] Go to Firestore Database
2. [ ] Create `admins` collection
3. [ ] Add document with admin user UID
4. [ ] Set fields: `role: "admin"`, `email: "admin@example.com"`

**Option B: Using Script**
```bash
# Update src/scripts/add-admin.ts with user UIDs
# Then run:
npx tsx src/scripts/add-admin.ts
```

**Verify:**
- [ ] Admin document exists in Firestore
- [ ] Role field is set to "admin"
- [ ] Email field is correct

### Step 4: Test Admin Access

1. [ ] Sign in with admin user
2. [ ] Navigate to `/admin/orders`
3. [ ] Verify you can see all orders
4. [ ] Test filtering by status
5. [ ] Test filtering by payment
6. [ ] Test date range filter
7. [ ] Test search functionality
8. [ ] Click on an order to view details
9. [ ] Test updating order status
10. [ ] Test adding tracking information
11. [ ] Test adding admin notes

### Step 5: Test User Access (Non-Admin)

1. [ ] Sign in with regular user (not in admins collection)
2. [ ] Try to access `/admin/orders` - should be blocked
3. [ ] Navigate to `/orders` (user orders page)
4. [ ] Verify user can only see their own orders
5. [ ] Verify user cannot update orders

### Step 6: Deploy Application

```bash
# Build the application
npm run build

# Test the build locally
npm run start

# Deploy to hosting (Vercel/Firebase)
# For Vercel:
vercel --prod

# For Firebase Hosting:
firebase deploy --only hosting
```

**Verify:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No build warnings (or acceptable warnings)
- [ ] Application runs in production mode

---

## Post-Deployment Verification

### Functionality Tests

**Orders List Page:**
- [ ] Page loads without errors
- [ ] Statistics cards show correct data
- [ ] Orders table displays all orders
- [ ] Status filter works
- [ ] Payment filter works
- [ ] Date range filter works
- [ ] Custom date range works
- [ ] Search works (order number, name, email)
- [ ] Clear filters button works
- [ ] Refresh button works
- [ ] Results counter is accurate
- [ ] Click on order navigates to detail page

**Order Detail Page:**
- [ ] Page loads without errors
- [ ] All order information displays correctly
- [ ] Order items show with images
- [ ] Pricing breakdown is correct
- [ ] Customer information displays
- [ ] Shipping address displays
- [ ] Payment method displays
- [ ] Status badges show correct colors
- [ ] Update status form works
- [ ] Payment status update works
- [ ] Admin notes save correctly
- [ ] Tracking form works
- [ ] Tracking information saves
- [ ] Timeline shows all events
- [ ] Back button works
- [ ] Loading states work

**Status Transitions:**
- [ ] pending → confirmed works
- [ ] confirmed → processing works
- [ ] processing → shipped works
- [ ] shipped → delivered works
- [ ] Any status → cancelled works
- [ ] Invalid transitions are blocked
- [ ] Error messages show for invalid transitions

**Automatic Actions:**
- [ ] COD orders auto-mark as paid on delivery
- [ ] Timestamps update correctly
- [ ] Timeline updates on status change
- [ ] Admin notes save with status updates

### Security Tests

**Admin Access:**
- [ ] Admin can view all orders
- [ ] Admin can update any order
- [ ] Admin can add tracking to any order
- [ ] Admin can cancel any order

**User Access:**
- [ ] Users can only see their own orders
- [ ] Users cannot access `/admin/orders`
- [ ] Users cannot update orders
- [ ] Users get permission denied on admin routes

**Firestore Rules:**
- [ ] Rules prevent unauthorized access
- [ ] Rules allow admin operations
- [ ] Rules validate status transitions
- [ ] Rules validate order creation

### Performance Tests

- [ ] Orders list loads in < 2 seconds
- [ ] Order detail loads in < 1 second
- [ ] Filters apply instantly (client-side)
- [ ] Search is responsive
- [ ] No lag when typing in search
- [ ] Status updates are fast
- [ ] Optimistic updates work

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Design

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

---

## Monitoring Setup

### Firebase Console

1. [ ] Set up Firebase Console access
2. [ ] Monitor Firestore usage
3. [ ] Check for security rule violations
4. [ ] Monitor query performance

### Error Tracking

1. [ ] Set up error logging (optional: Sentry)
2. [ ] Monitor console errors
3. [ ] Track failed operations
4. [ ] Set up alerts for critical errors

### Analytics (Optional)

1. [ ] Set up Google Analytics
2. [ ] Track admin actions
3. [ ] Monitor order updates
4. [ ] Track page views

---

## Documentation Review

- [x] ADMIN_ORDER_MANAGEMENT.md - Complete system docs
- [x] ADMIN_SETUP_GUIDE.md - Setup instructions
- [x] ADMIN_QUICK_REFERENCE.md - Quick reference
- [x] ADMIN_ARCHITECTURE.md - System architecture
- [x] IMPLEMENTATION_SUMMARY.md - Implementation details
- [x] DEPLOYMENT_CHECKLIST_ADMIN.md - This checklist

---

## Rollback Plan

If issues occur after deployment:

### Immediate Actions

1. **Revert Firestore Rules** (if rules cause issues)
```bash
# Restore previous rules from backup
firebase deploy --only firestore:rules
```

2. **Disable Admin Access** (if security issue)
```bash
# Remove all documents from admins collection
# Or update rules to deny all admin operations temporarily
```

3. **Revert Application Code**
```bash
# Revert to previous commit
git revert HEAD
git push

# Redeploy
vercel --prod
```

### Backup Strategy

- [ ] Backup Firestore data before deployment
- [ ] Keep previous version of firestore.rules
- [ ] Tag releases in Git
- [ ] Document all changes

---

## Support Contacts

**Technical Issues:**
- Email: tech@farmscraft.com
- Slack: #tech-support

**Firebase Issues:**
- Firebase Console: https://console.firebase.google.com
- Firebase Support: https://firebase.google.com/support

**Deployment Issues:**
- Vercel Support: https://vercel.com/support
- Firebase Hosting: https://firebase.google.com/support/contact

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check Firestore usage
- [ ] Gather admin feedback
- [ ] Fix any critical bugs

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Add requested features
- [ ] Update documentation

### Ongoing
- [ ] Regular security audits
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Feature enhancements

---

## Success Criteria

The deployment is successful when:

✅ All admin users can access `/admin/orders`
✅ All orders are visible to admins
✅ Filters and search work correctly
✅ Order status updates work
✅ Tracking information can be added
✅ Regular users cannot access admin panel
✅ No security rule violations
✅ No console errors
✅ Performance is acceptable (< 2s load time)
✅ Mobile experience is good
✅ All documentation is complete

---

## Sign-Off

**Deployed By:** ___________________  
**Date:** ___________________  
**Version:** ___________________  
**Environment:** [ ] Development [ ] Staging [ ] Production

**Verified By:** ___________________  
**Date:** ___________________  

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Next Steps After Deployment

1. **Monitor for 24 hours** - Watch for any errors or issues
2. **Gather feedback** - Ask admins about their experience
3. **Document issues** - Keep track of any problems
4. **Plan improvements** - Based on feedback and usage
5. **Schedule review** - Review system after 1 week

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Project Documentation](./ADMIN_ORDER_MANAGEMENT.md)

---

**Deployment Status:** [ ] Not Started [ ] In Progress [ ] Completed [ ] Verified

**Last Updated:** ___________________
