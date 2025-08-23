import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { audio, format } = await request.json()

    // In a real implementation, you would:
    // 1. Convert the base64 audio to a proper audio file
    // 2. Send it to OpenAI's Whisper API
    // 3. Return the transcription

    // For demo purposes, we'll simulate transcription
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate different transcription results
    const sampleTranscriptions = [
      "I need to remember to follow up with the client about the project proposal by Friday.",
      "Great idea for the new feature - we should implement voice search functionality.",
      "Meeting notes: discussed budget allocation for Q4, need to review marketing spend.",
      "Personal reminder: book dentist appointment and pick up dry cleaning.",
      "Project update: development is 80% complete, testing phase starts next week.",
    ]

    const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)]

    return NextResponse.json({
      text: randomTranscription,
      confidence: 0.95,
    })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}
