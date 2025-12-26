# Admin Order Management - Quick Reference

## Common Tasks

### 1. View All Orders
- Navigate to `/admin/orders`
- Use filters to narrow down results
- Click on order number to view details

### 2. Update Order Status

**From Orders List:**
- Click the status badge dropdown
- Select new status
- Status updates automatically

**From Order Detail Page:**
1. Navigate to `/admin/orders/[orderId]`
2. Update "Order Status" dropdown
3. Optionally update "Payment Status"
4. Add admin note if needed
5. Click "Update Status"

### 3. Add Tracking Information

1. Go to order detail page
2. Scroll to "Tracking Information" card
3. Enter:
   - Carrier (e.g., "Delhivery", "Blue Dart")
   - Tracking Number
   - Tracking URL (optional)
4. Click "Update Tracking"

### 4. Cancel an Order

1. Go to order detail page
2. Change status to "Cancelled"
3. Add reason in "Admin Note"
4. Click "Update Status"

### 5. Mark Order as Delivered

1. Go to order detail page
2. Change status to "Delivered"
3. Payment status will auto-update to "Paid" for COD orders
4. Click "Update Status"

### 6. Filter Orders

**By Status:**
- Select from "All statuses" dropdown

**By Payment:**
- Select from "All payments" dropdown

**By Date:**
- Select "Today", "This week", "This month"
- Or select "Custom range" and pick dates

**By Search:**
- Type order number, customer name, or email

### 7. Process a New Order

**Typical Flow:**
1. Order arrives as "Pending"
2. Review order details
3. Update to "Confirmed"
4. Prepare items → Update to "Processing"
5. Ship order → Update to "Shipped" + Add tracking
6. Order delivered → Update to "Delivered"

---

## Status Workflow

```
New Order (pending)
    ↓
Confirm Order (confirmed)
    ↓
Prepare Items (processing)
    ↓
Ship Order (shipped) ← Add tracking here
    ↓
Delivered (delivered) ← Auto-mark payment as paid for COD
```

**Alternative Paths:**
- Cancel anytime before shipped
- Mark as failed if delivery fails
- Retry failed orders (back to pending)

---

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search
- `Esc` - Clear filters
- `F5` - Refresh orders

---

## Order Status Colors

- 🟡 **Pending** - Yellow (needs attention)
- 🔵 **Confirmed** - Blue (acknowledged)
- 🟣 **Processing** - Purple (being prepared)
- 🟦 **Shipped** - Indigo (in transit)
- 🟢 **Delivered** - Green (completed)
- 🔴 **Cancelled** - Red (cancelled)
- 🔴 **Failed** - Red (failed)

---

## Payment Status Colors

- 🟡 **Pending** - Yellow (awaiting payment)
- 🟢 **Paid** - Green (payment received)
- 🔴 **Failed** - Red (payment failed)
- 🟠 **Refunded** - Orange (refunded)

---

## Quick Filters

**Today's Orders:**
- Date Range: "Today"

**Pending Orders:**
- Status: "Pending"

**Unpaid Orders:**
- Payment: "Pending"

**Shipped Orders:**
- Status: "Shipped"

**This Month's Revenue:**
- Date Range: "This month"
- Payment: "Paid"

---

## Common Carriers (India)

- Delhivery
- Blue Dart
- DTDC
- FedEx
- Ecom Express
- Xpressbees
- Shadowfax
- India Post

---

## Tracking URL Formats

**Delhivery:**
```
https://www.delhivery.com/track/package/[TRACKING_NUMBER]
```

**Blue Dart:**
```
https://www.bluedart.com/tracking/[TRACKING_NUMBER]
```

**DTDC:**
```
https://www.dtdc.in/tracking.asp?Ttype=0&strCnno=[TRACKING_NUMBER]
```

**India Post:**
```
https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=[TRACKING_NUMBER]
```

---

## Best Practices

1. **Confirm orders within 24 hours**
2. **Add tracking info when shipping**
3. **Update status promptly**
4. **Add admin notes for important info**
5. **Check pending orders daily**
6. **Respond to customer notes**
7. **Mark COD as paid only after delivery**

---

## Troubleshooting

**Can't update status?**
- Check if transition is valid
- Verify you're logged in as admin

**Orders not loading?**
- Click refresh button
- Check internet connection
- Clear browser cache

**Tracking not saving?**
- Ensure carrier and number are filled
- Check for special characters

---

## Support Contacts

- Technical Issues: tech@farmscraft.com
- Order Issues: orders@farmscraft.com
- Customer Support: support@farmscraft.com

---

## Related Documentation

- [Full Admin Order Management Guide](./ADMIN_ORDER_MANAGEMENT.md)
- [Admin Setup Guide](./ADMIN_SETUP_GUIDE.md)
- [Firestore Schema](./FIRESTORE_SCHEMA.md)
