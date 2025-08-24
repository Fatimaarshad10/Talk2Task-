import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Handle OAuth code exchange
async function handleOAuthCodeExchange(code: string, userId: string) {
  try {
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET
    const redirectUri = `https://talk2-task-hztu.vercel.app/auth/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured' },
        { status: 500 }
      )
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error('No access token received')
    }

    return NextResponse.json({
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      message: 'OAuth code exchanged successfully'
    })

  } catch {
    console.error('OAuth code exchange error:')
    return NextResponse.json(
      {
        error: 'Failed to exchange OAuth code',
        details: 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle OAuth code exchange
    if (body.code && body.userId) {
      return await handleOAuthCodeExchange(body.code, body.userId)
    }

    // Handle task creation
    const { task, accessToken } = body
    if (!task || !accessToken) {
      return NextResponse.json(
        { error: 'Task and access token are required' },
        { status: 400 }
      )
    }

    console.log('Creating Google Calendar event for task:', task.title)

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: accessToken
    })

    // Create Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Prepare event data with better time handling
    const startTime = task.due_date ? new Date(task.due_date) : new Date()
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour later

    const event = {
      summary: task.title,
      description: task.description || `Task: ${task.title}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use user's timezone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
      // Add task metadata
      extendedProperties: {
        private: {
          taskId: task.id || 'unknown',
          source: 'Talk2Task',
          priority: task.priority || 'medium'
        }
      }
    }

    console.log('Calendar event data:', event)

    // Create calendar event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send notifications to attendees
    })

    const createdEvent = response.data
    console.log('Calendar event created successfully:', createdEvent.id)

    return NextResponse.json({
      success: true,
      event: createdEvent,
      message: 'Calendar event created successfully'
    })

  } catch {
    console.error('Google Calendar integration error:')

    // Provide more specific error messages
    let errorMessage = 'Failed to create calendar event'

    return NextResponse.json(
      {
        error: errorMessage,
        details: 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('accessToken')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: accessToken
    })

    // Create Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Get user's calendar list
    const response = await calendar.calendarList.list()

    return NextResponse.json({
      success: true,
      calendars: response.data.items || []
    })

  } catch {
    console.error('Google Calendar list error:')

    return NextResponse.json(
      {
        error: 'Failed to fetch calendars',
        details: 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Add OAuth URL generation endpoint
export async function PUT(request: NextRequest) {
  try {
    const { redirectUri } = await request.json()

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'Redirect URI is required' },
        { status: 400 }
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured' },
        { status: 500 }
      )
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    })

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'OAuth URL generated successfully'
    })

  } catch {
    console.error('OAuth URL generation error:')

    return NextResponse.json(
      {
        error: 'Failed to generate OAuth URL',
        details: 'Unknown error'
      },
      { status: 500 }
    )
  }
}
