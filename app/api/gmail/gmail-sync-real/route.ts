import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, userEmail, maxResults = 50 } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 })
    }

    console.log(`Starting real Gmail sync for ${userEmail}`)

    // First, get user profile to verify connection
    const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", profileResponse.status)
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 })
    }

    const profile = await profileResponse.json()
    console.log(`Gmail profile verified: ${profile.emailAddress}`)

    // Fetch recent messages
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!messagesResponse.ok) {
      console.error("Messages fetch failed:", messagesResponse.status)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const messagesList = await messagesResponse.json()

    if (!messagesList.messages || messagesList.messages.length === 0) {
      return NextResponse.json({
        success: true,
        emails: [],
        profile,
        totalProcessed: 0,
      })
    }

    console.log(`Fetching details for ${messagesList.messages.length} messages`)

    // Fetch detailed information for each message (in batches to avoid rate limits)
    const batchSize = 10
    const allEmails = []

    for (let i = 0; i < messagesList.messages.length; i += batchSize) {
      const batch = messagesList.messages.slice(i, i + batchSize)

      const batchPromises = batch.map(async (message: any) => {
        try {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          )

          if (!detailResponse.ok) {
            console.error(`Failed to fetch message ${message.id}:`, detailResponse.status)
            return null
          }

          return detailResponse.json()
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter(Boolean)
      allEmails.push(...validResults)

      // Small delay to respect rate limits
      if (i + batchSize < messagesList.messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    console.log(`Successfully fetched ${allEmails.length} email details`)

    // Process emails into our format
    const processedEmails = allEmails
      .map((email: any) => {
        try {
          const headers = email.payload?.headers || []
          const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")
          const toHeader = headers.find((h: any) => h.name.toLowerCase() === "to")
          const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === "subject")
          const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")

          // Extract email body
          let body = ""
          let htmlBody = ""

          const extractBody = (payload: any) => {
            if (payload.body?.data) {
              const decoded = Buffer.from(payload.body.data, "base64").toString("utf-8")
              if (payload.mimeType === "text/html") {
                htmlBody = decoded
              } else {
                body = decoded
              }
            }

            if (payload.parts) {
              payload.parts.forEach((part: any) => {
                if (part.mimeType === "text/plain" && part.body?.data) {
                  body = Buffer.from(part.body.data, "base64").toString("utf-8")
                } else if (part.mimeType === "text/html" && part.body?.data) {
                  htmlBody = Buffer.from(part.body.data, "base64").toString("utf-8")
                } else if (part.parts) {
                  extractBody(part)
                }
              })
            }
          }

          extractBody(email.payload)

          // Use plain text if available, otherwise convert HTML
          let finalBody = body
          if (!finalBody && htmlBody) {
            // Simple HTML to text conversion
            finalBody = htmlBody
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<\/p>/gi, "\n")
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .trim()
          }

          // Clean up the body
          finalBody = finalBody.slice(0, 5000) // Limit length

          const processedEmail = {
            id: email.id,
            threadId: email.threadId,
            from: fromHeader?.value || "unknown@gmail.com",
            to: toHeader?.value || userEmail,
            subject: subjectHeader?.value || "No Subject",
            content: finalBody || email.snippet || "No content available",
            date: dateHeader?.value || new Date(Number.parseInt(email.internalDate)).toISOString(),
            labels: email.labelIds || [],
            read: !email.labelIds?.includes("UNREAD"),
            important: email.labelIds?.includes("IMPORTANT") || email.labelIds?.includes("STARRED"),
            snippet: email.snippet || "",
            internalDate: email.internalDate,
            sizeEstimate: email.sizeEstimate,
          }

          return processedEmail
        } catch (error) {
          console.error("Error processing email:", error)
          return null
        }
      })
      .filter(Boolean)

    console.log(`Successfully processed ${processedEmails.length} emails`)

    return NextResponse.json({
      success: true,
      emails: processedEmails,
      profile,
      totalProcessed: processedEmails.length,
      nextPageToken: messagesList.nextPageToken,
    })
  } catch (error) {
    console.error("Gmail sync error:", error)
    return NextResponse.json(
      {
        error: "Gmail sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Get Gmail connection status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get("accessToken")

    if (!accessToken) {
      return NextResponse.json({ connected: false, error: "No access token" })
    }

    // Verify token by fetching profile
    const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ connected: false, error: "Invalid token" })
    }

    const profile = await profileResponse.json()

    return NextResponse.json({
      connected: true,
      emailAddress: profile.emailAddress,
      messagesTotal: profile.messagesTotal,
      threadsTotal: profile.threadsTotal,
      historyId: profile.historyId,
    })
  } catch (error) {
    console.error("Gmail status check error:", error)
    return NextResponse.json({ connected: false, error: "Status check failed" })
  }
}
