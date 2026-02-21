"use server";

import { ContentPiece, TeamMember } from "@/types";
import { getAuthUrl, createDriveFolder, uploadFileToDrive, ensureFolder } from "@/lib/google-drive";
import { adminDb } from "@/lib/firebase-admin";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generateAuthUrlAction(companyId: string) {
    return getAuthUrl(companyId);
}

export async function notifyTeamMember(
  memberId: string,
  memberName: string,
  memberEmail: string | undefined,
  content: ContentPiece
) {
  // In a real app, this would send an email (Resend/SendGrid) or sync with Calendar
  console.log("---------------------------------------------------");
  console.log(`[NOTIFICATION] Sending notification to ${memberName} (${memberId})`);
  console.log(`[EMAIL] To: ${memberEmail || "No Email Provided"}`);
  console.log(`[SUBJECT] Nueva Asignación de Grabación: ${content.title}`);
  console.log(`[BODY] Hola ${memberName}, se te ha asignado la grabación de "${content.title}" para el día ${content.recordingDate}.`);
  console.log("---------------------------------------------------");
  
  if (!memberEmail) {
    return { success: false, error: "Member has no email" };
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return { success: true };
}

export async function linkDriveFolder(companyId: string, folderUrl: string) {
    console.log(`[DRIVE] Linking folder ${folderUrl} to company ${companyId}`);
     // logic to update company would go here or be handled by the main updateCompany action
     return { success: true };
}

// ... (other imports)

export async function uploadFileAction(formData: FormData) {
    try {
        const companyId = formData.get('companyId') as string;
        const rootFolderId = formData.get('rootFolderId') as string || "";
        const originalFileName = formData.get('originalFileName') as string;
        const mimeType = formData.get('mimeType') as string;
        const scheduledDate = formData.get('scheduledDate') as string | undefined;
        const contentFormat = formData.get('contentFormat') as string | undefined;
        const file = formData.get('file') as File;

        if (!file || !companyId) {
            throw new Error("Missing required fields");
        }

        const companyDoc = await adminDb.collection("companies").doc(companyId).get();
        const companyData = companyDoc.data();
        const refreshToken = companyData?.drive_refresh_token;
        const companyName = companyData?.name || "Company";

        if (!refreshToken) {
            throw new Error("No Drive connection found");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        let effectiveRootFolderId = rootFolderId;

        // If no root folder linked, find/create one for the Company
        if (!effectiveRootFolderId) {
            try {
                const rootFolderName = `SocialFlow - ${companyName}`;
                const companyFolder = await ensureFolder(refreshToken, rootFolderName);
                effectiveRootFolderId = companyFolder.id;
                
                await adminDb.collection("companies").doc(companyId).update({
                    drive_folder_id: effectiveRootFolderId,
                    drive_link: companyFolder.webViewLink
                });
                console.log(`[DRIVE] Automatically linked root folder: ${rootFolderName} (${effectiveRootFolderId})`);
            } catch (rootError) {
                console.error("Failed to ensure company root folder", rootError);
                effectiveRootFolderId = ""; 
            }
        }

        let targetFolderId = effectiveRootFolderId;

        // --- Folder Hierarchy Logic ---
        if (effectiveRootFolderId) {
            try {
                const dateObj = scheduledDate ? new Date(scheduledDate) : new Date();
                const monthYearName = format(dateObj, "MMMM yyyy", { locale: es });
                const monthYearNameCap = monthYearName.charAt(0).toUpperCase() + monthYearName.slice(1);
                
                const monthFolder = await ensureFolder(refreshToken, monthYearNameCap, effectiveRootFolderId);
                targetFolderId = monthFolder.id;

                const dayName = format(dateObj, "d");
                const dayFolder = await ensureFolder(refreshToken, dayName, targetFolderId);
                targetFolderId = dayFolder.id;

            } catch (folderError: any) {
                console.error("Error ensuring folder hierarchy", folderError);

                if (folderError.code === 404 || folderError.message?.includes("File not found")) {
                    console.log("[DRIVE] Stale drive_folder_id detected. Recovering...");
                    try {
                        const rootFolderName = `SocialFlow - ${companyName}`;
                        const newRoot = await ensureFolder(refreshToken, rootFolderName);
                        effectiveRootFolderId = newRoot.id;

                        await adminDb.collection("companies").doc(companyId).update({
                            drive_folder_id: effectiveRootFolderId,
                            drive_link: newRoot.webViewLink
                        });

                        const dateObj = scheduledDate ? new Date(scheduledDate) : new Date();
                        const monthYearName = format(dateObj, "MMMM yyyy", { locale: es });
                        const monthYearNameCap = monthYearName.charAt(0).toUpperCase() + monthYearName.slice(1);
                        
                        const monthFolder = await ensureFolder(refreshToken, monthYearNameCap, effectiveRootFolderId);
                        const dayName = format(dateObj, "d");
                        const dayFolder = await ensureFolder(refreshToken, dayName, monthFolder.id);
                        
                        targetFolderId = dayFolder.id;

                    } catch (recoveryError) {
                        console.error("Failed to recover folder hierarchy", recoveryError);
                        targetFolderId = ""; 
                    }
                } else {
                    targetFolderId = effectiveRootFolderId || "";
                }
            }
        }

        // --- File Naming Logic ---
        const prefix = contentFormat ? `${contentFormat}_` : "";
        const finalFileName = `${prefix}${originalFileName}`;

        try {
            const uploadedFile = await uploadFileToDrive(refreshToken, targetFolderId, finalFileName, mimeType, buffer);
            return { success: true, fileId: uploadedFile.id, webViewLink: uploadedFile.webViewLink };
        } catch (uploadError: any) {
             console.error("Primary upload failed, retrying to root", uploadError);
             if (uploadError.message?.includes('File not found') || uploadError.code === 404) {
                 const retryFile = await uploadFileToDrive(refreshToken, "", finalFileName, mimeType, buffer);
                 return { success: true, fileId: retryFile.id, webViewLink: retryFile.webViewLink, warning: "Uploaded to root (Folder missing)" };
             }
             throw uploadError;
        }
    } catch (e: any) {
        console.error("Upload failed", e);
        return { success: false, error: e.message || "Upload failed" };
    }
}
