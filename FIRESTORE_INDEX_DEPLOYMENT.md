# Firestore Index Deployment Guide

## Problem
The order history is failing with "Database index required" error because the composite index for querying orders by `userId` and `createdAt` hasn't been deployed to Firestore yet.

## Temporary Fix Applied
I've implemented a fallback mechanism that will:
1. First try to use the composite index (if available)
2. If the index is missing, fall back to client-side sorting
3. This allows the app to work immediately while you deploy the proper index

## Permanent Solution: Deploy Firestore Indexes

### Step 1: Login to Firebase
```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

### Step 2: Deploy the Indexes
```bash
firebase deploy --only firestore:indexes
```

This command will deploy all the indexes defined in `firestore.indexes.json` to your Firestore database.

### Step 3: Wait for Index Creation
After deployment, Firestore will start building the indexes. This can take a few minutes to several hours depending on the amount of data in your database.

You can monitor the index creation status in the Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project: `farmscraft-fed87`
3. Navigate to Firestore Database → Indexes
4. Check the status of the indexes (Building/Enabled)

## Alternative: Deploy via Firebase Console

If you prefer to deploy manually through the Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project: `farmscraft-fed87`
3. Navigate to Firestore Database → Indexes
4. Click "Add Index"
5. Configure the index:
   - Collection ID: `orders`
   - Fields to index:
     - Field: `userId`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - Query scope: Collection
6. Click "Create"

## Verify the Fix

After deploying the indexes:
1. Wait for the index status to show "Enabled" in Firebase Console
2. Refresh your application
3. Navigate to the Account → Orders tab
4. The orders should now load successfully without falling back to client-side sorting

## Current Index Configuration

The following indexes are configured in `firestore.indexes.json`:

1. **userId + createdAt** (Required for user order history)
2. **status + createdAt** (For admin order filtering)
3. **userId + status + createdAt** (For user order filtering by status)
4. **paymentStatus + createdAt** (For admin payment filtering)
5. **orderNumber** (For order lookup)

## Troubleshooting

### Error: "Failed to authenticate"
Run `firebase login` to authenticate with your Google account.

### Error: "Permission denied"
Make sure you have the necessary permissions on the Firebase project `farmscraft-fed87`.

### Orders still not loading
1. Check browser console for specific error messages
2. Verify the index status in Firebase Console
3. Clear browser cache and refresh
4. Check Firestore security rules are properly configured

## Notes

- The fallback mechanism (client-side sorting) will work but is less efficient
- For production, always deploy the proper indexes
- Index creation time depends on the amount of existing data
- You only need to deploy indexes once; they persist across deployments
