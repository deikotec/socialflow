const TIKTOK_OPEN_API = "https://open.tiktokapis.com/v2";

export const TikTokApi = {
  // 1. Generate Auth URL
  getAuthUrl: (redirectUri: string, state: string) => {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const scope = "user.info.basic,video.upload,video.publish"; // Adjust scopes as needed

    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  },

  // 2. Exchange Code for Token
  exchangeCode: async (code: string, redirectUri: string) => {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    const params = new URLSearchParams({
      client_key: clientKey!,
      client_secret: clientSecret!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const res = await fetch(`${TIKTOK_OPEN_API}/oauth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: params,
    });

    if (!res.ok) throw new Error("Failed to exchange TikTok code");
    return res.json();
  },

  // 3. Refresh Token
  refreshToken: async (refreshToken: string) => {
     const clientKey = process.env.TIKTOK_CLIENT_KEY;
     const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

     const params = new URLSearchParams({
       client_key: clientKey!,
       client_secret: clientSecret!,
       grant_type: "refresh_token",
       refresh_token: refreshToken,
     });

     const res = await fetch(`${TIKTOK_OPEN_API}/oauth/token/`, {
       method: "POST",
       headers: { "Content-Type": "application/x-www-form-urlencoded" },
       body: params
     });

     if (!res.ok) throw new Error("Failed to refresh TikTok token");
     return res.json();
  },

  // 4. Get User Info (for display)
  getUserInfo: async (accessToken: string) => {
    const res = await fetch(`${TIKTOK_OPEN_API}/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch TikTok user info");
    return res.json();
  },

  // 5. Initialize Video Upload (Direct Post)
  // Note: This requires 'video.publish' scope
  publishVideo: async (accessToken: string, videoUrl: string, title: string) => {
      // 1. Init
      const initUrl = `${TIKTOK_OPEN_API}/post/publish/video/init/`;
      const initRes = await fetch(initUrl, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
              post_info: {
                  title: title,
                  privacy_level: "PUBLIC_TO_EVERYONE",
                  disable_duet: false,
                  disable_comment: false,
                  disable_stitch: false,
                  video_cover_timestamp_ms: 1000
              },
              source_info: {
                  source: "PULL_FROM_URL",
                  video_url: videoUrl
              }
          })
      });

      if (!initRes.ok) {
           const err = await initRes.json();
           throw new Error(`Failed to init TikTok upload: ${err.error?.message || 'Unknown error'}`);
      }
      
      return initRes.json();
  }
};
