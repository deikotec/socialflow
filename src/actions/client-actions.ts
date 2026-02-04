"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createDriveFolder } from "@/lib/drive";
import { cookies } from "next/headers";

export interface ClientData {
  name: string;
  email: string; // Contact email
  website?: string;
  notes?: string;
}

export async function createClient(data: ClientData) {
  // 1. Verify Authentication
  const session = (await cookies()).get("session")?.value;
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    // 2. Get User's Agency ID
    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      throw new Error("User profile not found");
    }
    const agencyId = userSnap.data()?.agencyId;

    if (!agencyId) {
      throw new Error("User does not belong to an agency");
    }

    // 3. Create Drive Folder
    // We create a folder with the client's name. Ideally, we organize by agency.
    // For now, we will just create it in the root or a specific parent if configured.
    const driveFolderId = await createDriveFolder(data.name);

    // 4. Create Client in Firestore
    const clientRef = adminDb
      .collection("agencies")
      .doc(agencyId)
      .collection("clients")
      .doc();

    await clientRef.set({
      ...data,
      drive_folder_id: driveFolderId,
      createdAt: new Date(),
      createdBy: uid,
    });

    return { success: true, clientId: clientRef.id };
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to create client");
  }
}

export async function getClients() {
  const session = (await cookies()).get("session")?.value;
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const userSnap = await adminDb.collection("users").doc(uid).get();
    const agencyId = userSnap.data()?.agencyId;

    if (!agencyId) return [];

    const snapshot = await adminDb
      .collection("agencies")
      .doc(agencyId)
      .collection("clients")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}
