import { NextRequest, NextResponse } from "next/server";
import { MetaApi } from "@/lib/meta";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  // State should include companyId to know which company to update on callback
  // In production, encrypt this or store in a session/cookie for security
  const state = JSON.stringify({ companyId });
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

  const authUrl = MetaApi.getAuthUrl(redirectUri, state);

  return NextResponse.redirect(authUrl);
}
