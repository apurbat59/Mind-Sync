import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") // User's email
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL(`/dashboard?error=oauth_denied`, request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL(`/dashboard?error=missing_code`, request.url))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID || "your-client-id",
        client_secret: process.env.GMAIL_CLIENT_SECRET || "your-client-secret",
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/gmail-callback",
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text())
      return NextResponse.redirect(new URL(`/dashboard?error=token_exchange_failed`, request.url))
    }

    const tokens = await tokenResponse.json()

    // Create a success page that stores tokens and redirects
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Connected Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f9ff; }
            .success { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>✅ Gmail Connected Successfully!</h2>
            <p>Setting up real-time email sync...</p>
            <div class="spinner"></div>
            <p><small>You will be redirected to your dashboard shortly.</small></p>
          </div>
          <script>
            // Store tokens in localStorage
            localStorage.setItem('gmail-token-${state}', '${tokens.access_token}');
            localStorage.setItem('gmail-refresh-token-${state}', '${tokens.refresh_token || ""}');
            localStorage.setItem('gmail-token-expires-${state}', '${Date.now() + tokens.expires_in * 1000}');
            localStorage.setItem('gmail-connected-${state}', 'true');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              window.location.href = '/dashboard?gmail_connected=true';
            }, 2000);
          </script>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    console.error("Gmail callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard?error=callback_failed`, request.url))
  }
}
