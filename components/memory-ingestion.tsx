"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, FileText, Video, Chrome, Database, Upload, Loader2, CheckCircle } from "lucide-react"

interface MemoryIngestionProps {
  onMemoryAdded: (memory: {
    content: string
    source: string
    type: "email" | "note" | "meeting" | "document" | "voice" | "web"
    metadata?: any
  }) => void
}

export default function MemoryIngestion({ onMemoryAdded }: MemoryIngestionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Manual text input
  const [manualText, setManualText] = useState("")
  const [manualSource, setManualSource] = useState("")
  const [manualType, setManualType] = useState<"email" | "note" | "meeting" | "document" | "web">("note")

  // Email simulation
  const [emailCount, setEmailCount] = useState(10)

  // Document upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Web URL
  const [webUrl, setWebUrl] = useState("")

  const addManualMemory = () => {
    if (!manualText.trim() || !manualSource.trim()) return

    onMemoryAdded({
      content: manualText,
      source: manualSource,
      type: manualType,
      metadata: {
        addedManually: true,
        timestamp: new Date().toISOString(),
      },
    })

    setManualText("")
    setManualSource("")
    setSuccessMessage("Memory added successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const simulateEmailIngestion = async () => {
    setIsProcessing(true)
    setProcessingStatus("Connecting to Gmail API...")

    // Simulate email processing
    const emailTemplates = [
      {
        content:
          "Meeting scheduled for tomorrow at 2 PM to discuss Q4 budget planning. Please prepare the financial reports.",
        source: "Gmail - john@company.com",
        metadata: { subject: "Q4 Budget Meeting", sender: "john@company.com" },
      },
      {
        content:
          "The new AI model deployment is complete. Performance metrics show 15% improvement over the previous version.",
        source: "Gmail - tech-team@company.com",
        metadata: { subject: "AI Model Deployment Update", sender: "tech-team@company.com" },
      },
      {
        content:
          "Client feedback on the prototype is very positive. They want to proceed with the full implementation.",
        source: "Gmail - client@external.com",
        metadata: { subject: "Prototype Feedback", sender: "client@external.com" },
      },
      {
        content: "Don't forget about the team lunch on Friday. Restaurant reservation is confirmed for 12:30 PM.",
        source: "Gmail - hr@company.com",
        metadata: { subject: "Team Lunch Reminder", sender: "hr@company.com" },
      },
      {
        content:
          "The quarterly report shows significant growth in user engagement. Mobile app downloads increased by 40%.",
        source: "Gmail - analytics@company.com",
        metadata: { subject: "Q3 Analytics Report", sender: "analytics@company.com" },
      },
    ]

    for (let i = 0; i < Math.min(emailCount, emailTemplates.length); i++) {
      setProcessingStatus(`Processing email ${i + 1} of ${Math.min(emailCount, emailTemplates.length)}...`)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      onMemoryAdded({
        content: emailTemplates[i].content,
        source: emailTemplates[i].source,
        type: "email",
        metadata: emailTemplates[i].metadata,
      })
    }

    setProcessingStatus("")
    setIsProcessing(false)
    setSuccessMessage(`Successfully ingested ${Math.min(emailCount, emailTemplates.length)} emails!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const simulateMeetingIngestion = async () => {
    setIsProcessing(true)
    setProcessingStatus("Connecting to Zoom API...")

    const meetingTemplates = [
      {
        content:
          "Discussed the new product roadmap for 2024. Key priorities include AI integration, mobile optimization, and user experience improvements. Action items: Sarah to create wireframes, Mike to research AI tools, deadline next Friday.",
        source: "Zoom - Product Planning Meeting",
        metadata: {
          duration: "45 minutes",
          participants: ["Sarah", "Mike", "Alex", "Lisa"],
          date: new Date().toISOString(),
        },
      },
      {
        content:
          "Weekly standup: Development team reported 80% completion on the authentication system. QA team found 3 minor bugs that will be fixed by tomorrow. Marketing team preparing launch campaign materials.",
        source: "Zoom - Weekly Standup",
        metadata: {
          duration: "30 minutes",
          participants: ["Dev Team", "QA Team", "Marketing"],
          date: new Date().toISOString(),
        },
      },
    ]

    for (let i = 0; i < meetingTemplates.length; i++) {
      setProcessingStatus(`Processing meeting transcript ${i + 1}...`)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      onMemoryAdded({
        content: meetingTemplates[i].content,
        source: meetingTemplates[i].source,
        type: "meeting",
        metadata: meetingTemplates[i].metadata,
      })
    }

    setProcessingStatus("")
    setIsProcessing(false)
    setSuccessMessage("Successfully ingested meeting transcripts!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const processWebUrl = async () => {
    if (!webUrl.trim()) return

    setIsProcessing(true)
    setProcessingStatus("Extracting content from webpage...")

    // Simulate web scraping
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const simulatedContent = `Article about ${webUrl}: This webpage contains valuable information about modern web development practices, including best practices for user experience design, performance optimization, and accessibility standards. The content discusses the importance of responsive design and progressive web applications.`

    onMemoryAdded({
      content: simulatedContent,
      source: `Web - ${webUrl}`,
      type: "web",
      metadata: {
        url: webUrl,
        extractedAt: new Date().toISOString(),
        wordCount: simulatedContent.split(" ").length,
      },
    })

    setWebUrl("")
    setProcessingStatus("")
    setIsProcessing(false)
    setSuccessMessage("Web content extracted and saved!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const processDocument = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setProcessingStatus("Processing document...")

    // Simulate document processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const simulatedContent = `Document content from ${uploadedFile.name}: This document contains important information about project specifications, requirements, and implementation details. Key points include technical architecture, user requirements, and project timeline.`

    onMemoryAdded({
      content: simulatedContent,
      source: `Document - ${uploadedFile.name}`,
      type: "document",
      metadata: {
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type,
        processedAt: new Date().toISOString(),
      },
    })

    setUploadedFile(null)
    setProcessingStatus("")
    setIsProcessing(false)
    setSuccessMessage("Document processed and saved!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Unified Memory Ingestion</CardTitle>
          <CardDescription>
            Connect your digital life and automatically capture information from multiple sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {isProcessing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
              <span className="text-blue-800">{processingStatus}</span>
            </div>
          )}

          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-blue-50">
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      placeholder="e.g., Personal Notes, Meeting with John"
                      value={manualSource}
                      onChange={(e) => setManualSource(e.target.value)}
                      className="border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={manualType} onValueChange={(value: any) => setManualType(value)}>
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter the content you want to remember..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="min-h-[120px] border-blue-200"
                  />
                </div>
                <Button
                  onClick={addManualMemory}
                  disabled={!manualText.trim() || !manualSource.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Add Memory
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Gmail Integration</h3>
                  <p className="text-sm text-blue-700">Import and process your recent emails</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailCount">Number of emails to process</Label>
                  <Input
                    id="emailCount"
                    type="number"
                    min="1"
                    max="50"
                    value={emailCount}
                    onChange={(e) => setEmailCount(Number.parseInt(e.target.value) || 10)}
                    className="border-blue-200"
                  />
                </div>
                <Button
                  onClick={simulateEmailIngestion}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Import Emails
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Video className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Zoom Integration</h3>
                  <p className="text-sm text-blue-700">Import meeting transcripts and recordings</p>
                </div>
              </div>
              <Button
                onClick={simulateMeetingIngestion}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Video className="h-4 w-4 mr-2" />}
                Import Meeting Transcripts
              </Button>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Document Processing</h3>
                  <p className="text-sm text-blue-700">Upload and extract text from documents</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document">Upload Document</Label>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="border-blue-200"
                  />
                </div>
                {uploadedFile && (
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm">
                      <strong>Selected:</strong> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                )}
                <Button
                  onClick={processDocument}
                  disabled={!uploadedFile || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Process Document
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="web" className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Chrome className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Web Content Extraction</h3>
                  <p className="text-sm text-blue-700">Extract and save content from web pages</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webUrl">Website URL</Label>
                  <Input
                    id="webUrl"
                    type="url"
                    placeholder="https://example.com/article"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="border-blue-200"
                  />
                </div>
                <Button
                  onClick={processWebUrl}
                  disabled={!webUrl.trim() || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Chrome className="h-4 w-4 mr-2" />
                  )}
                  Extract Content
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
