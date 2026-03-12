import Link from 'next/link';
import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'API Documentation - KnowledgeDB' };

const cards = [
  { href: '/docs/auth', title: 'Authentication', desc: 'Register, login, refresh tokens, and manage sessions. All API endpoints require a valid Bearer token.', badges: ['POST'], count: '4 endpoints' },
  { href: '/docs/knowledgedbs', title: 'Knowledge Bases', desc: 'Create and manage isolated knowledge containers. Each KnowledgeDB holds documents and images in its own namespace.', badges: ['POST', 'GET', 'DEL'] },
  { href: '/docs/documents', title: 'Documents', desc: 'Upload, generate, list, and manage documents. Supports PDF, DOCX, TXT, and Markdown with automatic AI indexing.', badges: ['POST', 'GET', 'DEL'], count: '6 endpoints' },
  { href: '/docs/search', title: 'RAG Search', desc: 'Ask natural language questions and receive AI-generated answers grounded in your uploaded documents with source citations.', badges: ['POST'] },
  { href: '/docs/images', title: 'Images', desc: 'Generate images with AI (Titan), upload existing images with automatic vision analysis, and manage your image library.', badges: ['POST', 'GET', 'DEL'], count: '7 endpoints' },
  { href: '/docs/websocket', title: 'WebSocket Chat', desc: 'Real-time streaming chat powered by Claude. Supports conversation history, model selection, and custom system prompts.', badges: [], count: 'WebSocket API' },
  { href: '/docs/subscription', title: 'Subscription', desc: 'Manage billing, checkout, plan changes, cancellations, and usage tracking. Powered by Polar for seamless payment processing.', badges: ['POST', 'GET'], count: '7 endpoints' },
];

const badgeColors: Record<string, string> = {
  POST: 'bg-blue/15 text-blue', GET: 'bg-green/15 text-green', DEL: 'bg-accent/15 text-accent',
};

export default function DocsOverviewPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>KnowledgeDB API</h1>
        <p>Build intelligent, RAG-powered applications with the KnowledgeDB REST API and WebSocket interface. Upload documents, create knowledge bases, search with AI, and chat in real time.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-12">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <div className="bg-bg-card border border-border rounded-lg px-4 py-3">
          <span className="text-[11px] text-text-muted uppercase tracking-wider">Base URL</span>
          <code className="block text-sm text-accent mt-1 font-mono">https://fgbpqt2pq6.execute-api.us-east-1.amazonaws.com/prod</code>
        </div>
        <div className="bg-bg-card border border-border rounded-lg px-4 py-3">
          <span className="text-[11px] text-text-muted uppercase tracking-wider">WebSocket</span>
          <code className="block text-sm text-accent mt-1 font-mono">wss://p417pa2mu2.execute-api.us-east-1.amazonaws.com/prod</code>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-10">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">⚡ Quick Start</h3>
        {[
          { step: '1', title: 'Create an account', desc: 'Register via POST /auth/signup with your email, password, first and last name.' },
          { step: '2', title: 'Authenticate', desc: 'Login via POST /auth/login to receive your idToken. Use it as a Bearer token for all subsequent requests.' },
          { step: '3', title: 'Create a Knowledge Base', desc: 'Use POST /knowledgedbs to create a container for your documents.' },
          { step: '4', title: 'Upload documents', desc: 'Upload PDF, DOCX, TXT, or MD files via POST /documents/upload. They\'re automatically indexed by the AI.' },
          { step: '5', title: 'Search with AI', desc: 'Ask natural language questions via POST /search and get AI-generated answers grounded in your documents.' },
        ].map((s) => (
          <div key={s.step} className="flex gap-4 mb-4 last:mb-0">
            <div className="w-7 h-7 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
            <div>
              <h4 className="text-sm font-medium text-text-primary">{s.title}</h4>
              <p className="text-xs text-text-secondary mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors no-underline group">
            <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">{c.title}</h3>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">{c.desc}</p>
            <div className="flex items-center gap-2">
              {c.badges.map((b) => (
                <span key={b} className={`method-badge ${badgeColors[b] || ''}`}>{b}</span>
              ))}
              {c.count && <span className="text-[11px] text-text-muted">{c.count}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Auth banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-6">
        <p className="text-sm text-text-secondary">
          🔑 All API endpoints (except <code className="text-accent">/auth/signup</code>, <code className="text-accent">/auth/login</code>, and <code className="text-accent">/health</code>) require authentication.
          Include your <code className="text-accent">idToken</code> in the <code className="text-accent">Authorization: Bearer &lt;token&gt;</code> header.
          Endpoints for documents, images, knowledge bases, and search also require the <code className="text-accent">x-api-key</code> header returned from login.
          Tokens expire after 1 hour — use the refresh endpoint to get new ones.
        </p>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-5 mb-10">
        <p className="text-sm text-text-secondary">
          ℹ️ Responses use standard HTTP status codes. <code className="text-accent">200</code> for success, <code className="text-accent">201</code> for created, <code className="text-accent">400</code> for bad request, <code className="text-accent">401</code> for unauthorized, <code className="text-accent">404</code> for not found, and <code className="text-accent">500</code> for server errors. All responses are JSON.
        </p>
      </div>

      {/* Health Check */}
      <EndpointBlock method="GET" title="Health Check" path="/health" id="health"
        description="Simple health check endpoint to verify the API is running. Does not require authentication."
        requiresAuth={false}
        responseFields={[
          { name: 'status', type: 'string', desc: 'Always "healthy".' },
        ]}
        codeTabs={[
          { label: 'Response', content: '// GET /health — no auth required\n{\n  "status": "healthy"\n}' },
        ]}
        testFields={[]}
      />
    </div>
    </div>
  );
}
