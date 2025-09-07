import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Replace with your actual OpenRouter key, preferably from environment variables
const OPENROUTER_API_KEY =
  "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";

export async function POST(req: NextRequest) {
  try {
    const { text, timezone } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text input is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // Using a standard, reliable model
          messages: [
            {
              role: "system",
              content: `You are Talk2Task, an AI-powered productivity assistant. Your goal is to convert user input into a structured JSON object.

The JSON object must have the following fields:
{
  "title": "string",
  "description": "string",
  "priority": "'low' | 'medium' | 'high' | 'urgent'",
  "due_date": "ISO 8601 string (e.g., '2025-09-05T14:30:00Z') or null",
  "integrations": "array of strings (e.g., ['google_calendar'])",
  "category": "'Task' | 'Work' | 'Meeting' | 'General'",
  "ai_response": "string"
}

Here are your instructions:
1.  **Analyze the user's text** to extract the details for the JSON fields.
2.  **Categorize the request**: Based on keywords, classify the request into one of four categories: 'Meeting' (e.g., "schedule a call", "meet with"), 'Work' (e.g., "project deadline", "submit report"), 'Task' (e.g., "buy groceries", "remind me to"), or 'General' for anything else.
3.  **Create a clear title**: Start the title with the category. For example, "Meeting: Team Sync" or "Task: Pick up dry cleaning".
4.  **Handle Dates and Times**:
    *   The current date is ${new Date().toISOString()}. The user's timezone is ${timezone}.
    *   When converting dates and times, always consider the user's timezone.
    *   If the user provides a date and time, convert it to a full ISO 8601 string in UTC.
    *   If the user provides only a date (e.g., "tomorrow"), use the current time on that date in their timezone.
    *   If the user provides only a time (e.g., "at 5pm"), use today's date in their timezone.
    *   If no date or time is mentioned, set \`due_date\` to \`null\`.
5.  **Integration Detection**:
    *   If the text mentions a date, time, scheduling, calendar, or meeting, add 'google_calendar' to the \`integrations\` array.
    *   If the text mentions "notion", "workspace", "database", "page", or "notion workspace", add 'notion' to the \`integrations\` array.
    *   The array can contain both integrations if applicable, or be empty if no integrations are detected.
6.  **Description**: Use the user's full text as the description.
7.  **AI Response**: Create a friendly confirmation message for the user.`,
            },
            { role: "user", content: text },
          ],
          response_format: { type: "json_object" }, // Request JSON output
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", errorBody);
      throw new Error(
        `API request failed with status ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || null;

    if (!aiResponse) {
      throw new Error("No response content from OpenRouter");
    }

    // The AI should return a JSON string, so we parse it.
    const taskData = JSON.parse(aiResponse);

    // --- Fallback validation ---
    if (!taskData.title) taskData.title = text.substring(0, 50);
    if (!taskData.description)
      taskData.description = `Task created from: "${text}"`;
    if (!["low", "medium", "high", "urgent"].includes(taskData.priority)) {
      taskData.priority = "medium";
    }
    if (!taskData.integrations) taskData.integrations = [];
    if (!taskData.ai_response)
      taskData.ai_response = "Task has been created for you.";
    // --- End Fallback validation ---

    return NextResponse.json({
      success: true,
      task: taskData,
      original_input: text,
    });
  } catch (error: any) {
    console.error("AI processing error:", error);
    return NextResponse.json(
      {
        error: "AI request failed",
        details: error.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
