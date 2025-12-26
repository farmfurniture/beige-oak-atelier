/**
 * Helper to check if current user is an admin
 * This can be used in client-side components
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase-client';

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user signed in');
      return false;
    }

    console.log('Checking admin status for user:', user.uid);
    
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      console.log('Admin document found:', data);
      return data.role === 'admin';
    } else {
      console.log('No admin document found for user:', user.uid);
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = auth.currentUser;
  return user?.uid || null;
}
