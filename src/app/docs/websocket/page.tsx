'use client';

import { useState, useRef, useCallback } from 'react';

interface WsMessage {
  direction: 'sent' | 'received' | 'system' | 'error';
  text: string;
  time: string;
}

const WS_BASE = 'wss://p417pa2mu2.execute-api.us-east-1.amazonaws.com/prod';

export default function WebSocketDocsPage() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [kbId, setKbId] = useState('');
  const [token, setToken] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamBuf = useRef('');

  const now = () => new Date().toLocaleTimeString();

  const addMsg = useCallback((msg: WsMessage) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const connect = () => {
    const t = token || localStorage.getItem('kdb_id_token') || '';
    if (!t) { addMsg({ direction: 'error', text: 'No token provided. Login first or paste your idToken.', time: now() }); return; }
    addMsg({ direction: 'system', text: 'Connecting...', time: now() });
    const ws = new WebSocket(WS_BASE + '?token=' + t);
    ws.onopen = () => { setConnected(true); addMsg({ direction: 'system', text: 'Connected', time: now() }); };
    ws.onclose = () => { setConnected(false); addMsg({ direction: 'system', text: 'Disconnected', time: now() }); };
    ws.onerror = () => { addMsg({ direction: 'error', text: 'Connection error', time: now() }); };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'start') {
          streamBuf.current = '';
          addMsg({ direction: 'system', text: '--- AI response start ---', time: now() });
        } else if (data.type === 'chunk') {
          streamBuf.current += data.text || '';
        } else if (data.type === 'end') {
          addMsg({ direction: 'received', text: streamBuf.current || '(empty response)', time: now() });
          streamBuf.current = '';
        } else if (data.type === 'error') {
          addMsg({ direction: 'error', text: data.error || 'Unknown error', time: now() });
        } else {
          addMsg({ direction: 'received', text: JSON.stringify(data, null, 2), time: now() });
        }
      } catch (_e) {
        addMsg({ direction: 'received', text: e.data, time: now() });
      }
    };
    wsRef.current = ws;
  };

  const disconnect = () => { wsRef.current?.close(); wsRef.current = null; };

  const send = () => {
    if (!wsRef.current || !question.trim()) return;
    const payload = { action: 'sendMessage', question: question.trim(), knowledgeDbId: kbId || undefined, model_id: 'basic' };
    wsRef.current.send(JSON.stringify(payload));
    addMsg({ direction: 'sent', text: question.trim(), time: now() });
    setQuestion('');
  };

  return (
    <div>
      <div className="page-hero">
        <h1>WebSocket Chat</h1>
        <p>Real-time streaming chat powered by Claude. Supports conversation history, model selection, and custom system prompts.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <div className="bg-bg-card border border-border rounded-lg px-4 py-3 mb-6">
          <span className="text-[11px] text-text-muted uppercase tracking-wider">WebSocket URL</span>
          <div className="endpoint-url mt-2 w-full">
            <span className="endpoint-method-dot bg-blue" />
            <code>wss://p417pa2mu2.execute-api.us-east-1.amazonaws.com/prod?token=&lt;idToken&gt;</code>
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-8 text-sm text-text-secondary">
          🔑 Connect by appending your <code className="text-accent">idToken</code> as a query parameter: <code className="text-accent">?token=&lt;idToken&gt;</code>
        </div>

        {/* Send Message docs */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Send Message</h2>
          <div className="endpoint-block">
            <div className="endpoint-header">
              <span className="method-badge bg-blue/15 text-blue border border-blue/20">SEND</span>
              <h3 className="text-[15px] font-semibold text-text-primary">sendMessage</h3>
              <div className="endpoint-url">
                <span className="endpoint-method-dot bg-blue" />
                <code>WebSocket</code>
              </div>
            </div>
            <div className="endpoint-body">
              <div className="endpoint-docs">
                <p className="text-sm text-text-secondary mb-4">Send a chat message to get a streaming AI response.</p>
                <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Payload</h4>
                <div className="space-y-2 mb-4">
                  {[
                    { name: 'action', desc: '"sendMessage"' },
                    { name: 'question', desc: "The user's message/question" },
                    { name: 'knowledgeDbId', desc: 'Knowledge base context' },
                    { name: 'model_id', desc: '"basic" (default model)' },
                    { name: 'system_prompt', desc: 'Optional system prompt' },
                  ].map((f) => (
                    <div key={f.name} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                      <code className="text-xs text-accent font-mono shrink-0 bg-accent/5 px-2 py-0.5 rounded">{f.name}</code>
                      <span className="text-xs text-text-secondary">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="endpoint-code">
                <pre className="p-4 text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre leading-relaxed flex-1">{`// Send message
{
  "action": "sendMessage",
  "question": "What are the key findings?",
  "knowledgeDbId": "kb_abc123",
  "model_id": "basic"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Response Events */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Response Events</h2>
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            {[
              { type: 'start', desc: 'AI has started generating a response.', example: '{ "type": "start" }' },
              { type: 'chunk', desc: 'A piece of the streaming response text.', example: '{ "type": "chunk", "text": "Based on..." }' },
              { type: 'end', desc: 'The response is complete.', example: '{ "type": "end" }' },
              { type: 'error', desc: 'An error occurred during processing.', example: '{ "type": "error", "error": "Rate limit" }' },
              { type: 'history', desc: 'Response to load_history action.', example: '{ "type": "history", "messages": [...] }' },
              { type: 'clear_complete', desc: 'Conversation history was cleared.', example: '{ "type": "clear_complete" }' },
            ].map((evt) => (
              <div key={evt.type} className="flex gap-4">
                <code className="text-xs text-accent font-mono shrink-0 w-28 bg-accent/5 px-2 py-0.5 rounded h-fit">{evt.type}</code>
                <div>
                  <p className="text-xs text-text-secondary">{evt.desc}</p>
                  <pre className="text-[11px] text-text-muted font-mono mt-1">{evt.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Actions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Other Actions</h2>
          <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-1">load_history</h4>
              <p className="text-xs text-text-secondary mb-2">Load conversation history with pagination.</p>
              <pre className="text-[11px] text-text-muted font-mono bg-bg-tertiary rounded-lg p-3">{`{ "action": "load_history", "knowledgeDbId": "kb_abc123", "start": 0, "end": 50 }`}</pre>
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-1">clear_conversation</h4>
              <p className="text-xs text-text-secondary mb-2">Clear all conversation history for a knowledge base.</p>
              <pre className="text-[11px] text-text-muted font-mono bg-bg-tertiary rounded-lg p-3">{`{ "action": "clear_conversation", "knowledgeDbId": "kb_abc123" }`}</pre>
            </div>
          </div>
        </section>

        {/* Live Test Panel */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Live Test</h2>
          <div className="ws-test-panel">
            <div className="ws-test-header">
              <span className={'w-3 h-3 rounded-full ' + (connected ? 'bg-green' : 'bg-text-muted')} />
              <span className="text-sm font-medium text-text-primary">{connected ? 'Connected' : 'Disconnected'}</span>
              <div className="ml-auto flex gap-2">
                {!connected ? (
                  <button onClick={connect} className="px-4 py-1.5 bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">Connect</button>
                ) : (
                  <button onClick={disconnect} className="px-4 py-1.5 bg-bg-tertiary border border-border text-text-secondary text-xs font-medium rounded-lg hover:border-accent transition-colors">Disconnect</button>
                )}
              </div>
            </div>
            <div className="ws-test-body space-y-4">
              {!connected && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">idToken (optional if logged in)</label>
                  <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your idToken here..."
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none" />
                </div>
              )}
              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Knowledge Base ID (optional)</label>
                <input type="text" value={kbId} onChange={(e) => setKbId(e.target.value)} placeholder="kb_abc123"
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type a message..."
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                  className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none"
                  disabled={!connected} />
                <button onClick={send} disabled={!connected || !question.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                  Send
                </button>
              </div>
              <div className="ws-messages">
                {messages.length === 0 && <div className="text-text-muted text-xs italic">No messages yet. Connect and send a message to start.</div>}
                {messages.map((m, i) => (
                  <div key={i} className={'ws-msg ' + m.direction}>
                    <span className="text-text-muted text-[10px] mr-2">[{m.time}]</span>
                    {m.direction === 'sent' && <span className="text-blue mr-1">→</span>}
                    {m.direction === 'received' && <span className="text-green mr-1">←</span>}
                    {m.direction === 'error' && <span className="text-accent mr-1">✕</span>}
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
