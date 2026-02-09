import { Company } from "@/types";

const META_API_VERSION = "v20.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export const MetaApi = {
  // 1. Generate Login URL
  getAuthUrl: (redirectUri: string, state: string) => {
    const clientId = process.env.META_CLIENT_ID;
    const scope = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "public_profile",
      "business_management", // Added business_management just in case! 
    ].join(",");

    return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}&response_type=code&auth_type=reauthenticate`;
  },

  // 2. Exchange Code for Short-Lived Token
  exchangeCode: async (code: string, redirectUri: string) => {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;

    const url = `${META_BASE_URL}/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;
    
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json();
        console.error("Meta Token Exchange Error:", err);
        throw new Error(`Failed to exchange code for token: ${err.error?.message || JSON.stringify(err)}`);
    }
    return res.json();
  },

  // 3. Get Long-Lived Token (Required for offline access)
  getLongLivedToken: async (shortLivedToken: string) => {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;

    const url = `${META_BASE_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to get long-lived token");
    return res.json();
  },
// ...
  // 4. Get User Pages
  getPages: async (accessToken: string) => {
    const url = `${META_BASE_URL}/me/accounts?access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch pages");
    return res.json();
  },

  getMe: async (accessToken: string) => {
      const res = await fetch(`${META_BASE_URL}/me?access_token=${accessToken}`);
      return res.json();
  },

  // 5. Get Instagram Business Account ID from Page
  getInstagramAccount: async (pageId: string, accessToken: string) => {
    const url = `${META_BASE_URL}/${pageId}?fields=instagram_business_account&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch IG account");
    return res.json();
  },
  
  // 6. Get IG Details (Username)
  getInstagramDetails: async (instagramId: string, accessToken: string) => {
     const url = `${META_BASE_URL}/${instagramId}?fields=username,profile_picture_url&access_token=${accessToken}`;
     const res = await fetch(url);
     if (!res.ok) throw new Error("Failed to fetch IG details");
     return res.json();
  },

  // 7. Create Media Container (IG)
  createMediaContainer: async (accessToken: string, igUserId: string, mediaUrl: string, caption: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE', coverUrl?: string, isCarouselItem: boolean = false, scheduledPublishTime?: number) => {
    const url = `${META_BASE_URL}/${igUserId}/media`;
    
    const params = new URLSearchParams({
      access_token: accessToken,
    });

    if (!isCarouselItem) {
        params.append('caption', caption);
    } else {
        params.append('is_carousel_item', 'true');
    }

    if (scheduledPublishTime) {
        params.append('published', 'false');
        params.append('scheduled_publish_time', scheduledPublishTime.toString());
    }
    
    if (mediaType === 'VIDEO') {
        params.append('media_type', 'REELS');
        params.append('video_url', mediaUrl);
        if(coverUrl) params.append('cover_url', coverUrl);
    } else {
        params.append('image_url', mediaUrl);
    }

    const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to create container: ${err.error?.message || 'Unknown error'}`);
    }
    return res.json();
  },

  // 8. Publish Media
  publishMedia: async (accessToken: string, igUserId: string, creationId: string) => {
    const url = `${META_BASE_URL}/${igUserId}/media_publish`;
    const params = new URLSearchParams({
       access_token: accessToken,
       creation_id: creationId
    });

    const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
    if (!res.ok) {
         const err = await res.json();
         throw new Error(`Failed to publish media: ${err.error?.message || 'Unknown error'}`);
    }
    return res.json();
  },

  // 9. Get Container Status
  getContainerStatus: async (accessToken: string, containerId: string) => {
     const url = `${META_BASE_URL}/${containerId}?fields=status_code,status&access_token=${accessToken}`;
     const res = await fetch(url);
     return res.json();
  },

  // 10. Create Carousel Container
  createCarouselContainer: async (accessToken: string, igUserId: string, caption: string, children: string[], scheduledPublishTime?: number) => {
      const url = `${META_BASE_URL}/${igUserId}/media`;
      const params = new URLSearchParams({
          access_token: accessToken,
          caption: caption,
          media_type: 'CAROUSEL',
          children: children.join(',') // List of item container IDs
      });

      if (scheduledPublishTime) {
          params.append('published', 'false');
          params.append('scheduled_publish_time', scheduledPublishTime.toString());
      }
      
      const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
      if (!res.ok) {
           const err = await res.json();
           throw new Error(`Failed to create carousel container: ${err.error?.message || 'Unknown error'}`);
      }
      return res.json();
  },
  // 11. Debug Permissions
  getPermissions: async (accessToken: string) => {
      const url = `${META_BASE_URL}/me/permissions?access_token=${accessToken}`;
      const res = await fetch(url);
      return res.json();
  }
};
