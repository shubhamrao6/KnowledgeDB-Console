'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import { login, setTokens } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const message = searchParams.get('message');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { status, data } = await login(email, password);
      if (status === 200) {
        setTokens(data);
        useAuthStore.getState().hydrate();
        router.push(plan ? `/console/settings?upgrade=${plan}` : '/console');
      } else {
        setError((data as { message?: string }).message || 'Login failed');
      }
    } catch (_e) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <Logo size={40} />
          <h1 className="mt-4 text-xl font-semibold text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
            KDB <span className="text-accent">Console</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message === 'upgrade_success' && (
            <div className="bg-green/10 border border-green/30 text-green text-sm rounded-lg px-4 py-2.5">
              Your plan has been upgraded successfully. Please sign in again to activate your new subscription.
            </div>
          )}
          {error && <div className="bg-accent/10 border border-accent/30 text-accent text-sm rounded-lg px-4 py-2.5">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-accent-light text-white font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">Sign up</Link>
        </p>
        <p className="text-center text-sm text-text-muted mt-3">
          <Link href="/" className="text-text-muted hover:text-text-primary transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
