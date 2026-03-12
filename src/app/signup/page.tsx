'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import { signup } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { status, data } = await signup(form.email, form.password, form.firstName, form.lastName);
      if (status === 200) {
        if (data.apiKey) localStorage.setItem('kdb_api_key', data.apiKey);
        router.push('/login');
      } else {
        setError((data as { message?: string }).message || 'Signup failed');
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
          <p className="text-sm text-text-muted mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-accent/10 border border-accent/30 text-accent text-sm rounded-lg px-4 py-2.5">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm text-text-secondary mb-1.5">First Name</label>
              <input id="firstName" type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="John" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm text-text-secondary mb-1.5">Last Name</label>
              <input id="lastName" type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors placeholder:text-text-muted" placeholder="••••••••" />
            <p className="text-[11px] text-text-muted mt-1">Must include uppercase, lowercase, number, and special character.</p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-accent-light text-white font-medium py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-sm text-text-muted mt-3">
          <Link href="/" className="text-text-muted hover:text-text-primary transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
