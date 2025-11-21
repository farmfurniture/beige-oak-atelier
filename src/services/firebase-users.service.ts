import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase";

const USERS_COLLECTION = "users";

export type UserProfileInput = {
  uid: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
};

async function getUserByField(field: "email" | "phone", value: string) {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where(field, "==", value));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Record<string, unknown>;
}

export const firebaseUsersService = {
  async getUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return null;
    return getUserByField("email", normalized);
  },

  async getUserByPhone(phone: string) {
    const normalized = phone.trim();
    if (!normalized) return null;
    return getUserByField("phone", normalized);
  },

  async createOrUpdateUser(profile: UserProfileInput) {
    const userRef = doc(db, USERS_COLLECTION, profile.uid);
    const existing = await getDoc(userRef);
    const now = serverTimestamp();

    const payload: Record<string, unknown> = {
      uid: profile.uid,
      email: profile.email?.trim().toLowerCase() ?? null,
      phone: profile.phone ?? null,
      firstName: profile.firstName?.trim() ?? null,
      lastName: profile.lastName?.trim() ?? null,
      updatedAt: now,
    };

    if (!existing.exists()) {
      payload.createdAt = now;
    }

    await setDoc(userRef, payload, { merge: true });
  },
};
