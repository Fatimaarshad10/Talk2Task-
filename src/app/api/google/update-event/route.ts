import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const { eventId, status, session } = await req.json();

    if (!session || !session.provider_token) {
      return NextResponse.json(
        { error: "Not authenticated with Google" },
        { status: 401 }
      );
    }
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.provider_token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // First, get the existing event to preserve its title
    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    let newTitle = existingEvent.data.summary || "Event";
    // Remove existing prefixes to avoid duplication like "[Completed] [Completed] Title"
    newTitle = newTitle.replace(/\[(Completed|Cancelled)\]\s/g, "");

    if (status === "completed" || status === "cancelled") {
      const prefix = status === "completed" ? "[Completed]" : "[Cancelled]";
      newTitle = `${prefix} ${newTitle}`;
    }

    const updatedEvent = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      requestBody: {
        summary: newTitle,
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent.data });
  } catch (error: any) {
    console.error("Failed to update Google Calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update event", details: error.message },
      { status: 500 }
    );
  }
}
