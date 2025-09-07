import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(req: NextRequest) {
  try {
    const { pageId } = await req.json();

    // Get the Notion access token from cookies
    const notionToken = req.cookies.get("notion_access_token")?.value;

    if (!notionToken) {
      return NextResponse.json(
        { error: "Not authenticated with Notion" },
        { status: 401 }
      );
    }
    if (!pageId) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    const notion = new Client({
      auth: notionToken,
    });

    // Delete the page by archiving it (Notion doesn't have true deletion via API)
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });

    return NextResponse.json({
      success: true,
      message: "Page archived successfully",
    });
  } catch (error: any) {
    console.error("Failed to delete Notion page:", error);
    // If the page is already deleted/archived, Notion returns a 404 error. We can treat this as a success.
    if (error.status === 404) {
      return NextResponse.json({
        success: true,
        message: "Page was already deleted",
      });
    }
    return NextResponse.json(
      { error: "Failed to delete page", details: error.message },
      { status: 500 }
    );
  }
}