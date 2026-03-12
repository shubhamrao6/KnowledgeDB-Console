# KnowledgeDB Console — Design & Architecture

## Product Vision

KnowledgeDB democratizes AI development by making LLM application creation accessible to everyone. The Console is the unified hub where users access all KnowledgeDB tools:

- **KDB Canvas** — Visual no-code builder for LLM workflows
- **KDB Chat** — RAG-powered conversational interface
- **KDB API** — Interactive API documentation with live testing

**Company:** Entropy AI Research Labs Pvt Ltd, Dublin, Ireland

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KnowledgeDB Console                       │
│                    (Next.js 15 App)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Landing  │  │ Console  │  │   API    │  │   Auth    │  │
│  │  Page    │  │Dashboard │  │   Docs   │  │Login/Sign │  │
│  │   /      │  │/console  │  │  /docs   │  │  /login   │  │
│  └──────────┘  └────┬─────┘  └──────────┘  └───────────┘  │
│                     │                                       │
│         ┌───────────┼───────────┐                          │
│         │           │           │                          │
│    ┌────┴───┐  ┌────┴───┐  ┌───┴────┐                     │
│    │ Canvas │  │  Chat  │  │  API   │                     │
│    │(demo)  │  │+ KBs   │  │  Docs  │                     │
│    └────────┘  └────────┘  └────────┘                     │
│                     │                                       │
│              ┌──────┴──────┐                               │
│              │ KnowledgeDB │                               │
│              │  REST API   │                               │
│              │ + WebSocket │                               │
│              └─────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Console Dashboard Flow

After login, users land on `/console` — a dashboard with three product cards:

| Card | Route | Status | Description |
|------|-------|--------|-------------|
| KDB Canvas | `/console/canvas` | Demo | No-code LLM workflow builder |
| KDB Chat | `/console/chat` | Live | RAG chat with knowledge bases |
| KDB API | `/docs` (new tab) | Live | Interactive API documentation |

---

## KDB Chat Architecture

The chat app follows a sidebar + main content pattern:

- **Sidebar** lists knowledge bases (not conversations). Each KB has one chat thread.
- **"New"** creates a new knowledge base.
- **Selecting a KB** loads its chat history via WebSocket `load_history` action.
- **Messages** stream in real time via WebSocket (`start` → `chunk` → `end`).

### WebSocket Flow

```
1. User selects a KB and types a message
2. App sends via WebSocket:
   {
     "action": "sendMessage",
     "question": "What are the key findings?",
     "model_id": "basic"
   }

3. Server streams back:
   { "type": "start", "message": "..." }
   { "type": "chunk", "text": "The key " }
   { "type": "chunk", "text": "findings " }
   { "type": "chunk", "text": "include..." }
   { "type": "end", "message": "..." }

4. App renders chunks progressively (typing effect with streaming cursor)
5. On "end", finalize message in state, re-enable input
```

**WebSocket URL:** `wss://p417pa2mu2.execute-api.us-east-1.amazonaws.com/prod?token=<idToken>`

### State Management

Chat state lives in `chatStore` (Zustand):

- `threads` — `Record<kbId, Message[]>` — one thread per knowledge base
- `isStreaming` — locks input during streaming
- `pagination` — cursor-based pagination per KB for history loading
- Threads persist to `localStorage` under `kdb_chat_threads`

### Components

| Component | Purpose |
|-----------|---------|
| `ChatMessage` | Message bubble with markdown rendering (react-markdown + rehype-highlight) |
| `ChatInput` | Input bar with KB selector dropdown and send button |
| `EmptyState` | Centered prompt suggestions when no messages exist |

---

## KDB Canvas Architecture

