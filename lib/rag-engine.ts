// RAG Engine with ML-powered semantic search and retrieval
export interface EmbeddingVector {
  id: string
  vector: number[]
  metadata: {
    content: string
    source: string
    type: string
    timestamp: string
    keywords: string[]
    entities: string[]
    sentiment: number
    importance: number
  }
}

export interface RAGContext {
  relevantMemories: EmbeddingVector[]
  semanticSimilarity: number[]
  contextWindow: string
  retrievalScore: number
}

export class RAGEngine {
  private embeddings: Map<string, EmbeddingVector> = new Map()
  private indexedKeywords: Map<string, string[]> = new Map()
  private entityGraph: Map<string, Set<string>> = new Map()
  private temporalIndex: Map<string, string[]> = new Map()

  // Generate embeddings using a simplified transformer-like approach
  async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation (in production, use actual ML models)
    const words = this.tokenize(text.toLowerCase())
    const embedding = new Array(384).fill(0) // 384-dimensional embeddings

    // TF-IDF inspired weighting with semantic features
    const wordFreq = this.calculateWordFrequency(words)
    const semanticFeatures = this.extractSemanticFeatures(text)

    words.forEach((word, index) => {
      const hash = this.hashWord(word)
      const weight = wordFreq[word] * this.getIDF(word)

      for (let i = 0; i < 384; i++) {
        const featureIndex = (hash + i) % 384
        embedding[featureIndex] += weight * Math.sin(index + i) * semanticFeatures[i % semanticFeatures.length]
      }
    })

