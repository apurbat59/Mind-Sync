import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1500

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    const { message, emailContext, memoryContext, userEmail, conversationHistory } = await request.json()

    // Build comprehensive prompt for Gemini 2.0 Flash
    const systemPrompt = `You are MindSync AI, an intelligent email assistant powered by Gemini 2.0 Flash. You have access to the user's emails and personal memories.

User Email: ${userEmail}

RECENT EMAILS:
${emailContext}

PERSONAL MEMORIES:
${memoryContext}

CONVERSATION HISTORY:
${conversationHistory.map((msg: any) => `${msg.sender}: ${msg.content}`).join("\n")}

Your capabilities:
- Analyze and summarize emails
- Find specific emails or information
- Identify action items and important tasks
- Provide insights about communication patterns
- Answer questions about email content
- Help with email management and organization

Respond in a helpful, conversational tone. Be specific and reference actual email content when relevant. If you're providing email summaries or insights, format them clearly.`

    const userPrompt = `User Question: ${message}

Please provide a helpful response based on the user's emails and memories. Be specific and actionable.`

    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: systemPrompt + "\n\n" + userPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    })

    let response
    let attempt = 0
    while (attempt < MAX_RETRIES) {
      response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      })

      if (response.ok) break

      const status = response.status
      if (status === 503) {
        console.warn(`Gemini API overloaded (503). Retry attempt ${attempt + 1}...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)))
        attempt++
      } else {
        const errorData = await response.text()
        console.error("Gemini API error:", status, errorData)
        throw new Error(`Gemini API error: ${status} - ${errorData}`)
      }
    }

    if (!response || !response.ok) {
      throw new Error("Gemini API is unavailable after multiple attempts.")
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error("No response from Gemini API")
    }

    // Determine response type based on content
    let responseType = "text"
    const lowerResponse = aiResponse.toLowerCase()

    if (lowerResponse.includes("email") && lowerResponse.includes("summary")) {
      responseType = "email-summary"
    } else if (lowerResponse.includes("insight") || lowerResponse.includes("pattern")) {
      responseType = "insight"
    }

    return NextResponse.json({
      response: aiResponse,
      type: responseType,
      model: "gemini-2.0-flash-exp",
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        response:
          "Sorry, I'm having trouble reaching Gemini right now due to high load. Please try again shortly.",
        type: "text",
        error: true,
      },
      { status: 503 },
    )
  }
}
