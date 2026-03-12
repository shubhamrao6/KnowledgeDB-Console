import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service - KnowledgeDB' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <div className="flex gap-3 mb-10 flex-wrap">
          <Link href="/privacy" className="text-xs text-text-muted border border-border rounded-lg px-3 py-1.5 hover:border-accent hover:text-accent transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-accent border border-accent rounded-lg px-3 py-1.5">Terms of Service</Link>
          <Link href="/" className="text-xs text-text-muted border border-border rounded-lg px-3 py-1.5 hover:border-accent hover:text-accent transition-colors ml-auto">← Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Terms of Service</h1>
        <p className="text-sm text-text-muted mb-12">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-accent [&_h2]:mt-12 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-accent [&_a:hover]:underline">
          <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the KnowledgeDB platform, API, and related services (&ldquo;Services&rdquo;) operated by Entropy AI Research Labs Pvt Ltd (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using our Services, you agree to be bound by these Terms.</p>

          <h2>1. Account Registration</h2>
          <p>To use KnowledgeDB, you must create an account by providing accurate and complete information. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials and API tokens.</li>
            <li>All activities that occur under your account, including API calls made with your authentication tokens.</li>
            <li>Notifying us immediately of any unauthorized use of your account.</li>
          </ul>
          <p>You must be at least 16 years of age to create an account.</p>

          <h2>2. Services Description</h2>
          <p>KnowledgeDB provides a platform for building LLM-powered applications, including:</p>
          <ul>
            <li>Knowledge base creation and management for organizing your documents and data.</li>
            <li>Document upload and AI-powered indexing (PDF, DOCX, TXT, Markdown).</li>
            <li>AI image generation and image analysis with vision models.</li>
            <li>RAG-powered search with AI-generated answers grounded in your documents.</li>
            <li>Real-time WebSocket chat powered by large language models.</li>
            <li>REST API access for programmatic integration.</li>
          </ul>

          <h2>3. Subscription Plans and Payment</h2>
          <p>KnowledgeDB offers tiered subscription plans (Starter, Professional, and Enterprise). By subscribing to a paid plan, you agree to pay all fees associated with your selected plan. We reserve the right to modify pricing with 30 days&apos; advance notice.</p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to use KnowledgeDB to:</p>
          <ul>
            <li>Upload, store, or process content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
            <li>Generate content that violates any applicable law or infringes on third-party intellectual property rights.</li>
            <li>Attempt to gain unauthorized access to other users&apos; knowledge bases, accounts, or data.</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of our AI models or platform.</li>
            <li>Use the API to build a competing service or resell API access without authorization.</li>
            <li>Exceed your plan&apos;s rate limits or engage in activities that degrade service performance.</li>
          </ul>

          <h2>5. Your Content and Intellectual Property</h2>
          <p>You retain all ownership rights to content you upload to KnowledgeDB. By uploading content, you grant us a limited license to process, index, and store your content as necessary to provide the Services. This license terminates when you delete your content or close your account. We do not claim ownership of your content.</p>

          <h2>6. AI-Generated Content</h2>
          <p>You acknowledge that AI-generated content may not always be accurate, complete, or appropriate. You are responsible for reviewing and validating AI outputs before use. We do not guarantee the accuracy or reliability of AI-generated responses.</p>

          <h2>7. API Usage</h2>
          <ul>
            <li>Use API authentication tokens securely and not share them publicly.</li>
            <li>Respect rate limits and usage quotas associated with your subscription plan.</li>
            <li>Tokens expire after 1 hour and must be refreshed using the provided refresh endpoint.</li>
          </ul>

          <h2>8. Service Availability</h2>
          <p>We strive to maintain high availability but do not guarantee uninterrupted access. We may temporarily suspend access for maintenance, updates, or security reasons.</p>

          <h2>9. Termination</h2>
          <p>Either party may terminate this agreement at any time. Upon termination, your access will be revoked and your content deleted within 30 days unless you request an export.</p>

          <h2>10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Entropy AI Research Labs Pvt Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>The Services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express or implied.</p>

          <h2>12. Governing Law</h2>
          <p>These Terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ireland.</p>

          <h2>13. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Services after changes constitutes acceptance of the revised Terms.</p>

          <h2>14. Contact Us</h2>
          <p>Entropy AI Research Labs Pvt Ltd<br />Dublin, Ireland<br /><a href="mailto:director@entropyresearch.ai">director@entropyresearch.ai</a></p>
        </div>
      </div>
    </div>
  );
}