The Canvas is a visual no-code builder for LLM workflows (currently a demo with simulated backend).

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: "KDB Canvas" + Demo badge + Run/Clear buttons       │
├────────────┬─────────────────────────────────┬───────────────┤
│            │                                 │               │
│ Component  │         Canvas Area             │  Properties   │
│  Palette   │    (dot grid background)        │    Panel      │
│            │                                 │               │
│ 8 types:   │  ┌─────┐    ┌─────┐            │  Model select │
│ · User In  │  │Node │───→│Node │            │  System prompt│
│ · Doc Load │  └─────┘    └─────┘            │  top_k slider │
│ · LLM      │                                 │  KB ID input  │
│ · RAG      │  Draggable nodes with           │               │
│ · Filter   │  bezier curve connections       │               │
│ · Cond.    │                                 │               │
│ · KB       │                                 │               │
│ · Output   │                                 │               │
│            │                                 │               │
│ Templates: │                                 │               │
│ · RAG Chat │                                 │               │
│ · Doc QA   │                                 │               │
│ · Summ.    │                                 │               │
├────────────┴─────────────────────────────────┴───────────────┤
│ Execution Log (expandable, simulated run output)             │
└──────────────────────────────────────────────────────────────┘
```

### Component Types

| Type | Color | Description |
|------|-------|-------------|
| User Input | blue | Entry point for user queries |
| Document Loader | green | Loads documents from a KB |
| LLM Model | purple | Language model inference node |
| RAG Search | orange | Vector search over knowledge base |
| Filter | pink | Filters/transforms data |
| Conditional | yellow | Branching logic |
| Knowledge Base | cyan | KB reference node |
| Output | red | Final output/response node |

### Interactions

- **Drag-and-drop** from palette to canvas (HTML5 drag events)
- **Click** a palette item to add it at a default position
- **Drag nodes** on canvas to reposition
- **Click output port** → **click input port** to create bezier connections
- **Click node** to open properties panel (uses `justInteracted` ref to prevent instant close)
- **Templates** load pre-built node + connection configurations
- **Run** button simulates execution with fake log output

### Data Model

```typescript
interface CanvasNode {
  id: string;
  type: string;       // component type key
  label: string;
  x: number; y: number;
  config: Record<string, string>;  // properties (model, prompt, top_k, etc.)
}

interface Connection {
  id: string;
  from: string;  // source node ID
  to: string;    // target node ID
}
```

---

## KDB API Docs Architecture

Interactive API documentation with live test panels for every endpoint.

### Layout

- **Fixed sidebar** (280px) with navigation grouped by section (Auth, KnowledgeDBs, Documents, etc.)
- **Sticky top bar** with theme toggle, auth indicator, and Console link
- **Main content** area with endpoint blocks

### EndpointBlock Component

Each API endpoint is rendered as an `EndpointBlock` with:

| Section | Description |
|---------|-------------|
| Header | Method badge (GET/POST/DELETE) + title + URL pill with method dot |
| Docs tab | Parameters table, request/response examples |
| Code tab | cURL, JavaScript, Python code samples |
| Test tab | Live input fields, file upload, Send Request button, response display |

```typescript
interface EndpointProps {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  title: string;
  description: string;
  params?: Param[];          // query/body parameters
  codeTabs?: CodeTab[];      // code samples
  testFields?: TestField[];  // input fields for test panel
  testEndpoint?: string;     // API path to call
  requiresAuth?: boolean;
}
```

### Page Hero

Every docs section page has a gradient hero banner:
- Background: `linear-gradient(180deg, red-glow 0%, transparent 100%)`
- Title: gradient text (`#e74c3c` → `#ff6b6b`)
- Subtitle: secondary text, centered, max-width 600px

### Sections

| Route | Section | Endpoints |
|-------|---------|-----------|
| `/docs` | Overview | Health check |
| `/docs/auth` | Authentication | Login, Signup, Refresh, Logout |
| `/docs/knowledgedbs` | Knowledge Bases | List, Create, Delete |
| `/docs/documents` | Documents | Upload, Generate, List, Get, Delete, Reindex |
| `/docs/images` | Images | Generate, Upload, List, Delete |
| `/docs/search` | Search | RAG Search |
| `/docs/subscription` | Subscription | Get, Usage, Checkout, Change, Cancel, Portal |
| `/docs/websocket` | WebSocket | Live test panel with connect/disconnect and streaming |

---

## Design System

### Color Tokens

```
Dark Mode (default):
  bg-primary:     #0a0a0f
  bg-secondary:   #12121a
  bg-tertiary:    #1a1a26
  bg-card:        #16161f
  bg-hover:       #1e1e2a
  border:         #2a2a3a
  border-light:   #3a3a4a
  text-primary:   #f0f0f5
  text-secondary: #a0a0b5
  text-muted:     #6a6a80
  accent:         #e74c3c (red)
  accent-light:   #ff6b6b (coral)
  green:          #2ecc71
  blue:           #3498db
  orange:         #f39c12

Light Mode:
  bg-primary:     #ffffff
  bg-secondary:   #f8f9fa
  bg-tertiary:    #f0f1f3
  bg-card:        #ffffff
  bg-hover:       #eef0f4
  border:         #e0e3e8
  border-light:   #d0d4da
  text-primary:   #1a1a2e
  text-secondary: #4a4a5a
  text-muted:     #8a8a9a
```

