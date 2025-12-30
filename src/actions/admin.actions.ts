"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { env } from "@/config/env.mjs";

// Simple static session token - NOT using JWT
const ADMIN_SESSION_TOKEN = "admin_authenticated_session_2024";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginState = {
  success?: boolean;
  error?: string;
};

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const rawCredentials = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawCredentials);

  if (!parsed.success) {
    const message =
      parsed.error.flatten().formErrors[0] ??
      Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0] ??
      "Invalid credentials";
    return { error: message };
  }

  const { username, password } = parsed.data;

  // Check credentials against env vars
  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return { error: "Incorrect username or password" };
  }

  const cookieStore = cookies();

  // Set a simple session cookie (not JWT)
  cookieStore.set({
    name: "admin_session",
    value: ADMIN_SESSION_TOKEN,
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });

  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete("admin_session");
}

export async function deleteUserAction(userId: string) {
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirebaseAdminApp, getFirebaseAdminDb } = await import(
      "@/lib/server/firebase-admin"
    );

    const app = await getFirebaseAdminApp();
    const auth = getAuth(app);
    const db = await getFirebaseAdminDb();

    // Delete from Firebase Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await db.collection("users").doc(userId).delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
