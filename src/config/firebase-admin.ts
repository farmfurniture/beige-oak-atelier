import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

/**
 * Initialize Firebase Admin SDK
 * This runs on the server-side only and bypasses security rules
 */
function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        // Check if we have service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccount) {
            try {
                const credentials = JSON.parse(serviceAccount);
                adminApp = initializeApp({
                    credential: cert(credentials),
                });
            } catch (error) {
                console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
                throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
            }
        } else {
            // Fallback: Use individual environment variables
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (!projectId || !clientEmail || !privateKey) {
                console.error('Missing Firebase Admin credentials. Please set either:');
                console.error('1. FIREBASE_SERVICE_ACCOUNT (full service account JSON)');
                console.error('2. FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY');
                console.error('Found:', { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!privateKey });
                throw new Error('Missing Firebase Admin SDK credentials');
            }

            adminApp = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }
    } else {
        adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);

    return { adminApp, adminDb };
}

// Initialize on module load
const { adminApp: app, adminDb: db } = initializeFirebaseAdmin();

export { app as adminApp, db as adminDb };
