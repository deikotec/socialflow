import { NextRequest, NextResponse } from "next/server";
import { TikTokApi } from "@/lib/tiktok";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  // State management
  const state = JSON.stringify({ companyId, csrf: Math.random().toString(36).substring(7) });
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

  const authUrl = TikTokApi.getAuthUrl(redirectUri, state);

  return NextResponse.redirect(authUrl);
}
