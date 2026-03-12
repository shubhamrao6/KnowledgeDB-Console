import { create } from 'zustand';
import { apiRequest } from '@/lib/api';

export interface KnowledgeBase {
  knowledgeDbId: string;
  name: string;
  description?: string;
  documentCount?: number;
  namespace?: string;
  createdAt?: string;
}

export interface Document {
  documentId: string;
  knowledgeDbId: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  chunkCount?: number;
  status: string;
  createdAt?: string;
}

interface KBState {
  knowledgeBases: KnowledgeBase[];
  activeKBId: string | null;
  loading: boolean;
  setActiveKB: (id: string | null) => void;
  fetchKnowledgeBases: () => Promise<void>;
  createKnowledgeBase: (name: string, description?: string) => Promise<KnowledgeBase | null>;
  deleteKnowledgeBase: (id: string) => Promise<void>;
}

export const useKBStore = create<KBState>((set, get) => ({
  knowledgeBases: [],
  activeKBId: null,
  loading: false,

  setActiveKB: (id) => set({ activeKBId: id }),

  fetchKnowledgeBases: async () => {
    set({ loading: true });
    try {
      const { data } = await apiRequest<{ knowledgedbs: KnowledgeBase[]; count: number }>('GET', '/knowledgedbs');
      const kbs = (data as { knowledgedbs?: KnowledgeBase[] }).knowledgedbs || [];
      set({ knowledgeBases: kbs });
    } catch (_e) { /* ignore */ }
    set({ loading: false });
  },

  createKnowledgeBase: async (name, description) => {
    try {
      const { data } = await apiRequest<KnowledgeBase>('POST', '/knowledgedbs', { name, description });
      await get().fetchKnowledgeBases();
      return data as KnowledgeBase;
    } catch (_e) {
      return null;
    }
  },

  deleteKnowledgeBase: async (id) => {
    await apiRequest('DELETE', '/knowledgedbs/' + id);
    set((s) => ({
      knowledgeBases: s.knowledgeBases.filter((kb) => kb.knowledgeDbId !== id),
      activeKBId: s.activeKBId === id ? null : s.activeKBId,
    }));
  },
}));
