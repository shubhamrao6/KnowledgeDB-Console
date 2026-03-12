'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export default function ChatInput({ onSend, onStop }: {
  onSend: (message: string) => void;
  onStop: () => void;
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="border-t border-border bg-bg-primary px-4 py-3 shrink-0">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-end gap-2 bg-bg-secondary border border-border rounded-xl px-3 py-2 focus-within:border-accent/50 transition-colors">
          <button className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted shrink-0 mb-0.5" title="Attach file" aria-label="Attach file"><Paperclip size={18} /></button>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask anything about your knowledge base..." rows={1}
            className="flex-1 bg-transparent text-text-primary text-sm resize-none outline-none placeholder:text-text-muted leading-relaxed max-h-[200px]" />
          {isStreaming ? (
            <button onClick={onStop} className="p-2 rounded-lg bg-accent text-white shrink-0 mb-0.5 hover:bg-accent/80 transition-colors" title="Stop" aria-label="Stop generating"><Square size={16} /></button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()}
              className="p-2 rounded-lg bg-accent text-white shrink-0 mb-0.5 hover:bg-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Send" aria-label="Send message"><Send size={16} /></button>
          )}
        </div>
        <p className="text-[11px] text-text-muted text-center mt-2">KDB Console can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}
