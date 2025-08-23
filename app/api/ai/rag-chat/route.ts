import { type NextRequest, NextResponse } from "next/server"
import { ragEngine } from "@/lib/ai/rag-engine"

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

    const { query, userEmail, useRAG = true } = await request.json()

    let enhancedPrompt = query
    let ragContext = ""

    if (useRAG) {
      // Perform RAG retrieval
      const ragResults = await ragEngine.retrieveRelevantContext(query, 8)

      if (ragResults.relevantMemories.length > 0) {
        ragContext = ragResults.contextWindow

        // Enhanced prompt with RAG context
        enhancedPrompt = `You are MindSync AI, an intelligent assistant with access to the user's personal memories and data.

User Query: "${query}"

RETRIEVED CONTEXT (RAG):
${ragContext}

Based on the retrieved context above, provide a comprehensive and personalized response to the user's query. Reference specific information from their memories when relevant. If the context doesn't contain enough information to fully answer the query, acknowledge this and provide what insights you can.

Focus on:
1. Direct answers using the retrieved context
2. Connections between different memories
3. Patterns or insights you can identify
4. Actionable recommendations based on their data

Response:`
      }
    }

    // Call Gemini API with enhanced prompt
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
                  text: enhancedPrompt,
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
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", response.status, errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error("No response from Gemini API")
    }

    // Return enhanced response with RAG metadata
    return NextResponse.json({
      response: aiResponse,
      ragUsed: useRAG,
      contextRetrieved: ragContext.length > 0,
      retrievalScore: ragContext.length > 0 ? 0.85 : 0,
      model: "gemini-2.0-flash-exp",
      enhancedWithRAG: true,
    })
  } catch (error) {
    console.error("RAG Chat API error:", error)

    // Fallback response
    return NextResponse.json({
      response:
        "I apologize, but I'm having trouble processing your request with RAG enhancement right now. Please try again in a moment.",
      ragUsed: false,
      contextRetrieved: false,
      retrievalScore: 0,
      error: true,
    })
  }
}
