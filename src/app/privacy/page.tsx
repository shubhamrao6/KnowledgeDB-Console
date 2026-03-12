import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy - KnowledgeDB' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <div className="flex gap-3 mb-10 flex-wrap">
          <Link href="/privacy" className="text-xs text-accent border border-accent rounded-lg px-3 py-1.5">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-text-muted border border-border rounded-lg px-3 py-1.5 hover:border-accent hover:text-accent transition-colors">Terms of Service</Link>
          <Link href="/" className="text-xs text-text-muted border border-border rounded-lg px-3 py-1.5 hover:border-accent hover:text-accent transition-colors ml-auto">← Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-12">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-accent [&_h2]:mt-12 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-accent [&_a:hover]:underline">
          <p>Entropy AI Research Labs Pvt Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the KnowledgeDB platform (knowledgedb.dev) and its associated services. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform, API, and related services.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li>Account information: name, email address, and password when you register via our authentication API.</li>
            <li>Usage data: API call logs, feature usage patterns, timestamps, and request metadata to maintain and improve our services.</li>
            <li>Content you upload: documents (PDF, DOCX, TXT, Markdown), images, and other files you submit to your knowledge bases.</li>
            <li>AI interaction data: search queries, chat messages sent via our WebSocket interface, and AI-generated responses.</li>
            <li>Technical data: IP address, browser type, device information, and cookies necessary for authentication and session management.</li>
            <li>Payment information: billing details processed through our third-party payment providers. We do not store full payment card numbers.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, operate, and maintain the KnowledgeDB platform and API services.</li>
            <li>To process and index your uploaded documents and images for AI-powered search and retrieval (RAG).</li>
            <li>To authenticate your identity and manage your account and API access tokens.</li>
            <li>To process payments and manage your subscription (Starter, Professional, or Enterprise plans).</li>
            <li>To communicate with you about service updates, security alerts, and support requests.</li>
            <li>To monitor and analyze usage trends to improve platform performance and reliability.</li>
            <li>To detect, prevent, and address technical issues, abuse, or security threats.</li>
          </ul>

          <h2>3. AI Processing and Your Content</h2>
          <p>When you upload documents or images to KnowledgeDB, our AI systems process this content to create searchable indexes within your knowledge bases. Key points:</p>
          <ul>
            <li>Your content is processed within your isolated knowledge base namespace and is not shared with other users.</li>
            <li>We do not use your uploaded content to train our AI models unless you explicitly opt in.</li>
            <li>AI-generated responses are derived from your content and the underlying language models.</li>
            <li>You retain full ownership of all content you upload to the platform.</li>
          </ul>

          <h2>4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul>
            <li>Cloud infrastructure providers who host our API and storage services, under strict data processing agreements.</li>
            <li>Payment processors to handle subscription billing.</li>
            <li>Law enforcement or regulatory authorities when required by applicable law.</li>
            <li>Third parties in connection with a merger, acquisition, or sale of assets, with prior notice.</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>We retain your account information for as long as your account is active. Uploaded documents and knowledge base content are retained until you delete them or close your account. API logs are retained for up to 12 months. Upon account deletion, we remove your personal data within 30 days, except where retention is required by law.</p>

          <h2>6. Data Security</h2>
          <ul>
            <li>Encryption of data in transit (TLS/HTTPS) and at rest.</li>
            <li>Token-based authentication with automatic expiration (1-hour token lifetime with refresh capability).</li>
            <li>Isolated knowledge base namespaces to prevent cross-user data access.</li>
            <li>Regular security audits and vulnerability assessments.</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal data.</li>
            <li>Export your uploaded documents and knowledge base content.</li>
            <li>Restrict or object to certain processing activities.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Lodge a complaint with a data protection authority.</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:director@entropyresearch.ai">director@entropyresearch.ai</a>.</p>

          <h2>8. Cookies</h2>
          <p>We use minimal cookies and local storage for essential functionality: authentication session management and theme preference (<code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-xs">kdb_theme</code>). We do not use third-party tracking or advertising cookies.</p>

          <h2>9. International Data Transfers</h2>
          <p>Our services are operated from Ireland and the United States. If you access KnowledgeDB from outside these regions, your data may be transferred to and processed in these jurisdictions. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws, including GDPR.</p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>KnowledgeDB is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &ldquo;Last updated&rdquo; date.</p>

          <h2>12. Contact Us</h2>
          <p>Entropy AI Research Labs Pvt Ltd<br />Dublin, Ireland<br /><a href="mailto:director@entropyresearch.ai">director@entropyresearch.ai</a></p>
        </div>
      </div>
    </div>
  );
}
