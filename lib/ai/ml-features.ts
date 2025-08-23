// Advanced ML features for memory processing and analysis
export interface MLInsight {
  type: "pattern" | "anomaly" | "trend" | "cluster" | "prediction"
  confidence: number
  description: string
  data: any
  actionable: boolean
}

export interface ClusterResult {
  clusterId: number
  centroid: number[]
  members: string[]
  label: string
  coherence: number
}

export interface TrendAnalysis {
  metric: string
  direction: "increasing" | "decreasing" | "stable"
  strength: number
  timeframe: string
  prediction: number[]
}

export class MLFeatureEngine {
  private clusters: Map<number, ClusterResult> = new Map()
  private trends: Map<string, TrendAnalysis> = new Map()
  private anomalies: Set<string> = new Set()

  // K-means clustering for memory grouping
  async performClustering(embeddings: Map<string, any>, k = 5): Promise<ClusterResult[]> {
    const vectors = Array.from(embeddings.values()).map((emb) => emb.vector)
    const ids = Array.from(embeddings.keys())

    if (vectors.length < k) {
      k = Math.max(1, vectors.length)
    }

    // Initialize centroids randomly
    const centroids = this.initializeCentroids(vectors, k)
    const assignments = new Array(vectors.length).fill(0)
    let converged = false
    let iterations = 0
    const maxIterations = 100

    while (!converged && iterations < maxIterations) {
      const newAssignments = new Array(vectors.length)

      // Assign each point to nearest centroid
      for (let i = 0; i < vectors.length; i++) {
        let minDistance = Number.POSITIVE_INFINITY
        let bestCluster = 0

        for (let j = 0; j < k; j++) {
          const distance = this.euclideanDistance(vectors[i], centroids[j])
          if (distance < minDistance) {
            minDistance = distance
            bestCluster = j
          }
        }

        newAssignments[i] = bestCluster
      }

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = vectors.filter((_, i) => newAssignments[i] === j)
        if (clusterPoints.length > 0) {
          centroids[j] = this.calculateCentroid(clusterPoints)
        }
      }

      // Check convergence
      converged = this.arraysEqual(assignments, newAssignments)
      assignments.splice(0, assignments.length, ...newAssignments)
      iterations++
    }

    // Build cluster results
    const clusters: ClusterResult[] = []
    for (let j = 0; j < k; j++) {
      const members = ids.filter((_, i) => assignments[i] === j)
      if (members.length > 0) {
        const cluster: ClusterResult = {
          clusterId: j,
          centroid: centroids[j],
          members,
          label: this.generateClusterLabel(members, embeddings),
          coherence: this.calculateClusterCoherence(members, embeddings, centroids[j]),
        }
        clusters.push(cluster)
        this.clusters.set(j, cluster)
      }
    }

