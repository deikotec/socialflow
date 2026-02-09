import { NextRequest, NextResponse } from "next/server";
import { TikTokApi } from "@/lib/tiktok";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  try {
    const { companyId } = JSON.parse(state);
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

    // 1. Exchange Code for Token
    const tokenData = await TikTokApi.exchangeCode(code, redirectUri);
    
    // TikTok returns: access_token, expires_in, refresh_token, refresh_expires_in, open_id
    if (tokenData.error) {
         throw new Error(tokenData.error_description || "TikTok Auth Failed");
    }

    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    // 2. Get User Info
    const userInfoData = await TikTokApi.getUserInfo(access_token);
    const userInfo = userInfoData.data?.user || {};
    const username = userInfo.display_name || "TikTok User";

    // 3. Update Company in Firestore
    await adminDb.collection("companies").doc(companyId).update({
      "socialConnections.tiktok": {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        openId: open_id,
        username: username,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=tiktok_connected`
    );
  } catch (error) {
    console.error("TikTok Auth Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=tiktok_auth_failed`
    );
  }
}
