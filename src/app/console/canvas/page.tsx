'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  ArrowLeft, Play, Save, Plus, Trash2, X,
  Brain, FileText, MessageCircle, Database, Search,
  Filter, GitBranch, Zap, Settings, ChevronRight,
} from 'lucide-react';

interface CanvasNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  config: Record<string, string>;
}

interface Connection {
  from: string;
  to: string;
}

const NODE_TYPES = [
  { type: 'input', label: 'User Input', icon: MessageCircle, category: 'Input', desc: 'Accepts user text input' },
  { type: 'document', label: 'Document Loader', icon: FileText, category: 'Input', desc: 'Load documents from a knowledge base' },
  { type: 'llm', label: 'LLM Model', icon: Brain, category: 'Processing', desc: 'Process text with a language model' },
  { type: 'search', label: 'RAG Search', icon: Search, category: 'Processing', desc: 'Search knowledge base with vector similarity' },
  { type: 'filter', label: 'Filter', icon: Filter, category: 'Processing', desc: 'Filter and transform data' },
  { type: 'branch', label: 'Conditional', icon: GitBranch, category: 'Logic', desc: 'Branch based on conditions' },
  { type: 'knowledgedb', label: 'Knowledge Base', icon: Database, category: 'Data', desc: 'Connect to a KnowledgeDB instance' },
  { type: 'output', label: 'Output', icon: Zap, category: 'Output', desc: 'Final output of the workflow' },
];

const TEMPLATES = [
  { name: 'RAG Chatbot', nodes: ['input', 'knowledgedb', 'search', 'llm', 'output'] },
  { name: 'Document Q&A', nodes: ['document', 'search', 'llm', 'output'] },
  { name: 'Content Generator', nodes: ['input', 'llm', 'filter', 'output'] },
];

let nextId = 1;

