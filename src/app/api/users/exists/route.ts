import { NextResponse } from "next/server";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";
import { headers } from "next/headers";
import { getFirebaseAdminDb } from "@/lib/server/firebase-admin";
import { normalizeIndianPhone } from "@/lib/phone-utils";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const requestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (value) => Boolean(value.email || value.phone),
    "Provide an email or phone number"
  );

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, phone } = requestSchema.parse(body);

    const db = await getFirebaseAdminDb();
    let exists = false;

    if (email) {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email.trim().toLowerCase())
        .limit(1)
        .get();
      exists = !snapshot.empty;
    } else if (phone) {
      const normalized = normalizeIndianPhone(phone);
      if (normalized) {
        const snapshot = await db
          .collection("users")
          .where("phone", "==", normalized)
          .limit(1)
          .get();
        exists = !snapshot.empty;
      }
    }

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("User existence check failed:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Unable to check user status" },
      { status: 500 }
    );
  }
}
