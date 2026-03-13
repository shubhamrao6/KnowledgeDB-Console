# Implementation Plan: Payment Gateway Integration (Polar)

## Overview

Integrate Polar as the payment gateway across four files: create a checkout success page, fix settings page button logic, wire landing page pricing CTAs to real checkout flows, and add plan query param handling to the login page. The existing `apiRequest` already handles auth headers and 401 auto-refresh, so no API client changes are needed.

## Tasks

- [x] 1. Create Checkout Success Page
  - [x] 1.1 Create `src/app/console/checkout/success/page.tsx`
    - Read `checkout_id` from `useSearchParams()`
    - If missing, redirect immediately to `/console/settings`
    - Call `POST /subscription/confirm` with `{ checkoutId }` exactly once (use `useRef` guard)
    - Show loading/confirming state while API call is in progress
    - On success: save returned `apiKey` to `localStorage.setItem('kdb_api_key', apiKey)`, then redirect to `/console/settings`
    - On error: display error message ("We couldn't confirm your payment") with a "Go to Settings" link
    - Handle network errors with generic connectivity message
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.5, 8.6_

  - [ ]* 1.2 Write property test for checkout confirmation (Property 3)
    - **Property 3: Checkout confirm is called with the correct checkout_id**
    - For any non-empty checkout_id in URL params, verify POST `/subscription/confirm` is called with that exact value
    - **Validates: Requirement 1.1**

  - [ ]* 1.3 Write property test for API key persistence (Property 2)
    - **Property 2: API key persistence round-trip**
    - For any API key returned by confirm, verify `localStorage.getItem('kdb_api_key')` returns the same value
    - **Validates: Requirements 7.1, 1.2**

- [x] 2. Checkpoint - Verify checkout success page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Fix Settings Page Button Logic and Subscription Actions
  - [x] 3.1 Rewrite button visibility logic in `src/app/console/settings/page.tsx`
    - Starter plan: show "Upgrade to Professional" and "Upgrade to Enterprise" buttons; hide Switch, Cancel, Manage Billing
    - Professional plan: show "Switch to Enterprise", "Cancel Subscription", "Manage Billing"; hide upgrade buttons
    - Enterprise plan: show "Switch to Professional", "Cancel Subscription", "Manage Billing"; hide upgrade buttons
    - Remove the existing incorrect "Downgrade to Starter" button and always-visible "Manage Billing"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.2 Fix checkout and plan change handlers in `src/app/console/settings/page.tsx`
    - `handleCheckout`: call `POST /subscription/checkout` with `{ plan }`, redirect to `checkoutUrl` via `window.location.href` (not `window.open`). For Starter activation, save `apiKey` directly and update state
    - `handleChangePlan`: call `POST /subscription/change` with `{ newPlan }`, save returned `apiKey`, update subscription state
    - `handleCancel`: keep confirmation dialog, call `POST /subscription/cancel`, update subscription status on success
    - `handlePortal`: call `POST /subscription/portal`, open `portalUrl` in new tab
    - Add error handling: 409 on checkout → "already subscribed" message; 400 on change → "must use checkout"; 404 on cancel → "free plans cannot be canceled"; 500 on portal → "billing portal only for paid plans"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 3.3 Add `?upgrade=plan` auto-trigger in `src/app/console/settings/page.tsx`
    - Read `upgrade` query param from `useSearchParams()`
    - On mount, if `upgrade` param contains a valid plan name, auto-trigger `handleCheckout(plan)`
    - After checkout completes or fails, remove the `upgrade` param from the URL using `router.replace`
    - _Requirements: 4.1, 4.2_

  - [ ]* 3.4 Write property test for button visibility (Property 1)
    - **Property 1: Button visibility is determined by plan**
    - For any valid plan (starter, professional, enterprise), verify exactly the correct set of buttons renders
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

  - [ ]* 3.5 Write property test for plan change endpoint (Property 7)
    - **Property 7: Plan change calls the correct endpoint with the target plan**
    - For any paid plan user switching to the other paid plan, verify POST `/subscription/change` is called with the correct target plan
    - **Validates: Requirement 3.4**

  - [ ]* 3.6 Write property test for settings auto-trigger (Property 6)
    - **Property 6: Settings page auto-triggers checkout from upgrade param**
    - For any valid plan in the `upgrade` query param, verify checkout is triggered automatically on mount
    - **Validates: Requirement 4.1**

- [x] 4. Checkpoint - Verify settings page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire Landing Page Pricing CTAs
  - [x] 5.1 Replace pricing CTA links in `src/app/page.tsx`
    - Replace the `<a href="#contact">` links on pricing cards with `<button>` elements that call a `handlePricingCTA(plan)` function
    - Import `useAuthStore` and `apiRequest`; use `useRouter` from `next/navigation`
    - Add `handlePricingCTA(plan)` logic:
      - Check `isLoggedIn` from auth store
      - Logged in + paid plan: call `POST /subscription/checkout { plan }`, redirect to `checkoutUrl` via `window.location.href`
      - Logged in + starter: call `POST /subscription/checkout { plan: 'starter' }`, save returned `apiKey` to localStorage
      - Not logged in + paid plan: `router.push('/login?plan={plan}')`
      - Not logged in + starter: `router.push('/signup')`
    - Handle 409 conflict: show toast/message "Already subscribed", redirect to `/console/settings`
    - Add loading state per button (track which plan is loading)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.5_

  - [ ]* 5.2 Write property test for landing page CTA routing (Property 4)
    - **Property 4: Landing page CTA routes correctly by auth state and plan**
    - For any combination of auth state and plan, verify the correct action is taken
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ]* 5.3 Write property test for checkout redirect URL (Property 8)
    - **Property 8: Checkout redirect uses the returned URL**
    - For any checkoutUrl returned by POST `/subscription/checkout`, verify the browser redirects to that exact URL
    - **Validates: Requirements 3.1, 3.2**

- [x] 6. Add Plan Query Param Handling to Login Page
  - [x] 6.1 Modify `src/app/login/page.tsx` to handle `?plan` query param
    - Import `useSearchParams` from `next/navigation`
    - Read `plan` query param on mount
    - After successful login, if `plan` param exists, redirect to `/console/settings?upgrade={plan}` instead of `/console`
    - If no `plan` param, keep existing redirect to `/console`
    - _Requirements: 6.1, 6.2_

  - [ ]* 6.2 Write property test for login redirect (Property 5)
    - **Property 5: Login redirect preserves plan intent**
    - For any valid plan name in the `plan` query param, verify redirect goes to `/console/settings?upgrade={plan}`; when absent, verify redirect goes to `/console`
    - **Validates: Requirements 6.1, 6.2**

- [x] 7. Final Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The existing `apiRequest` in `src/lib/api.ts` already handles `x-api-key` headers (Req 7.2) and 401 auto-refresh (Req 8.7), so no API client changes needed
- Property tests use fast-check as specified in the design document
- All checkout redirects use `window.location.href` (full page navigation to Polar), not `window.open`
