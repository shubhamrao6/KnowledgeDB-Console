'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Settings, LogOut, ChevronLeft, ChevronRight, FolderPlus, LayoutGrid } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import { useKBStore } from '@/stores/kbStore';
import { useChatStore } from '@/stores/chatStore';
import { logout, clearTokens } from '@/lib/auth';

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const { knowledgeBases, activeKBId, setActiveKB, fetchKnowledgeBases, createKnowledgeBase } = useKBStore();
  const { threads } = useChatStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchKnowledgeBases();
  }, [isLoggedIn, fetchKnowledgeBases]);

  const handleSelectKB = (id: string) => {
    setActiveKB(id);
    router.push('/console/chat');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const kb = await createKnowledgeBase(newName.trim(), newDesc.trim() || undefined);
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
    setCreating(false);
    if (kb?.knowledgeDbId) {
      setActiveKB(kb.knowledgeDbId);
      router.push('/console/chat');
    }
  };

  const handleNewKB = () => {
    if (collapsed) onToggle();
    setShowCreate(true);
  };

  const handleLogout = async () => {
    try { await logout(); } catch (_e) { clearTokens(); }
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setLoggedIn(false);
    router.push('/login');
  };

  if (collapsed) {
    return (
      <div className="w-[60px] bg-bg-secondary border-r border-border flex flex-col items-center py-3 shrink-0 h-full">
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-bg-hover mb-3" aria-label="Expand sidebar" title="Expand sidebar">
          <Logo size={24} />
        </button>
        <button onClick={handleNewKB} className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary mb-2" aria-label="New Knowledge Base" title="New Knowledge Base">
          <FolderPlus size={20} />
        </button>
        <div className="w-6 border-t border-border my-1" />
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1 py-1">
          {knowledgeBases.map((kb) => (
            <button key={kb.knowledgeDbId} onClick={() => handleSelectKB(kb.knowledgeDbId)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                activeKBId === kb.knowledgeDbId ? 'bg-red-glow text-accent' : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
              }`} title={kb.name} aria-label={kb.name}>
              {kb.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 pt-2 border-t border-border mt-1">
          <ThemeToggle />
          <button onClick={() => router.push('/console')} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" title="Dashboard" aria-label="Dashboard"><LayoutGrid size={18} /></button>
          <button onClick={() => router.push('/console/knowledge')} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" title="Manage KBs" aria-label="Manage Knowledge Bases"><Database size={18} /></button>
          <button onClick={() => router.push('/console/settings')} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" title="Settings" aria-label="Settings"><Settings size={18} /></button>
          {isLoggedIn && <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" title="Logout" aria-label="Logout"><LogOut size={18} /></button>}
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" aria-label="Expand sidebar" title="Expand sidebar"><ChevronRight size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] bg-bg-secondary border-r border-border flex flex-col shrink-0 h-full">
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-sm text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
            KDB <span className="text-accent text-xs font-normal">Chat</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted" aria-label="Collapse sidebar"><ChevronLeft size={16} /></button>
        </div>
      </div>
      <div className="p-3">
        <button onClick={() => setShowCreate(true)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-bg-hover text-text-secondary text-sm transition-colors">
          <FolderPlus size={16} /> New Knowledge Base
        </button>
      </div>

      {showCreate && (
        <div className="px-3 pb-3">
          <form onSubmit={handleCreate} className="bg-bg-tertiary border border-border rounded-lg p-3 space-y-2">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Knowledge base name"
              className="w-full bg-bg-secondary border border-border rounded-md px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent/50 placeholder:text-text-muted" autoFocus required />
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="w-full bg-bg-secondary border border-border rounded-md px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent/50 placeholder:text-text-muted" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }} className="px-2.5 py-1 text-xs text-text-muted hover:text-text-secondary transition-colors">Cancel</button>
              <button type="submit" disabled={creating} className="px-2.5 py-1 text-xs bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity">{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-2 py-1">Knowledge Bases</div>
        {knowledgeBases.length === 0 ? (
          <p className="text-xs text-text-muted px-2 py-3">No knowledge bases yet</p>
        ) : (
          knowledgeBases.map((kb) => {
            const msgCount = (threads[kb.knowledgeDbId] || []).length;
            return (
              <button key={kb.knowledgeDbId} onClick={() => handleSelectKB(kb.knowledgeDbId)}
                className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                  activeKBId === kb.knowledgeDbId ? 'bg-red-glow text-accent' : 'text-text-secondary hover:bg-bg-hover'
                }`}>
                <Database size={14} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{kb.name}</span>
                  <span className="text-[10px] text-text-muted">{kb.documentCount || 0} docs{msgCount > 0 ? ' · ' + msgCount + ' msgs' : ''}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3 space-y-1">
        <button onClick={() => router.push('/console')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors">
          <LayoutGrid size={16} /> Dashboard
        </button>
        <button onClick={() => router.push('/console/knowledge')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors">
          <Database size={16} /> Manage KBs
          {knowledgeBases.length > 0 && <span className="ml-auto text-[11px] bg-bg-tertiary text-text-muted px-1.5 py-0.5 rounded">{knowledgeBases.length}</span>}
        </button>
        <button onClick={() => router.push('/console/settings')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors">
          <Settings size={16} /> Settings
        </button>
        {isLoggedIn && (
          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-semibold shrink-0">{user?.firstName?.[0] || 'U'}</div>
              <span className="text-sm text-text-secondary truncate">{user?.firstName || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted" title="Logout" aria-label="Logout"><LogOut size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
