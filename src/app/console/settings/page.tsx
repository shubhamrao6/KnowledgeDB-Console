'use client';

import { useEffect, useState } from 'react';
import { User, CreditCard, BarChart3, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/lib/api';

interface Subscription {
  plan: string; status: string; apiKey: string;
  currentPeriodStart: string; currentPeriodEnd: string;
  createdAt: string; updatedAt: string;
}

interface Usage {
  plan: string; quota: number; used: number; remaining: number;
  percentUsed: number; periodStart: string; periodEnd: string;
  throttle: { rateLimit: number; burstLimit: number };
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    apiRequest<{ subscription: Subscription }>('GET', '/subscription').then(({ data }) => {
      setSub((data as { subscription?: Subscription }).subscription || null);
    }).catch((_e) => {});
    apiRequest<Usage>('GET', '/subscription/usage').then(({ data }) => {
      setUsage(data);
    }).catch((_e) => {});
  }, []);

  const handlePortal = async () => {
    const { data } = await apiRequest<{ portalUrl: string }>('POST', '/subscription/portal');
    if ((data as { portalUrl?: string }).portalUrl) window.open((data as { portalUrl: string }).portalUrl, '_blank');
  };

  const handleCheckout = async (plan: string) => {
    const { data } = await apiRequest<{ checkoutUrl: string }>('POST', '/subscription/checkout', {
      plan, successUrl: window.location.origin + '/console/settings',
    });
    if ((data as { checkoutUrl?: string }).checkoutUrl) window.open((data as { checkoutUrl: string }).checkoutUrl, '_blank');
  };

  const planColors: Record<string, string> = {
    free: 'bg-bg-tertiary text-text-muted', starter: 'bg-blue/15 text-blue',
    professional: 'bg-accent/15 text-accent', enterprise: 'bg-green/15 text-green',
  };

  const handleChangePlan = async (newPlan: string) => {
    const { status, data } = await apiRequest<{ apiKey?: string; subscription?: Subscription }>('POST', '/subscription/change', { newPlan });
    if (status === 200) {
      if ((data as { apiKey?: string }).apiKey) localStorage.setItem('kdb_api_key', (data as { apiKey: string }).apiKey);
      if ((data as { subscription?: Subscription }).subscription) setSub((prev) => prev ? { ...prev, ...(data as { subscription: Subscription }).subscription } : prev);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? Access continues until the end of the current period.')) return;
    const { status, data } = await apiRequest<{ subscription?: Subscription }>('POST', '/subscription/cancel', { immediate: false });
    if (status === 200 && (data as { subscription?: Subscription }).subscription) {
      setSub((prev) => prev ? { ...prev, ...(data as { subscription: Subscription }).subscription } : prev);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 w-full">
      <h1 className="text-xl font-semibold text-text-primary mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-muted uppercase tracking-wider mb-3"><User size={14} /> Account</h2>
        <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-text-muted">Name</span><span className="text-text-primary">{user?.firstName} {user?.lastName}</span></div>
          <div className="flex justify-between text-sm"><span className="text-text-muted">Email</span><span className="text-text-primary">{user?.email}</span></div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-muted uppercase tracking-wider mb-3"><CreditCard size={14} /> Subscription</h2>
        <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
          {sub ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Plan</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${planColors[sub.plan] || planColors.free}`}>{sub.plan}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Status</span><span className="text-green capitalize">{sub.status}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Current Period</span>
                <span className="text-text-primary text-xs">{sub.currentPeriodStart?.split('T')[0]} → {sub.currentPeriodEnd?.split('T')[0]}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handlePortal} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"><ExternalLink size={12} /> Manage Billing</button>
                {sub.plan !== 'professional' && <button onClick={() => handleCheckout('professional')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">Upgrade to Professional</button>}
                {sub.plan === 'professional' && sub.status === 'active' && <button onClick={() => handleChangePlan('starter')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors">Downgrade to Starter</button>}
                {sub.status === 'active' && sub.plan !== 'free' && <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-accent/30 rounded-lg hover:bg-accent/10 text-accent transition-colors">Cancel Subscription</button>}
              </div>
            </>
          ) : <p className="text-sm text-text-muted">Loading subscription...</p>}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-muted uppercase tracking-wider mb-3"><BarChart3 size={14} /> Usage</h2>
        <div className="bg-bg-card border border-border rounded-xl p-4">
          {usage ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-text-muted">API Calls</span><span className="text-text-primary">{usage.used.toLocaleString()} / {usage.quota.toLocaleString()}</span></div>
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: Math.min(usage.percentUsed, 100) + '%', background: usage.percentUsed > 90 ? '#e74c3c' : usage.percentUsed > 70 ? '#f39c12' : '#2ecc71' }} />
                </div>
                <p className="text-xs text-text-muted mt-1">{usage.remaining.toLocaleString()} remaining</p>
              </div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Rate Limit</span><span className="text-text-primary">{usage.throttle.rateLimit} req/s (burst: {usage.throttle.burstLimit})</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Period</span><span className="text-text-primary text-xs">{usage.periodStart} → {usage.periodEnd}</span></div>
            </div>
          ) : <p className="text-sm text-text-muted">Loading usage...</p>}
        </div>
      </section>
    </div>
  );
}