    // Normalize the embedding vector
    return this.normalizeVector(embedding)
  }

  // Advanced tokenization with NLP preprocessing
  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => !this.isStopWord(word))
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
    ])
    return stopWords.has(word.toLowerCase())
  }

  private calculateWordFrequency(words: string[]): Record<string, number> {
    const freq: Record<string, number> = {}
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1
    })

    // Normalize by document length
    const totalWords = words.length
    Object.keys(freq).forEach((word) => {
      freq[word] = freq[word] / totalWords
    })

    return freq
  }

  private getIDF(word: string): number {
    // Simplified IDF calculation
    const totalDocs = this.embeddings.size || 1
    const docsWithWord =
      Array.from(this.embeddings.values()).filter((emb) => emb.metadata.content.toLowerCase().includes(word)).length ||
      1

    return Math.log(totalDocs / docsWithWord)
  }

  private extractSemanticFeatures(text: string): number[] {
    const features: number[] = []

    // Sentiment analysis features
    const sentiment = this.analyzeSentiment(text)
    features.push(sentiment)

    // Named entity features
    const entities = this.extractEntities(text)
    features.push(entities.length / 10) // Normalized entity count

    // Temporal features
    const temporalWords = ["today", "tomorrow", "yesterday", "week", "month", "year", "urgent", "asap"]
    const temporalScore =
      temporalWords.reduce((score, word) => score + (text.toLowerCase().includes(word) ? 1 : 0), 0) /
      temporalWords.length
    features.push(temporalScore)

    // Topic modeling features (simplified)
    const topics = this.extractTopics(text)
    features.push(...topics.slice(0, 10))

    // Pad to ensure consistent feature vector size
    while (features.length < 20) {
      features.push(0)
    }

    return features.slice(0, 20)
  }

  private analyzeSentiment(text: string): number {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "love",
      "like",
      "happy",
      "success",
    ]
    const negativeWords = ["bad", "terrible", "awful", "hate", "dislike", "sad", "angry", "problem", "issue", "fail"]

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word) => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })

    // Normalize to [-1, 1]
    return Math.tanh(score / words.length)
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = []

    // Email pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex) || []
    entities.push(...emails)

    // Date patterns
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g
    const dates = text.match(dateRegex) || []
    entities.push(...dates)

    // Phone numbers
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b|\b$$\d{3}$$\s*\d{3}-\d{4}\b/g
    const phones = text.match(phoneRegex) || []
    entities.push(...phones)

    // Capitalized words (potential proper nouns)
    const properNouns = text.match(/\b[A-Z][a-z]+\b/g) || []
    entities.push(...properNouns.filter((word) => word.length > 2))

    return [...new Set(entities)]
  }

  private extractTopics(text: string): number[] {
    const topicKeywords = {
      business: ["meeting", "project", "client", "proposal", "budget", "revenue", "sales", "contract"],
      technology: ["software", "development", "code", "api", "database", "server", "cloud", "ai"],
      personal: ["family", "friend", "vacation", "health", "hobby", "personal", "home", "life"],
      finance: ["money", "payment", "invoice", "cost", "price", "financial", "bank", "investment"],
      education: ["learn", "study", "course", "training", "education", "knowledge", "skill", "teach"],
    }

    const topics: number[] = []
    const words = text.toLowerCase().split(/\s+/)

    Object.values(topicKeywords).forEach((keywords) => {
      const score = keywords.reduce((count, keyword) => count + (words.includes(keyword) ? 1 : 0), 0) / keywords.length
      topics.push(score)
    })

    return topics
  }

  private hashWord(word: string): number {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? vector.map((val) => val / magnitude) : vector
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))

    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  }

  // Index a memory with full ML processing
  async indexMemory(memory: any): Promise<void> {
    const embedding = await this.generateEmbedding(memory.content)
    const entities = this.extractEntities(memory.content)
    const keywords = this.tokenize(memory.content)
    const sentiment = this.analyzeSentiment(memory.content)

    // Calculate importance score using multiple factors
    const importance = this.calculateImportance(memory, entities, keywords)

    const embeddingVector: EmbeddingVector = {
      id: memory.id,
      vector: embedding,
      metadata: {
        content: memory.content,
        source: memory.source,
        type: memory.type,
        timestamp: memory.timestamp.toISOString(),
        keywords,
        entities,
        sentiment,
        importance,
      },
    }

    this.embeddings.set(memory.id, embeddingVector)

    // Build inverted indexes for fast retrieval
    this.buildInvertedIndexes(memory.id, keywords, entities)
    this.buildTemporalIndex(memory.id, memory.timestamp)
    this.buildEntityGraph(entities)
  }

  private calculateImportance(memory: any, entities: string[], keywords: string[]): number {
    let importance = 0.5 // Base importance

    // Email-specific importance factors
    if (memory.type === "email") {
      if (memory.metadata?.important) importance += 0.3
      if (memory.metadata?.labels?.includes("STARRED")) importance += 0.2
      if (entities.some((e) => e.includes("@"))) importance += 0.1 // Contains email addresses
    }

    // Content-based importance
    const urgentKeywords = ["urgent", "asap", "important", "critical", "deadline", "emergency"]
    if (urgentKeywords.some((word) => memory.content.toLowerCase().includes(word))) {
      importance += 0.2
    }

    // Entity richness
    importance += Math.min(entities.length * 0.05, 0.2)

    // Recency boost
    const daysSinceCreated = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreated < 1) importance += 0.1
    if (daysSinceCreated < 7) importance += 0.05

    return Math.min(importance, 1.0)
  }

  private buildInvertedIndexes(memoryId: string, keywords: string[], entities: string[]): void {
    // Keyword index
    keywords.forEach((keyword) => {
      if (!this.indexedKeywords.has(keyword)) {
        this.indexedKeywords.set(keyword, [])
      }
      this.indexedKeywords.get(keyword)!.push(memoryId)
    })

    // Entity index (reuse keyword index structure)
    entities.forEach((entity) => {
      const normalizedEntity = entity.toLowerCase()
      if (!this.indexedKeywords.has(normalizedEntity)) {
        this.indexedKeywords.set(normalizedEntity, [])
      }
      this.indexedKeywords.get(normalizedEntity)!.push(memoryId)
    })
  }

  private buildTemporalIndex(memoryId: string, timestamp: Date): void {
    const dateKey = timestamp.toISOString().split("T")[0] // YYYY-MM-DD
    if (!this.temporalIndex.has(dateKey)) {
      this.temporalIndex.set(dateKey, [])
    }
    this.temporalIndex.get(dateKey)!.push(memoryId)
  }

  private buildEntityGraph(entities: string[]): void {
    // Build co-occurrence graph for entity relationships
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i].toLowerCase()
        const entity2 = entities[j].toLowerCase()

        if (!this.entityGraph.has(entity1)) {
          this.entityGraph.set(entity1, new Set())
        }
        if (!this.entityGraph.has(entity2)) {
          this.entityGraph.set(entity2, new Set())
        }

        this.entityGraph.get(entity1)!.add(entity2)
        this.entityGraph.get(entity2)!.add(entity1)
      }
    }
  }

  // Advanced RAG retrieval with multiple ranking strategies
  async retrieveRelevantContext(query: string, maxResults = 10): Promise<RAGContext> {
    const queryEmbedding = await this.generateEmbedding(query)
    const queryKeywords = this.tokenize(query)
    const queryEntities = this.extractEntities(query)

    // Multi-stage retrieval
    const candidates = new Map<string, number>()

    // Stage 1: Semantic similarity using embeddings
    for (const [id, embedding] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding.vector)
      if (similarity > 0.1) {
        // Threshold for relevance
        candidates.set(id, similarity * 0.4) // 40% weight for semantic similarity
      }
    }

    // Stage 2: Keyword matching with TF-IDF
    queryKeywords.forEach((keyword) => {
      const memoryIds = this.indexedKeywords.get(keyword) || []
      memoryIds.forEach((id) => {
        const currentScore = candidates.get(id) || 0
        const tfIdfScore = this.calculateTFIDF(keyword, id)
        candidates.set(id, currentScore + tfIdfScore * 0.3) // 30% weight for keyword matching
      })
    })

    // Stage 3: Entity matching
    queryEntities.forEach((entity) => {
      const normalizedEntity = entity.toLowerCase()
      const memoryIds = this.indexedKeywords.get(normalizedEntity) || []
      memoryIds.forEach((id) => {
        const currentScore = candidates.get(id) || 0
        candidates.set(id, currentScore + 0.2) // 20% weight for entity matching
      })
    })

    // Stage 4: Temporal relevance
    const recentBoost = this.calculateTemporalRelevance(query)
    recentBoost.forEach((boost, id) => {
      const currentScore = candidates.get(id) || 0
      candidates.set(id, currentScore + boost * 0.1) // 10% weight for temporal relevance
    })

    // Rank and select top results
    const rankedResults = Array.from(candidates.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, maxResults)

    const relevantMemories = rankedResults.map(([id]) => this.embeddings.get(id)!).filter(Boolean)

    const semanticSimilarity = rankedResults.map(([, score]) => score)

    // Build context window
    const contextWindow = this.buildContextWindow(relevantMemories, query)

    // Calculate overall retrieval score
    const retrievalScore =
      semanticSimilarity.length > 0
        ? semanticSimilarity.reduce((sum, score) => sum + score, 0) / semanticSimilarity.length
        : 0

    return {
      relevantMemories,
      semanticSimilarity,
      contextWindow,
      retrievalScore,
    }
  }

  private calculateTFIDF(keyword: string, memoryId: string): number {
    const embedding = this.embeddings.get(memoryId)
    if (!embedding) return 0

    const tf = embedding.metadata.keywords.filter((k) => k === keyword).length / embedding.metadata.keywords.length
    const idf = this.getIDF(keyword)

    return tf * idf
  }

  private calculateTemporalRelevance(query: string): Map<string, number> {
    const temporalBoosts = new Map<string, number>()
    const now = new Date()

    // Check for temporal keywords in query
    const temporalKeywords = {
      today: 0,
      yesterday: 1,
      "this week": 7,
      "last week": 14,
      "this month": 30,
      recent: 7,
      latest: 3,
    }

    let maxDaysBack = 30 // Default lookback

    Object.entries(temporalKeywords).forEach(([keyword, days]) => {
      if (query.toLowerCase().includes(keyword)) {
        maxDaysBack = Math.min(maxDaysBack, days)
      }
    })

    // Boost recent memories
    for (const [id, embedding] of this.embeddings) {
      const memoryDate = new Date(embedding.metadata.timestamp)
      const daysDiff = (now.getTime() - memoryDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff <= maxDaysBack) {
        const boost = Math.max(0, 1 - daysDiff / maxDaysBack)
        temporalBoosts.set(id, boost)
      }
    }

    return temporalBoosts
  }

  private buildContextWindow(memories: EmbeddingVector[], query: string): string {
    // Sort memories by importance and relevance
    const sortedMemories = memories.sort((a, b) => {
      const scoreA = a.metadata.importance
      const scoreB = b.metadata.importance
      return scoreB - scoreA
    })

    let contextWindow = `Query: ${query}\n\nRelevant Context:\n\n`
    let totalLength = contextWindow.length
    const maxLength = 4000 // Context window limit

    sortedMemories.forEach((memory, index) => {
      const memoryText =
        `[${index + 1}] Source: ${memory.metadata.source}\n` +
        `Type: ${memory.metadata.type}\n` +
        `Date: ${new Date(memory.metadata.timestamp).toLocaleDateString()}\n` +
        `Content: ${memory.metadata.content}\n` +
        `Entities: ${memory.metadata.entities.join(", ")}\n` +
        `Sentiment: ${memory.metadata.sentiment > 0 ? "Positive" : memory.metadata.sentiment < 0 ? "Negative" : "Neutral"}\n\n`

      if (totalLength + memoryText.length <= maxLength) {
        contextWindow += memoryText
        totalLength += memoryText.length
      }
    })

    return contextWindow
  }

  // Get memory statistics for analytics
  getAnalytics(): any {
    const totalMemories = this.embeddings.size
    const typeDistribution: Record<string, number> = {}
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 }
    let avgImportance = 0

    for (const embedding of this.embeddings.values()) {
      // Type distribution
      typeDistribution[embedding.metadata.type] = (typeDistribution[embedding.metadata.type] || 0) + 1

      // Sentiment distribution
      if (embedding.metadata.sentiment > 0.1) sentimentDistribution.positive++
      else if (embedding.metadata.sentiment < -0.1) sentimentDistribution.negative++
      else sentimentDistribution.neutral++

      // Average importance
      avgImportance += embedding.metadata.importance
    }

    avgImportance = totalMemories > 0 ? avgImportance / totalMemories : 0

    return {
      totalMemories,
      typeDistribution,
      sentimentDistribution,
      avgImportance,
      totalKeywords: this.indexedKeywords.size,
      totalEntities: this.entityGraph.size,
      indexSize: {
        embeddings: this.embeddings.size,
        keywords: this.indexedKeywords.size,
        temporal: this.temporalIndex.size,
        entities: this.entityGraph.size,
      },
    }
  }

  // Clear all indexes (for testing/reset)
  clearIndexes(): void {
    this.embeddings.clear()
    this.indexedKeywords.clear()
    this.entityGraph.clear()
    this.temporalIndex.clear()
  }
}

// Singleton instance
export const ragEngine = new RAGEngine()
