"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Search, Brain, Zap, Target, TrendingUp, Loader2, Sparkles, Database } from "lucide-react"
import { ragEngine, type RAGContext } from "@/lib/ai/rag-engine"
import { mlEngine, type MLInsight } from "@/lib/ai/ml-features"

interface RAGSearchProps {
  memories: any[]
  onSearchComplete?: (results: RAGContext) => void
}

export default function RAGSearch({ memories, onSearchComplete }: RAGSearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isIndexing, setIsIndexing] = useState(false)
  const [ragResults, setRagResults] = useState<RAGContext | null>(null)
  const [mlInsights, setMlInsights] = useState<MLInsight[]>([])
  const [indexingProgress, setIndexingProgress] = useState(0)
  const [ragAnalytics, setRagAnalytics] = useState<any>(null)
  const [isIndexed, setIsIndexed] = useState(false)

  useEffect(() => {
    if (memories.length > 0 && !isIndexed) {
      indexMemories()
    }
  }, [memories, isIndexed])

  const indexMemories = async () => {
    setIsIndexing(true)
    setIndexingProgress(0)

    try {
      // Clear existing indexes
      ragEngine.clearIndexes()
      mlEngine.clearMLData()

      // Index memories with progress tracking
      for (let i = 0; i < memories.length; i++) {
        await ragEngine.indexMemory(memories[i])
        setIndexingProgress(((i + 1) / memories.length) * 100)

        // Small delay to show progress
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      // Generate ML insights
      const embeddings = (ragEngine as any).embeddings
      const insights = await mlEngine.generateInsights(embeddings)
      setMlInsights(insights)

      // Get analytics
      const analytics = ragEngine.getAnalytics()
      setRagAnalytics(analytics)

      setIsIndexed(true)
    } catch (error) {
      console.error("Indexing error:", error)
    } finally {
      setIsIndexing(false)
    }
  }

  const performRAGSearch = async () => {
    if (!query.trim() || !isIndexed) return

    setIsSearching(true)

    try {
      const results = await ragEngine.retrieveRelevantContext(query, 10)
      setRagResults(results)
      onSearchComplete?.(results)

      // Update search analytics
      const analytics = ragEngine.getAnalytics()
      setRagAnalytics(analytics)
    } catch (error) {
      console.error("RAG search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      performRAGSearch()
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "cluster":
        return <Target className="h-4 w-4" />
      case "trend":
        return <TrendingUp className="h-4 w-4" />
      case "anomaly":
        return <Zap className="h-4 w-4" />
      case "pattern":
        return <Brain className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "cluster":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "trend":
        return "bg-green-100 text-green-800 border-green-200"
      case "anomaly":
        return "bg-red-100 text-red-800 border-red-200"
      case "pattern":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* RAG Search Interface */}
      <Card className="bg-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            RAG-Powered Semantic Search
          </CardTitle>
          <CardDescription>
            Advanced retrieval-augmented generation with ML-powered semantic understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Indexing Status */}
          {isIndexing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600">Building semantic indexes...</span>
                <span className="text-blue-600">{Math.round(indexingProgress)}%</span>
              </div>
              <Progress value={indexingProgress} className="h-2" />
            </div>
          )}

          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Ask complex questions about your memories using natural language..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] border-blue-200 focus:border-blue-400"
                disabled={isSearching || isIndexing || !isIndexed}
              />
            </div>
            <Button
              onClick={performRAGSearch}
              disabled={isSearching || isIndexing || !query.trim() || !isIndexed}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Index Status */}
          {ragAnalytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{ragAnalytics.totalMemories}</div>
                <div className="text-xs text-blue-600">Indexed Memories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{ragAnalytics.totalKeywords}</div>
                <div className="text-xs text-blue-600">Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{ragAnalytics.totalEntities}</div>
                <div className="text-xs text-blue-600">Entities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{(ragAnalytics.avgImportance * 100).toFixed(0)}%</div>
                <div className="text-xs text-blue-600">Avg Importance</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RAG Results */}
      {ragResults && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                RAG Retrieval Results
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Score: {(ragResults.retrievalScore * 100).toFixed(1)}%
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-700">
              Found {ragResults.relevantMemories.length} semantically relevant memories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Context Window Preview */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Generated Context Window</h4>
              <div className="text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {ragResults.contextWindow.slice(0, 500)}
                {ragResults.contextWindow.length > 500 && "..."}
              </div>
            </div>

            {/* Retrieved Memories */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-900">Retrieved Memories (Ranked by Relevance)</h4>
              {ragResults.relevantMemories.slice(0, 5).map((memory, index) => (
                <div key={memory.id} className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="text-xs bg-green-100 text-green-800 border-green-200">#{index + 1}</Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        {memory.metadata.type}
                      </Badge>
                      <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                        Similarity: {(ragResults.semanticSimilarity[index] * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(memory.metadata.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-green-800 mb-1">{memory.metadata.source}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{memory.metadata.content}</p>

                  {memory.metadata.entities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {memory.metadata.entities.slice(0, 3).map((entity: string, i: number) => (
                        <Badge key={i} className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ML Insights */}
      {mlInsights.length > 0 && (
        <Card className="bg-white border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              ML-Powered Insights
            </CardTitle>
            <CardDescription className="text-purple-700">
              Advanced machine learning analysis of your memory patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mlInsights.slice(0, 6).map((insight, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <Badge className={`text-xs ${getInsightColor(insight.type)}`}>{insight.type.toUpperCase()}</Badge>
                    <Badge className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  {insight.actionable && (
                    <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200">Actionable</Badge>
                  )}
                </div>

                <p className="text-sm text-purple-800 font-medium mb-2">{insight.description}</p>

                {insight.type === "cluster" && insight.data.members && (
                  <div className="text-xs text-purple-600">
                    Cluster contains {insight.data.members.length} memories with{" "}
                    {(insight.data.coherence * 100).toFixed(0)}% coherence
                  </div>
                )}

                {insight.type === "trend" && insight.data.direction && (
                  <div className="text-xs text-purple-600">
                    Trend: {insight.data.direction} with {(insight.data.strength * 100).toFixed(0)}% strength
                  </div>
                )}

                {insight.type === "anomaly" && insight.data.anomalies && (
                  <div className="text-xs text-purple-600">
                    {insight.data.anomalies.length} unusual patterns detected
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sample Queries */}
      {!ragResults && isIndexed && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg">Try These Advanced Queries</CardTitle>
            <CardDescription>Examples of complex semantic searches you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Find all emails about project deadlines and urgent tasks",
                "Show me conversations with clients about budget or pricing",
                "What are the main topics discussed in my recent meetings?",
                "Find memories related to AI, machine learning, or technology trends",
                "Show me all important communications from last week",
                "What patterns do you see in my email communication?",
                "Find anomalies or unusual activities in my memory data",
                "Cluster my memories by topic and show the main themes",
              ].map((sampleQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(sampleQuery)}
                  className="text-left justify-start h-auto p-3 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <div className="text-xs text-gray-600 line-clamp-2">{sampleQuery}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
