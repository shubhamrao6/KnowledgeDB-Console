'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Heart, UserPlus, LogIn, RotateCw, LogOut, CreditCard, Eye, ShoppingCart, XCircle, BarChart3, ExternalLink, Zap, Database, FilePlus, List, Trash2, Upload, Sparkles, FileText, Search, Image, RefreshCw, MessageCircle } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  method?: 'get' | 'post' | 'delete';
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const sections: NavSection[] = [
  { title: 'Getting Started', links: [
    { href: '/docs', icon: BookOpen, label: 'Overview' },
    { href: '/docs#health', icon: Heart, label: 'Health Check', method: 'get' },
  ]},
  { title: 'Authentication', links: [
    { href: '/docs/auth', icon: LogIn, label: 'Auth Overview' },
    { href: '/docs/auth#signup', icon: UserPlus, label: 'Sign Up', method: 'post' },
    { href: '/docs/auth#login', icon: LogIn, label: 'Login', method: 'post' },
    { href: '/docs/auth#refresh', icon: RotateCw, label: 'Refresh Token', method: 'post' },
    { href: '/docs/auth#logout', icon: LogOut, label: 'Logout', method: 'post' },
  ]},
  { title: 'Subscription', links: [
    { href: '/docs/subscription', icon: CreditCard, label: 'Subscription Overview' },
    { href: '/docs/subscription#get-subscription', icon: Eye, label: 'Get Status', method: 'get' },
    { href: '/docs/subscription#checkout', icon: ShoppingCart, label: 'Checkout', method: 'post' },
    { href: '/docs/subscription#change', icon: RotateCw, label: 'Change Plan', method: 'post' },
    { href: '/docs/subscription#cancel', icon: XCircle, label: 'Cancel', method: 'post' },
    { href: '/docs/subscription#usage', icon: BarChart3, label: 'Usage', method: 'get' },
    { href: '/docs/subscription#portal', icon: ExternalLink, label: 'Customer Portal', method: 'post' },
    { href: '/docs/subscription#webhook', icon: Zap, label: 'Webhook', method: 'post' },
  ]},
  { title: 'Knowledge Bases', links: [
    { href: '/docs/knowledgedbs', icon: Database, label: 'KnowledgeDBs Overview' },
    { href: '/docs/knowledgedbs#create', icon: FilePlus, label: 'Create', method: 'post' },
    { href: '/docs/knowledgedbs#list', icon: List, label: 'List', method: 'get' },
    { href: '/docs/knowledgedbs#delete', icon: Trash2, label: 'Delete', method: 'delete' },
  ]},
  { title: 'Documents', links: [
    { href: '/docs/documents', icon: FileText, label: 'Documents Overview' },
    { href: '/docs/documents#upload', icon: Upload, label: 'Upload', method: 'post' },
    { href: '/docs/documents#generate', icon: Sparkles, label: 'Generate', method: 'post' },
    { href: '/docs/documents#list', icon: List, label: 'List', method: 'get' },
    { href: '/docs/documents#get', icon: Eye, label: 'Get Document', method: 'get' },
    { href: '/docs/documents#delete', icon: Trash2, label: 'Delete', method: 'delete' },
    { href: '/docs/documents#reindex', icon: RefreshCw, label: 'Reindex', method: 'post' },
  ]},
  { title: 'Search', links: [
    { href: '/docs/search', icon: Search, label: 'RAG Search', method: 'post' },
  ]},
  { title: 'Images', links: [
    { href: '/docs/images', icon: Image, label: 'Images Overview' },
    { href: '/docs/images#generate', icon: Sparkles, label: 'Generate', method: 'post' },
    { href: '/docs/images#upload', icon: Upload, label: 'Upload', method: 'post' },
    { href: '/docs/images#list', icon: List, label: 'List', method: 'get' },
    { href: '/docs/images#get', icon: Eye, label: 'Get Image', method: 'get' },
    { href: '/docs/images#delete', icon: Trash2, label: 'Delete', method: 'delete' },
    { href: '/docs/images#reindex', icon: RefreshCw, label: 'Reindex', method: 'post' },
  ]},
  { title: 'WebSocket', links: [
    { href: '/docs/websocket', icon: MessageCircle, label: 'Chat (WebSocket)' },
  ]},
];

const methodColors: Record<string, string> = {
  get: 'bg-green/15 text-green',
  post: 'bg-blue/15 text-blue',
  delete: 'bg-accent/15 text-accent',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('kdb_id_token');
    if (token) {
      setLoggedIn(true);
      try {
        const user = JSON.parse(localStorage.getItem('kdb_user') || '{}');
        setUserName(user.firstName || user.email || 'User');
      } catch (_e) { setUserName('User'); }
    }
  }, []);

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return pathname === base;
  };

  const breadcrumb = (() => {
    if (pathname === '/docs') return 'Overview';
    const seg = pathname.split('/').pop();
    const map: Record<string, string> = {
      auth: 'Authentication', knowledgedbs: 'Knowledge Bases', documents: 'Documents',
      search: 'RAG Search', images: 'Images', websocket: 'WebSocket Chat', subscription: 'Subscription',
    };
    return map[seg || ''] || 'Overview';
  })();

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <nav className={`docs-sidebar ${mobileOpen ? '!flex' : ''}`}>
        <div className="h-[52px] flex items-center justify-between px-5 border-b border-border shrink-0">
          <Link href="/docs" className="flex items-center gap-2 no-underline">
            <Logo size={22} />
            <span className="font-semibold text-sm text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
              KDB <span className="text-accent text-xs font-normal">API</span>
            </span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-text-muted"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-2">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-3 py-2">{section.title}</div>
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] mb-0.5 transition-colors no-underline ${
                      isActive(link.href) ? 'bg-red-glow text-accent font-medium' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}>
                    <Icon size={14} className="shrink-0 text-accent opacity-70" />
                    <span className="flex-1">{link.label}</span>
                    {link.method && (
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${methodColors[link.method] || ''}`}>
                        {link.method === 'delete' ? 'DEL' : link.method.toUpperCase()}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Main */}
      <div className="docs-main flex flex-col min-h-screen">
        <div className="docs-topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-1 text-text-muted"><Menu size={20} /></button>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/docs" className="text-text-muted hover:text-text-primary transition-colors no-underline">Docs</Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary font-medium">{breadcrumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs" className="top-bar-link"><BookOpen size={14} /><span>API Ref</span></Link>
            <a href="https://knowledgedb.dev" target="_blank" rel="noopener noreferrer" className="top-bar-link"><ExternalLink size={14} /><span>KnowledgeDB.dev</span></a>
            <div className="w-px h-5 bg-border" />
            <Link href="/console" className="text-sm font-medium text-accent hover:text-accent-light transition-colors no-underline inline-flex items-center gap-1.5">Console <span className="text-xs">→</span></Link>
            <div className="w-px h-5 bg-border" />
            <ThemeToggle />
            <span className={`auth-indicator ${loggedIn ? 'logged-in' : 'logged-out'}`}>
              <span className="auth-dot" />
              {loggedIn ? userName : 'Not logged in'}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
