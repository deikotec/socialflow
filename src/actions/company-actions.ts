"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createDriveFolder } from "@/lib/drive";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

export interface CompanyData {
  name: string;
  drive_folder_id?: string; // Optional: Provide existing shared folder ID
}

export async function createCompany(data: CompanyData) {
  // 1. Verify Authentication
  const session = (await cookies()).get("session")?.value;
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    // 2. Drive Folder Logic
    // If no folder ID provided, create one
    let driveFolderId = data.drive_folder_id;
    if (!driveFolderId) {
       const newFolderId = await createDriveFolder(data.name);
       if (!newFolderId) throw new Error("Failed to create Drive folder (no ID returned)");
       driveFolderId = newFolderId;
    }

    // 3. Create Company Document
    const companyRef = adminDb.collection("companies").doc();
    const portalToken = crypto.randomUUID();
    
    const companyData = {
      name: data.name,
      drive_folder_id: driveFolderId,
      portalToken: portalToken,
      ownerId: uid,
      createdAt: new Date(),
    };

    await companyRef.set(companyData);

    // 4. Update User Profile to add this company
    const userRef = adminDb.collection("users").doc(uid);
    // Ensure user doc exists (it should, but just in case)
    await userRef.set({
        email: decodedToken.email,
        owned_companies: FieldValue.arrayUnion(companyRef.id) 
    }, { merge: true });

    return { success: true, companyId: companyRef.id };
  } catch (error) {
    console.error("Error creating company:", error);
    throw new Error("Failed to create company");
  }
}



export async function updateCompany(companyId: string, data: any) {
  const session = (await cookies()).get("session")?.value;
  if (!session) throw new Error("Unauthorized");

  try {
     const decodedToken = await adminAuth.verifySessionCookie(session);
     const uid = decodedToken.uid;

     // Verify ownership (simple check)
     const companyRef = adminDb.collection("companies").doc(companyId);
     const doc = await companyRef.get();
     
     if (!doc.exists) throw new Error("Company not found");
     if (doc.data()?.ownerId !== uid) throw new Error("Not authorized to edit this company");

     // Filter undefined
     const updateData = JSON.parse(JSON.stringify(data));
     
     await companyRef.update(updateData);
     return { success: true };
  } catch (error) {
     console.error("Error updating company:", error);
     throw new Error("Failed to update company");
  }
}
