/**
 * Diagnostic script to check admin setup and orders
 * Run this in browser console or as a script
 */

import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { auth } from '@/config/firebase-client';

export async function diagnoseAdminSetup() {
  console.log('='.repeat(60));
  console.log('ADMIN SETUP DIAGNOSTIC');
  console.log('='.repeat(60));

  // Check 1: Current User
  console.log('\n1. Checking current user...');
  const user = auth.currentUser;
  if (user) {
    console.log('✅ User signed in:', user.email, '(UID:', user.uid + ')');
  } else {
    console.log('❌ No user signed in');
    return;
  }

  // Check 2: Admin Document
  console.log('\n2. Checking admin document...');
  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      console.log('✅ Admin document exists:', adminDoc.data());
    } else {
      console.log('❌ Admin document NOT found');
      console.log('   To fix: Create document in Firestore:');
      console.log('   Collection: admins');
      console.log('   Document ID:', user.uid);
      console.log('   Fields: { role: "admin", email: "' + user.email + '" }');
    }
  } catch (error) {
    console.error('❌ Error checking admin document:', error);
  }

  // Check 3: Orders Collection
  console.log('\n3. Checking orders collection...');
  try {
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, limit(5));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    console.log('✅ Orders collection accessible');
    console.log('   Total orders found:', ordersSnapshot.size);
    
    if (ordersSnapshot.size > 0) {
      console.log('   Sample order:');
      const firstOrder = ordersSnapshot.docs[0].data();
      console.log('   - Order ID:', firstOrder.orderId);
      console.log('   - Order Number:', firstOrder.orderNumber);
      console.log('   - Status:', firstOrder.status);
      console.log('   - User ID:', firstOrder.userId);
    } else {
      console.log('   ⚠️  No orders found in database');
    }
  } catch (error: any) {
    console.error('❌ Error accessing orders:', error);
    if (error.code === 'permission-denied') {
      console.log('   This is likely because:');
      console.log('   1. User is not in admins collection, OR');
      console.log('   2. Firestore rules not deployed');
    }
  }

  // Check 4: Firestore Rules
  console.log('\n4. Testing Firestore rules...');
  try {
    // Try to read all orders (admin permission)
    const ordersRef = collection(db, 'orders');
    const allOrders = await getDocs(ordersRef);
    console.log('✅ Can read all orders (admin permission working)');
    console.log('   Total orders:', allOrders.size);
  } catch (error: any) {
    console.error('❌ Cannot read all orders:', error.code);
    if (error.code === 'permission-denied') {
      console.log('   Possible issues:');
      console.log('   1. User not in admins collection');
      console.log('   2. Firestore rules not deployed');
      console.log('   3. Admin role field not set correctly');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60));
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  (window as any).diagnoseAdmin = diagnoseAdminSetup;
  console.log('Run diagnoseAdmin() in console to check admin setup');
}
