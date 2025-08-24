"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Calendar, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface MemoryBlock {
  id: string
  content: string
  source: string
  timestamp: Date
  type: "email" | "note" | "meeting" | "document" | "voice" | "web"
  metadata?: any
}

interface MemorySearchProps {
  memories: MemoryBlock[]
}

interface SearchResult {
  memory: MemoryBlock
  relevanceScore: number
  highlights: string[]
}

export default function MemorySearch({ memories }: MemorySearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [aiResponse, setAiResponse] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    const history = localStorage.getItem("mindsync-search-history")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  const performSemanticSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setSearchResults([])
    setAiResponse("")

    try {
      // Update search count
      const currentCount = Number.parseInt(localStorage.getItem("mindsync-search-count") || "0")
      localStorage.setItem("mindsync-search-count", (currentCount + 1).toString())

      // Add to search history
      const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem("mindsync-search-history", JSON.stringify(newHistory))

      // Perform semantic search (simplified version)
      const results = performLocalSearch(query, memories)
      setSearchResults(results)

      // Generate AI response using Gemini
      if (results.length > 0) {
        await generateAIResponse(query, results)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const performLocalSearch = (searchQuery: string, memoryList: MemoryBlock[]): SearchResult[] => {
    const queryLower = searchQuery.toLowerCase()
    const queryWords = queryLower.split(" ").filter((word) => word.length > 2)

    const results = memoryList
      .map((memory) => {
        const contentLower = memory.content.toLowerCase()
        const sourceLower = memory.source.toLowerCase()

        let score = 0
        const highlights: string[] = []

        // Exact phrase match (highest score)
        if (contentLower.includes(queryLower)) {
          score += 10
          highlights.push(extractHighlight(memory.content, queryLower))
        }

        // Individual word matches
        queryWords.forEach((word) => {
          if (contentLower.includes(word)) {
            score += 2
            highlights.push(extractHighlight(memory.content, word))
          }
          if (sourceLower.includes(word)) {
            score += 1
          }
        })

        // Recency boost
        const daysSinceCreated = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreated < 7) score += 2
        if (daysSinceCreated < 1) score += 3

        return {
          memory,
          relevanceScore: score,
          highlights: [...new Set(highlights)].slice(0, 3),
        }
      })
      .filter((result) => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)

    return results
  }

  const extractHighlight = (content: string, searchTerm: string): string => {
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase())
    if (index === -1) return content.slice(0, 100) + "..."

    const start = Math.max(0, index - 50)
    const end = Math.min(content.length, index + searchTerm.length + 50)

    return (start > 0 ? "..." : "") + content.slice(start, end) + (end < content.length ? "..." : "")
  }

  const generateAIResponse = async (searchQuery: string, results: SearchResult[]) => {
    try {
      const context = results
        .slice(0, 5)
        .map((r) => `[${r.memory.timestamp.toLocaleDateString()}] ${r.memory.source}: ${r.memory.content}`)
        .join("\n\n")

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          context: context,
          type: "search",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
      }
    } catch (error) {
      console.error("AI response error:", error)
      setAiResponse("Unable to generate AI response at this time.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      performSemanticSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Semantic Memory Retrieval</CardTitle>
          <CardDescription>Ask questions about your memories in natural language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Ask anything about your memories... e.g., 'What did I discuss about AI in my meetings last week?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] border-blue-200 focus:border-blue-400"
              />
            </div>
            <Button
              onClick={performSemanticSearch}
              disabled={isSearching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((historyQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(historyQuery)}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {historyQuery.length > 30 ? historyQuery.slice(0, 30) + "..." : historyQuery}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Response */}
      {aiResponse && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">Search Results ({searchResults.length})</CardTitle>
            <CardDescription>Memories ranked by relevance to your query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={result.memory.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {result.memory.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Score: {result.relevanceScore}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {result.memory.timestamp.toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Source: {result.memory.source}</p>

                  {result.highlights.length > 0 ? (
                    <div className="space-y-1">
                      {result.highlights.map((highlight, hIndex) => (
                        <p key={hIndex} className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-200">
                          {highlight}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-200">
                      {result.memory.content.length > 200
                        ? result.memory.content.slice(0, 200) + "..."
                        : result.memory.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && !isSearching && searchResults.length === 0 && (
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
              <p className="text-gray-600">Try different keywords or add more memories to search through</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
