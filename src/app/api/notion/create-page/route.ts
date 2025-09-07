import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function POST(req: NextRequest) {
  try {
    const { task, databaseId } = await req.json();

    console.log("Creating Notion page with:", { task: task.title, databaseId });

    // Get the Notion access token from cookies
    const notionToken = req.cookies.get("notion_access_token")?.value;

    if (!notionToken) {
      console.error("No Notion access token found in cookies");
      return NextResponse.json(
        { error: "Not authenticated with Notion" },
        { status: 401 }
      );
    }

    if (!databaseId) {
      console.error("No database ID provided");
      return NextResponse.json(
        { error: "Database ID is required" },
        { status: 400 }
      );
    }

    console.log("Initializing Notion client with token:", notionToken.substring(0, 10) + "...");

    const notion = new Client({
      auth: notionToken,
    });

    // Create a new page in the specified database
    console.log("Creating page with properties:", {
      title: task.title,
      priority: task.priority,
      due_date: task.due_date,
      databaseId
    });

    // Check if we can retrieve the database first to see its properties
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
      console.log("Database info retrieved successfully");
      console.log("Database object:", JSON.stringify(dbInfo, null, 2));
    } catch (dbError: any) {
      console.error("Failed to retrieve database info:", dbError);
    }

    // Create a minimal page with just the title first
    const pageData = {
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: task.title,
              },
            },
          ],
        },
      },
      children: task.description ? [
        {
          object: "block" as const,
          type: "paragraph" as const,
          paragraph: {
            rich_text: [
              {
                text: {
                  content: task.description,
                },
              },
            ],
          },
        },
      ] : [],
    };

    console.log("Page data to send:", JSON.stringify(pageData, null, 2));

    console.log("Page creation data:", JSON.stringify(pageData, null, 2));

    const response = await notion.pages.create(pageData);

    return NextResponse.json({ success: true, page: response });
  } catch (error: any) {
    console.error("Failed to create Notion page:", error);

    // Provide more detailed error information
    let errorMessage = "Failed to create page";
    let statusCode = 500;

    if (error.code) {
      console.error("Notion API Error Code:", error.code);
      switch (error.code) {
        case 'unauthorized':
          errorMessage = "Notion access token is invalid or expired";
          statusCode = 401;
          break;
        case 'restricted_resource':
          errorMessage = "Database not found or integration doesn't have access";
          statusCode = 403;
          break;
        case 'validation_error':
          errorMessage = "Invalid data sent to Notion API";
          statusCode = 400;
          break;
        case 'object_not_found':
          errorMessage = "Database ID is incorrect or database was deleted";
          statusCode = 404;
          break;
        default:
          errorMessage = `Notion API error: ${error.code}`;
      }
    }

    if (error.message) {
      console.error("Error message:", error.message);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || "Unknown error",
        code: error.code || "unknown"
      },
      { status: statusCode }
    );
  }
}