"use server";

import { getFirebaseAdminDb } from "@/lib/server/firebase-admin";
import type { AdminProfile, AdminProfileUpdate } from "@/types/admin.types";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const ADMIN_COLLECTION = "admin_config";
const ADMIN_DOC_ID = "admin_profile";

/**
 * Get the admin profile from Firestore
 */
export async function getAdminProfile(): Promise<AdminProfile | null> {
    try {
        const db = await getFirebaseAdminDb();
        const doc = await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        return {
            email: data?.email || "",
            passwordHash: data?.passwordHash || "",
            profilePictureUrl: data?.profilePictureUrl,
            updatedAt: data?.updatedAt?.toDate() || new Date(),
            passwordResetToken: data?.passwordResetToken,
            passwordResetExpires: data?.passwordResetExpires?.toDate(),
        };
    } catch (error) {
        console.error("[Admin Service] Failed to get admin profile:", error);
        return null;
    }
}

/**
 * Initialize admin profile if it doesn't exist
 * Uses env vars for initial credentials
 */
export async function initializeAdminProfile(): Promise<boolean> {
    try {
        const db = await getFirebaseAdminDb();
        const doc = await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).get();

        if (doc.exists) {
            return true; // Already initialized
        }

        const email = process.env.ADMIN_USERNAME || "admin@farmscraft.com";
        const password = process.env.ADMIN_PASSWORD || "admin123";
        const passwordHash = await bcrypt.hash(password, 12);

        await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).set({
            email,
            passwordHash,
            updatedAt: new Date(),
        });

        console.log("[Admin Service] Initialized admin profile");
        return true;
    } catch (error) {
        console.error("[Admin Service] Failed to initialize admin profile:", error);
        return false;
    }
}

/**
 * Update admin profile fields
 */
export async function updateAdminProfile(updates: AdminProfileUpdate): Promise<boolean> {
    try {
        const db = await getFirebaseAdminDb();
        await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).update({
            ...updates,
            updatedAt: new Date(),
        });
        return true;
    } catch (error) {
        console.error("[Admin Service] Failed to update admin profile:", error);
        return false;
    }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const profile = await getAdminProfile();

        if (!profile) {
            // Fallback to env-based authentication
            const envPassword = process.env.ADMIN_PASSWORD;
            if (currentPassword !== envPassword) {
                return { success: false, error: "Current password is incorrect" };
            }
        } else {
            // Verify current password against stored hash
            const isValid = await bcrypt.compare(currentPassword, profile.passwordHash);
            if (!isValid) {
                return { success: false, error: "Current password is incorrect" };
            }
        }

        // Hash and save new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        const db = await getFirebaseAdminDb();

        await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).set({
            email: profile?.email || process.env.ADMIN_USERNAME || "admin@farmscraft.com",
            passwordHash: newPasswordHash,
            profilePictureUrl: profile?.profilePictureUrl,
            updatedAt: new Date(),
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("[Admin Service] Failed to change password:", error);
        return { success: false, error: "Failed to change password" };
    }
}

/**
 * Update admin profile picture URL
 */
export async function updateProfilePicture(url: string): Promise<boolean> {
    return updateAdminProfile({ profilePictureUrl: url });
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(): Promise<{ token: string; expires: Date } | null> {
    try {
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const db = await getFirebaseAdminDb();
        await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).update({
            passwordResetToken: token,
            passwordResetExpires: expires,
        });

        return { token, expires };
    } catch (error) {
        console.error("[Admin Service] Failed to create reset token:", error);
        return null;
    }
}

/**
 * Validate password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<boolean> {
    try {
        const profile = await getAdminProfile();

        if (!profile?.passwordResetToken || !profile?.passwordResetExpires) {
            return false;
        }

        if (profile.passwordResetToken !== token) {
            return false;
        }

        if (new Date() > profile.passwordResetExpires) {
            return false;
        }

        return true;
    } catch (error) {
        console.error("[Admin Service] Failed to validate reset token:", error);
        return false;
    }
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(
    token: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const isValid = await validatePasswordResetToken(token);

        if (!isValid) {
            return { success: false, error: "Invalid or expired reset token" };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        const db = await getFirebaseAdminDb();

        await db.collection(ADMIN_COLLECTION).doc(ADMIN_DOC_ID).update({
            passwordHash: newPasswordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error("[Admin Service] Failed to reset password:", error);
        return { success: false, error: "Failed to reset password" };
    }
}

/**
 * Validate admin credentials (for login)
 * Checks both Firestore profile and env vars as fallback
 */
export async function validateAdminCredentials(
    email: string,
    password: string
): Promise<boolean> {
    try {
        const profile = await getAdminProfile();

        if (profile) {
            // Check against stored credentials
            if (email !== profile.email) {
                return false;
            }
            return bcrypt.compare(password, profile.passwordHash);
        }

        // Fallback to env vars
        const envEmail = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;

        return email === envEmail && password === envPassword;
    } catch (error) {
        console.error("[Admin Service] Failed to validate credentials:", error);
        // Fallback to env vars on error
        const envEmail = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;
        return email === envEmail && password === envPassword;
    }
}
