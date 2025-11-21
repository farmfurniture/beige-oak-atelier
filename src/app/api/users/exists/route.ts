import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdminDb } from "@/lib/server/firebase-admin";

const requestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (value) => Boolean(value.email || value.phone),
    "Provide an email or phone number"
  );

const normalizePhone = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  return `+91${digits}`;
};

export async function POST(request: Request) {
  try {
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
      const normalized = normalizePhone(phone);
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
