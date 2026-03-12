'use client';

import { Copy, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Logo from '@/components/layout/Logo';
import { Message } from '@/stores/chatStore';

export default function ChatMessage({ message, isStreaming, onRegenerate }: {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 py-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center shrink-0 mt-0.5"><Logo size={20} /></div>
      )}
      <div className={`max-w-[720px] ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-bg-tertiary text-text-primary ml-auto' : 'text-text-primary'} ${isStreaming ? 'streaming-cursor' : ''}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>
          )}
        </div>
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <button onClick={handleCopy} className="p-1 rounded hover:bg-bg-hover text-text-muted transition-colors" title="Copy" aria-label="Copy response">
              {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
            {onRegenerate && <button onClick={onRegenerate} className="p-1 rounded hover:bg-bg-hover text-text-muted transition-colors" title="Regenerate" aria-label="Regenerate response"><RotateCcw size={14} /></button>}
          </div>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((src, i) => (
              <div key={i} className="text-xs bg-bg-tertiary border border-border rounded-lg px-2.5 py-1.5 text-text-secondary">
                📄 {src.title}{src.score ? ' (' + (src.score * 100).toFixed(0) + '%)' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
      {isUser && <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted text-xs font-semibold shrink-0 mt-0.5">You</div>}
    </div>
  );
}
