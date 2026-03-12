import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Authentication - KnowledgeDB API' };

export default function AuthDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>Authentication</h1>
        <p>Token-based authentication. Sign up, login to receive tokens, and include the idToken as a Bearer token in all authenticated requests.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-8 text-sm text-text-secondary">
          🔑 Auth flow: <code className="text-accent">POST /auth/signup</code> → <code className="text-accent">POST /auth/login</code> → use the returned idToken as <code className="text-accent">Authorization: Bearer &lt;idToken&gt;</code>. Tokens expire in 1 hour. Use <code className="text-accent">/auth/refresh</code> to get new tokens.
        </div>

        <EndpointBlock method="POST" title="Sign Up" path="/auth/signup" id="signup"
          description="Register a new user account. After signup, the account is immediately active — no email verification step required."
          requiresAuth={false}
          requestParams={[
            { name: 'email', type: 'string', required: true, desc: "User's email address. Must be unique." },
            { name: 'password', type: 'string', required: true, desc: 'Password. Must include uppercase, lowercase, number, and special character.' },
            { name: 'firstName', type: 'string', required: true, desc: "User's first name." },
            { name: 'lastName', type: 'string', required: true, desc: "User's last name." },
          ]}
          responseFields={[
            { name: 'message', type: 'string', desc: 'Success confirmation message.' },
            { name: 'userId', type: 'string', desc: 'Unique user identifier (UUID).' },
            { name: 'apiKey', type: 'string', desc: 'API key for x-api-key header.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /auth/signup\n{\n  "email": "user@example.com",\n  "password": "SecurePass1!",\n  "firstName": "John",\n  "lastName": "Doe"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "User registered successfully",\n  "userId": "abc-123-def",\n  "apiKey": "ak_xxxxxxxx"\n}' },
          ]}
          testFields={[
            { name: 'email', placeholder: 'user@example.com' },
            { name: 'password', placeholder: 'SecurePass1!' },
            { name: 'firstName', placeholder: 'John' },
            { name: 'lastName', placeholder: 'Doe' },
          ]}
          notes={['If the email is already registered, you\'ll receive a 400 error with "User already exists".']}
        />

        <EndpointBlock method="POST" title="Login" path="/auth/login" id="login"
          description="Authenticate with email and password to receive JWT tokens. The idToken is used for API authentication, the accessToken for Cognito operations, and the refreshToken to get new tokens."
          requiresAuth={false}
          requestParams={[
            { name: 'email', type: 'string', required: true, desc: "Registered email address." },
            { name: 'password', type: 'string', required: true, desc: "Account password." },
          ]}
          responseFields={[
            { name: 'idToken', type: 'string', desc: 'JWT token for API authentication (Bearer token). Expires in 1 hour.' },
            { name: 'accessToken', type: 'string', desc: 'Cognito access token.' },
            { name: 'refreshToken', type: 'string', desc: 'Token to refresh expired tokens without re-login.' },
            { name: 'apiKey', type: 'string', desc: 'API key for x-api-key header.' },
            { name: 'firstName', type: 'string', desc: "User's first name." },
            { name: 'lastName', type: 'string', desc: "User's last name." },
            { name: 'email', type: 'string', desc: "User's email." },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /auth/login\n{\n  "email": "user@example.com",\n  "password": "SecurePass1!"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "idToken": "eyJhbGciOi...",\n  "accessToken": "eyJhbGciOi...",\n  "refreshToken": "eyJhbGciOi...",\n  "apiKey": "ak_xxxxxxxx",\n  "firstName": "John",\n  "lastName": "Doe",\n  "email": "user@example.com"\n}' },
          ]}
          testFields={[
            { name: 'email', placeholder: 'user@example.com' },
            { name: 'password', placeholder: 'SecurePass1!' },
          ]}
        />

        <EndpointBlock method="POST" title="Refresh Tokens" path="/auth/refresh" id="refresh"
          description="Get new tokens using a valid refresh token. Use this when your idToken expires (after 1 hour) instead of re-logging in."
          requiresAuth={false}
          requestParams={[
            { name: 'refreshToken', type: 'string', required: true, desc: 'The refresh token from login.' },
          ]}
          responseFields={[
            { name: 'idToken', type: 'string', desc: 'New JWT token for API authentication.' },
            { name: 'accessToken', type: 'string', desc: 'New Cognito access token.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /auth/refresh\n{\n  "refreshToken": "eyJhbGciOi..."\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "idToken": "eyJhbGciOi...",\n  "accessToken": "eyJhbGciOi..."\n}' },
          ]}
          testFields={[
            { name: 'refreshToken', type: 'textarea', placeholder: 'Paste your refresh token here' },
          ]}
        />

        <EndpointBlock method="POST" title="Logout" path="/auth/logout" id="logout"
          description="Invalidate the current session. Requires the access token to revoke."
          requestParams={[
            { name: 'accessToken', type: 'string', required: true, desc: 'The access token to invalidate.' },
          ]}
          responseFields={[
            { name: 'message', type: 'string', desc: 'Logout confirmation.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /auth/logout\n// Authorization: Bearer <idToken>\n{\n  "accessToken": "eyJhbGciOi..."\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Logged out successfully"\n}' },
          ]}
          testFields={[
            { name: 'accessToken', type: 'textarea', placeholder: 'Paste your access token here' },
          ]}
        />
      </div>
    </div>
  );
}
