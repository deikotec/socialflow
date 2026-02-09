import { NextRequest, NextResponse } from "next/server";
import { MetaApi } from "@/lib/meta";
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
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

    // 1. Exchange Code for Short-Lived Token
    const tokenData = await MetaApi.exchangeCode(code, redirectUri);
    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for Long-Lived Token (60 days)
    const longTokenData = await MetaApi.getLongLivedToken(shortLivedToken);
    const accessToken = longTokenData.access_token;

    // DEBUG: Check Permissions & Identity
    const permissions = await MetaApi.getPermissions(accessToken);
    console.log("Granted Permissions:", JSON.stringify(permissions));

    const me = await MetaApi.getMe(accessToken);
    console.log("Logged in as:", JSON.stringify(me));

    // 3. Get Pages (simpler fetch for debugging)
    const pagesData = await MetaApi.getPages(accessToken);
    const pages = pagesData.data;
    console.log("Pages fetched:", JSON.stringify(pages));


    let instagramAccount = null;
    let connectedPageId = null;
    // Iterate pages to find one with instagram_business_account
    if (pages) {
        for (const page of pages) {
            console.log("Checking page:", page.id, page.name);
            try {
                const pageDetails = await MetaApi.getInstagramAccount(page.id, accessToken);
                console.log("Page Details:", JSON.stringify(pageDetails));
                
                if (pageDetails.instagram_business_account) {
                    instagramAccount = pageDetails.instagram_business_account;
                    connectedPageId = page.id;
                    console.log("Found IG Account on page:", page.name, instagramAccount.id);
                    break;
                }
            } catch (e) {
                console.error("Error fetching page details", e);
            }
        }
    }

    if (!instagramAccount) {
         return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_instagram_connected`
          );
    }

    // 4. Get Instagram Details (Username)
    const igDetails = await MetaApi.getInstagramDetails(instagramAccount.id, accessToken);

    // 5. Update Company in Firestore
    await adminDb.collection("companies").doc(companyId).update({
      "socialConnections.instagram": {
        accessToken: accessToken,
        instagramUserId: instagramAccount.id,
        pageId: connectedPageId,
        username: igDetails.username,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=instagram_connected`
    );
  } catch (error) {
    console.error("Meta Auth Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=meta_auth_failed`
    );
  }
}