export default function CanvasPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runLog, setRunLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const justInteracted = useRef(false);

  const addNode = useCallback((type: string) => {
    const def = NODE_TYPES.find((n) => n.type === type);
    if (!def) return;
    const id = 'node_' + nextId++;
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    setNodes((prev) => [...prev, { id, type, label: def.label, x, y, config: {} }]);
    setSelected(id);
  }, []);

  const addNodeAt = useCallback((type: string, x: number, y: number) => {
    const def = NODE_TYPES.find((n) => n.type === type);
    if (!def) return;
    const id = 'node_' + nextId++;
    setNodes((prev) => [...prev, { id, type, label: def.label, x, y, config: {} }]);
    setSelected(id);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (selected === id) setSelected(null);
  }, [selected]);

  const loadTemplate = useCallback((tpl: typeof TEMPLATES[0]) => {
    const newNodes: CanvasNode[] = tpl.nodes.map((type, i) => {
      const def = NODE_TYPES.find((n) => n.type === type);
      return { id: 'node_' + nextId++, type, label: def?.label || type, x: 120 + i * 180, y: 150 + (i % 2) * 80, config: {} };
    });
    const newConns: Connection[] = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      newConns.push({ from: newNodes[i].id, to: newNodes[i + 1].id });
    }
    setNodes(newNodes);
    setConnections(newConns);
    setSelected(null);
  }, []);

  const handleCanvasMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (connecting) {
      if (connecting !== nodeId) {
        setConnections((prev) => {
          if (prev.some((c) => c.from === connecting && c.to === nodeId)) return prev;
          return [...prev, { from: connecting, to: nodeId }];
        });
      }
      setConnecting(null);
      return;
    }
    setSelected(nodeId);
    setDragging(nodeId);
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    justInteracted.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setNodes((prev) => prev.map((n) => n.id === dragging ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : n));
  };

  const handleMouseUp = () => { setDragging(null); };

  const runWorkflow = async () => {
    setRunning(true);
    setShowLog(true);
    setRunLog(['Starting workflow...']);
    // Fake execution
    for (const node of nodes) {
      await new Promise((r) => setTimeout(r, 600));
      setRunLog((prev) => [...prev, 'Executing: ' + node.label + ' (' + node.type + ')']);
    }
    await new Promise((r) => setTimeout(r, 400));
    setRunLog((prev) => [...prev, '', 'Workflow completed successfully.', 'Output: "Based on the documents in your knowledge base, the key findings suggest that..."']);
    setRunning(false);
  };

  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-[48px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/console')} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted transition-colors" aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <Logo size={22} />
          <span className="font-semibold text-sm text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
            KDB <span className="text-orange text-xs font-normal">Canvas</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange bg-orange/10 border border-orange/20 px-2 py-0.5 rounded-full">Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runWorkflow} disabled={running || nodes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-accent to-accent-light text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
            <Play size={12} /> {running ? 'Running...' : 'Run'}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border text-text-secondary rounded-lg hover:bg-bg-hover transition-colors">
            <Save size={12} /> Save
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component palette */}
        <div className="w-[220px] bg-bg-secondary border-r border-border flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-border">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Components</span>
          </div>
          <div className="p-2 space-y-0.5">
            {NODE_TYPES.map((nt) => {
              const Icon = nt.icon;
              return (
                <button key={nt.type} onClick={() => addNode(nt.type)}
                  draggable onDragStart={(e) => e.dataTransfer.setData('nodeType', nt.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors text-left cursor-grab active:cursor-grabbing">
                  <Icon size={15} className="text-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{nt.label}</div>
                    <div className="text-[10px] text-text-muted truncate">{nt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-border mt-auto">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">Templates</span>
            {TEMPLATES.map((tpl) => (
              <button key={tpl.name} onClick={() => loadTemplate(tpl)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-bg-hover transition-colors mb-0.5">
                {tpl.name} <ChevronRight size={12} className="text-text-muted" />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden bg-bg-primary"
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('nodeType');
            if (!type) return;
            const rect = e.currentTarget.getBoundingClientRect();
            addNodeAt(type, e.clientX - rect.left - 80, e.clientY - rect.top - 30);
          }}
          onClick={() => { if (justInteracted.current) { justInteracted.current = false; return; } setSelected(null); setConnecting(null); }}>
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.8" fill="var(--color-border)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((c, i) => {
              const fromNode = nodes.find((n) => n.id === c.from);
              const toNode = nodes.find((n) => n.id === c.to);
              if (!fromNode || !toNode) return null;
              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 80;
              const y2 = toNode.y + 30;
              const mx = (x1 + x2) / 2;
              return (
                <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.5" />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const def = NODE_TYPES.find((nt) => nt.type === node.type);
            const Icon = def?.icon || Zap;
            const isSelected = selected === node.id;
            const isConnSource = connecting === node.id;
            return (
              <div key={node.id} className={`absolute cursor-move select-none ${isSelected ? 'z-20' : 'z-10'}`}
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => handleCanvasMouseDown(node.id, e)}>
                <div className={`w-[160px] bg-bg-card border rounded-xl shadow-lg transition-colors ${isSelected ? 'border-accent shadow-accent/10' : isConnSource ? 'border-blue' : 'border-border hover:border-border-light'}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
                    <Icon size={14} className="text-accent shrink-0" />
                    <span className="text-xs font-medium text-text-primary truncate">{node.label}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{def?.category}</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setConnecting(node.id); }}
                        className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-blue hover:bg-blue/10 transition-colors" title="Connect">
                        <Plus size={10} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Delete">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center flex flex-col items-center">
                <Logo size={40} />
                <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">Start Building</h3>
                <p className="text-sm text-text-secondary mb-4 max-w-[300px]">Drag components from the left panel or pick a template to get started.</p>
              </div>
            </div>
          )}

          {/* Connecting hint */}
          {connecting && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-blue/10 border border-blue/30 text-blue text-xs px-3 py-1.5 rounded-full">
              Click a node to connect, or click canvas to cancel
            </div>
          )}
        </div>

        {/* Right: Properties panel */}
        {selectedNode && (
          <div className="w-[240px] bg-bg-secondary border-l border-border flex flex-col shrink-0">
            <div className="h-[44px] flex items-center justify-between px-4 border-b border-border">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Properties</span>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-bg-hover text-text-muted"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Label</label>
                <input type="text" value={selectedNode.label}
                  onChange={(e) => setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, label: e.target.value } : n))}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-accent/50 focus:outline-none" />
              </div>
              {selectedNode.type === 'llm' && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Model</label>
                  <select className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-accent/50 focus:outline-none"
                    value={selectedNode.config.model || 'claude-3'}
                    onChange={(e) => setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, config: { ...n.config, model: e.target.value } } : n))}>
                    <option value="claude-3">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="llama-3">Llama 3</option>
                  </select>
                </div>
              )}
              {selectedNode.type === 'llm' && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">System Prompt</label>
                  <textarea className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-accent/50 focus:outline-none resize-none h-20"
                    placeholder="You are a helpful assistant..."
                    value={selectedNode.config.systemPrompt || ''}
                    onChange={(e) => setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, config: { ...n.config, systemPrompt: e.target.value } } : n))} />
                </div>
              )}
              {selectedNode.type === 'search' && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Top K Results</label>
                  <input type="number" className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-accent/50 focus:outline-none"
                    value={selectedNode.config.topK || '5'} min="1" max="20"
                    onChange={(e) => setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, config: { ...n.config, topK: e.target.value } } : n))} />
                </div>
              )}
              {selectedNode.type === 'knowledgedb' && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Knowledge Base ID</label>
                  <input type="text" className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none"
                    placeholder="kb_abc123"
                    value={selectedNode.config.kbId || ''}
                    onChange={(e) => setNodes((prev) => prev.map((n) => n.id === selectedNode.id ? { ...n, config: { ...n.config, kbId: e.target.value } } : n))} />
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  <Settings size={12} /> <span>Type: {selectedNode.type}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1">
                  <span>Connections: {connections.filter((c) => c.from === selectedNode.id || c.to === selectedNode.id).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Run log panel */}
      {showLog && (
        <div className="h-[180px] border-t border-border bg-bg-secondary shrink-0 flex flex-col">
          <div className="h-[36px] flex items-center justify-between px-4 border-b border-border">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Execution Log</span>
            <button onClick={() => setShowLog(false)} className="p-1 rounded hover:bg-bg-hover text-text-muted"><X size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {runLog.map((line, i) => (
              <div key={i} className={line.startsWith('Output:') ? 'text-green' : line.includes('completed') ? 'text-accent' : 'text-text-secondary'}>
                {line || '\u00A0'}
              </div>
            ))}
            {running && <div className="text-orange animate-pulse">Processing...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
