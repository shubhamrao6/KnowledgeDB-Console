'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, hydrate } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  const isDashboard = pathname === '/console';
  const isCanvas = pathname.startsWith('/console/canvas');

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !isLoggedIn) router.push('/login');
  }, [ready, isLoggedIn, router]);

  if (!ready || !isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isDashboard || isCanvas) {
    return (
      <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-bg-primary overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
