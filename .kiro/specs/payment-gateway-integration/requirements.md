# Requirements Document

## Introduction

This document defines the requirements for integrating Polar as the payment gateway into the KnowledgeDB console frontend. The integration covers the full subscription lifecycle: checkout initiation, Polar redirect handling, checkout confirmation, plan changes between paid tiers, cancellation, billing portal access, and correct UI behavior across all pages that interact with subscriptions. Requirements are derived from the approved design document.

## Glossary

- **Console**: The authenticated area of the KnowledgeDB frontend application at `/console/*`
- **Settings_Page**: The page at `/console/settings` that displays subscription info, usage stats, and plan management actions
- **Checkout_Success_Page**: The page at `/console/checkout/success` that handles Polar's redirect after payment
- **Landing_Page**: The public-facing home page at `/` that includes pricing cards with CTAs
- **Login_Page**: The authentication page at `/login`
- **API_Client**: The `apiRequest` function in `src/lib/api.ts` that handles all HTTP calls to the backend
- **Auth_Store**: The Zustand store in `src/stores/authStore.ts` that manages authentication state
- **Polar**: The external payment gateway that hosts checkout pages and billing portal
- **Starter_Plan**: The free tier plan that does not require Polar checkout
- **Paid_Plan**: Either the Professional or Enterprise plan, which requires Polar checkout
- **API_Key**: The `kdb_api_key` value stored in localStorage, returned by the backend after subscription operations
- **Checkout_ID**: A unique identifier returned by Polar and passed as a query parameter to the Checkout_Success_Page

## Requirements

### Requirement 1: Checkout Success Page — Confirmation Flow

**User Story:** As a user who just completed payment on Polar, I want the application to confirm my subscription and save my API key, so that I can immediately use my new plan.

#### Acceptance Criteria

1. WHEN the Checkout_Success_Page loads with a valid `checkout_id` query parameter, THE Checkout_Success_Page SHALL call POST `/subscription/confirm` with the checkout_id
2. WHEN POST `/subscription/confirm` returns successfully, THE Checkout_Success_Page SHALL save the returned API_Key to localStorage under the key `kdb_api_key`
3. WHEN POST `/subscription/confirm` returns successfully, THE Checkout_Success_Page SHALL redirect the user to the Settings_Page
4. WHILE the confirmation API call is in progress, THE Checkout_Success_Page SHALL display a loading/confirming state
5. IF POST `/subscription/confirm` fails with an invalid or expired checkout_id, THEN THE Checkout_Success_Page SHALL display an error message indicating the checkout session could not be confirmed
6. IF the Checkout_Success_Page loads without a `checkout_id` query parameter, THEN THE Checkout_Success_Page SHALL redirect the user to the Settings_Page immediately
7. THE Checkout_Success_Page SHALL call POST `/subscription/confirm` at most once per page load to prevent duplicate processing

### Requirement 2: Settings Page — Button Visibility by Plan

**User Story:** As a subscribed user, I want to see only the actions relevant to my current plan, so that I am not confused by inapplicable options.

#### Acceptance Criteria

1. WHILE the current plan is Starter_Plan, THE Settings_Page SHALL display "Upgrade to Professional" and "Upgrade to Enterprise" buttons
2. WHILE the current plan is Starter_Plan, THE Settings_Page SHALL hide the "Switch to..." button, the "Cancel Subscription" button, and the "Manage Billing" button
3. WHILE the current plan is Professional, THE Settings_Page SHALL display a "Switch to Enterprise" button, a "Cancel Subscription" button, and a "Manage Billing" button
4. WHILE the current plan is Professional, THE Settings_Page SHALL hide all upgrade buttons
5. WHILE the current plan is Enterprise, THE Settings_Page SHALL display a "Switch to Professional" button, a "Cancel Subscription" button, and a "Manage Billing" button
6. WHILE the current plan is Enterprise, THE Settings_Page SHALL hide all upgrade buttons

### Requirement 3: Settings Page — Subscription Actions

**User Story:** As a subscribed user, I want to upgrade, switch plans, cancel, or manage billing from the settings page, so that I can control my subscription without leaving the console.

#### Acceptance Criteria

