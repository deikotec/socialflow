"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function createSession(idToken: string) {
  try {
    // 5 days expiration
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating session:", error);
    return { success: false, error: "Failed to create session" };
  }
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

interface CreateProfileData {
  uid: string;
  email: string;
  role: "freelancer" | "agency";
  name: string;
}

export async function createProfile(data: CreateProfileData) {
  try {
    const userRef = adminDb.collection("users").doc(data.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return { success: true, message: "Profile already exists" };
    }

    await userRef.set({
      uid: data.uid,
      email: data.email,
      role: data.role,
      name: data.name,
      owned_companies: [], // Initialize empty companies list
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating profile:", error);
    throw new Error("Failed to create profile");
  }
}

export async function getSessionUserProfile() {
   const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) return null;

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(session, true);
        const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    } catch {
        return null;
    }
}
