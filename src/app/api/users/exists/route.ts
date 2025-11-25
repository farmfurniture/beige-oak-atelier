import { NextResponse } from "next/server";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";
import { headers } from "next/headers";

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
    // Validate body but ignore the result
    requestSchema.parse(body);

    // Always return exists: false to prevent enumeration
    // The client will proceed to try to send OTP/Link
    // If the user exists, the auth flow will handle it (e.g. logging them in or merging)
    return NextResponse.json({ exists: false });
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
