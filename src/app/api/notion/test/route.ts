import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET(req: NextRequest) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const token = req.cookies.get("notion_access_token")?.value;

    console.log("Test route - Database ID:", databaseId);
    console.log("Test route - Token exists:", !!token);

    if (!token) {
      return NextResponse.json({
        error: "No Notion access token found",
        databaseId: databaseId,
        hasToken: false
      });
    }

    if (!databaseId || databaseId === 'YOUR_ACTUAL_DATABASE_ID_HERE') {
      return NextResponse.json({
        error: "Database ID not configured",
        databaseId: databaseId,
        hasToken: true
      });
    }

    const notion = new Client({ auth: token });

    // Try to retrieve the database info
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });

    return NextResponse.json({
      success: true,
      message: "Notion connection successful",
      databaseId: databaseId,
      hasToken: true,
      databaseFound: true,
      databaseInfo: {
        title: (response as any).title?.[0]?.plain_text || "Unknown",
        properties: Object.keys((response as any).properties || {})
      }
    });

  } catch (error: any) {
    console.error("Test route error:", error);
    return NextResponse.json({
      error: "Notion test failed",
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}