import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    const { query, context, type } = await request.json()

    let prompt = ""

    if (type === "search") {
      prompt = `You are MindSync, an AI assistant that helps users understand their personal memories and data. 

User Query: "${query}"

Relevant Context from User's Memories:
${context}

Based on the user's memories above, provide a helpful, personalized response to their query. Be conversational and reference specific details from their memories when relevant. If the memories don't contain enough information to fully answer the query, acknowledge this and provide what insights you can.`
    } else {
      prompt = `You are MindSync, an AI assistant for personal memory management. Help the user with: ${query}`
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I was unable to generate a response at this time."

    return NextResponse.json({
      response: aiResponse,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Fallback response
    const fallbackResponses = {
      search:
        "Based on your memories, I can see you've been active in several areas. While I couldn't process your specific query with AI at the moment, I can see patterns in your captured information that might be relevant to what you're looking for.",
      default:
        "I'm here to help you with your memory management needs. While I couldn't connect to the AI service right now, I can still help you organize and search through your captured memories.",
    }

    return NextResponse.json({
      response: fallbackResponses.search || fallbackResponses.default,
    })
  }
}
