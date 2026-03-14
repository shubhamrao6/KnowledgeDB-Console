import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Subscription - KnowledgeDB API' };

export default function SubscriptionDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>Subscription</h1>
        <p>Manage billing, checkout, plan changes, cancellations, and usage tracking. Powered by Polar for seamless payment processing.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <EndpointBlock method="GET" title="Get Subscription" path="/subscription" id="get-subscription"
          description="Retrieve the current user's subscription details. Returns the subscription object or null if no subscription exists."
          responseFields={[
            { name: 'subscription', type: 'object | null', desc: 'Subscription object with plan, status, apiKey, cancelAtPeriodEnd, period dates, createdAt, updatedAt. Null if no subscription.' },
          ]}
          codeTabs={[
            { label: 'Active', content: '// GET /subscription\n// 200 OK — active subscription\n{\n  "subscription": {\n    "plan": "starter",\n    "status": "active",\n    "apiKey": "abc123...",\n    "cancelAtPeriodEnd": false,\n    "currentPeriodStart": "2026-03-12T...",\n    "currentPeriodEnd": "2026-04-12T...",\n    "createdAt": "2026-03-12T...",\n    "updatedAt": "2026-03-12T..."\n  }\n}' },
            { label: 'Pending Cancel', content: '// GET /subscription\n// 200 OK — pending cancellation\n{\n  "subscription": {\n    "plan": "professional",\n    "status": "active",\n    "apiKey": "abc123...",\n    "cancelAtPeriodEnd": true,\n    "currentPeriodStart": "2026-03-12T...",\n    "currentPeriodEnd": "2026-04-12T...",\n    "createdAt": "2026-03-12T...",\n    "updatedAt": "2026-03-12T..."\n  }\n}' },
            { label: 'No Subscription', content: '// GET /subscription\n// 200 OK — no subscription\n{\n  "subscription": null,\n  "message": "No subscription found. Use /subscription/checkout to subscribe."\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="GET" title="Get Usage" path="/subscription/usage" id="usage"
          description="Retrieve API usage statistics for the current billing period."
          responseFields={[
            { name: 'plan', type: 'string', desc: 'Current plan name.' },
            { name: 'quota', type: 'number', desc: 'Total API calls allowed.' },
            { name: 'used', type: 'number', desc: 'API calls used this period.' },
            { name: 'remaining', type: 'number', desc: 'Remaining API calls.' },
            { name: 'percentUsed', type: 'number', desc: 'Usage percentage.' },
            { name: 'throttle', type: 'object', desc: 'Rate limit and burst limit.' },
          ]}
          codeTabs={[
            { label: 'Response', content: '// GET /subscription/usage\n// 200 OK\n{\n  "plan": "professional",\n  "quota": 100000,\n  "used": 15420,\n  "remaining": 84580,\n  "percentUsed": 15.42,\n  "periodStart": "2026-01-01",\n  "periodEnd": "2026-02-01",\n  "throttle": {\n    "rateLimit": 50,\n    "burstLimit": 100\n  }\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="POST" title="Create Checkout" path="/subscription/checkout" id="checkout"
          description="Create a checkout session for subscribing to a plan. Returns a URL to redirect the user to the payment page."
          requestParams={[
            { name: 'plan', type: 'string', required: true, desc: 'Plan to subscribe to (starter, professional).' },
            { name: 'successUrl', type: 'string', desc: 'URL to redirect after successful payment.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /subscription/checkout\n{\n  "plan": "professional",\n  "successUrl": "https://knowledgedb.dev/console/checkout/success?checkout_id={CHECKOUT_ID}"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "checkoutUrl": "https://polar.sh/checkout/..."\n}' },
          ]}
          testFields={[
            { name: 'plan', type: 'select', options: ['starter', 'professional'], defaultValue: 'professional' },
            { name: 'successUrl', placeholder: 'https://knowledgedb.dev/console/checkout/success?checkout_id={CHECKOUT_ID}' },
          ]}
        />

        <EndpointBlock method="POST" title="Confirm Checkout" path="/subscription/confirm" id="confirm"
          description="Confirm a checkout session after the user completes payment on Polar. Call this on your success page to activate the subscription and receive the new API key."
          requestParams={[
            { name: 'checkoutId', type: 'string', required: true, desc: 'The checkout ID from the Polar redirect URL query parameter.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /subscription/confirm\n{\n  "checkoutId": "466de8b3-d631-451d-ac6d-e6f1d595301b"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Subscription activated",\n  "subscription": {\n    "plan": "professional",\n    "status": "active",\n    "apiKey": "ak_newkey",\n    "currentPeriodEnd": "2026-04-12T00:00:00Z"\n  }\n}' },
          ]}
          testFields={[
            { name: 'checkoutId', placeholder: '466de8b3-d631-451d-ac6d-e6f1d595301b' },
          ]}
        />

        <EndpointBlock method="POST" title="Cancel Subscription" path="/subscription/cancel" id="cancel"
          description="Cancel the current subscription. Access continues until the end of the current billing period."
          codeTabs={[
            { label: 'Request', content: '// POST /subscription/cancel\n// No body required' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Subscription cancelled",\n  "subscription": {\n    "plan": "professional",\n    "status": "active",\n    "cancelAtPeriodEnd": true,\n    "currentPeriodEnd": "2026-02-01T00:00:00Z"\n  }\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="POST" title="Reactivate Subscription" path="/subscription/reactivate" id="reactivate"
          description="Reactivate a subscription that has a pending cancellation. Undoes cancelAtPeriodEnd so the subscription renews normally. No request body needed."
          codeTabs={[
            { label: 'Response', content: '// POST /subscription/reactivate\n// 200 OK\n{\n  "message": "Subscription reactivated. Cancellation has been undone.",\n  "subscription": {\n    "plan": "professional",\n    "status": "active",\n    "cancelAtPeriodEnd": false,\n    "currentPeriodEnd": "2026-04-12T..."\n  }\n}' },
            { label: 'Error 400', content: '// POST /subscription/reactivate\n// 400 — not pending cancellation\n{\n  "error": "Subscription is not pending cancellation"\n}\n\n// 400 — starter user\n{\n  "error": "Starter plan does not need reactivation"\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="POST" title="Customer Portal" path="/subscription/portal" id="portal"
          description="Get a URL to the customer billing portal where users can manage payment methods and view invoices."
          codeTabs={[
            { label: 'Response', content: '// POST /subscription/portal\n// 200 OK\n{\n  "portalUrl": "https://polar.sh/portal/..."\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="POST" title="Webhook" path="/subscription/webhook" id="webhook"
          description="Polar webhook endpoint for subscription events. This is called by Polar, not by your application directly."
          requiresAuth={false}
          notes={['This endpoint is called by Polar when subscription events occur (created, updated, cancelled). You do not need to call this directly.']}
          codeTabs={[
            { label: 'Payload', content: '// POST /subscription/webhook\n// Called by Polar\n{\n  "type": "subscription.updated",\n  "data": {\n    "id": "sub_xxx",\n    "status": "active",\n    ...\n  }\n}' },
          ]}
        />
      </div>
    </div>
  );
}
