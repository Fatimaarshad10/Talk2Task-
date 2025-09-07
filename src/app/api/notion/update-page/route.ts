import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(req: NextRequest) {
  try {
    const { pageId, status } = await req.json();

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

    // Map status to Notion status names
    const statusMapping: { [key: string]: string } = {
      pending: "Not started",
      in_progress: "In progress",
      completed: "Done",
      cancelled: "Cancelled",
    };

    const notionStatus = statusMapping[status] || "Not started";

    // Update the page properties
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: {
            name: notionStatus,
          },
        },
      },
    });

    return NextResponse.json({ success: true, page: response });
  } catch (error: any) {
    console.error("Failed to update Notion page:", error);
    return NextResponse.json(
      { error: "Failed to update page", details: error.message },
      { status: 500 }
    );
  }
}