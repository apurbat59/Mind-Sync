import { type NextRequest, NextResponse } from "next/server"

function decodeBase64(input: string): string {
  return Buffer.from(input, "base64").toString("utf-8")
}

function extractBody(payload: any): string {
  if (payload.body?.data) return decodeBase64(payload.body.data)

  if (payload.parts) {
    for (const part of payload.parts) {
      if (
        part.mimeType === "text/plain" ||
        part.mimeType === "text/html"
      ) {
        if (part.body?.data) {
          return decodeBase64(part.body.data)
        }
      }

      // Handle nested multipart parts
      if (part.parts) {
        const nested = extractBody(part)
        if (nested) return nested
      }
    }
  }

  return ""
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// POST: Sync real Gmail messages
export async function POST(request: NextRequest) {
  try {
    const { accessToken, userEmail, pageToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 })
    }

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}`
    const listRes = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!listRes.ok) {
      const errorText = await listRes.text()
      console.error("List fetch failed:", errorText)
      return NextResponse.json({ error: "Failed to fetch message list" }, { status: listRes.status })
    }

    const messageList = await listRes.json()

    if (!messageList.messages?.length) {
      return NextResponse.json({
        emails: [],
        nextPageToken: null,
        totalProcessed: 0,
      })
    }

    const emailPromises = messageList.messages.map(async (msg: any) => {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`
      const detailRes = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!detailRes.ok) return null
      return detailRes.json()
    })

    const emailDetails = await Promise.all(emailPromises)
    const processedEmails = emailDetails
      .filter(Boolean)
      .map((email: any) => {
        const headers = email.payload?.headers || []
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ""

        let body = extractBody(email.payload)
        if (body.includes("<html>") || body.includes("<div>")) {
          body = cleanHtml(body)
        }

        return {
          id: email.id,
          threadId: email.threadId,
          from: getHeader("from") || "unknown",
          to: getHeader("to") || userEmail,
          subject: getHeader("subject") || "(No Subject)",
          content: body.slice(0, 2000),
          date: getHeader("date") || new Date().toISOString(),
          labels: email.labelIds || [],
          read: !email.labelIds?.includes("UNREAD"),
          important: email.labelIds?.includes("IMPORTANT") || email.labelIds?.includes("STARRED"),
          snippet: email.snippet || "",
          internalDate: email.internalDate,
        }
      })

    return NextResponse.json({
      success: true,
      emails: processedEmails,
      nextPageToken: messageList.nextPageToken || null,
      totalProcessed: processedEmails.length,
    })
  } catch (err: any) {
    console.error("Real Gmail sync error:", err)
    return NextResponse.json(
      {
        error: "Failed to sync Gmail",
        details: err?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET: Check Gmail connection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get("accessToken")

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 })
    }

    const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!profileRes.ok) {
      return NextResponse.json({ connected: false, error: "Invalid access token" }, { status: 401 })
    }

    const profile = await profileRes.json()

    return NextResponse.json({
      connected: true,
      emailAddress: profile.emailAddress,
      messagesTotal: profile.messagesTotal,
      threadsTotal: profile.threadsTotal,
      historyId: profile.historyId,
    })
  } catch (err) {
    console.error("Gmail connection error:", err)
    return NextResponse.json({ connected: false, error: "Connection failed" }, { status: 500 })
  }
}
