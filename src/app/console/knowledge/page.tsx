'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Database, Trash2, FileText, X } from 'lucide-react';
import { useKBStore } from '@/stores/kbStore';

export default function KnowledgePage() {
  const router = useRouter();
  const { knowledgeBases, loading, fetchKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase } = useKBStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchKnowledgeBases(); }, [fetchKnowledgeBases]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await createKnowledgeBase(name.trim(), description.trim() || undefined);
    setName(''); setDescription(''); setShowCreate(false); setCreating(false);
  };

  const handleDelete = async (id: string, kbName: string) => {
    if (confirm('Delete "' + kbName + '"? This will remove all documents in this knowledge base.')) {
      await deleteKnowledgeBase(id);
    }
  };

  return (
    <div className="max-w-[900px] w-full mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Knowledge Bases</h1>
          <p className="text-sm text-text-muted mt-1">Manage your knowledge bases and documents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-light text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Knowledge Base
        </button>
      </div>
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-card border border-border rounded-xl p-6 w-full max-w-[440px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Create Knowledge Base</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-bg-hover text-text-muted" aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="kb-name" className="block text-sm text-text-secondary mb-1.5">Name</label>
                <input id="kb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 placeholder:text-text-muted" placeholder="My Knowledge Base" />
              </div>
              <div>
                <label htmlFor="kb-desc" className="block text-sm text-text-secondary mb-1.5">Description (optional)</label>
                <textarea id="kb-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 resize-none placeholder:text-text-muted" placeholder="What is this knowledge base about?" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : knowledgeBases.length === 0 ? (
        <div className="text-center py-16">
          <Database size={48} className="mx-auto text-text-muted mb-4 opacity-40" />
          <p className="text-text-muted">No knowledge bases yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeBases.map((kb) => (
            <div key={kb.knowledgeDbId} className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-light transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-glow flex items-center justify-center"><Database size={20} className="text-accent" /></div>
                <button onClick={() => handleDelete(kb.knowledgeDbId, kb.name)}
                  className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" title="Delete" aria-label={'Delete ' + kb.name}>
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-medium text-text-primary text-sm mb-1">{kb.name}</h3>
              {kb.description && <p className="text-xs text-text-muted mb-3 line-clamp-2">{kb.description}</p>}
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><FileText size={12} /> {kb.documentCount || 0} docs</span>
              </div>
              <button onClick={() => router.push('/console/knowledge/' + kb.knowledgeDbId)}
                className="mt-3 w-full text-center text-xs text-accent hover:underline">Manage Documents →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
