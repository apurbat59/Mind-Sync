"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, Loader2, Download, Sparkles } from "lucide-react"

interface MemoryBlock {
  id: string
  content: string
  source: string
  timestamp: Date
  type: "email" | "note" | "meeting" | "document" | "voice" | "web"
  metadata?: any
}

interface DigestGeneratorProps {
  memories: MemoryBlock[]
}

interface DigestSection {
  title: string
  content: string
  memories: MemoryBlock[]
  priority: "high" | "medium" | "low"
}

export default function DigestGenerator({ memories }: DigestGeneratorProps) {
  const [digestPeriod, setDigestPeriod] = useState<"today" | "week" | "month">("today")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDigest, setGeneratedDigest] = useState<DigestSection[]>([])
  const [digestSummary, setDigestSummary] = useState("")
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const filteredMemories = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (digestPeriod) {
      case "today":
        cutoffDate.setHours(0, 0, 0, 0)
        break
      case "week":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
    }

    return memories
      .filter((memory) => memory.timestamp >= cutoffDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [memories, digestPeriod])

  const generateDigest = async () => {
    if (filteredMemories.length === 0) return

    setIsGenerating(true)

    try {
      // Simulate AI digest generation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const sections = await generateDigestSections(filteredMemories)
      const summary = await generateDigestSummary(sections)

      setGeneratedDigest(sections)
      setDigestSummary(summary)
      setLastGenerated(new Date())
    } catch (error) {
      console.error("Error generating digest:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateDigestSections = async (memories: MemoryBlock[]): Promise<DigestSection[]> => {
    // Group memories by type and importance
    const sections: DigestSection[] = []

    // Key Meetings & Decisions
    const meetings = memories.filter((m) => m.type === "meeting")
    if (meetings.length > 0) {
      sections.push({
        title: "Key Meetings & Decisions",
        content: `You participated in ${meetings.length} meeting(s) during this period. Key discussions included project planning, team coordination, and strategic decisions. Important action items were identified and assigned to team members.`,
        memories: meetings,
        priority: "high",
      })
    }

    // Important Communications
    const emails = memories.filter((m) => m.type === "email")
    if (emails.length > 0) {
      sections.push({
        title: "Important Communications",
        content: `Processed ${emails.length} important email(s) covering client updates, internal communications, and project coordination. Several emails require follow-up actions.`,
        memories: emails,
        priority: "high",
      })
    }

    // Ideas & Insights
    const notes = memories.filter((m) => m.type === "note" || m.type === "voice")
    if (notes.length > 0) {
      sections.push({
        title: "Ideas & Insights",
        content: `Captured ${notes.length} idea(s) and insight(s) through notes and voice recordings. These include creative solutions, strategic thoughts, and personal reflections that could be valuable for future reference.`,
        memories: notes,
        priority: "medium",
      })
    }

    // Documents & Research
    const documents = memories.filter((m) => m.type === "document" || m.type === "web")
    if (documents.length > 0) {
      sections.push({
        title: "Documents & Research",
        content: `Reviewed ${documents.length} document(s) and web resource(s). This research material covers industry trends, technical documentation, and reference materials relevant to current projects.`,
        memories: documents,
        priority: "medium",
      })
    }

    return sections
  }

  const generateDigestSummary = async (sections: DigestSection[]): Promise<string> => {
    const totalMemories = filteredMemories.length
    const highPrioritySections = sections.filter((s) => s.priority === "high").length

    const periodText = digestPeriod === "today" ? "today" : digestPeriod === "week" ? "this week" : "this month"

    return `${periodText.charAt(0).toUpperCase() + periodText.slice(1)}, you captured ${totalMemories} memories across ${sections.length} key areas. ${highPrioritySections} high-priority areas require your attention. Your focus has been on meetings, communications, and strategic planning. Consider reviewing the action items and following up on pending decisions.`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      case "low":
        return "🟢"
      default:
        return "⚪"
    }
  }

  const exportDigest = () => {
    const digestText = `
MindSync Digest - ${digestPeriod.charAt(0).toUpperCase() + digestPeriod.slice(1)}
Generated: ${lastGenerated?.toLocaleString()}

SUMMARY
${digestSummary}

DETAILED SECTIONS
${generatedDigest
  .map(
    (section) => `
${section.title.toUpperCase()}
Priority: ${section.priority.toUpperCase()}
${section.content}

Related Memories:
${section.memories.map((m) => `- ${m.timestamp.toLocaleDateString()}: ${m.source} - ${m.content.slice(0, 100)}...`).join("\n")}
`,
  )
  .join("\n")}
    `.trim()

    const blob = new Blob([digestText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindsync-digest-${digestPeriod}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Digest Generator</CardTitle>
          <CardDescription>Generate intelligent summaries of your captured memories and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select
                value={digestPeriod}
                onValueChange={(value: "today" | "week" | "month") => setDigestPeriod(value)}
              >
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateDigest}
              disabled={isGenerating || filteredMemories.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Digest
            </Button>

            {generatedDigest.length > 0 && (
              <Button
                onClick={exportDigest}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <div className="text-sm text-gray-600">{filteredMemories.length} memories in selected period</div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Digest */}
      {generatedDigest.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Executive Summary
              </CardTitle>
              {lastGenerated && <CardDescription>Generated on {lastGenerated.toLocaleString()}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-gray-800 leading-relaxed">{digestSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Digest Sections */}
          <div className="space-y-4">
            {generatedDigest.map((section, index) => (
              <Card key={index} className="bg-white border-blue-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-900 flex items-center">
                      <span className="mr-2">{getPriorityIcon(section.priority)}</span>
                      {section.title}
                    </CardTitle>
                    <Badge className={getPriorityColor(section.priority)}>{section.priority} priority</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>

                  {/* Related Memories */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Related Memories ({section.memories.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {section.memories.slice(0, 5).map((memory) => (
                        <div key={memory.id} className="p-2 bg-blue-50 rounded border border-blue-100 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {memory.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{memory.timestamp.toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-700 font-medium text-xs mb-1">{memory.source}</p>
                          <p className="text-gray-600 text-xs line-clamp-2">{memory.content.slice(0, 150)}...</p>
                        </div>
                      ))}
                      {section.memories.length > 5 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          +{section.memories.length - 5} more memories
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMemories.length === 0 && (
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories to digest</h3>
              <p className="text-gray-600">
                No memories found for the selected time period. Try selecting a different period or add more memories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {isGenerating && (
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">Generating Your Digest</h3>
              <p className="text-blue-600">AI is analyzing your memories and creating personalized insights...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
