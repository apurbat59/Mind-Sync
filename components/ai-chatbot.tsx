"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Loader2, Bot, User, Sparkles } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "email-summary" | "insight"
}

interface AIChatbotProps {
  memories: any[]
  userEmail: string
}

export default function AIChatbot({ memories, userEmail }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `Hi! I'm your AI assistant powered by Gemini 2.0 Flash. I have access to all your emails and memories. Ask me anything about your communications, find specific emails, or get insights about your email patterns!`,
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Get user's emails for context
      const userEmails = JSON.parse(localStorage.getItem(`emails-${userEmail}`) || "[]")

      // Prepare context from emails and memories
      const emailContext = userEmails
        .slice(0, 20) // Last 20 emails
        .map((email: any) => `From: ${email.from}\nSubject: ${email.subject}\nContent: ${email.content}`)
        .join("\n\n")

      const memoryContext = memories
        .filter((m) => m.type !== "email")
        .slice(0, 10)
        .map((m) => `${m.source}: ${m.content}`)
        .join("\n\n")

      const response = await fetch("/api/chat-gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          emailContext,
          memoryContext,
          userEmail,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        type: data.type || "text",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMessageIcon = (message: Message) => {
    if (message.sender === "user") {
      return <User className="h-4 w-4" />
    }

    switch (message.type) {
      case "email-summary":
        return <MessageCircle className="h-4 w-4" />
      case "insight":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getMessageBadge = (message: Message) => {
    if (message.sender === "user") return null

    switch (message.type) {
      case "email-summary":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Email Analysis</Badge>
      case "insight":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">AI Insight</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Gemini 2.0</Badge>
    }
  }

  const suggestedQuestions = [
    "Show me my most important emails from today",
    "What are the main topics in my recent emails?",
    "Find emails about meetings or appointments",
    "Summarize my unread emails",
    "What action items do I have from my emails?",
    "Show me emails from specific people",
  ]

  return (
    <Card className="bg-white border-blue-100 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-900 flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          AI Email Assistant
        </CardTitle>
        <CardDescription className="text-gray-600">
          Powered by Gemini 2.0 Flash • Real-time email analysis and insights
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 space-y-2 ${
                  message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getMessageIcon(message)}
                  <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
                  {getMessageBadge(message)}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your emails or memories..."
            className="flex-1 border-blue-200 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
