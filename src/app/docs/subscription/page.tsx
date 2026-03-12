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
          description="Retrieve the current user's subscription details."
          responseFields={[
            { name: 'subscription', type: 'object', desc: 'Subscription object with plan, status, apiKey, period dates.' },
          ]}
          codeTabs={[
            { label: 'Response', content: '// GET /subscription\n// 200 OK\n{\n  "subscription": {\n    "plan": "professional",\n    "status": "active",\n    "apiKey": "ak_xxx",\n    "currentPeriodStart": "2026-01-01T00:00:00Z",\n    "currentPeriodEnd": "2026-02-01T00:00:00Z"\n  }\n}' },
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
            { label: 'Request', content: '// POST /subscription/checkout\n{\n  "plan": "professional",\n  "successUrl": "https://knowledgedb.dev/console/settings"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "checkoutUrl": "https://polar.sh/checkout/..."\n}' },
          ]}
          testFields={[
            { name: 'plan', type: 'select', options: ['starter', 'professional'], defaultValue: 'professional' },
            { name: 'successUrl', placeholder: 'https://knowledgedb.dev/console/settings' },
          ]}
        />

        <EndpointBlock method="POST" title="Change Plan" path="/subscription/change" id="change"
          description="Change the current subscription plan. Takes effect immediately."
          requestParams={[
            { name: 'newPlan', type: 'string', required: true, desc: 'Target plan (starter, professional, enterprise).' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /subscription/change\n{\n  "newPlan": "starter"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Plan changed successfully",\n  "subscription": { ... },\n  "apiKey": "ak_newkey"\n}' },
          ]}
          testFields={[
            { name: 'newPlan', type: 'select', options: ['starter', 'professional', 'enterprise'], defaultValue: 'starter' },
          ]}
        />

        <EndpointBlock method="POST" title="Cancel Subscription" path="/subscription/cancel" id="cancel"
          description="Cancel the current subscription. Access continues until the end of the current billing period."
          requestParams={[
            { name: 'immediate', type: 'boolean', desc: 'If true, cancel immediately. Default: false (end of period).' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /subscription/cancel\n{\n  "immediate": false\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Subscription cancelled",\n  "subscription": {\n    "status": "cancelled",\n    ...\n  }\n}' },
          ]}
          testFields={[
            { name: 'immediate', type: 'select', options: ['false', 'true'], defaultValue: 'false' },
          ]}
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
