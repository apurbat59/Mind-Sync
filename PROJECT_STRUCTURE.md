# MindSync Project Structure

This document outlines the organized file structure of the MindSync application.

## 📁 Root Directory

```
mindsync-app/
├── app/                    # Next.js App Router
├── components/             # React Components
├── lib/                    # Utility Libraries
├── hooks/                  # Custom React Hooks
├── public/                 # Static Assets
├── styles/                 # Global Styles
├── .env                    # Environment Variables
├── .env.example           # Environment Template
├── README.md              # Project Documentation
└── PROJECT_STRUCTURE.md   # This File
```

## 📁 App Directory (`app/`)

```
app/
├── api/                   # API Routes
│   ├── ai/               # AI-related APIs
│   │   ├── chat/
│   │   ├── chat-gemini/
│   │   └── rag-chat/
│   ├── gmail/            # Gmail Integration APIs
│   │   ├── gmail-callback/
│   │   ├── gmail-oauth/
│   │   ├── gmail-real/
│   │   ├── gmail-sync/
│   │   └── gmail-sync-real/
│   └── memory/           # Memory-related APIs
│       └── transcribe/
├── dashboard/            # Dashboard Page
├── globals.css          # Global Styles
├── layout.tsx           # Root Layout
├── loading.tsx          # Loading Component
└── page.tsx             # Landing Page
```

## 📁 Components Directory (`components/`)

```
components/
├── ai/                  # AI-related Components
│   ├── ai-chatbot.tsx
│   └── rag-search.tsx
├── auth/                # Authentication Components
│   ├── auth-modal.tsx
│   ├── login-modal.tsx
│   └── user-management.tsx
├── gmail/               # Gmail Integration Components
│   ├── digest-generator.tsx
│   └── gmail-connector.tsx
├── memory/              # Memory Management Components
│   ├── enhanced-memory-search.tsx
│   ├── memory-graphs.tsx
│   ├── memory-ingestion.tsx
│   ├── memory-search.tsx
│   ├── memory-timeline.tsx
│   └── voice-capture.tsx
├── ui/                  # UI Components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── theme-provider.tsx
│   └── ... (other UI components)
└── index.ts             # Component Exports
```

## 📁 Lib Directory (`lib/`)

```
lib/
├── ai/                  # AI-related Libraries
│   ├── ml-features.ts   # Machine Learning Features
│   └── rag-engine.ts    # RAG (Retrieval-Augmented Generation) Engine
├── constants/           # Application Constants
│   └── index.ts
├── gmail/               # Gmail Integration Utilities
├── memory/              # Memory Management Utilities
├── types/               # TypeScript Type Definitions
│   └── index.ts
├── utils.ts             # General Utilities
└── index.ts             # Library Exports
```

## 📁 Hooks Directory (`hooks/`)

```
hooks/
├── use-mobile.tsx       # Mobile Detection Hook
└── use-toast.ts         # Toast Notification Hook
```

## 🔧 Configuration Files

- **`.env`**: Environment variables (not in git)
- **`.env.example`**: Environment template
- **`next.config.mjs`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration
- **`tsconfig.json`**: TypeScript configuration
- **`components.json`**: shadcn/ui configuration

## 🎯 Key Features by Directory

### AI Features (`/app/api/ai/`, `/components/ai/`, `/lib/ai/`)
- Chat functionality with Gemini AI
- RAG-powered search and responses
- Machine learning insights

### Gmail Integration (`/app/api/gmail/`, `/components/gmail/`)
- OAuth authentication
- Email synchronization
- Digest generation

### Memory Management (`/app/api/memory/`, `/components/memory/`)
- Memory ingestion and storage
- Voice transcription
- Memory search and visualization
- Timeline and graphs

### Authentication (`/components/auth/`)
- User registration and login
- User management
- Session handling

## 📝 Import Conventions

### Components
```typescript
// Use the index file for clean imports
import { AIChatbot, MemoryTimeline } from '@/components'
```

### Libraries
```typescript
// Use the index file for clean imports
import { ragEngine, API_ENDPOINTS } from '@/lib'
```

### Types
```typescript
// Import types from the types directory
import type { User, Memory } from '@/lib/types'
```

## 🚀 Best Practices

1. **Feature-based Organization**: Components and APIs are organized by feature/domain
2. **Consistent Naming**: Use kebab-case for files and directories
3. **Index Files**: Use index files for clean imports
4. **Type Safety**: Centralize type definitions in `/lib/types/`
5. **Constants**: Centralize constants in `/lib/constants/`
6. **Environment Variables**: All secrets are in `.env` file
7. **Documentation**: Keep this structure updated as the project evolves