1. WHEN a Starter_Plan user clicks an upgrade button, THE Settings_Page SHALL call POST `/subscription/checkout` with the selected plan
2. WHEN POST `/subscription/checkout` returns a checkoutUrl for a Paid_Plan, THE Settings_Page SHALL redirect the browser to that checkoutUrl
3. WHEN POST `/subscription/checkout` returns an API_Key for Starter_Plan activation, THE Settings_Page SHALL save the API_Key to localStorage and update the displayed subscription state
4. WHEN a Paid_Plan user clicks the "Switch to..." button, THE Settings_Page SHALL call POST `/subscription/change` with the target plan
5. WHEN POST `/subscription/change` returns successfully, THE Settings_Page SHALL save the returned API_Key to localStorage and update the displayed subscription state
6. WHEN a Paid_Plan user clicks "Cancel Subscription", THE Settings_Page SHALL display a confirmation dialog before calling POST `/subscription/cancel`
7. WHEN POST `/subscription/cancel` returns successfully, THE Settings_Page SHALL update the displayed subscription status
8. WHEN a Paid_Plan user clicks "Manage Billing", THE Settings_Page SHALL call POST `/subscription/portal` and open the returned portalUrl in a new browser tab

### Requirement 4: Settings Page — Upgrade Intent from Login Redirect

**User Story:** As a user who clicked a pricing CTA while not logged in, I want the settings page to automatically start my checkout after I log in, so that I don't have to find the upgrade button again.

#### Acceptance Criteria

1. WHEN the Settings_Page loads with an `upgrade` query parameter containing a valid plan name, THE Settings_Page SHALL automatically trigger the checkout flow for that plan
2. WHEN the auto-triggered checkout completes or fails, THE Settings_Page SHALL remove the `upgrade` query parameter from the URL

### Requirement 5: Landing Page — Pricing CTA Behavior

**User Story:** As a visitor viewing pricing options, I want the pricing card buttons to start the actual checkout flow, so that I can subscribe to a plan directly.

#### Acceptance Criteria

1. WHEN a logged-in user clicks a Paid_Plan pricing CTA, THE Landing_Page SHALL call POST `/subscription/checkout` with the selected plan and redirect to the returned checkoutUrl
2. WHEN a logged-in user clicks the Starter_Plan pricing CTA, THE Landing_Page SHALL call POST `/subscription/checkout` with plan "starter" and save the returned API_Key to localStorage
3. WHEN a not-logged-in user clicks a Paid_Plan pricing CTA, THE Landing_Page SHALL redirect to `/login?plan={selectedPlan}`
4. WHEN a not-logged-in user clicks the Starter_Plan pricing CTA, THE Landing_Page SHALL redirect to `/signup`
5. WHILE a checkout API call is in progress from the Landing_Page, THE Landing_Page SHALL display a loading state on the clicked button

### Requirement 6: Login Page — Plan Query Parameter Handling

**User Story:** As a user redirected from the landing page pricing CTA, I want to be taken to the upgrade flow after logging in, so that my checkout intent is preserved.

#### Acceptance Criteria

1. WHEN the Login_Page has a `plan` query parameter and the user logs in successfully, THE Login_Page SHALL redirect to `/console/settings?upgrade={plan}` instead of the default `/console` route
2. WHEN the Login_Page does not have a `plan` query parameter, THE Login_Page SHALL redirect to `/console` after successful login as it does today

### Requirement 7: API Key Persistence

**User Story:** As a user completing any subscription operation that returns an API key, I want the key to be saved immediately, so that subsequent API calls use the correct key.

#### Acceptance Criteria

1. WHEN any subscription endpoint (checkout, confirm, change) returns an API_Key in its response, THE API_Client or calling component SHALL save the API_Key to localStorage under the key `kdb_api_key` immediately
2. WHEN the API_Client makes an authenticated request, THE API_Client SHALL include the current API_Key from localStorage in the `x-api-key` header

### Requirement 8: Error Handling — Subscription Endpoints

**User Story:** As a user performing subscription operations, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. IF POST `/subscription/checkout` returns 409 Conflict, THEN THE calling component SHALL display a message indicating the user already has an active subscription and guide them to the Settings_Page
2. IF POST `/subscription/change` returns 400 Bad Request, THEN THE Settings_Page SHALL display a message indicating that free plan users must upgrade through checkout
3. IF POST `/subscription/cancel` returns 404, THEN THE Settings_Page SHALL display a message indicating that free plans cannot be canceled
4. IF POST `/subscription/portal` returns 500, THEN THE Settings_Page SHALL display a message indicating that the billing portal is only available for paid plans
5. IF any subscription API call fails due to a network error, THEN THE calling component SHALL display a generic connectivity error message with a retry suggestion
6. IF the Checkout_Success_Page receives an error from POST `/subscription/confirm`, THEN THE Checkout_Success_Page SHALL display the error and provide a link to the Settings_Page
7. IF a subscription API call returns 401 Unauthorized, THEN THE API_Client SHALL attempt a token refresh and retry the request once before failing
