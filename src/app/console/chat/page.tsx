'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Database, Trash2, ArrowDown } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/chat/EmptyState';
import { useChatStore, PAGE_SIZE } from '@/stores/chatStore';
import { useKBStore } from '@/stores/kbStore';
import { ChatWebSocket, WSMessage } from '@/lib/websocket';
import { apiRequest } from '@/lib/api';

export default function ChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const activeKBRef = useRef<string | null>(null);
  const loadTypeRef = useRef<'initial' | 'older'>('initial');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const {
    threads, isStreaming,
    addMessage, appendToLastAssistant,
    updateLastAssistantMessage, setStreaming,
    setThread, prependMessages, clearThread,
    getPagination, setPagination,
  } = useChatStore();
  const { activeKBId, knowledgeBases } = useKBStore();

  const activeKB = knowledgeBases.find((kb) => kb.knowledgeDbId === activeKBId);
  const messages = activeKBId ? (threads[activeKBId] || []) : [];
  const isEmpty = messages.length === 0 && !loadingHistory;
  const pag = activeKBId ? getPagination(activeKBId) : { cursor: 0, hasMore: true };
  activeKBRef.current = activeKBId;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
  }, []);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => { if (isNearBottom()) scrollToBottom(); }, [messages.length, scrollToBottom, isNearBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 400);
  }, []);

  const sendLoadHistory = useCallback((kbId: string, start: number, end: number) => {
    wsRef.current?.send({ action: 'load_history', knowledgeDbId: kbId, start, end });
  }, []);

  const handleScrollForPagination = useCallback(() => {
    handleScroll();
    const el = scrollRef.current;
    if (!el || loadingHistory || isStreaming) return;
    const kbId = activeKBRef.current;
    if (!kbId) return;
    const { cursor, hasMore } = useChatStore.getState().getPagination(kbId);
    if (!hasMore) return;
    if (el.scrollTop < 50 && cursor > 0) {
      setLoadingHistory(true);
      loadTypeRef.current = 'older';
      sendLoadHistory(kbId, cursor, cursor + PAGE_SIZE);
    }
  }, [loadingHistory, isStreaming, handleScroll, sendLoadHistory]);

  const toMessages = useCallback((raw: Array<{ role: string; content: string; timestamp: string }>, offset: number) => {
    return raw.map((m, i) => ({
      id: 'hist_' + (offset + i) + '_' + Date.now(),
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
    }));
  }, []);

  useEffect(() => {
    const handleWSMessage = (msg: WSMessage) => {
      const kbId = activeKBRef.current;
      if (!kbId) return;
      if (msg.type === 'start') { scrollToBottom(); }
      else if (msg.type === 'chunk') { appendToLastAssistant(kbId, msg.text); scrollToBottom(); }
      else if (msg.type === 'end') { setStreaming(false); useChatStore.getState().saveThreads(); scrollToBottom(); }
      else if (msg.type === 'error') { updateLastAssistantMessage(kbId, 'Sorry, an error occurred: ' + msg.error); setStreaming(false); useChatStore.getState().saveThreads(); setLoadingHistory(false); }
      else if (msg.type === 'history') {
        const items = msg.messages || [];
        const isOlder = loadTypeRef.current === 'older';
        const { cursor } = useChatStore.getState().getPagination(kbId);
        if (isOlder) {
          const el = scrollRef.current;
          const prevHeight = el?.scrollHeight || 0;
          prependMessages(kbId, toMessages(items, cursor));
          setPagination(kbId, { cursor: cursor + items.length, hasMore: items.length >= PAGE_SIZE });
          requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prevHeight; });
        } else {
          setThread(kbId, toMessages(items, 0));
          setPagination(kbId, { cursor: items.length, hasMore: items.length >= PAGE_SIZE });
          scrollToBottom();
        }
        setLoadingHistory(false);
      } else if (msg.type === 'clear_complete') { clearThread(kbId); setClearing(false); }
    };

    const ws = new ChatWebSocket({
      onMessage: handleWSMessage,
      onClose: () => {
        if (useChatStore.getState().isStreaming) {
          const kbId = activeKBRef.current;
          if (kbId) {
            const msgs = useChatStore.getState().threads[kbId] || [];
            const last = msgs[msgs.length - 1];
            if (last?.role === 'assistant' && !last.content) updateLastAssistantMessage(kbId, 'Connection lost. Please try again.');
          }
          setStreaming(false);
          useChatStore.getState().saveThreads();
        }
        setLoadingHistory(false);
        setClearing(false);
      },
    });
    ws.connect();
    wsRef.current = ws;
    return () => { ws.disconnect(); wsRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeKBId) return;
    const { cursor } = useChatStore.getState().getPagination(activeKBId);
    if (cursor > 0) return;
    const doLoad = () => {
      if (!wsRef.current?.connected) return false;
      setLoadingHistory(true);
      loadTypeRef.current = 'initial';
      sendLoadHistory(activeKBId, 0, PAGE_SIZE);
      return true;
    };
    if (!doLoad()) {
      const timer = setTimeout(() => { if (activeKBRef.current === activeKBId) doLoad(); }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKBId]);

  const handleSend = useCallback(async (text: string) => {
    if (!activeKBId) return;
    addMessage(activeKBId, { id: 'msg_' + Date.now(), role: 'user', content: text, timestamp: Date.now() });
    addMessage(activeKBId, { id: 'msg_' + (Date.now() + 1), role: 'assistant', content: '', timestamp: Date.now() });
    setStreaming(true);
    scrollToBottom();

    // Pre-fetch RAG context via /search before sending to WebSocket
    let ragContext: string | undefined;
    try {
      const { status, data } = await apiRequest<{ answer?: string; sources?: Array<{ title: string; score: number; chunk: string }> }>(
        'POST', '/search', { question: text, knowledge_db: activeKBId, top_k: 5 }
      );
      console.log('[Chat] /search response:', { status, data });
      if (status >= 200 && status < 300 && data.sources?.length) {
        ragContext = data.sources.map((s) => `[${s.title}] (score: ${s.score})\n${s.chunk}`).join('\n\n');
      }
    } catch { /* proceed without context */ }

    console.log('[Chat] RAG context:', ragContext ? ragContext.substring(0, 200) + '...' : 'none');

    const payload: { action: string; [key: string]: unknown } = { action: 'sendMessage', question: text, knowledgeDbId: activeKBId, model_id: 'basic', system_prompt: ragContext
      ? `You are a helpful assistant. Use the following context from the user's knowledge base to answer their question. If the context is not relevant, you may ignore it.\n\n---\n${ragContext}\n---`
      : 'You are a helpful assistant' };

    console.log('[Chat] WebSocket payload:', JSON.stringify(payload, null, 2));

    if (!wsRef.current?.connected) {
      wsRef.current?.connect();
      setTimeout(() => {
        const sent = wsRef.current?.send(payload);
        if (!sent) { updateLastAssistantMessage(activeKBId, 'Could not connect. Please refresh and try again.'); setStreaming(false); }
      }, 1500);
      return;
    }
    const sent = wsRef.current.send(payload);
    if (!sent) { updateLastAssistantMessage(activeKBId, 'Could not send message. Check your connection.'); setStreaming(false); }
  }, [activeKBId, addMessage, setStreaming, updateLastAssistantMessage, scrollToBottom]);

  const handleClearHistory = useCallback(() => {
    if (!activeKBId || isStreaming || clearing) return;
    if (!confirm('Clear all conversation history for this knowledge base? This cannot be undone.')) return;
    setClearing(true);
    if (!wsRef.current?.connected) { clearThread(activeKBId); setClearing(false); return; }
    const sent = wsRef.current.send({ action: 'clear_conversation', knowledgeDbId: activeKBId });
    if (!sent) { clearThread(activeKBId); setClearing(false); }
  }, [activeKBId, isStreaming, clearing, clearThread]);

  const handleStop = useCallback(() => {
    wsRef.current?.disconnect();
    setStreaming(false);
    useChatStore.getState().saveThreads();
    setTimeout(() => {
      const ws = new ChatWebSocket({
        onMessage: (msg: WSMessage) => {
          const kbId = activeKBRef.current;
          if (!kbId) return;
          if (msg.type === 'chunk') { appendToLastAssistant(kbId, msg.text); scrollToBottom(); }
          else if (msg.type === 'end') { setStreaming(false); useChatStore.getState().saveThreads(); }
          else if (msg.type === 'error') { updateLastAssistantMessage(kbId, 'Error: ' + msg.error); setStreaming(false); }
          else if (msg.type === 'history') {
            const items = msg.messages || [];
            const isOlder = loadTypeRef.current === 'older';
            const { cursor } = useChatStore.getState().getPagination(kbId);
            if (isOlder) {
              const el = scrollRef.current;
              const prevHeight = el?.scrollHeight || 0;
              prependMessages(kbId, toMessages(items, cursor));
              setPagination(kbId, { cursor: cursor + items.length, hasMore: items.length >= PAGE_SIZE });
              requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prevHeight; });
            } else {
              setThread(kbId, toMessages(items, 0));
              setPagination(kbId, { cursor: items.length, hasMore: items.length >= PAGE_SIZE });
              scrollToBottom();
            }
            setLoadingHistory(false);
          } else if (msg.type === 'clear_complete') { if (kbId) clearThread(kbId); setClearing(false); }
        },
      });
      ws.connect();
      wsRef.current = ws;
    }, 500);
  }, [setStreaming, appendToLastAssistant, updateLastAssistantMessage, scrollToBottom, prependMessages, setThread, setPagination, clearThread, toMessages]);

  const handleSuggestion = useCallback((text: string) => { handleSend(text); }, [handleSend]);

  if (!activeKBId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-6 opacity-40"><Database size={48} className="text-text-muted" /></div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Select a Knowledge Base</h2>
        <p className="text-sm text-text-muted text-center max-w-sm">Choose a knowledge base from the sidebar to start chatting, or create a new one.</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-[48px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center">
          <Database size={16} className="text-accent mr-2" />
          <span className="text-sm font-medium text-text-primary">{activeKB?.name || 'Knowledge Base'}</span>
          <span className="text-xs text-text-muted ml-2">{activeKB?.documentCount || 0} docs</span>
        </div>
        <button onClick={handleClearHistory} disabled={clearing || isStreaming || isEmpty}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear conversation history" aria-label="Clear conversation history">
          <Trash2 size={14} /> {clearing ? 'Clearing...' : 'Clear'}
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div ref={scrollRef} onScroll={handleScrollForPagination} className="h-full overflow-y-auto">
          {loadingHistory && messages.length > 0 && <div className="flex justify-center py-3"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}
          {!pag.hasMore && messages.length > 0 && <div className="text-center py-3"><span className="text-[11px] text-text-muted">Beginning of conversation</span></div>}
          {loadingHistory && isEmpty ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : isEmpty ? (
            <EmptyState onSuggestion={handleSuggestion} />
          ) : (
            <div className="max-w-[800px] mx-auto py-4 px-4">
              {messages.map((msg, i) => (
                <ChatMessage key={msg.id} message={msg} isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'} />
              ))}
            </div>
          )}
        </div>
        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-bg-card border border-border shadow-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent/50 transition-colors z-10"
            title="Scroll to latest" aria-label="Scroll to latest message"><ArrowDown size={18} /></button>
        )}
      </div>
      <ChatInput onSend={handleSend} onStop={handleStop} />
    </>
  );
}
