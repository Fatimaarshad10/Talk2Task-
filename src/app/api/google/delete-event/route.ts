import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const { eventId, session } = await req.json();

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

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Failed to delete Google Calendar event:", error);
    // If the event is already deleted, Google sends a 410 error. We can treat this as a success.
    if (error.code === 410) {
      return NextResponse.json({
        success: true,
        message: "Event was already deleted",
      });
    }
    return NextResponse.json(
      { error: "Failed to delete event", details: error.message },
      { status: 500 }
    );
  }
}
