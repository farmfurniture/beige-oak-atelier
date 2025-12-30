/**
 * Admin Profile Types
 * Defines the structure for admin profile data stored in Firestore
 */

export interface AdminProfile {
    /** Admin email address */
    email: string;
    /** Hashed password using bcrypt */
    passwordHash: string;
    /** URL to profile picture (Cloudinary) */
    profilePictureUrl?: string;
    /** Last update timestamp */
    updatedAt: Date;
    /** Password reset token (temporary) */
    passwordResetToken?: string;
    /** Password reset token expiration */
    passwordResetExpires?: Date;
}

export interface AdminProfileUpdate {
    email?: string;
    passwordHash?: string;
    profilePictureUrl?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface AdminLoginCredentials {
    email: string;
    password: string;
}
