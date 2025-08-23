# MindSync App

A Next.js application for personal memory management and AI-powered email assistance.

## 📁 Project Structure

This project follows a feature-based organization structure. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

### Key Directories:
- **`/app/api/`** - API routes organized by feature (ai, gmail, memory)
- **`/components/`** - React components organized by feature
- **`/lib/`** - Utility libraries and type definitions
- **`/hooks/`** - Custom React hooks

## Environment Setup

This project uses environment variables for secure configuration. Follow these steps to set up your environment:

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file and add your actual API keys and credentials:

#### Required Variables

- **GEMINI_API_KEY**: Your Google Gemini AI API key
  - Get it from: https://makersuite.google.com/app/apikey
  
- **GMAIL_CLIENT_ID**: Your Google OAuth client ID
  - Get it from: https://console.cloud.google.com/
  
- **GMAIL_CLIENT_SECRET**: Your Google OAuth client secret
  - Get it from: https://console.cloud.google.com/

#### Optional Variables

- **GMAIL_REDIRECT_URI**: OAuth redirect URI (defaults to `http://localhost:3000/api/gmail-callback`)
- **NODE_ENV**: Environment (defaults to `development`)

### 3. Example .env File

```env
# Gemini AI API Key
GEMINI_API_KEY=your-actual-gemini-api-key-here

# Gmail OAuth Configuration
GMAIL_CLIENT_ID=your-actual-gmail-client-id-here
GMAIL_CLIENT_SECRET=your-actual-gmail-client-secret-here
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail-callback

# Environment
NODE_ENV=development
```

## Security Notes

- The `.env` file is already included in `.gitignore` to prevent accidental commits
- Never commit your actual API keys to version control
- Use different API keys for development and production environments
- Regularly rotate your API keys for security

## Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- AI-powered email analysis and summarization
- Personal memory management
- Gmail integration via OAuth
- RAG (Retrieval-Augmented Generation) for enhanced AI responses
- Voice capture and transcription
- Memory search and timeline visualization
