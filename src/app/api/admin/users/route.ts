import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/server/firebase-admin";

export async function GET(request: Request) {
    console.log("API: /api/admin/users called");
    try {
        // Note: Admin authentication is handled by the client-side admin system
        // In production, you should add proper API authentication here
        console.log("API: Processing request...");

        console.log("API: Importing Firebase modules...");
        const { getAuth } = await import("firebase-admin/auth");
        const { getFirebaseAdminApp, getFirebaseAdminDb } = await import(
            "@/lib/server/firebase-admin"
        );

        console.log("API: Initializing Firebase Admin...");
        const app = await getFirebaseAdminApp();
        const auth = getAuth(app);
        const db = await getFirebaseAdminDb();

        // Fetch users from Firebase Auth
        let authUsers: any[] = [];
        try {
            console.log("API: Fetching users from Auth...");
            const listUsersResult = await auth.listUsers(1000);
            authUsers = listUsersResult.users;
            console.log(`API: Fetched ${authUsers.length} users from Auth`);
        } catch (error) {
            console.error("API: Error fetching auth users:", error);
            // Continue even if auth fetch fails
        }

        // Fetch user profiles from Firestore
        console.log("API: Fetching users from Firestore...");
        const usersSnapshot = await db.collection("users").get();
        console.log(`API: Fetched ${usersSnapshot.size} docs from Firestore`);

        // Create a map to merge users from both sources
        const allUsersMap = new Map();

        // 1. Add users from Auth first
        authUsers.forEach((authUser) => {
            allUsersMap.set(authUser.uid, {
                id: authUser.uid,
                uid: authUser.uid,
                email: authUser.email || null,
                phone: authUser.phoneNumber || null,
                displayName: authUser.displayName || null,
                photoURL: authUser.photoURL || null,
                createdAt: {
                    _seconds: Math.floor(new Date(authUser.metadata.creationTime).getTime() / 1000),
                    _nanoseconds: 0
                },
                lastSignInTime: authUser.metadata.lastSignInTime,
                source: 'auth'
            });
        });

        // 2. Merge/Add users from Firestore
        usersSnapshot.docs.forEach((doc) => {
            const firestoreData = doc.data();
            const existingUser = allUsersMap.get(doc.id);

            if (existingUser) {
                // Merge Firestore data into existing Auth user
                allUsersMap.set(doc.id, {
                    ...existingUser,
                    ...firestoreData, // Firestore data takes precedence for profile fields
                    // Ensure critical IDs don't get overwritten by bad data
                    id: doc.id,
                    uid: doc.id,
                    // If Firestore has email/phone, use it, otherwise keep Auth's
                    email: firestoreData.email || existingUser.email,
                    phone: firestoreData.phone || existingUser.phone,
                });
            } else {
                // User exists only in Firestore
                let createdAt = firestoreData.createdAt;

                // Normalize Firestore timestamp if needed
                if (createdAt && typeof createdAt.toDate === 'function') {
                    const date = createdAt.toDate();
                    createdAt = {
                        _seconds: Math.floor(date.getTime() / 1000),
                        _nanoseconds: 0
                    };
                } else if (createdAt && createdAt.seconds) {
                    createdAt = {
                        _seconds: createdAt.seconds,
                        _nanoseconds: createdAt.nanoseconds || 0
                    };
                }

                allUsersMap.set(doc.id, {
                    id: doc.id,
                    uid: doc.id,
                    ...firestoreData,
                    createdAt,
                    source: 'firestore_only'
                });
            }
        });

        const users = Array.from(allUsersMap.values());
        console.log(`API: Returning ${users.length} total users`);

        return NextResponse.json({ users });
    } catch (error) {
        console.error("API: Critical error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        // Note: Admin authentication is handled by the client-side admin system
        // In production, you should add proper API authentication here

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const { getAuth } = await import("firebase-admin/auth");
        const { getFirebaseAdminApp, getFirebaseAdminDb } = await import(
            "@/lib/server/firebase-admin"
        );

        const app = await getFirebaseAdminApp();
        const auth = getAuth(app);
        const db = await getFirebaseAdminDb();

        // Delete from Firebase Auth
        try {
            await auth.deleteUser(userId);
        } catch (error) {
            console.error("Error deleting from Auth:", error);
            // Continue even if auth deletion fails (user might not exist in Auth)
        }

        // Delete from Firestore
        await db.collection("users").doc(userId).delete();

        // Also delete user's cart if exists
        try {
            await db.collection("carts").doc(userId).delete();
        } catch (error) {
            console.error("Error deleting cart:", error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
