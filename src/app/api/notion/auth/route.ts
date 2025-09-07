import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    console.error("Notion OAuth error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/settings?error=notion_oauth_failed`
    );
  }

  if (!code) {
    // Redirect to Notion OAuth
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = `${requestUrl.origin}/api/notion/auth`;

    if (!clientId) {
      console.error("NOTION_CLIENT_ID not configured");
      return NextResponse.redirect(
        `${requestUrl.origin}/settings?error=notion_config_missing`
      );    
    }

    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return NextResponse.redirect(notionAuthUrl);
  }

  // Exchange code for access token
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;
    const redirectUri = `${requestUrl.origin}/api/notion/auth`;

    if (!clientId || !clientSecret) {
      throw new Error("Notion credentials not configured");
    }

    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to exchange Notion code:", errorData);
      throw new Error("Failed to get access token");
    }

    const tokenData = await response.json();

    // Store the token in a cookie for now (in production, you'd store this securely)
    const responseObj = NextResponse.redirect(`${requestUrl.origin}/settings?success=notion_connected`);

    // Set the access token in a cookie (not httpOnly so client can check for it)
    responseObj.cookies.set("notion_access_token", tokenData.access_token, {
      httpOnly: false, // Allow client-side access for connection checking
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 3600, // Default to 1 hour
    });

    // Store workspace info if available
    if (tokenData.workspace_name) {
      responseObj.cookies.set("notion_workspace_name", tokenData.workspace_name, {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.expires_in || 3600,
      });
    }

    return responseObj;
  } catch (error) {
    console.error("Notion OAuth exchange error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/settings?error=notion_token_exchange_failed`
    );
  }
}