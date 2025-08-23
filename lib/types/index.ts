// Re-export all types from their respective modules
export type { RAGContext } from '../ai/rag-engine'
export type { MLInsight } from '../ai/ml-features'

// Common types used across the application
export interface User {
  name: string
  email: string
  id?: string
}

export interface Memory {
  id: string
  content: string
  type: 'text' | 'voice' | 'email' | 'image'
  timestamp: Date
  tags: string[]
  userId: string
}

export interface Email {
  id: string
  subject: string
  sender: string
  content: string
  timestamp: Date
  userId: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  context?: any
}