### Typography

| Usage | Font | Size |
|-------|------|------|
| Body | Inter | 14px |
| Brand/Logo | Orbitron | varies |
| Code | Fira Code / JetBrains Mono | 12–13px |
| Metadata | Inter | 11–12px |

### Theme Persistence

- `localStorage` key: `kdb_theme`
- Values: `"dark"` (default) or `"light"`
- Applied via `data-theme` attribute on `<html>`
- Shared across all sections: landing page, API docs, and console

### Gradient Language

- Primary accent gradient: `linear-gradient(135deg, #e74c3c, #ff6b6b)` (red → coral)
- Dark-to-accent gradient: `linear-gradient(135deg, #2c3e50, #e74c3c)` (used sparingly)
- Glow: `rgba(231, 76, 60, 0.15)` dark / `rgba(231, 76, 60, 0.08)` light

---

## Auth Flow

```
┌──────────┐     ┌──────────┐     ┌────────────────┐
│  /login  │────→│ POST     │────→│ Store tokens    │
│  /signup │     │ /auth/*  │     │ in localStorage │
└──────────┘     └──────────┘     └───────┬────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Redirect to   │
                                   │ /console      │
                                   └───────┬──────┘
                                           │
                                ┌──────────┴──────────┐
                                │ On 401 → try refresh │
                                │ On refresh fail →    │
                                │ redirect to /login   │
                                └─────────────────────┘
```

### Token Storage

| Key | Value |
|-----|-------|
| `kdb_id_token` | Cognito ID token (used for API auth + WebSocket) |
| `kdb_access_token` | Cognito access token |
| `kdb_refresh_token` | Refresh token for silent renewal |
| `kdb_api_key` | API key from subscription |
| `kdb_user` | JSON-serialized user object (firstName, lastName, email) |

Tokens are shared between Console and API Docs — logging in from either keeps the user authenticated across both.

---

## State Management (Zustand)

Three stores manage all client-side state:

### authStore

| Field | Type | Purpose |
|-------|------|---------|
| `user` | `User \| null` | Current user object |
| `isLoggedIn` | `boolean` | Auth status |
| `hydrate()` | method | Reads tokens from localStorage on mount |

### chatStore

| Field | Type | Purpose |
|-------|------|---------|
| `threads` | `Record<kbId, Message[]>` | Chat history per knowledge base |
| `isStreaming` | `boolean` | Locks UI during WebSocket streaming |
| `pagination` | `Record<kbId, PaginationInfo>` | Cursor + hasMore per KB |
| `addMessage()` | method | Appends message and persists |
| `appendToLastAssistant()` | method | Appends streaming chunk to last AI message |
| `clearThread()` | method | Removes a KB's chat history |

### kbStore

| Field | Type | Purpose |
|-------|------|---------|
| `knowledgeBases` | `KnowledgeBase[]` | All user's KBs |
| `activeKBId` | `string \| null` | Currently selected KB |
| `loading` | `boolean` | Fetch in progress |
| `fetchKnowledgeBases()` | method | GET `/knowledgedbs` |
| `createKnowledgeBase()` | method | POST `/knowledgedbs` |
| `deleteKnowledgeBase()` | method | DELETE `/knowledgedbs/{id}` |

---

## Subscription Integration

Plans are managed via Polar checkout, surfaced in the Settings page:

| Plan | Price | API Calls | KBs |
|------|-------|-----------|-----|
| Free | $0 | Limited | 1 |
| Starter | $29/mo | 10,000 | Multiple |
| Professional | $99/mo | 100,000 | Unlimited |
| Enterprise | Custom | Custom | Unlimited |

Subscription endpoints: GET `/subscription`, GET `/subscription/usage`, POST `/subscription/checkout`, POST `/subscription/change`, POST `/subscription/cancel`, POST `/subscription/portal`.

---

## Deployment

- **Platform:** AWS Amplify Console (SSR)
- **Domain:** knowledgedb.dev
- **Build:** `npm run build` (Next.js 15)
- **No static export** — dynamic routes (`/console/knowledge/[id]`) require server-side rendering
- Push to connected branch triggers automatic deployment

---

© 2026 Entropy AI Research Labs Pvt Ltd. All rights reserved.
