'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Trash2, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useKBStore, Document } from '@/stores/kbStore';

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s === 'completed' || s === 'indexed' || s === 'ready') return <span className="flex items-center gap-1 text-xs text-green"><CheckCircle size={12} /> Ready</span>;
  if (s === 'processing' || s === 'indexing' || s === 'pending') return <span className="flex items-center gap-1 text-xs text-orange animate-pulse"><Clock size={12} /> Processing...</span>;
  if (s === 'failed' || s === 'error') return <span className="flex items-center gap-1 text-xs text-accent"><AlertCircle size={12} /> Failed</span>;
  return <span className="text-xs text-text-muted">{status}</span>;
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function KBDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kbId = params.id as string;
  const { knowledgeBases } = useKBStore();
  const kb = knowledgeBases.find((k) => k.knowledgeDbId === kbId);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const { data } = await apiRequest<{ documents: Document[] }>('GET', '/documents?knowledgeDbId=' + kbId);
      const docs = (data as { documents?: Document[] }).documents || [];
      setDocuments(docs);
      return docs;
    } catch (_e) { return []; }
  }, [kbId]);

  useEffect(() => {
    setLoading(true);
    fetchDocs().finally(() => setLoading(false));
  }, [fetchDocs]);

  useEffect(() => {
    const hasProcessing = documents.some((d) => {
      const s = d.status?.toLowerCase() || '';
      return s === 'processing' || s === 'indexing' || s === 'pending';
    });
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => { fetchDocs(); }, 5000);
    } else if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current); pollRef.current = null;
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, [documents, fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('knowledgeDbId', kbId);
      await apiRequest('POST', '/documents/upload', formData, true, true);
      await fetchDocs();
    } catch (_e) { /* ignore */ }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    await apiRequest('DELETE', '/documents/' + docId);
    setDocuments((d) => d.filter((doc) => doc.documentId !== docId));
  };

  const handleReindex = async (docId: string) => {
    await apiRequest('POST', '/documents/reindex', { documentId: docId });
    await fetchDocs();
  };

  return (
    <div className="max-w-[900px] w-full mx-auto px-6 py-8">
      <button onClick={() => router.push('/console/knowledge')}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Knowledge Bases
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{kb?.name || 'Knowledge Base'}</h1>
          {kb?.description && <p className="text-sm text-text-muted mt-1">{kb.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchDocs()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer transition-opacity">
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg" />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText size={48} className="mx-auto text-text-muted mb-4 opacity-40" />
          <p className="text-text-muted mb-2">No documents yet</p>
          <p className="text-xs text-text-muted">Upload PDFs, text files, images, or markdown documents</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.documentId} className="flex items-center justify-between bg-bg-card border border-border rounded-lg px-4 py-3 group hover:border-border-light transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-text-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">{doc.filename}</p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} />
                    {doc.fileSize ? <span className="text-[11px] text-text-muted">{formatSize(doc.fileSize)}</span> : null}
                    {doc.chunkCount ? <span className="text-[11px] text-text-muted">{doc.chunkCount} chunks</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleReindex(doc.documentId)} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted" title="Reindex" aria-label={'Reindex ' + doc.filename}><RefreshCw size={14} /></button>
                <button onClick={() => handleDelete(doc.documentId)} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted" title="Delete" aria-label={'Delete ' + doc.filename}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
