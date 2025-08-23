"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Filter, TrendingUp, BarChart3 } from "lucide-react"

interface MemoryBlock {
  id: string
  content: string
  source: string
  timestamp: Date
  type: "email" | "note" | "meeting" | "document" | "voice" | "web"
  metadata?: any
}

interface MemoryTimelineProps {
  memories: MemoryBlock[]
}

interface TimelineGroup {
  date: string
  memories: MemoryBlock[]
  count: number
}

export default function MemoryTimeline({ memories }: MemoryTimelineProps) {
  const [filterType, setFilterType] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filteredMemories = useMemo(() => {
    let filtered = [...memories]

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((memory) => memory.type === filterType)
    }

    // Filter by time range
    const now = new Date()
    if (timeRange !== "all") {
      const cutoffDate = new Date()
      switch (timeRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          cutoffDate.setMonth(now.getMonth() - 3)
          break
      }
      filtered = filtered.filter((memory) => memory.timestamp >= cutoffDate)
    }

    // Sort
    filtered.sort((a, b) => {
      return sortOrder === "newest"
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime()
    })

    return filtered
  }, [memories, filterType, timeRange, sortOrder])

  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: MemoryBlock[] } = {}

    filteredMemories.forEach((memory) => {
      const dateKey = memory.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(memory)
    })

    return Object.entries(groups)
      .map(([date, memories]) => ({
        date,
        memories,
        count: memories.length,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB
      })
  }, [filteredMemories, sortOrder])

  const typeStats = useMemo(() => {
    const stats: { [key: string]: number } = {}
    filteredMemories.forEach((memory) => {
      stats[memory.type] = (stats[memory.type] || 0) + 1
    })
    return stats
  }, [filteredMemories])

  const getTypeColor = (type: string) => {
    const colors = {
      email: "bg-blue-100 text-blue-800 border-blue-200",
      note: "bg-green-100 text-green-800 border-green-200",
      meeting: "bg-purple-100 text-purple-800 border-purple-200",
      document: "bg-orange-100 text-orange-800 border-orange-200",
      voice: "bg-pink-100 text-pink-800 border-pink-200",
      web: "bg-cyan-100 text-cyan-800 border-cyan-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return "📧"
      case "note":
        return "📝"
      case "meeting":
        return "🎥"
      case "document":
        return "📄"
      case "voice":
        return "🎤"
      case "web":
        return "🌐"
      default:
        return "📋"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Memory Timeline & Temporal Reasoning</CardTitle>
          <CardDescription>Visualize your memory patterns and track how your thoughts evolve over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Memory Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <span className="capitalize text-gray-700">{type}</span>
                  </div>
                  <Badge className={getTypeColor(type)}>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Timeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Memories</span>
                <span className="font-semibold text-blue-900">{filteredMemories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Period</span>
                <span className="font-semibold text-blue-900">
                  {timeRange === "all"
                    ? "All Time"
                    : timeRange === "today"
                      ? "Today"
                      : timeRange === "week"
                        ? "This Week"
                        : timeRange === "month"
                          ? "This Month"
                          : "This Quarter"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Days with Activity</span>
                <span className="font-semibold text-blue-900">{timelineGroups.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg per Day</span>
                <span className="font-semibold text-blue-900">
                  {timelineGroups.length > 0 ? (filteredMemories.length / timelineGroups.length).toFixed(1) : "0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Memory Timeline</CardTitle>
          <CardDescription>Chronological view of your captured memories</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineGroups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
              <p className="text-gray-600">Try adjusting your filters or add more memories</p>
            </div>
          ) : (
            <div className="space-y-6">
              {timelineGroups.map((group, groupIndex) => (
                <div key={group.date} className="relative">
                  {/* Date Header */}
                  <div className="sticky top-0 bg-white z-10 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {new Date(group.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {group.count} memories
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline Line */}
                  <div className="relative pl-8">
                    {groupIndex < timelineGroups.length - 1 && (
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    )}

                    <div className="space-y-4">
                      {group.memories.map((memory, memoryIndex) => (
                        <div key={memory.id} className="relative">
                          {/* Timeline Dot */}
                          <div className="absolute -left-6 top-3 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>

                          {/* Memory Card */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ml-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getTypeIcon(memory.type)}</span>
                                <Badge className={getTypeColor(memory.type)}>{memory.type}</Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {memory.timestamp.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <h4 className="font-medium text-blue-900 mb-1">{memory.source}</h4>

                            <p className="text-sm text-gray-700 mb-2">
                              {memory.content.length > 200 ? memory.content.slice(0, 200) + "..." : memory.content}
                            </p>

                            {memory.metadata && (
                              <div className="text-xs text-gray-500 space-y-1">
                                {memory.metadata.duration && <div>Duration: {memory.metadata.duration}</div>}
                                {memory.metadata.participants && (
                                  <div>Participants: {memory.metadata.participants.join(", ")}</div>
                                )}
                                {memory.metadata.wordCount && <div>Words: {memory.metadata.wordCount}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
