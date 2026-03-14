'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { logout, clearTokens } from '@/lib/auth';

interface ConfirmResponse {
  message: string;
  subscription: {
    plan: string;
    status: string;
    apiKey: string;
    currentPeriodEnd: string;
  };
}

type Status = 'confirming' | 'success' | 'error';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmedRef = useRef(false);
  const [status, setStatus] = useState<Status>('confirming');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutId = searchParams.get('checkout_id');

  useEffect(() => {
    if (!checkoutId) {
      router.replace('/console/settings');
      return;
    }
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    async function confirmCheckout() {
      const { status: httpStatus, data } = await apiRequest<ConfirmResponse>(
        'POST',
        '/subscription/confirm',
        { checkoutId }
      );

      if (httpStatus === 0) {
        setStatus('error');
        setErrorMessage('Something went wrong. Please check your connection and try again.');
        return;
      }

      if (httpStatus >= 200 && httpStatus < 300 && data.subscription?.apiKey) {
        localStorage.setItem('kdb_api_key', data.subscription.apiKey);
        setStatus('success');
        // Logout and redirect to login with upgrade success message
        try { await logout(); } catch { clearTokens(); }
        router.replace('/login?message=upgrade_success');
      } else {
        setStatus('error');
        setErrorMessage("We couldn't confirm your payment. The checkout session may have expired.");
      }
    }

    confirmCheckout();
  }, [checkoutId, router]);

  if (status === 'confirming') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-secondary">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-bg-card border border-border rounded-xl p-6 max-w-md text-center space-y-4">
          <p className="text-sm text-text-primary">{errorMessage}</p>
          <a href="/console/settings" className="inline-block px-4 py-2 text-xs bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Redirecting...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
