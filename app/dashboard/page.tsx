"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  ArrowLeft,
  Mic,
  Search,
  Calendar,
  TrendingUp,
  FileText,
  Database,
  Clock,
  BookOpen,
  Mail,
  CheckCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react"
import VoiceCapture from "@/components/voice-capture"
import EnhancedMemorySearch from "@/components/enhanced-memory-search"
import MemoryIngestion from "@/components/memory-ingestion"
import MemoryTimeline from "@/components/memory-timeline"
import DigestGenerator from "@/components/digest-generator"
import MemoryGraphs from "@/components/memory-graphs"
import AIChatbot from "@/components/ai-chatbot"
import GmailConnector from "@/components/gmail-connector"

interface MemoryBlock {
  id: string
  content: string
  source: string
  timestamp: Date
  type: "email" | "note" | "meeting" | "document" | "voice" | "web"
  metadata?: any
}

interface EmailData {
  id: string
  from: string
  to: string
  subject: string
  content: string
  date: string
  labels: string[]
  read: boolean
  important: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [memories, setMemories] = useState<MemoryBlock[]>([])
  const [emails, setEmails] = useState<EmailData[]>([])
  const [isGmailConnected, setIsGmailConnected] = useState(false)
  const [isRealGmail, setIsRealGmail] = useState(false)
  const [stats, setStats] = useState({
    totalMemories: 0,
    todayMemories: 0,
    emailsProcessed: 0,
    searchQueries: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("mindsync-user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)

      // Load memories first
      loadMemories()

      // Check for real Gmail connection
      const gmailToken = localStorage.getItem(`gmail-token-${userData.email}`)
      if (gmailToken) {
        setIsRealGmail(true)
        setIsGmailConnected(true)
        // Real emails will be loaded by GmailConnector component
      } else {
        // Load demo emails if no real connection
        loadDemoEmails(userData.email)
      }
    } else {
      router.push("/")
    }
  }, [router])

  const loadDemoEmails = (userEmail: string) => {
    const demoEmails = JSON.parse(localStorage.getItem(`emails-${userEmail}`) || "[]")
    if (demoEmails.length > 0) {
      setEmails(demoEmails)
      setIsGmailConnected(true)
      convertEmailsToMemories(demoEmails)
    }
  }

  const loadMemories = () => {
    const savedMemories = localStorage.getItem("mindsync-memories")
    if (savedMemories) {
      const parsed = JSON.parse(savedMemories)
      const memoriesWithDates = parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
      setMemories(memoriesWithDates)
      updateStats(memoriesWithDates, 0)
    }
  }

  const handleRealEmailsLoaded = (realEmails: EmailData[]) => {
    console.log(`Loaded ${realEmails.length} real emails from Gmail`)
    setEmails(realEmails)
    setIsRealGmail(true)
    convertEmailsToMemories(realEmails)
  }

