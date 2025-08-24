import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: "Text input is required" },
        { status: 400 }
      )
    }

    console.log('Processing text input:', text)

    // Enhanced system prompt for better task extraction (commented out for now)
    /*
    const systemPrompt = `You are Talk2Task, an AI-powered productivity assistant that converts natural language into structured tasks.

Your job is to analyze the user's input and extract:
1. A clear, actionable task title
2. Detailed description if needed
3. Priority level (low, medium, high, urgent)
4. Due date if mentioned (in ISO format)
5. Suggested integrations (google_calendar if time/date mentioned)

Return ONLY valid JSON with this exact structure:
{
  "title": "string - clear task title",
  "description": "string - detailed description or null",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO string or null",
  "integrations": ["platform1", "platform2"],
  "context": "string - brief context summary",
  "ai_response": "friendly confirmation message"
}

Examples:
Input: "Schedule a team meeting for tomorrow at 2 PM"
Output: {
  "title": "Schedule team meeting",
  "description": "Team meeting scheduled for tomorrow at 2 PM",
  "priority": "medium",
  "due_date": "2024-01-16T14:00:00Z",
  "integrations": ["google_calendar"],
  "context": "Team meeting scheduling",
  "ai_response": "I've scheduled your team meeting for tomorrow at 2 PM!"
}

Input: "Buy groceries this weekend"
Output: {
  "title": "Buy groceries",
  "description": "Purchase groceries for the weekend",
  "priority": "medium",
  "due_date": "2024-01-20T18:00:00Z",
  "integrations": [],
  "context": "Shopping task",
  "ai_response": "I've added grocery shopping to your weekend tasks!"
}`
    */

    // Use a more reliable AI service - OpenAI if available, otherwise fallback
    let aiResponse
    const aimlApiKey = process.env.AIMLAPI_KEY

    if (aimlApiKey) {
      // Use AIML API as fallback
      console.log('Using AIML API')
      const aimlResponse = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aimlApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemma-3-4b-it",
          messages: [
            // { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      })

      if (!aimlResponse.ok) {
        throw new Error(`AIML API failed with ${aimlResponse.status}`)
      }

      const aimlData = await aimlResponse.json()
      aiResponse = aimlData.choices?.[0]?.message?.content
    } else {
      // Fallback to simple parsing
      console.log('Using fallback parsing')
      aiResponse = JSON.stringify({
        title: text,
        description: `Task: ${text}`,
        priority: "medium",
        due_date: null,
        integrations: [],
        context: "Manual task creation",
        ai_response: "Task created successfully!"
      })
    }

    if (!aiResponse) {
      throw new Error("No response from AI API")
    }

    // Parse AI response
    let taskData
    try {
      taskData = JSON.parse(aiResponse)

      // Validate required fields
      if (!taskData.title) {
        taskData.title = text
      }
      if (!taskData.description) {
        taskData.description = `Task: ${text}`
      }
      if (!taskData.priority || !['low', 'medium', 'high', 'urgent'].includes(taskData.priority)) {
        taskData.priority = 'medium'
      }
      if (!taskData.integrations) {
        taskData.integrations = []
      }
      if (!taskData.context) {
        taskData.context = 'AI processed task'
      }
      if (!taskData.ai_response) {
        taskData.ai_response = 'Task created successfully!'
      }

      // Process due date if mentioned
      if (taskData.due_date) {
        try {
          // Validate ISO date format
          new Date(taskData.due_date)
        } catch {
          // If invalid date, set to null
          taskData.due_date = null
        }
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback task data
      taskData = {
        title: text,
        description: `AI processed: ${text}`,
        priority: "medium",
        due_date: null,
        integrations: [],
        context: "AI fallback",
        ai_response: "Task created successfully!",
      }
    }

    console.log('Processed task data:', taskData)

    return NextResponse.json({
      success: true,
      task: taskData,
      original_input: text,
    })
  } catch {
    console.error("AI processing error:")

    return NextResponse.json(
      {
        error: "Failed to process with AI",
        details: "Unknown error",
      },
      { status: 500 }
    )
  }
}
