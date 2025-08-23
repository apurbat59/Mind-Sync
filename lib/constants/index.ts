// API Configuration
export const API_ENDPOINTS = {
  CHAT: '/api/ai/chat',
  CHAT_GEMINI: '/api/ai/chat-gemini',
  RAG_CHAT: '/api/ai/rag-chat',
  GMAIL_OAUTH: '/api/gmail/gmail-oauth',
  GMAIL_CALLBACK: '/api/gmail/gmail-callback',
  GMAIL_SYNC: '/api/gmail/gmail-sync',
  TRANSCRIBE: '/api/memory/transcribe',
} as const

// Gmail OAuth Configuration
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
] as const

// Application Constants
export const APP_CONFIG = {
  NAME: 'MindSync',
  DESCRIPTION: 'AI-Powered Second Brain',
  VERSION: '1.0.0',
  MAX_MEMORY_LENGTH: 10000,
  MAX_SEARCH_RESULTS: 50,
} as const

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
} as const

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'mindsync-user',
  USERS: 'mindsync-users',
  GMAIL_TOKEN: 'gmail-token',
  GMAIL_REFRESH_TOKEN: 'gmail-refresh-token',
  GMAIL_TOKEN_EXPIRES: 'gmail-token-expires',
  GMAIL_CONNECTED: 'gmail-connected',
} as const
