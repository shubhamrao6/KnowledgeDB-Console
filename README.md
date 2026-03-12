# KnowledgeDB Console

**Live:** [knowledgedb.dev](https://knowledgedb.dev)
**Company:** Entropy AI Research Labs Pvt Ltd, Dublin, Ireland
**Contact:** director@entropyresearch.ai

---

## Overview

KnowledgeDB Console is a unified Next.js application that combines the KnowledgeDB landing page, API documentation, and console tools into a single deployable project. It serves as the complete frontend for the KnowledgeDB platform — a no-code LLM application builder.

## What's Inside

### Landing Page (`/`)
Product marketing page with feature showcase, pricing, solutions, and contact information. Includes an image carousel, smooth scroll navigation, and embedded previews of ChaosAI and DocHuman.

### KDB Chat (`/console/chat`)
RAG-powered chat interface. Users upload documents into knowledge bases, then ask questions and get AI-generated answers streamed in real time via WebSocket. Supports conversation history, markdown rendering, and knowledge base switching.

### KDB Canvas (`/console/canvas`)
Visual no-code builder for LLM applications (demo). Drag-and-drop components like LLM models, RAG search, document loaders, and conditional logic onto a canvas to create AI workflows. Includes templates for common patterns.

### KDB API (`/docs`)
Full interactive API documentation with test panels for every endpoint. Covers authentication, knowledge bases, documents, images, RAG search, subscription management, and WebSocket chat. Each endpoint has a live "Test" tab for sending real API requests.

### Auth (`/login`, `/signup`)
Email/password authentication via AWS Cognito. Tokens stored in localStorage and shared across all sections.

### Legal (`/privacy`, `/terms`)
Privacy policy and terms of service pages.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| WebSocket | Native WebSocket API |
| Markdown | react-markdown + rehype-highlight |
| Icons | Lucide React |
| Deployment | AWS Amplify |

---

## Routes

```
/                              → Landing page
/login                         → Login
/signup                        → Signup
/privacy                       → Privacy policy
/terms                         → Terms of service
/console                       → Dashboard (KDB Canvas, Chat, API cards)
/console/chat                  → Chat interface
/console/canvas                → No-code builder (demo)
/console/knowledge             → Knowledge bases list
/console/knowledge/[id]        → KB detail / documents
/console/settings              → Account settings
/docs                          → API docs overview
/docs/auth                     → Auth endpoints
/docs/documents                → Documents endpoints
/docs/images                   → Images endpoints
/docs/knowledgedbs             → KnowledgeDBs endpoints
/docs/search                   → Search endpoint
/docs/subscription             → Subscription endpoints
/docs/websocket                → WebSocket docs + live test
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

No environment variables required — the API base URL and WebSocket URL are hardcoded to the production endpoints. Theme preference is stored in `localStorage` under `kdb_theme`.

### Build

```bash
npm run build
```

### Deploy

Designed for AWS Amplify Console (SSR). Push to the connected branch and Amplify handles the rest.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (theme, fonts)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind + CSS variables
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── console/
│   │   ├── layout.tsx          # Console layout (auth guard, sidebar routing)
│   │   ├── page.tsx            # Dashboard with 3 product cards
│   │   ├── chat/page.tsx       # Chat interface
│   │   ├── canvas/page.tsx     # No-code builder (demo)
│   │   ├── knowledge/
│   │   │   ├── page.tsx        # KB list
│   │   │   └── [id]/page.tsx   # KB detail + documents
│   │   └── settings/page.tsx
│   └── docs/
│       ├── layout.tsx          # Docs layout (sidebar, topbar)
│       ├── page.tsx            # API overview + health check
│       ├── auth/page.tsx
│       ├── documents/page.tsx
│       ├── images/page.tsx
│       ├── knowledgedbs/page.tsx
│       ├── search/page.tsx
│       ├── subscription/page.tsx
│       └── websocket/page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx     # Message bubble with markdown
│   │   ├── ChatInput.tsx       # Input bar with KB selector
│   │   └── EmptyState.tsx      # Empty chat suggestions
│   ├── docs/
│   │   └── EndpointBlock.tsx   # API endpoint with test panel
│   └── layout/
│       ├── Sidebar.tsx         # Console sidebar (KBs, nav)
│       ├── ThemeToggle.tsx     # Dark/light toggle
│       └── Logo.tsx            # SVG logo component
├── lib/
│   ├── api.ts                  # REST API client
│   ├── auth.ts                 # Token management
│   └── websocket.ts            # WebSocket connection manager
└── stores/
    ├── authStore.ts            # Auth state (Zustand)
    ├── chatStore.ts            # Chat threads, streaming
    └── kbStore.ts              # Knowledge bases, documents
```

## API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Health | `/health` | GET |
| Sign up | `/auth/signup` | POST |
| Login | `/auth/login` | POST |
| Refresh | `/auth/refresh` | POST |
| Logout | `/auth/logout` | POST |
| List KBs | `/knowledgedbs` | GET |
| Create KB | `/knowledgedbs` | POST |
| Delete KB | `/knowledgedbs/{id}` | DELETE |
| Upload doc | `/documents/upload` | POST |
| Generate doc | `/documents/generate` | POST |
| List docs | `/documents?knowledgeDbId=` | GET |
| Get doc | `/documents/{id}` | GET |
| Delete doc | `/documents/{id}` | DELETE |
| Reindex doc | `/documents/reindex` | POST |
| RAG search | `/search` | POST |
| Generate image | `/images/generate` | POST |
| Upload image | `/images/upload` | POST |
| List images | `/images?knowledgeDbId=` | GET |
| Delete image | `/images/{id}` | DELETE |
| Get subscription | `/subscription` | GET |
| Usage | `/subscription/usage` | GET |
| Checkout | `/subscription/checkout` | POST |
| Change plan | `/subscription/change` | POST |
| Cancel | `/subscription/cancel` | POST |
| Portal | `/subscription/portal` | POST |
| Chat | `wss://...?token=<idToken>` | WebSocket |

## Design System

- **Dark mode** (default): `#0a0a0f` bg, `#e74c3c` accent, `#ff6b6b` accent-light
- **Light mode**: `#ffffff` bg, same accent colors
- **Fonts**: Inter (body), Orbitron (brand/logo)
- **Theme key**: `kdb_theme` in localStorage (shared across all sections)
- **Auth tokens**: `kdb_id_token`, `kdb_access_token`, `kdb_refresh_token`, `kdb_api_key`

---

© 2026 Entropy AI Research Labs Pvt Ltd. All rights reserved.
