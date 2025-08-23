"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, Loader2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface GmailConnectorProps {
  userEmail: string
  onEmailsLoaded: (emails: any[]) => void
  onConnectionStatusChange: (connected: boolean) => void
}

export default function GmailConnector({ userEmail, onEmailsLoaded, onConnectionStatusChange }: GmailConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [gmailProfile, setGmailProfile] = useState<any>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [emailCount, setEmailCount] = useState(0)

  useEffect(() => {
    checkExistingConnection()

    // Check for OAuth callback success
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("gmail_connected") === "true") {
      // Connection was successful, check for stored tokens
      setTimeout(checkExistingConnection, 1000)
    }
  }, [userEmail])

  const checkExistingConnection = async () => {
    const token = localStorage.getItem(`gmail-token-${userEmail}`)
    const tokenExpires = localStorage.getItem(`gmail-token-expires-${userEmail}`)

    if (token && tokenExpires) {
      const expiresAt = Number.parseInt(tokenExpires)
      if (Date.now() < expiresAt) {
        setAccessToken(token)
        await verifyConnection(token)
      } else {
        // Token expired, try to refresh
        await refreshToken()
      }
    }
  }

  const verifyConnection = async (token: string) => {
    try {
      const response = await fetch(`/api/gmail/gmail-sync-real?accessToken=${token}`)
      const data = await response.json()

      if (data.connected) {
        setIsConnected(true)
        setGmailProfile(data)
        setConnectionError(null)
        onConnectionStatusChange(true)

        // Auto-sync emails on connection
        await syncEmails(token)
      } else {
        setIsConnected(false)
        setConnectionError(data.error || "Connection verification failed")
        onConnectionStatusChange(false)
      }
    } catch (error) {
      console.error("Connection verification error:", error)
      setConnectionError("Failed to verify Gmail connection")
      setIsConnected(false)
      onConnectionStatusChange(false)
    }
  }

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(`gmail-refresh-token-${userEmail}`)

    if (!refreshToken) {
      setConnectionError("No refresh token available. Please reconnect.")
      return
    }

    try {
      // In a real implementation, you'd call your backend to refresh the token
      // For now, we'll just clear the expired token
      localStorage.removeItem(`gmail-token-${userEmail}`)
      localStorage.removeItem(`gmail-refresh-token-${userEmail}`)
      localStorage.removeItem(`gmail-token-expires-${userEmail}`)
      setConnectionError("Token expired. Please reconnect to Gmail.")
    } catch (error) {
      console.error("Token refresh error:", error)
      setConnectionError("Failed to refresh token. Please reconnect.")
    }
  }

  const connectGmail = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const response = await fetch("/api/gmail/gmail-oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (data.authUrl) {
        // Redirect to Gmail OAuth
        window.location.href = data.authUrl
      } else {
        throw new Error("Failed to get OAuth URL")
      }
    } catch (error) {
      console.error("Gmail connection error:", error)
      setConnectionError("Failed to initiate Gmail connection")
      setIsConnecting(false)
    }
  }

  const syncEmails = async (token?: string) => {
    const currentToken = token || accessToken
    if (!currentToken) {
      setConnectionError("No access token available")
      return
    }

    setIsSyncing(true)
    setConnectionError(null)

    try {
      console.log("Starting Gmail sync...")

      const response = await fetch("/api/gmail/gmail-sync-real", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: currentToken,
          userEmail,
          maxResults: 50,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`Successfully synced ${data.emails.length} emails`)
        setEmailCount(data.emails.length)
        setLastSyncTime(new Date())
        setGmailProfile(data.profile)

        // Pass emails to parent component
        onEmailsLoaded(data.emails)

        // Store emails locally for offline access
        localStorage.setItem(`real-emails-${userEmail}`, JSON.stringify(data.emails))
        localStorage.setItem(`gmail-last-sync-${userEmail}`, new Date().toISOString())
      } else {
        throw new Error(data.error || "Sync failed")
      }
    } catch (error) {
      console.error("Email sync error:", error)
      setConnectionError(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const disconnect = () => {
    localStorage.removeItem(`gmail-token-${userEmail}`)
    localStorage.removeItem(`gmail-refresh-token-${userEmail}`)
    localStorage.removeItem(`gmail-token-expires-${userEmail}`)
    localStorage.removeItem(`gmail-connected-${userEmail}`)
    localStorage.removeItem(`real-emails-${userEmail}`)

    setIsConnected(false)
    setAccessToken(null)
    setGmailProfile(null)
    setConnectionError(null)
    setEmailCount(0)
    setLastSyncTime(null)
    onConnectionStatusChange(false)
    onEmailsLoaded([])
  }

  return (
    <Card className={`border-2 ${isConnected ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="text-blue-900">Real Gmail Integration</span>
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isConnected
            ? `Connected to ${gmailProfile?.emailAddress || userEmail} • ${emailCount} emails synced`
            : "Connect your Gmail account to access real-time email data"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {connectionError && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{connectionError}</span>
          </div>
        )}

        {isConnected && gmailProfile && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Email Address:</span>
                <p className="text-gray-900">{gmailProfile.emailAddress}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Messages:</span>
                <p className="text-gray-900">{gmailProfile.messagesTotal?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Synced Emails:</span>
                <p className="text-gray-900">{emailCount}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Sync:</span>
                <p className="text-gray-900">{lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Never"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {!isConnected ? (
            <Button onClick={connectGmail} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Gmail
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => syncEmails()}
                disabled={isSyncing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>

              <Button
                onClick={disconnect}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
              >
                Disconnect
              </Button>
            </>
          )}
        </div>

        {isSyncing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-800 text-sm">Fetching real emails from Gmail API...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
