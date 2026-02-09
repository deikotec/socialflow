"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { generateContentIdeas, GeneratedIdea } from "@/lib/ai/gemini";
import { ContentPiece, ContentStatus } from "@/types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...cleanData } = data; // Remove ID if present

    const newContent = {
        ...cleanData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: data.status || "idea",
        createdBy: uid,
    };

    await contentRef.set(newContent);
    revalidatePath("/content"); // Invalidate cache for the content page
    revalidatePath("/home");    // Also home if it shows recent content
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
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id, // Ensure doc.id overrides any corrupted id field in data
            // Convert Timestamps to Dates if necessary for client serialization
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt || null,
            scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate() : data.scheduledDate || null,
            recordingDate: data.recordingDate?.toDate ? data.recordingDate.toDate() : data.recordingDate || undefined,
        } as unknown as ContentPiece;
    });
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
    
    revalidatePath("/content");
    revalidatePath("/home");
    return { success: true };
}

export async function updateContent(companyId: string, contentId: string, data: Partial<ContentPiece>) {
    const session = (await cookies()).get("session")?.value;
    if (!session) throw new Error("Unauthorized");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...cleanData } = data; // Remove ID to prevent overwriting

    await adminDb
        .collection("companies")
        .doc(companyId)
        .collection("content")
        .doc(contentId)
        .update({
            ...cleanData,
            updatedAt: new Date(),
        });

    revalidatePath("/content");
    revalidatePath("/home");
    return { success: true };
}

export async function deleteContent(companyId: string, contentId: string) {
    const session = (await cookies()).get("session")?.value;
    if (!session) throw new Error("Unauthorized");

    await adminDb
        .collection("companies")
        .doc(companyId)
        .collection("content")
        .doc(contentId)
        .delete();

    revalidatePath("/content");
    revalidatePath("/home");
    return { success: true };
}
