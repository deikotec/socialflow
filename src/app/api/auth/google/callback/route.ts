import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google-drive";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const companyId = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/settings?error=oauth_denied", req.url));
  }

  if (!code || !companyId) {
     return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
        // Securely update company with refresh token using Admin SDK (bypassing cookie check)
        const companyRef = adminDb.collection("companies").doc(companyId);
        
        await companyRef.update({ 
            drive_refresh_token: tokens.refresh_token,
            // Optionally update drive_link if we want to default to root or something, 
            // but usually we create a specific folder later if not exists.
        });
        
        return NextResponse.redirect(new URL("/settings?success=drive_connected", req.url));
    } else {
         console.warn("No refresh token received");
         // If already connected, maybe just success? or warning.
         return NextResponse.redirect(new URL("/settings?error=no_refresh_token", req.url));
    }

  } catch (error) {
    console.error("OAuth Error:", error);
    return NextResponse.redirect(new URL("/settings?error=exchange_failed", req.url));
  }
}
