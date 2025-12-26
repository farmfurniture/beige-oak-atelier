/**
 * Script to add admin users to Firestore
 * 
 * Usage:
 * 1. Update the ADMIN_USERS array with user IDs and emails
 * 2. Run: npx tsx src/scripts/add-admin.ts
 * 
 * Note: This requires Firebase Admin SDK for production use.
 * For development, you can manually add to Firestore Console.
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Add admin users here
const ADMIN_USERS = [
  {
    uid: 'your-firebase-user-id-here',
    email: 'admin@farmscraft.com',
  },
  // Add more admins as needed
];

async function addAdminUser(uid: string, email: string) {
  try {
    await setDoc(doc(db, 'admins', uid), {
      role: 'admin',
      email: email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Successfully added admin: ${email} (${uid})`);
  } catch (error) {
    console.error(`❌ Error adding admin ${email}:`, error);
  }
}

async function addAllAdmins() {
  console.log('🚀 Starting admin user setup...\n');

  for (const admin of ADMIN_USERS) {
    await addAdminUser(admin.uid, admin.email);
  }

  console.log('\n✨ Admin setup complete!');
}

// Run the script
addAllAdmins().catch(console.error);
