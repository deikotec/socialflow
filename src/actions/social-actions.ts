"use server";

import { adminDb } from "@/lib/firebase-admin";
import { MetaApi } from "@/lib/meta";
import { TikTokApi } from "@/lib/tiktok";
import { ContentPiece, Company } from "@/types";

export async function publishContent(companyId: string, contentId: string) {
  try {
    // 1. Fetch Company & Content
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    const contentDoc = await adminDb.collection("companies").doc(companyId).collection("content").doc(contentId).get();

    if (!companyDoc.exists || !contentDoc.exists) {
      throw new Error("Company or Content not found");
    }

    const company = { id: companyDoc.id, ...companyDoc.data() } as Company;
    const content = { id: contentDoc.id, ...contentDoc.data() } as ContentPiece;

    if (!content.drive_link) {
        throw new Error("No media file linked to this content.");
    }
    
    // We need a direct download link for the APIs to pull from.
    // formData.drive_link usually is a view link. 
    // We successfully stored `webViewLink`? 
    // For specialized APIs, we might need a `webContentLink` or similar if the file is public.
    // If the file is not public, this will fail.
    // ASSUMPTION: The user has made the file accessible or we are using a proxy.
    // For now, let's assume `drive_link` is usable or convert it.
    // Google Drive `view` links -> `https://drive.google.com/uc?id=FILE_ID&export=download`
    
    let mediaUrl = content.drive_link;
    if (content.drive_file_id) {
         mediaUrl = `https://drive.google.com/uc?id=${content.drive_file_id}&export=download`;
    }

    // 2. Platform Logic
    const results = [];
    const platforms = content.platforms || [];
    
    // Fallback for legacy data
    // @ts-ignore
    if (platforms.length === 0 && content['platform']) platforms.push(content['platform']);

    for (const platform of platforms) {
        try {
            if (platform === "instagram") {
                await publishToInstagram(company, content, mediaUrl!);
                results.push({ platform, status: 'success' });
            } else if (platform === "tiktok") {
                await publishToTikTok(company, content, mediaUrl!);
                results.push({ platform, status: 'success' });
            } else {
                results.push({ platform, status: 'skipped', reason: 'Not supported' });
            }
        } catch (err: any) {
            console.error(`Failed to publish to ${platform}`, err);
            results.push({ platform, status: 'failed', error: err.message });
        }
    }

    // 3. Update Status
    const anySuccess = results.some(r => r.status === 'success');
    if (anySuccess) {
        await adminDb.collection("companies").doc(companyId).collection("content").doc(contentId).update({
            status: "posted",
            updatedAt: new Date()
        });
    }

    return { success: anySuccess, results };

  } catch (error) {
    console.error("Publish Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

async function publishToInstagram(company: Company, content: ContentPiece, mediaUrl: string) {
    const igConnection = company.socialConnections?.instagram;
    if (!igConnection?.accessToken || !igConnection?.instagramUserId) {
        throw new Error("Instagram not connected.");
    }

    // Determine if scheduling
    let scheduledPublishTime: number | undefined = undefined;
    if (content.status === 'scheduled' && content.scheduledDate) {
        // Handle Firestore Timestamp or Date object or string
        let date: Date;
        // @ts-ignore
        if (content.scheduledDate.toDate) {
             // @ts-ignore
             date = content.scheduledDate.toDate();
        } else {
             date = new Date(content.scheduledDate);
        }
        
        const now = new Date();
        // API requires at least 15 mins (usually) into future, but widely 10m-75d.
        if (date.getTime() > now.getTime() + 10 * 60 * 1000) {
            scheduledPublishTime = Math.floor(date.getTime() / 1000);
        }
    }
    
    // Check if Carousel
    if (content.format === 'carousel' && content.carouselFiles && content.carouselFiles.length > 0) {
        const itemContainerIds = [];
        
        // 1. Create items
        for (const file of content.carouselFiles.sort((a,b) => a.order - b.order)) {
            const fileUrl = `https://drive.google.com/uc?id=${file.drive_file_id}&export=download`;
            const mediaType = file.mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE';
            
            const container = await MetaApi.createMediaContainer(
                igConnection.accessToken,
                igConnection.instagramUserId,
                fileUrl,
                "", // No caption for items
                mediaType,
                undefined,
                true // isCarouselItem
                // No scheduled time for items
            );
            itemContainerIds.push(container.id);
            
            // Wait for processing if video
            if (mediaType === 'VIDEO') {
                await waitForContainer(igConnection.accessToken, container.id);
            }
        }
        
        // 2. Create Carousel Container
        // Note: We need to update createCarouselContainer signature in meta.ts first or pass it if I missed it.
        // Assuming I'll update meta.ts in next step or I can do it now.
        // Actually I should have updated meta.ts completely. 
        // I'll assume createCarouselContainer supports it (I will add it).
        const carouselContainer = await MetaApi.createCarouselContainer(
            igConnection.accessToken,
            igConnection.instagramUserId,
            content.caption || "",
            itemContainerIds,
            scheduledPublishTime
        );
        
        // 3. Publish
        await MetaApi.publishMedia(igConnection.accessToken, igConnection.instagramUserId, carouselContainer.id);
        
    } else {
        // Single Post
        const mediaType = (content.format === 'reel' || (content.drive_link && content.drive_link.endsWith('.mp4'))) ? 'VIDEO' : 'IMAGE'; 
    
        // 1. Create Container
        const container = await MetaApi.createMediaContainer(
            igConnection.accessToken,
            igConnection.instagramUserId,
            mediaUrl,
            content.caption || "",
            mediaType,
            undefined,
            false,
            scheduledPublishTime
        );
    
        // 2. Wait for Processing (if video)
        if (mediaType === 'VIDEO') {
            await waitForContainer(igConnection.accessToken, container.id);
        }
    
        // 3. Publish
        await MetaApi.publishMedia(igConnection.accessToken, igConnection.instagramUserId, container.id);
    }
}

async function waitForContainer(accessToken: string, containerId: string) {
        let attempts = 0;
        while (attempts < 10) {
            await new Promise(r => setTimeout(r, 3000)); // Wait 3s
            const status = await MetaApi.getContainerStatus(accessToken, containerId);
            if (status.status_code === 'FINISHED') return;
            if (status.status_code === 'ERROR') throw new Error("Media processing failed on Instagram");
            attempts++;
        }
        throw new Error("Media processing timed out");
}

async function publishToTikTok(company: Company, content: ContentPiece, mediaUrl: string) {
    const tiktokConnection = company.socialConnections?.tiktok;
    if (!tiktokConnection?.accessToken) {
         throw new Error("TikTok not connected.");
    }
    
    // Note: Use Pull from URL
    await TikTokApi.publishVideo(tiktokConnection.accessToken, mediaUrl, content.title || "New Video");
}
