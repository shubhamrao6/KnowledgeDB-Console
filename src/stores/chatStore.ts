import { create } from 'zustand';

export const PAGE_SIZE = 10;

export interface Source {
  doc_id: string;
  title: string;
  chunk: string;
  score: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Source[];
}

interface PaginationInfo {
  cursor: number;
  hasMore: boolean;
}

interface ChatState {
  threads: Record<string, Message[]>;
  isStreaming: boolean;
  pagination: Record<string, PaginationInfo>;
  addMessage: (kbId: string, msg: Message) => void;
  appendToLastAssistant: (kbId: string, text: string) => void;
  updateLastAssistantMessage: (kbId: string, content: string, sources?: Source[]) => void;
  setStreaming: (val: boolean) => void;
  getMessages: (kbId: string) => Message[];
  loadThreads: () => void;
  saveThreads: () => void;
  clearThread: (kbId: string) => void;
  setThread: (kbId: string, messages: Message[]) => void;
  prependMessages: (kbId: string, messages: Message[]) => void;
  getPagination: (kbId: string) => PaginationInfo;
  setPagination: (kbId: string, info: Partial<PaginationInfo>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: {},
  isStreaming: false,
  pagination: {},

  addMessage: (kbId, msg) => {
    set((s) => ({ threads: { ...s.threads, [kbId]: [...(s.threads[kbId] || []), msg] } }));
    get().saveThreads();
  },

  appendToLastAssistant: (kbId, text) => {
    set((s) => {
      const msgs = [...(s.threads[kbId] || [])];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') msgs[msgs.length - 1] = { ...last, content: last.content + text };
      return { threads: { ...s.threads, [kbId]: msgs } };
    });
  },

  updateLastAssistantMessage: (kbId, content, sources) => {
    set((s) => {
      const msgs = [...(s.threads[kbId] || [])];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') msgs[msgs.length - 1] = { ...last, content, ...(sources ? { sources } : {}) };
      return { threads: { ...s.threads, [kbId]: msgs } };
    });
  },

  setStreaming: (val) => set({ isStreaming: val }),
  getMessages: (kbId) => get().threads[kbId] || [],

  loadThreads: () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('kdb_chat_threads');
    if (raw) { try { set({ threads: JSON.parse(raw) }); } catch (_e) { /* ignore */ } }
  },

  saveThreads: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('kdb_chat_threads', JSON.stringify(get().threads));
  },

  clearThread: (kbId) => {
    set((s) => {
      const threads = { ...s.threads }; delete threads[kbId];
      const pagination = { ...s.pagination }; delete pagination[kbId];
      return { threads, pagination };
    });
    get().saveThreads();
  },

  setThread: (kbId, messages) => {
    set((s) => ({ threads: { ...s.threads, [kbId]: messages } }));
    get().saveThreads();
  },

  prependMessages: (kbId, messages) => {
    set((s) => ({ threads: { ...s.threads, [kbId]: [...messages, ...(s.threads[kbId] || [])] } }));
    get().saveThreads();
  },

  getPagination: (kbId) => get().pagination[kbId] || { cursor: 0, hasMore: true },

  setPagination: (kbId, info) => {
    set((s) => ({ pagination: { ...s.pagination, [kbId]: { ...get().getPagination(kbId), ...info } } }));
  },
}));