    return clusters
  }

  private initializeCentroids(vectors: number[][], k: number): number[][] {
    const centroids: number[][] = []
    const vectorDim = vectors[0].length

    // Use k-means++ initialization for better results
    const chosen = new Set<number>()

    // Choose first centroid randomly
    const firstIndex = Math.floor(Math.random() * vectors.length)
    centroids.push([...vectors[firstIndex]])
    chosen.add(firstIndex)

    // Choose remaining centroids based on distance
    for (let i = 1; i < k; i++) {
      const distances: number[] = []
      let totalDistance = 0

      for (let j = 0; j < vectors.length; j++) {
        if (chosen.has(j)) {
          distances[j] = 0
          continue
        }

        let minDistance = Number.POSITIVE_INFINITY
        for (const centroid of centroids) {
          const distance = this.euclideanDistance(vectors[j], centroid)
          minDistance = Math.min(minDistance, distance)
        }

        distances[j] = minDistance * minDistance
        totalDistance += distances[j]
      }

      // Choose next centroid with probability proportional to squared distance
      let random = Math.random() * totalDistance
      for (let j = 0; j < vectors.length; j++) {
        if (chosen.has(j)) continue

        random -= distances[j]
        if (random <= 0) {
          centroids.push([...vectors[j]])
          chosen.add(j)
          break
        }
      }
    }

    return centroids
  }

  private euclideanDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0))
  }

  private calculateCentroid(vectors: number[][]): number[] {
    const dim = vectors[0].length
    const centroid = new Array(dim).fill(0)

    for (const vector of vectors) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += vector[i]
      }
    }

    return centroid.map((val) => val / vectors.length)
  }

  private arraysEqual(arr1: number[], arr2: number[]): boolean {
    return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i])
  }

  private generateClusterLabel(memberIds: string[], embeddings: Map<string, any>): string {
    // Analyze cluster members to generate meaningful label
    const keywords: Record<string, number> = {}
    const types: Record<string, number> = {}

    memberIds.forEach((id) => {
      const embedding = embeddings.get(id)
      if (embedding) {
        // Count keywords
        embedding.metadata.keywords.forEach((keyword: string) => {
          keywords[keyword] = (keywords[keyword] || 0) + 1
        })

        // Count types
        types[embedding.metadata.type] = (types[embedding.metadata.type] || 0) + 1
      }
    })

    // Find most common keywords and type
    const topKeywords = Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word)

    const dominantType = Object.entries(types).sort(([, a], [, b]) => b - a)[0]?.[0] || "mixed"

    return `${dominantType}: ${topKeywords.join(", ")}`
  }

  private calculateClusterCoherence(memberIds: string[], embeddings: Map<string, any>, centroid: number[]): number {
    if (memberIds.length === 0) return 0

    let totalDistance = 0
    let validMembers = 0

    memberIds.forEach((id) => {
      const embedding = embeddings.get(id)
      if (embedding) {
        const distance = this.euclideanDistance(embedding.vector, centroid)
        totalDistance += distance
        validMembers++
      }
    })

    // Return inverse of average distance (higher coherence = lower average distance)
    const avgDistance = validMembers > 0 ? totalDistance / validMembers : 1
    return 1 / (1 + avgDistance)
  }

  // Anomaly detection using isolation forest approach
  async detectAnomalies(embeddings: Map<string, any>): Promise<string[]> {
    const vectors = Array.from(embeddings.values())
    const ids = Array.from(embeddings.keys())
    const anomalies: string[] = []

    if (vectors.length < 10) return anomalies // Need minimum data for anomaly detection

    // Calculate statistical measures
    const means = this.calculateMeans(vectors.map((v) => v.vector))
    const stds = this.calculateStandardDeviations(
      vectors.map((v) => v.vector),
      means,
    )

    // Detect outliers using z-score method
    vectors.forEach((embedding, index) => {
      const zScores = embedding.vector.map((val: number, i: number) =>
        stds[i] > 0 ? Math.abs((val - means[i]) / stds[i]) : 0,
      )

      const maxZScore = Math.max(...zScores)
      const avgZScore = zScores.reduce((sum, score) => sum + score, 0) / zScores.length

      // Consider anomaly if z-score is high or if it's very different from cluster
      if (maxZScore > 3 || avgZScore > 2) {
        anomalies.push(ids[index])
        this.anomalies.add(ids[index])
      }
    })

    // Additional anomaly detection based on content features
    const contentAnomalies = this.detectContentAnomalies(embeddings)
    anomalies.push(...contentAnomalies)

    return [...new Set(anomalies)]
  }

  private calculateMeans(vectors: number[][]): number[] {
    const dim = vectors[0].length
    const means = new Array(dim).fill(0)

    vectors.forEach((vector) => {
      vector.forEach((val, i) => {
        means[i] += val
      })
    })

    return means.map((sum) => sum / vectors.length)
  }

  private calculateStandardDeviations(vectors: number[][], means: number[]): number[] {
    const dim = vectors[0].length
    const variances = new Array(dim).fill(0)

    vectors.forEach((vector) => {
      vector.forEach((val, i) => {
        variances[i] += Math.pow(val - means[i], 2)
      })
    })

    return variances.map((variance) => Math.sqrt(variance / vectors.length))
  }

  private detectContentAnomalies(embeddings: Map<string, any>): string[] {
    const anomalies: string[] = []
    const allEmbeddings = Array.from(embeddings.values())

    // Detect unusually long or short content
    const contentLengths = allEmbeddings.map((emb) => emb.metadata.content.length)
    const avgLength = contentLengths.reduce((sum, len) => sum + len, 0) / contentLengths.length
    const lengthStd = Math.sqrt(
      contentLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / contentLengths.length,
    )

    // Detect unusual sentiment
    const sentiments = allEmbeddings.map((emb) => emb.metadata.sentiment)
    const avgSentiment = sentiments.reduce((sum, sent) => sum + sent, 0) / sentiments.length
    const sentimentStd = Math.sqrt(
      sentiments.reduce((sum, sent) => sum + Math.pow(sent - avgSentiment, 2), 0) / sentiments.length,
    )

    allEmbeddings.forEach((embedding) => {
      const lengthZScore = lengthStd > 0 ? Math.abs((embedding.metadata.content.length - avgLength) / lengthStd) : 0
      const sentimentZScore =
        sentimentStd > 0 ? Math.abs((embedding.metadata.sentiment - avgSentiment) / sentimentStd) : 0

      if (lengthZScore > 2.5 || sentimentZScore > 2.5) {
        anomalies.push(embedding.id)
      }
    })

    return anomalies
  }

  // Time series analysis for trend detection
  async analyzeTrends(embeddings: Map<string, any>): Promise<TrendAnalysis[]> {
    const trends: TrendAnalysis[] = []

    // Group by time periods
    const timeGroups = this.groupByTimePeriod(embeddings)

    // Analyze different metrics
    const metrics = ["volume", "sentiment", "importance", "entity_count"]

    for (const metric of metrics) {
      const timeSeries = this.extractTimeSeries(timeGroups, metric)
      if (timeSeries.length >= 3) {
        // Need minimum data points
        const trend = this.detectTrend(timeSeries, metric)
        trends.push(trend)
        this.trends.set(metric, trend)
      }
    }

    return trends
  }

  private groupByTimePeriod(embeddings: Map<string, any>): Map<string, any[]> {
    const groups = new Map<string, any[]>()

    embeddings.forEach((embedding) => {
      const date = new Date(embedding.metadata.timestamp)
      const dateKey = date.toISOString().split("T")[0] // Group by day

      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(embedding)
    })

    return groups
  }

  private extractTimeSeries(timeGroups: Map<string, any[]>, metric: string): { date: string; value: number }[] {
    const series: { date: string; value: number }[] = []

    timeGroups.forEach((embeddings, date) => {
      let value = 0

      switch (metric) {
        case "volume":
          value = embeddings.length
          break
        case "sentiment":
          value = embeddings.reduce((sum, emb) => sum + emb.metadata.sentiment, 0) / embeddings.length
          break
        case "importance":
          value = embeddings.reduce((sum, emb) => sum + emb.metadata.importance, 0) / embeddings.length
          break
        case "entity_count":
          value = embeddings.reduce((sum, emb) => sum + emb.metadata.entities.length, 0) / embeddings.length
          break
      }

      series.push({ date, value })
    })

    return series.sort((a, b) => a.date.localeCompare(b.date))
  }

  private detectTrend(timeSeries: { date: string; value: number }[], metric: string): TrendAnalysis {
    const values = timeSeries.map((point) => point.value)
    const n = values.length

    // Linear regression to detect trend
    const xValues = Array.from({ length: n }, (_, i) => i)
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n
    const yMean = values.reduce((sum, y) => sum + y, 0) / n

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (values[i] - yMean)
      denominator += Math.pow(xValues[i] - xMean, 2)
    }

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean

    // Determine trend direction and strength
    let direction: "increasing" | "decreasing" | "stable"
    const slopeThreshold = Math.abs(yMean) * 0.1 // 10% of mean as threshold

    if (Math.abs(slope) < slopeThreshold) {
      direction = "stable"
    } else if (slope > 0) {
      direction = "increasing"
    } else {
      direction = "decreasing"
    }

    const strength = Math.min(Math.abs(slope) / (yMean || 1), 1)

    // Simple prediction for next few points
    const prediction = Array.from({ length: 3 }, (_, i) => slope * (n + i) + intercept)

    return {
      metric,
      direction,
      strength,
      timeframe: `${timeSeries[0].date} to ${timeSeries[n - 1].date}`,
      prediction,
    }
  }

  // Generate ML-powered insights
  async generateInsights(embeddings: Map<string, any>): Promise<MLInsight[]> {
    const insights: MLInsight[] = []

    // Clustering insights
    if (embeddings.size >= 5) {
      const clusters = await this.performClustering(embeddings)
      clusters.forEach((cluster) => {
        if (cluster.coherence > 0.7) {
          insights.push({
            type: "cluster",
            confidence: cluster.coherence,
            description: `Found coherent cluster: ${cluster.label} (${cluster.members.length} items)`,
            data: cluster,
            actionable: true,
          })
        }
      })
    }

    // Anomaly insights
    const anomalies = await this.detectAnomalies(embeddings)
    if (anomalies.length > 0) {
      insights.push({
        type: "anomaly",
        confidence: 0.8,
        description: `Detected ${anomalies.length} unusual memory patterns that may need attention`,
        data: { anomalies },
        actionable: true,
      })
    }

    // Trend insights
    const trends = await this.analyzeTrends(embeddings)
    trends.forEach((trend) => {
      if (trend.strength > 0.3) {
        insights.push({
          type: "trend",
          confidence: trend.strength,
          description: `${trend.metric} is ${trend.direction} over time`,
          data: trend,
          actionable: trend.direction !== "stable",
        })
      }
    })

    // Pattern insights
    const patterns = this.detectPatterns(embeddings)
    patterns.forEach((pattern) => {
      insights.push({
        type: "pattern",
        confidence: pattern.confidence,
        description: pattern.description,
        data: pattern.data,
        actionable: pattern.actionable,
      })
    })

    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  private detectPatterns(embeddings: Map<string, any>): MLInsight[] {
    const patterns: MLInsight[] = []
    const allEmbeddings = Array.from(embeddings.values())

    // Temporal patterns
    const hourCounts: Record<number, number> = {}
    const dayOfWeekCounts: Record<number, number> = {}

    allEmbeddings.forEach((embedding) => {
      const date = new Date(embedding.metadata.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()

      hourCounts[hour] = (hourCounts[hour] || 0) + 1
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1
    })

    // Find peak hours
    const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]

    if (peakHour && Number.parseInt(peakHour[1] as any) > allEmbeddings.length * 0.2) {
      patterns.push({
        type: "pattern",
        confidence: 0.7,
        description: `Most active during ${peakHour[0]}:00 hour (${peakHour[1]} activities)`,
        data: { type: "temporal", hour: peakHour[0], count: peakHour[1] },
        actionable: true,
      })
    }

    // Communication patterns
    const emailSenders: Record<string, number> = {}
    allEmbeddings
      .filter((emb) => emb.metadata.type === "email")
      .forEach((emb) => {
        const match = emb.metadata.content.match(/From: ([^\n]+)/)
        if (match) {
          const sender = match[1]
          emailSenders[sender] = (emailSenders[sender] || 0) + 1
        }
      })

    const topSender = Object.entries(emailSenders).sort(([, a], [, b]) => b - a)[0]

    if (topSender && topSender[1] > 5) {
      patterns.push({
        type: "pattern",
        confidence: 0.8,
        description: `Frequent communication with ${topSender[0]} (${topSender[1]} emails)`,
        data: { type: "communication", sender: topSender[0], count: topSender[1] },
        actionable: true,
      })
    }

    return patterns
  }

  // Get comprehensive ML analytics
  getMLAnalytics(): any {
    return {
      clusters: Array.from(this.clusters.values()),
      trends: Array.from(this.trends.values()),
      anomalies: Array.from(this.anomalies),
      totalClusters: this.clusters.size,
      totalTrends: this.trends.size,
      totalAnomalies: this.anomalies.size,
    }
  }

  // Clear all ML data
  clearMLData(): void {
    this.clusters.clear()
    this.trends.clear()
    this.anomalies.clear()
  }
}

// Singleton instance
export const mlEngine = new MLFeatureEngine()
