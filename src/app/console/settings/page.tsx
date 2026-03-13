'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

const VALID_PLANS = ['starter', 'professional', 'enterprise'];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upgradeTriggered = useRef(false);

  useEffect(() => {
    apiRequest<{ subscription: Subscription }>('GET', '/subscription').then(({ data }) => {
      setSub((data as { subscription?: Subscription }).subscription || null);
    }).catch(() => {});
    apiRequest<Usage>('GET', '/subscription/usage').then(({ data }) => {
      setUsage(data);
    }).catch(() => {});
  }, []);

  const handleCheckout = useCallback(async (plan: string) => {
    setError(null);
    try {
      const { status, data } = await apiRequest<{
        checkoutUrl?: string; checkoutId?: string; message?: string;
        apiKey?: string; subscription?: { plan: string; status: string; currentPeriodEnd: string };
        error?: string;
      }>('POST', '/subscription/checkout', { plan, successUrl: window.location.origin + '/console/checkout/success?checkout_id={CHECKOUT_ID}' });

      if (status === 409) {
        setError((data as { error?: string }).error || 'You already have an active subscription. Use plan switching to change plans.');
        return;
      }

      if (status === 0) {
        setError('Something went wrong. Please check your connection and try again.');
        return;
      }

      if (status >= 400) {
        setError((data as { error?: string }).error || 'Something went wrong. Please try again.');
        return;
      }

      // Starter instant activation — response has apiKey instead of checkoutUrl
      if (data.apiKey) {
        localStorage.setItem('kdb_api_key', data.apiKey);
        if (data.subscription) {
          setSub((prev) => prev ? { ...prev, ...data.subscription } : { ...data.subscription, apiKey: data.apiKey!, createdAt: '', updatedAt: '', currentPeriodStart: '' } as Subscription);
        }
        return;
      }

      // Paid plan — redirect to Polar checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    }
  }, []);

  const handleChangePlan = useCallback(async (newPlan: string) => {
    setError(null);
    try {
      const { status, data } = await apiRequest<{
        apiKey?: string; subscription?: Subscription; error?: string;
      }>('POST', '/subscription/change', { newPlan });

      if (status === 400) {
        setError((data as { error?: string }).error || 'Free plan users must upgrade through checkout. Please use the Upgrade button.');
        return;
      }

      if (status === 0) {
        setError('Something went wrong. Please check your connection and try again.');
        return;
      }

      if (status >= 400) {
        setError((data as { error?: string }).error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.apiKey) localStorage.setItem('kdb_api_key', data.apiKey);
      if (data.subscription) setSub((prev) => prev ? { ...prev, ...data.subscription } : prev);
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    }
  }, []);

  const handleCancel = useCallback(async () => {
    if (!confirm('Are you sure you want to cancel your subscription? Access continues until the end of the current period.')) return;
    setError(null);
    try {
      const { status, data } = await apiRequest<{
        subscription?: Subscription; error?: string;
      }>('POST', '/subscription/cancel');

      if (status === 404) {
        setError((data as { error?: string }).error || 'Free plans cannot be canceled.');
        return;
      }

      if (status === 0) {
        setError('Something went wrong. Please check your connection and try again.');
        return;
      }

      if (status >= 400) {
        setError((data as { error?: string }).error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.subscription) setSub((prev) => prev ? { ...prev, ...data.subscription } : prev);
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    }
  }, []);

  const handlePortal = useCallback(async () => {
    setError(null);
    try {
      const { status, data } = await apiRequest<{
        portalUrl?: string; error?: string;
      }>('POST', '/subscription/portal');

      if (status === 500) {
        setError((data as { error?: string }).error || 'Billing portal is only available for paid plans.');
        return;
      }

      if (status === 0) {
        setError('Something went wrong. Please check your connection and try again.');
        return;
      }

      if (status >= 400) {
        setError((data as { error?: string }).error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.portalUrl) window.open(data.portalUrl, '_blank');
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    }
  }, []);

  // Task 3.3: Auto-trigger checkout from ?upgrade=plan query param
  useEffect(() => {
    if (upgradeTriggered.current) return;
    const upgradePlan = searchParams.get('upgrade');
    if (upgradePlan && VALID_PLANS.includes(upgradePlan.toLowerCase())) {
      upgradeTriggered.current = true;
      handleCheckout(upgradePlan.toLowerCase()).finally(() => {
        router.replace('/console/settings');
      });
    }
  }, [searchParams, handleCheckout, router]);

  const planColors: Record<string, string> = {
    free: 'bg-bg-tertiary text-text-muted', starter: 'bg-blue/15 text-blue',
    professional: 'bg-accent/15 text-accent', enterprise: 'bg-green/15 text-green',
  };

  const currentPlan = sub?.plan?.toLowerCase();
  const isStarter = currentPlan === 'starter' || currentPlan === 'free';
  const isProfessional = currentPlan === 'professional';
  const isEnterprise = currentPlan === 'enterprise';
  const isPaid = isProfessional || isEnterprise;

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

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2 flex-wrap">
                {/* Starter plan: show upgrade buttons */}
                {isStarter && (
                  <>
                    <button onClick={() => handleCheckout('professional')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">Upgrade to Professional</button>
                    <button onClick={() => handleCheckout('enterprise')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green text-white rounded-lg hover:opacity-90 transition-opacity">Upgrade to Enterprise</button>
                  </>
                )}

                {/* Professional plan: switch to enterprise */}
                {isProfessional && (
                  <button onClick={() => handleChangePlan('enterprise')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors">Switch to Enterprise</button>
                )}

                {/* Enterprise plan: switch to professional */}
                {isEnterprise && (
                  <button onClick={() => handleChangePlan('professional')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors">Switch to Professional</button>
                )}

                {/* Paid plans: cancel and manage billing */}
                {isPaid && (
                  <>
                    <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-accent/30 rounded-lg hover:bg-accent/10 text-accent transition-colors">Cancel Subscription</button>
                    <button onClick={handlePortal} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"><ExternalLink size={12} /> Manage Billing</button>
                  </>
                )}
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
