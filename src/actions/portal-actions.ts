"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Company, ContentPiece } from "@/types";

export async function validatePortalToken(token: string): Promise<Company | null> {
  try {
    const snapshot = await adminDb
      .collection("companies")
      .where("portalToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Company;
  } catch (error) {
    console.error("Error validating portal token:", error);
    return null;
  }
}

export async function getPortalContent(companyId: string) {
  try {
    const snapshot = await adminDb
      .collection("companies")
      .doc(companyId)
      .collection("content")
      .where("status", "in", ["review", "approved", "rejected"]) // Show history too? Or just review?
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    })) as unknown as ContentPiece[];
  } catch (error) {
    console.error("Error fetching portal content:", error);
    return [];
  }
}

export async function approveContent(companyId: string, contentId: string, feedback?: string) {
  try {
    await adminDb
      .collection("companies")
      .doc(companyId)
      .collection("content")
      .doc(contentId)
      .update({
        status: "approved",
        feedback: feedback || "",
        updatedAt: new Date(),
      });
    return { success: true };
  } catch (error) {
    console.error("Error approving content:", error);
    throw new Error("Failed to approve content");
  }
}

export async function rejectContent(companyId: string, contentId: string, feedback: string) {
  try {
    await adminDb
      .collection("companies")
      .doc(companyId)
      .collection("content")
      .doc(contentId)
      .update({
        status: "rejected",
        feedback: feedback,
        updatedAt: new Date(),
      });
    return { success: true };
  } catch (error) {
    console.error("Error rejecting content:", error);
    throw new Error("Failed to reject content");
  }
}
