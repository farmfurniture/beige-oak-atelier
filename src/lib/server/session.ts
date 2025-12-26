import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env.mjs";

// Generate a secret key from env for JWT operations
const getSecret = () => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Please set it for secure session management."
    );
  }
  return new TextEncoder().encode(secret);
};

export type AdminSessionPayload = {
  admin: true;
  iat: number;
};

/**
 * Signs a new admin session JWT.
 * Called after successful login validation.
 */
export async function signAdminSession(): Promise<string> {
  const secret = getSecret();

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return token;
}

/**
 * Verifies an admin session JWT token.
 * Returns the payload if valid, null if invalid or expired.
 * If no token is provided, reads from cookies.
 */
export async function verifyAdminSession(
  token?: string
): Promise<AdminSessionPayload | null> {
  try {
    let sessionToken = token;

    // If no token provided, try to read from cookies
    if (!sessionToken) {
      const { cookies } = await import("next/headers");
      const cookieStore = cookies();
      sessionToken = cookieStore.get("admin_session")?.value;
    }

    if (!sessionToken) {
      return null;
    }

    const secret = getSecret();
    const verified = await jwtVerify(sessionToken, secret);

    // Ensure the token has the admin flag
    if (!verified.payload.admin) {
      return null;
    }

    return verified.payload as AdminSessionPayload;
  } catch (error) {
    // Token is invalid, expired, or verification failed
    return null;
  }
}
