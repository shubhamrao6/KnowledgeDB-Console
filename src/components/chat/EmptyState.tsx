'use client';

import Logo from '@/components/layout/Logo';
import { Database, FileText, Search, Image } from 'lucide-react';

const suggestions = [
  { icon: Search, text: 'Search my documents for key insights', color: 'text-blue' },
  { icon: FileText, text: 'Summarize the latest uploaded report', color: 'text-green' },
  { icon: Database, text: 'What topics are covered in my knowledge base?', color: 'text-orange' },
  { icon: Image, text: 'Generate an image for my presentation', color: 'text-accent' },
];

export default function EmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="mb-6 opacity-60"><Logo size={48} /></div>
      <h2 className="text-xl font-semibold text-text-primary mb-1">What can I help you with?</h2>
      <p className="text-sm text-text-muted mb-8 text-center">Ask questions about your documents and knowledge base.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px] w-full">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => onSuggestion(s.text)}
            className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-bg-hover text-left transition-colors group">
            <s.icon size={18} className={`${s.color} shrink-0 mt-0.5`} />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
