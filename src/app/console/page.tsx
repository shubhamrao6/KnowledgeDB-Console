'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, ArrowRight, Paintbrush, MessageCircle, BookOpen, Settings } from 'lucide-react';
import { logout, clearTokens } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

const apps = [
  {
    id: 'canvas',
    title: 'KDB Canvas',
    desc: 'Visual no-code builder for LLM applications. Drag, drop, and connect components to create AI-powered workflows.',
    href: '/console/canvas',
    accent: 'text-orange',
    icon: Paintbrush,
    tag: 'Demo',
  },
  {
    id: 'chat',
    title: 'KDB Chat',
    desc: 'RAG-powered chat interface. Upload documents to knowledge bases and have AI-grounded conversations with your data.',
    href: '/console/chat',
    accent: 'text-accent',
    icon: MessageCircle,
    tag: null,
  },
  {
    id: 'api',
    title: 'KDB API',
    desc: 'Full REST API and WebSocket documentation. Test endpoints, manage auth tokens, and integrate KnowledgeDB into your apps.',
    href: '/docs',
    accent: 'text-blue',
    icon: BookOpen,
    tag: null,
    external: true,
  },
];

const planColors: Record<string, string> = {
  starter: 'bg-blue/15 text-blue',
  professional: 'bg-accent/15 text-accent',
  enterprise: 'bg-green/15 text-green',
};

export default function ConsoleDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ subscription?: { plan: string } }>('GET', '/subscription').then(({ data }) => {
      if (data?.subscription?.plan) setPlan(data.subscription.plan);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (_e) { clearTokens(); }
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setLoggedIn(false);
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Top bar */}
      <div className="h-[56px] flex items-center justify-between px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-semibold text-[15px] text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
            KDB <span className="text-accent text-xs font-normal">Console</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {plan && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${planColors[plan] || 'bg-bg-tertiary text-text-muted'}`}>
              {plan}
            </span>
          )}
          <button onClick={() => router.push('/console/settings')} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-colors" title="Settings" aria-label="Settings">
            <Settings size={16} />
          </button>
          <ThemeToggle />
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-semibold">
              {user?.firstName?.[0] || 'U'}
            </div>
            <span className="text-sm text-text-secondary">{user?.firstName || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-colors" title="Logout" aria-label="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-[900px] w-full">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome back{user?.firstName ? ', ' + user.firstName : ''}</h1>
            <p className="text-text-secondary text-[15px]">What would you like to work on?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apps.map((app) => {
              const Icon = app.icon;
              const inner = (
                <div key={app.id} className="group bg-bg-card border border-border rounded-2xl p-6 hover:border-border-light transition-all hover:-translate-y-1 cursor-pointer relative overflow-hidden">
                  {app.tag && (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-bg-tertiary border border-border px-2 py-0.5 rounded-full">
                      {app.tag}
                    </span>
                  )}
                  <div className="mb-5">
                    <Icon size={36} className={app.accent} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
                    KDB <span className={app.accent}>{app.title.replace('KDB ', '')}</span>
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-5">{app.desc}</p>
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${app.accent} group-hover:gap-2.5 transition-all`}>
                    Open <ArrowRight size={14} />
                  </div>
                </div>
              );

              if (app.external) {
                return <a key={app.id} href={app.href} target="_blank" rel="noopener noreferrer" className="no-underline">{inner}</a>;
              }
              return <div key={app.id} onClick={() => router.push(app.href)}>{inner}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
