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

export async function uploadFileAction(
    companyId: string, 
    rootFolderId: string, 
    originalFileName: string, 
    fileContent: string, 
    mimeType: string,
    scheduledDate?: string, // ISO string
    contentFormat?: string
) {
    try {
        const companyDoc = await adminDb.collection("companies").doc(companyId).get();
        const companyData = companyDoc.data();
        const refreshToken = companyData?.drive_refresh_token;
        const companyName = companyData?.name || "Company";

        if (!refreshToken) {
            throw new Error("No Drive connection found");
        }

        const buffer = Buffer.from(fileContent, 'base64');
        
        let effectiveRootFolderId = rootFolderId;

        // If no root folder linked, find/create one for the Company
        if (!effectiveRootFolderId) {
            try {
                const rootFolderName = `SocialFlow - ${companyName}`;
                // Check if such folder exists in root, or create it
                const companyFolder = await ensureFolder(refreshToken, rootFolderName);
                effectiveRootFolderId = companyFolder.id;
                
                // Save this as the company's drive_folder_id for future
                await adminDb.collection("companies").doc(companyId).update({
                    drive_folder_id: effectiveRootFolderId,
                    drive_link: companyFolder.webViewLink
                });
                console.log(`[DRIVE] Automatically linked root folder: ${rootFolderName} (${effectiveRootFolderId})`);
            } catch (rootError) {
                console.error("Failed to ensure company root folder", rootError);
                // Fallback to uploading to root directory (empty string)
                effectiveRootFolderId = ""; 
            }
        }

        let targetFolderId = effectiveRootFolderId;

        // --- Folder Hierarchy Logic ---
        if (effectiveRootFolderId) {
            try {
                // 1. Month Year Folder (e.g. "Enero 2026")
                const dateObj = scheduledDate ? new Date(scheduledDate) : new Date();
                const monthYearName = format(dateObj, "MMMM yyyy", { locale: es });
                // Capitalize first letter
                const monthYearNameCap = monthYearName.charAt(0).toUpperCase() + monthYearName.slice(1);
                
                const monthFolder = await ensureFolder(refreshToken, monthYearNameCap, effectiveRootFolderId);
                targetFolderId = monthFolder.id;

                // 2. Day Folder (e.g. "15")
                // Only if we have a specific scheduled date? Or always use upload date day?
                // User said: "luego la carpeta 15" (implies day of month)
                const dayName = format(dateObj, "d");
                const dayFolder = await ensureFolder(refreshToken, dayName, targetFolderId);
                targetFolderId = dayFolder.id;

            } catch (folderError: any) {
                console.error("Error ensuring folder hierarchy", folderError);

                // Handle 404 (Folder Not Found) -> Likely the Company Root Folder was deleted externally
                if (folderError.code === 404 || folderError.message?.includes("File not found")) {
                    console.log("[DRIVE] Stale drive_folder_id detected. Recovering...");
                    try {
                        // 1. Re-create/Find the Company Root Folder
                        const rootFolderName = `SocialFlow - ${companyName}`;
                        const newRoot = await ensureFolder(refreshToken, rootFolderName);
                        effectiveRootFolderId = newRoot.id;

                        // 2. Update DB with new ID
                        await adminDb.collection("companies").doc(companyId).update({
                            drive_folder_id: effectiveRootFolderId,
                            drive_link: newRoot.webViewLink
                        });
                        console.log(`[DRIVE] Recovered root folder: ${effectiveRootFolderId}`);

                        // 3. Retry Hierarchy
                        const dateObj = scheduledDate ? new Date(scheduledDate) : new Date();
                        const monthYearName = format(dateObj, "MMMM yyyy", { locale: es });
                        const monthYearNameCap = monthYearName.charAt(0).toUpperCase() + monthYearName.slice(1);
                        
                        const monthFolder = await ensureFolder(refreshToken, monthYearNameCap, effectiveRootFolderId);
                        const dayName = format(dateObj, "d");
                        const dayFolder = await ensureFolder(refreshToken, dayName, monthFolder.id);
                        
                        targetFolderId = dayFolder.id;

                    } catch (recoveryError) {
                        console.error("Failed to recover folder hierarchy", recoveryError);
                        // If recovery fails, fallback to root (empty string) to ensure file is at least saved
                        targetFolderId = ""; 
                    }
                } else {
                    // Other error, fallback to current root (or root dir if undefined)
                    targetFolderId = effectiveRootFolderId || "";
                }
            }
        }

        // --- File Naming Logic ---
        // "reel_[nombre]" o "post_[nombre]"
        const prefix = contentFormat ? `${contentFormat}_` : "";
        // Clean filename to avoid issues?
        const finalFileName = `${prefix}${originalFileName}`;

        try {
            const file = await uploadFileToDrive(refreshToken, targetFolderId, finalFileName, mimeType, buffer);
            return { success: true, fileId: file.id, webViewLink: file.webViewLink };
        } catch (uploadError: any) {
             // ... existing retry logic ...
             console.error("Primary upload failed, retrying to root", uploadError);
             if (uploadError.message?.includes('File not found') || uploadError.code === 404) {
                 const file = await uploadFileToDrive(refreshToken, "", finalFileName, mimeType, buffer);
                 return { success: true, fileId: file.id, webViewLink: file.webViewLink, warning: "Uploaded to root (Folder missing)" };
             }
             throw uploadError;
        }
    } catch (e) {
        console.error("Upload failed", e);
        return { success: false, error: "Upload failed" };
    }
}