  const convertEmailsToMemories = (emailList: EmailData[]) => {
    // Convert emails to memories
    const emailMemories: MemoryBlock[] = emailList.map((email) => ({
      id: `email-${email.id}`,
      content: `Subject: ${email.subject}\n\nFrom: ${email.from}\n\n${email.content}`,
      source: `Gmail - ${email.from}`,
      timestamp: new Date(email.date),
      type: "email" as const,
      metadata: {
        subject: email.subject,
        from: email.from,
        labels: email.labels,
        important: email.important,
        read: email.read,
        gmailId: email.id,
        isReal: isRealGmail,
      },
    }))

    // Merge with existing non-email memories
    const existingMemories = JSON.parse(localStorage.getItem("mindsync-memories") || "[]")
    const nonEmailMemories = existingMemories.filter((m: any) => m.type !== "email")
    const allMemories = [...nonEmailMemories, ...emailMemories].map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))

    setMemories(allMemories)
    localStorage.setItem("mindsync-memories", JSON.stringify(allMemories))
    updateStats(allMemories, emailList.length)
  }

  const handleConnectionStatusChange = (connected: boolean) => {
    setIsGmailConnected(connected)
    if (!connected) {
      setIsRealGmail(false)
      setEmails([])
      // Remove email memories but keep other memories
      const existingMemories = JSON.parse(localStorage.getItem("mindsync-memories") || "[]")
      const nonEmailMemories = existingMemories.filter((m: any) => m.type !== "email")
      setMemories(nonEmailMemories.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      updateStats(nonEmailMemories, 0)
    }
  }

  const updateStats = (memoryList: MemoryBlock[], emailCount: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayMemories = memoryList.filter((m) => new Date(m.timestamp) >= today).length

    setStats({
      totalMemories: memoryList.length,
      todayMemories,
      emailsProcessed: emailCount,
      searchQueries: Number.parseInt(localStorage.getItem("mindsync-search-count") || "0"),
    })
  }

  const addMemory = (memory: Omit<MemoryBlock, "id" | "timestamp">) => {
    const newMemory: MemoryBlock = {
      ...memory,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    const updatedMemories = [...memories, newMemory]
    setMemories(updatedMemories)
    localStorage.setItem("mindsync-memories", JSON.stringify(updatedMemories))
    updateStats(updatedMemories, emails.length)
  }

  const handleBackToLanding = () => {
    router.push("/")
  }

  const handleLogout = () => {
    localStorage.removeItem("mindsync-user")
    router.push("/")
  }

  const recentEmails = emails.slice(0, 5)
  const recentMemories = memories
    .filter((m) => m.type !== "email")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MindSync</h1>
                <p className="text-sm text-blue-600">RAG-Powered AI Memory System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isGmailConnected && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {isRealGmail ? "Real Gmail Connected" : "Demo Gmail"}
                </Badge>
              )}
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                RAG + ML Enabled
              </Badge>
              <Button
                variant="outline"
                onClick={handleBackToLanding}
                className="border-blue-200 text-blue-700 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Landing
              </Button>
              <span className="text-sm font-medium text-gray-700">Welcome, {user.name.split(" ")[0]}!</span>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gmail Connection Component */}
        <div className="mb-8">
          <GmailConnector
            userEmail={user.email}
            onEmailsLoaded={handleRealEmailsLoaded}
            onConnectionStatusChange={handleConnectionStatusChange}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Memories</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMemories}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isRealGmail ? "Real Emails" : "Demo Emails"}
              </CardTitle>
              <Mail className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.emailsProcessed}</div>
              {isRealGmail && <div className="text-xs text-green-600 mt-1">Live Gmail Data</div>}
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Captures</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.todayMemories}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">AI Searches</CardTitle>
              <Search className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.searchQueries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-blue-50 border border-blue-200">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              RAG Search
            </TabsTrigger>
            <TabsTrigger
              value="ingestion"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <Database className="h-4 w-4 mr-2" />
              Ingestion
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="graphs"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="digest"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Digest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Emails */}
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Mail className="h-5 w-5 mr-2" />
                    Recent Emails
                    {isRealGmail && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">Live Data</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Latest emails from your {isRealGmail ? "real Gmail account" : "demo data"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEmails.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No emails loaded yet</p>
                      <p className="text-sm text-gray-400">Connect your Gmail to see real email data</p>
                    </div>
                  ) : (
                    recentEmails.map((email) => (
                      <div key={email.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                              {email.important ? "Important" : "Email"}
                            </Badge>
                            {isRealGmail && (
                              <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Real</Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{new Date(email.date).toLocaleString()}</span>
                        </div>
                        <h4 className="font-medium text-blue-900 text-sm mb-1">{email.subject}</h4>
                        <p className="text-sm text-gray-700 line-clamp-2">{email.content}</p>
                        <p className="text-xs text-blue-600 mt-1">From: {email.from}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Voice Capture */}
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Mic className="h-5 w-5 mr-2" />
                    Real-time Voice Capture
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Speak and see real-time transcription with instant processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceCapture onMemoryAdded={addMemory} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Non-Email Memories */}
            {recentMemories.length > 0 && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Recent Memories
                  </CardTitle>
                  <CardDescription className="text-gray-600">Your latest captured thoughts and notes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentMemories.map((memory) => (
                    <div key={memory.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="text-xs bg-gray-100 text-gray-800 border-gray-200">{memory.type}</Badge>
                        <span className="text-xs text-gray-500">{memory.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{memory.content}</p>
                      <p className="text-xs text-blue-600 mt-1">Source: {memory.source}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <AIChatbot memories={memories} userEmail={user.email} />
          </TabsContent>

          <TabsContent value="voice">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Real-time Voice Transcription</CardTitle>
                <CardDescription className="text-gray-600">
                  Speak your thoughts and see them transcribed in real-time with instant processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceCapture onMemoryAdded={addMemory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <EnhancedMemorySearch memories={memories} />
          </TabsContent>

          <TabsContent value="ingestion">
            <MemoryIngestion onMemoryAdded={addMemory} />
          </TabsContent>

          <TabsContent value="timeline">
            <MemoryTimeline memories={memories} />
          </TabsContent>

          <TabsContent value="graphs">
            <MemoryGraphs memories={memories} />
          </TabsContent>

          <TabsContent value="digest">
            <DigestGenerator memories={memories} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
