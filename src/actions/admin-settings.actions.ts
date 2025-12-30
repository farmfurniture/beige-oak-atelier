"use server";

import { revalidatePath } from "next/cache";
import {
    changeAdminPassword,
    createPasswordResetToken,
    getAdminProfile,
    resetPasswordWithToken,
    updateProfilePicture,
} from "@/services/admin.service.server";
import { sendPasswordResetEmail } from "@/services/email.service.server";
import { z } from "zod";

// Validation schemas
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type ActionState = {
    success?: boolean;
    error?: string;
    message?: string;
};

/**
 * Change admin password action
 */
export async function changePasswordAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = changePasswordSchema.safeParse(rawData);

    if (!parsed.success) {
        const errorMessage = parsed.error.errors[0]?.message || "Invalid input";
        return { error: errorMessage };
    }

    const { currentPassword, newPassword } = parsed.data;
    const result = await changeAdminPassword(currentPassword, newPassword);

    if (!result.success) {
        return { error: result.error || "Failed to change password" };
    }

    revalidatePath("/admin/settings");
    return { success: true, message: "Password changed successfully" };
}

/**
 * Request password reset email
 */
export async function requestPasswordResetAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required" };
    }

    // Get admin profile to verify email
    const profile = await getAdminProfile();
    const adminEmail = profile?.email || process.env.ADMIN_USERNAME;

    if (email !== adminEmail) {
        // Don't reveal if email exists - show generic message
        return { success: true, message: "If this email is registered, you will receive a reset link" };
    }

    // Create reset token
    const tokenData = await createPasswordResetToken();

    if (!tokenData) {
        return { error: "Failed to create reset token" };
    }

    // Send reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/admin/reset-password?token=${tokenData.token}`;

    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
        console.warn("[Password Reset] Email sending failed, but token was created");
    }

    return {
        success: true,
        message: "If this email is registered, you will receive a reset link"
    };
}

/**
 * Reset password with token action
 */
export async function resetPasswordWithTokenAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        token: formData.get("token"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = resetPasswordSchema.safeParse(rawData);

    if (!parsed.success) {
        const errorMessage = parsed.error.errors[0]?.message || "Invalid input";
        return { error: errorMessage };
    }

    const { token, newPassword } = parsed.data;
    const result = await resetPasswordWithToken(token, newPassword);

    if (!result.success) {
        return { error: result.error || "Failed to reset password" };
    }

    return { success: true, message: "Password reset successfully. You can now login." };
}

/**
 * Update profile picture action
 */
export async function updateProfilePictureAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const imageUrl = formData.get("imageUrl") as string;

    if (!imageUrl) {
        return { error: "Image URL is required" };
    }

    const success = await updateProfilePicture(imageUrl);

    if (!success) {
        return { error: "Failed to update profile picture" };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true, message: "Profile picture updated" };
}

/**
 * Get admin profile for client
 */
export async function getAdminProfileAction(): Promise<{
    email: string;
    profilePictureUrl?: string;
} | null> {
    const profile = await getAdminProfile();

    if (!profile) {
        return {
            email: process.env.ADMIN_USERNAME || "admin@farmscraft.com",
        };
    }

    return {
        email: profile.email,
        profilePictureUrl: profile.profilePictureUrl,
    };
}

/**
 * Update admin email/username action
 */
export async function updateAdminEmailAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const newEmail = formData.get("email") as string;

    if (!newEmail || !newEmail.includes("@")) {
        return { error: "Please enter a valid email address" };
    }

    const { updateAdminProfile } = await import("@/services/admin.service.server");
    const success = await updateAdminProfile({ email: newEmail });

    if (!success) {
        return { error: "Failed to update email" };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true, message: "Email updated successfully" };
}
