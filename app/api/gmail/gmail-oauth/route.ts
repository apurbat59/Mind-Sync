import { type NextRequest, NextResponse } from "next/server"

// Gmail OAuth configuration from environment variables
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/gmail-callback"

export async function POST(request: NextRequest) {
  try {
    // Check if Gmail OAuth credentials are available
    if (!GMAIL_CLIENT_ID) {
      return NextResponse.json(
        { error: "Gmail OAuth credentials not configured" },
        { status: 500 }
      )
    }

    const { email } = await request.json()

    // Gmail OAuth scopes for reading emails
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ")

    // Generate OAuth authorization URL
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GMAIL_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(email)}`

    console.log("Generated OAuth URL for:", email)

    return NextResponse.json({
      authUrl,
      message: "Redirect user to this URL for Gmail OAuth",
      clientId: GMAIL_CLIENT_ID,
      scopes: scopes.split(" "),
    })
  } catch (error) {
    console.error("Gmail OAuth error:", error)
    return NextResponse.json({ error: "OAuth setup failed" }, { status: 500 })
  }
}
