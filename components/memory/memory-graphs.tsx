"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, BarChart3, PieChart, Network, Brain, Calendar, Clock } from "lucide-react"

interface MemoryBlock {
  id: string
  content: string
  source: string
  timestamp: Date
  type: "email" | "note" | "meeting" | "document" | "voice" | "web"
  metadata?: any
}

interface MemoryGraphsProps {
  memories: MemoryBlock[]
}

interface TopicCluster {
  topic: string
  keywords: string[]
  memories: MemoryBlock[]
  count: number
  trend: "up" | "down" | "stable"
}

export default function MemoryGraphs({ memories }: MemoryGraphsProps) {
  const [timeRange, setTimeRange] = useState<string>("month")
  const [analysisType, setAnalysisType] = useState<string>("topics")

  // Generate topic clusters using simple keyword analysis
  const topicClusters = useMemo(() => {
    const clusters: { [key: string]: MemoryBlock[] } = {}
    const keywords = [
      "AI",
      "meeting",
      "project",
      "budget",
      "team",
      "development",
      "client",
      "product",
      "design",
      "marketing",
      "analytics",
      "performance",
      "strategy",
      "planning",
      "review",
      "feedback",
      "implementation",
      "launch",
      "optimization",
    ]

    // Simple clustering based on keyword presence
    memories.forEach((memory) => {
      const content = memory.content.toLowerCase()
      let assigned = false

      keywords.forEach((keyword) => {
        if (content.includes(keyword.toLowerCase()) && !assigned) {
          if (!clusters[keyword]) clusters[keyword] = []
          clusters[keyword].push(memory)
          assigned = true
        }
      })

      if (!assigned) {
        if (!clusters["General"]) clusters["General"] = []
        clusters["General"].push(memory)
      }
    })

    return Object.entries(clusters)
      .map(([topic, memories]) => ({
        topic,
        keywords: [topic.toLowerCase()],
        memories,
        count: memories.length,
        trend: Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : ("stable" as "up" | "down" | "stable"),
      }))
      .filter((cluster) => cluster.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [memories])

  // Activity patterns by time
  const activityPatterns = useMemo(() => {
    const patterns: { [key: string]: number } = {}
    const now = new Date()

    memories.forEach((memory) => {
      const hour = memory.timestamp.getHours()
      const timeSlot =
        hour < 6
          ? "Night (12-6 AM)"
          : hour < 12
            ? "Morning (6-12 PM)"
            : hour < 18
              ? "Afternoon (12-6 PM)"
              : "Evening (6-12 AM)"

      patterns[timeSlot] = (patterns[timeSlot] || 0) + 1
    })

    return Object.entries(patterns).map(([time, count]) => ({ time, count }))
  }, [memories])

  // Source distribution
  const sourceDistribution = useMemo(() => {
    const sources: { [key: string]: number } = {}
    memories.forEach((memory) => {
      const sourceType = memory.source.split(" - ")[0] || memory.source
      sources[sourceType] = (sources[sourceType] || 0) + 1
    })

    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [memories])

  // Weekly trends
  const weeklyTrends = useMemo(() => {
    const weeks: { [key: string]: number } = {}
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i * 7)
      const weekKey = `Week ${7 - i}`
      weeks[weekKey] = 0
    }

    memories.forEach((memory) => {
      const daysDiff = Math.floor((now.getTime() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor(daysDiff / 7)
      if (weekIndex < 7) {
        const weekKey = `Week ${7 - weekIndex}`
        if (weeks[weekKey] !== undefined) {
          weeks[weekKey]++
        }
      }
    })

    return Object.entries(weeks).map(([week, count]) => ({ week, count }))
  }, [memories])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200"
      case "down":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Smart Clustering & Memory Insights</CardTitle>
          <CardDescription>Discover patterns, topics, and trends in your memory data using AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-gray-500" />
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-40 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topics">Topic Analysis</SelectItem>
                  <SelectItem value="patterns">Activity Patterns</SelectItem>
                  <SelectItem value="sources">Source Analysis</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Clusters */}
      {analysisType === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicClusters.map((cluster, index) => (
            <Card key={cluster.topic} className="bg-white border-blue-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-900">{cluster.topic}</CardTitle>
                  <Badge className={getTrendColor(cluster.trend)}>{getTrendIcon(cluster.trend)}</Badge>
                </div>
                <CardDescription>
                  {cluster.count} memories • {cluster.keywords.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (cluster.count / Math.max(...topicClusters.map((c) => c.count))) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Recent:{" "}
                    {cluster.memories
                      .slice(0, 2)
                      .map((m) => m.source)
                      .join(", ")}
                    {cluster.memories.length > 2 && ` +${cluster.memories.length - 2} more`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Patterns */}
      {analysisType === "patterns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Daily Activity Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityPatterns.map((pattern, index) => (
                  <div key={pattern.time} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{pattern.time}</span>
                      <span className="text-sm text-blue-600 font-semibold">{pattern.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(pattern.count / Math.max(...activityPatterns.map((p) => p.count))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Weekly Memory Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyTrends.map((trend, index) => (
                  <div key={trend.week} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{trend.week}</span>
                      <span className="text-sm text-blue-600 font-semibold">{trend.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${trend.count === 0 ? 0 : Math.max(10, (trend.count / Math.max(...weeklyTrends.map((t) => t.count))) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Source Analysis */}
      {analysisType === "sources" && (
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Memory Sources Distribution
            </CardTitle>
            <CardDescription>Where your memories are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {sourceDistribution.map((source, index) => (
                  <div
                    key={source.source}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${(index * 45) % 360}, 70%, 60%)` }}
                      ></div>
                      <span className="font-medium text-gray-800">{source.source}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">{source.count}</Badge>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {sourceDistribution.map((source, index) => {
                      const total = sourceDistribution.reduce((sum, s) => sum + s.count, 0)
                      const percentage = (source.count / total) * 100
                      const strokeDasharray = `${percentage} ${100 - percentage}`
                      const strokeDashoffset = sourceDistribution
                        .slice(0, index)
                        .reduce((sum, s) => sum + (s.count / total) * 100, 0)

                      return (
                        <circle
                          key={source.source}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                          strokeWidth="8"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={-strokeDashoffset}
                          className="transition-all duration-300"
                        />
                      )
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{memories.length}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {analysisType === "trends" && (
        <div className="space-y-6">
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Memory Evolution Analysis
              </CardTitle>
              <CardDescription>How your focus and interests have evolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">Growing Topics</h3>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    {topicClusters
                      .filter((c) => c.trend === "up")
                      .slice(0, 3)
                      .map((cluster) => (
                        <div key={cluster.topic} className="text-sm">
                          <span className="font-medium text-green-800">{cluster.topic}</span>
                          <span className="text-green-600 ml-2">+{cluster.count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-900">Stable Topics</h3>
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    {topicClusters
                      .filter((c) => c.trend === "stable")
                      .slice(0, 3)
                      .map((cluster) => (
                        <div key={cluster.topic} className="text-sm">
                          <span className="font-medium text-blue-800">{cluster.topic}</span>
                          <span className="text-blue-600 ml-2">{cluster.count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-900">Declining Topics</h3>
                    <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                  </div>
                  <div className="space-y-2">
                    {topicClusters
                      .filter((c) => c.trend === "down")
                      .slice(0, 3)
                      .map((cluster) => (
                        <div key={cluster.topic} className="text-sm">
                          <span className="font-medium text-red-800">{cluster.topic}</span>
                          <span className="text-red-600 ml-2">-{cluster.count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Focus Areas</h4>
                  <p className="text-blue-800 text-sm">
                    Your top focus areas are{" "}
                    {topicClusters
                      .slice(0, 3)
                      .map((c) => c.topic)
                      .join(", ")}
                    . Consider creating dedicated time blocks for these topics.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">📈 Growth Opportunities</h4>
                  <p className="text-green-800 text-sm">
                    Topics showing growth trends could benefit from more structured documentation. Consider creating
                    templates for recurring themes.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">⏰ Optimal Times</h4>
                  <p className="text-orange-800 text-sm">
                    Your most productive memory capture time is{" "}
                    {activityPatterns.sort((a, b) => b.count - a.count)[0]?.time}. Schedule important tasks during these
                    peak periods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
