"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { generateContentIdeas, GeneratedIdea } from "@/lib/ai/gemini";
import { ContentPiece, ContentStatus } from "@/types";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

// --- AI Generation ---

export async function generateIdeasAction(topic: string): Promise<GeneratedIdea[]> {
    // 1. Verify Session
    const session = (await cookies()).get("session")?.value;
    if (!session) {
      throw new Error("Unauthorized");
    }
    await adminAuth.verifySessionCookie(session);

    // 2. Call AI
    return await generateContentIdeas(topic);
}

// --- Content CRUD ---

export async function createContent(companyId: string, data: Partial<ContentPiece>) {
     const session = (await cookies()).get("session")?.value;
     if (!session) throw new Error("Unauthorized");
     const decodedToken = await adminAuth.verifySessionCookie(session);
     const uid = decodedToken.uid;

     if (!companyId) throw new Error("Company ID is required");

     const contentRef = adminDb
        .collection("companies")
        .doc(companyId)
        .collection("content")
        .doc();
    
    const newContent = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: data.status || "idea",
        createdBy: uid,
    };

    await contentRef.set(newContent);
    return { success: true, id: contentRef.id };
}

export async function getContent(companyId: string) {
    const session = (await cookies()).get("session")?.value;
    if (!session) throw new Error("Unauthorized");
    // Optionally verify user has access to this company
    
    if (!companyId) return [];

    const snapshot = await adminDb
        .collection("companies")
        .doc(companyId)
        .collection("content")
        .orderBy("createdAt", "desc")
        .get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamps to Dates if necessary for client serialization
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
        scheduledDate: doc.data().scheduledDate?.toDate() || null,
    }));
}

export async function updateContentStatus(companyId: string, contentId: string, status: ContentStatus) {
    const session = (await cookies()).get("session")?.value;
    if (!session) throw new Error("Unauthorized");

    await adminDb
        .collection("companies")
        .doc(companyId)
        .collection("content")
        .doc(contentId)
        .update({
            status: status,
            updatedAt: new Date()
        });
    
    return { success: true };
}
