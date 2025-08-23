"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Brain, Sparkles, Target, Loader2, Zap } from "lucide-react"
import RAGSearch from "../ai/rag-search"
import type { RAGContext } from "@/lib/ai/rag-engine"

interface EnhancedMemorySearchProps {
  memories: any[]
}

export default function EnhancedMemorySearch({ memories }: EnhancedMemorySearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [aiResponse, setAiResponse] = useState("")
  const [ragResults, setRagResults] = useState<RAGContext | null>(null)
  const [searchMode, setSearchMode] = useState<"traditional" | "rag">("rag")

  const performTraditionalSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setSearchResults([])
    setAiResponse("")

    try {
      // Traditional keyword-based search
      const results = performLocalSearch(query, memories)
      setSearchResults(results)

      // Generate AI response using traditional method
      if (results.length > 0) {
        await generateTraditionalAIResponse(query, results)
      }
    } catch (error) {
      console.error("Traditional search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const performLocalSearch = (searchQuery: string, memoryList: any[]) => {
    const queryLower = searchQuery.toLowerCase()
    const queryWords = queryLower.split(" ").filter((word) => word.length > 2)

    const results = memoryList
      .map((memory) => {
        const contentLower = memory.content.toLowerCase()
        const sourceLower = memory.source.toLowerCase()

        let score = 0
        const highlights: string[] = []

        // Exact phrase match
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

  const generateTraditionalAIResponse = async (searchQuery: string, results: any[]) => {
    try {
      const context = results
        .slice(0, 5)
        .map((r) => `[${r.memory.timestamp.toLocaleDateString()}] ${r.memory.source}: ${r.memory.content}`)
        .join("\n\n")

      const response = await fetch("/api/chat", {
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

  const performRAGSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setAiResponse("")

    try {
      // Use RAG-enhanced search
      const response = await fetch("/api/rag-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          userEmail: "user@example.com",
          useRAG: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
      }
    } catch (error) {
      console.error("RAG search error:", error)
      setAiResponse("Unable to perform RAG search at this time.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = () => {
    if (searchMode === "traditional") {
      performTraditionalSearch()
    } else {
      performRAGSearch()
    }
  }

  const handleRAGComplete = (results: RAGContext) => {
    setRagResults(results)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Mode Selection */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Enhanced Memory Search</CardTitle>
          <CardDescription>
            Choose between traditional keyword search and advanced RAG-powered semantic search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchMode} onValueChange={(value: any) => setSearchMode(value)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-blue-50">
              <TabsTrigger
                value="traditional"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Traditional Search
              </TabsTrigger>
              <TabsTrigger value="rag" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Brain className="h-4 w-4 mr-2" />
                RAG Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traditional" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Traditional Keyword Search</span>
                </div>
                <p className="text-sm text-gray-600">
                  Fast keyword-based search with TF-IDF scoring and basic relevance ranking. Good for exact matches and
                  simple queries.
                </p>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Enter keywords to search your memories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[60px] border-blue-200 focus:border-blue-400"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rag" className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">RAG-Powered Semantic Search</span>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Advanced</Badge>
                </div>
                <p className="text-sm text-purple-700">
                  Advanced semantic search using embeddings, entity recognition, and ML-powered retrieval. Understands
                  context, relationships, and meaning beyond keywords.
                </p>
              </div>

              <RAGSearch memories={memories} onSearchComplete={handleRAGComplete} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Response */}
      {aiResponse && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center justify-between">
              <div className="flex items-center">
                {searchMode === "rag" ? <Brain className="h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                AI Analysis
              </div>
              <Badge
                className={`${searchMode === "rag" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}
              >
                {searchMode === "rag" ? "RAG-Enhanced" : "Traditional"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional Search Results */}
      {searchMode === "traditional" && searchResults.length > 0 && (
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Traditional Search Results ({searchResults.length})
            </CardTitle>
            <CardDescription>Keyword-based search results ranked by relevance</CardDescription>
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
                    <span>{result.memory.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Source: {result.memory.source}</p>

                  {result.highlights.length > 0 ? (
                    <div className="space-y-1">
                      {result.highlights.map((highlight: string, hIndex: number) => (
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

      {/* Comparison Insights */}
      {ragResults && searchResults.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Search Method Comparison
            </CardTitle>
            <CardDescription>Compare the effectiveness of traditional vs RAG-powered search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Traditional Search</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Results Found:</span>
                    <span className="font-medium">{searchResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Search Method:</span>
                    <span className="font-medium">Keyword Matching</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Score:</span>
                    <span className="font-medium">
                      {searchResults.length > 0 ? searchResults[0].relevanceScore : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">RAG Search</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Results Found:</span>
                    <span className="font-medium">{ragResults.relevantMemories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Search Method:</span>
                    <span className="font-medium">Semantic + ML</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retrieval Score:</span>
                    <span className="font-medium">{(ragResults.retrievalScore * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Insight:</strong> RAG search typically provides more contextually relevant results by
                understanding semantic meaning, while traditional search excels at exact keyword matches.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && !isSearching && searchResults.length === 0 && !aiResponse && searchMode === "traditional" && (
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
              <p className="text-gray-600">Try different keywords or switch to RAG search for semantic understanding</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
