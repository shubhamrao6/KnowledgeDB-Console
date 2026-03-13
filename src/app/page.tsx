'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import { Brain, Settings2, Plug, MessageSquare, FileText, PenTool, Database, Terminal, BarChart3, Code, Rocket, Shield, Mail, MapPin, Zap, ExternalLink, ChevronDown, ChevronUp, Briefcase, Building, Sprout } from 'lucide-react';

const features = [
  { icon: Code, title: 'No-Code Builder', desc: 'Create sophisticated LLM applications without writing a single line of code. Our visual interface makes AI development accessible to everyone.' },
  { icon: Rocket, title: 'Instant Deployment', desc: 'Deploy your LLM applications instantly to the cloud with one click. Scale automatically based on demand with our robust infrastructure.' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'Built for scale with enterprise-grade security, compliance, and support. Integrate seamlessly with your existing workflows and systems.' },
];

const accordion = [
  { icon: Brain, title: 'Pre-trained Models', body: 'Access a comprehensive library of pre-trained language models including GPT, BERT, and custom domain-specific models ready for immediate use in your applications.' },
  { icon: Settings2, title: 'Custom Training', body: 'Fine-tune models with your own data to create specialized AI applications tailored to your specific use case and industry requirements.' },
  { icon: Plug, title: 'API Integration', body: 'Seamlessly integrate your LLM applications with existing systems through our robust REST APIs and SDKs for popular programming languages.' },
];

const solutions = [
  { icon: MessageSquare, title: 'Chatbot Builder', desc: 'Create intelligent conversational AI with natural language understanding and context awareness' },
  { icon: FileText, title: 'Document Analysis', desc: 'Extract insights from documents with advanced text processing and summarization capabilities' },
  { icon: PenTool, title: 'Content Generation', desc: 'Generate high-quality content for marketing, documentation, and creative writing' },
  { icon: Database, title: 'Knowledge Base', desc: 'Build intelligent knowledge bases that understand and answer complex queries' },
  { icon: Terminal, title: 'Code Assistant', desc: 'AI-powered coding assistance for faster development and code optimization' },
  { icon: BarChart3, title: 'Data Analytics', desc: 'Transform raw data into actionable insights with natural language queries' },
];

const pricing = [
  { icon: Sprout, title: 'Starter', price: 'Free', period: '', desc: 'Perfect for individuals and small projects getting started with LLM applications', items: ['5 LLM Applications', '10K API Calls/month', 'Basic Templates', 'Community Support'], cta: 'Get Started', plan: 'starter' },
  { icon: Briefcase, title: 'Professional', price: '€9.99', period: '/mo', desc: 'Ideal for growing businesses and development teams building production apps', items: ['Unlimited Applications', '100K API Calls/month', 'Custom Model Training', 'Priority Support'], cta: 'Get Started', featured: true, plan: 'professional' },
  { icon: Building, title: 'Enterprise', price: 'Custom', period: '', desc: 'Scalable solutions for large organizations with advanced security and compliance needs', items: ['Unlimited Everything', 'Dedicated Infrastructure', 'Advanced Security', '24/7 Support'], cta: 'Contact Sales', plan: 'enterprise' },
];

const slides = [
  { img: '/img/1920x1080/01.jpg', title: 'Build LLM Apps Effortlessly', sub: 'Transform your ideas into powerful AI applications with KnowledgeDB.\nYour complete platform for custom LLM development.', cta: 'Get Started', href: '#pricing' },
  { img: '/img/1920x1080/02.jpg', title: 'LLMs for Everyone', sub: 'No coding required — Create, deploy, and scale your AI solutions\nwith our intuitive drag-and-drop interface.', cta: 'Learn More', href: '#about' },
];

export default function LandingPage() {
  const router = useRouter();
  const { hydrate } = useAuthStore();
  const [openAccordion, setOpenAccordion] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const goSlide = (i: number) => {
    setActiveSlide(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 6000);
  };

  // Smooth scroll for anchor links
  const smoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenu(false);
    }
  }, []);

  const handlePricingCTA = async (plan: string) => {
    if (!isLoggedIn()) {
      if (plan === 'starter') {
        router.push('/signup');
      } else {
        router.push('/login?plan=' + plan);
      }
      return;
    }

    setLoadingPlan(plan);
    try {
      const { status, data } = await apiRequest<{
        checkoutUrl?: string;
        checkoutId?: string;
        apiKey?: string;
        subscription?: object;
        error?: string;
      }>('POST', '/subscription/checkout', { plan, successUrl: window.location.origin + '/console/checkout/success?checkout_id={CHECKOUT_ID}' });

      if (status === 409) {
        alert('You already have an active subscription');
        router.push('/console/settings');
        return;
      }

      if (status >= 400) {
        alert(data?.error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.apiKey) {
        localStorage.setItem('kdb_api_key', data.apiKey);
        router.push('/console');
      }
    } catch {
      alert('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <nav className={`landing-nav flex items-center ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between h-full">
          <a href="#body" onClick={(e) => smoothScroll(e, '#body')} className="flex items-center gap-2 no-underline">
            <Logo size={30} />
            <span className="font-bold text-[26px] text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
              Knowledge<span className="text-[30px] font-black">DB</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="#body" onClick={(e) => smoothScroll(e, '#body')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Home</a>
            <a href="#about" onClick={(e) => smoothScroll(e, '#about')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#services" onClick={(e) => smoothScroll(e, '#services')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Solutions</a>
            <a href="#showcase" onClick={(e) => smoothScroll(e, '#showcase')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Showcase</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')} className="text-[15px] text-text-secondary hover:text-text-primary transition-colors">Contact</a>
            <Link href="/docs" target="_blank" className="text-[15px] text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1.5">API Docs <ExternalLink size={11} className="opacity-60" /></Link>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-accent hover:text-accent-light transition-colors inline-flex items-center gap-1.5">
              Console <span className="text-xs">→</span>
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-text-secondary" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </nav>
      {mobileMenu && (
        <div className="fixed inset-0 z-[99] bg-bg-primary pt-16 px-6 md:hidden">
          <div className="flex flex-col gap-4 text-lg">
            <a href="#body" onClick={(e) => smoothScroll(e, '#body')} className="text-text-secondary py-2">Home</a>
            <a href="#about" onClick={(e) => smoothScroll(e, '#about')} className="text-text-secondary py-2">Features</a>
            <a href="#services" onClick={(e) => smoothScroll(e, '#services')} className="text-text-secondary py-2">Solutions</a>
            <a href="#showcase" onClick={(e) => smoothScroll(e, '#showcase')} className="text-text-secondary py-2">Showcase</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')} className="text-text-secondary py-2">Pricing</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')} className="text-text-secondary py-2">Contact</a>
            <Link href="/docs" target="_blank" className="text-text-secondary py-2">API Docs</Link>
            <Link href="/login" className="text-accent py-2">Console →</Link>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Carousel Hero */}
      <section id="body" className="carousel-hero">
        {slides.map((slide, i) => (
          <div key={i} className={`carousel-slide ${activeSlide === i ? 'active' : ''}`}>
            <Image src={slide.img} alt="Slider" fill className="object-cover" priority={i === 0} />
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <h2 className="carousel-title">{slide.title}</h2>
              <p className="carousel-sub">{slide.sub}</p>
              <a href={slide.href} onClick={(e) => smoothScroll(e, slide.href)} className="carousel-cta">{slide.cta}</a>
            </div>
          </div>
        ))}
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)} className={`carousel-dot ${activeSlide === i ? 'active' : ''}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="about" className="landing-section">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="feature-card flex flex-col items-center">
                <f.icon size={48} className="text-accent mb-5" />
                <h3 className="text-xl font-semibold text-text-primary mb-3">{f.title}</h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why KnowledgeDB */}
      <section className="landing-section landing-section-alt">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="pt-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-5 flex items-center gap-3">
                <Logo size={36} /> Why KnowledgeDB?
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-8">
                We democratize AI development by making LLM application creation accessible to everyone. Whether you&apos;re a startup, enterprise, or individual developer, our platform provides the tools you need to build, deploy, and scale intelligent applications without the complexity.
              </p>
              <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')} className="inline-block px-7 py-3 border border-border text-text-secondary text-sm font-medium rounded-lg hover:border-accent hover:text-text-primary transition-colors uppercase tracking-wider">
                Contact Us
              </a>
            </div>
            <div className="space-y-4">
              {accordion.map((item, i) => (
                <div key={i} className="bg-bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-border-light">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left"
                  >
                    <item.icon size={22} className="text-accent shrink-0" />
                    <span className="flex-1 font-semibold text-text-primary text-[16px]">{item.title}</span>
                    {openAccordion === i ? <ChevronUp size={18} className="text-text-muted" /> : <ChevronDown size={18} className="text-text-muted" />}
                  </button>
                  {openAccordion === i && (
                    <div className="px-6 pb-5 text-[15px] text-text-secondary leading-relaxed">
                      {item.body}
                      {i === 2 && (
                        <span className="block mt-3">
                          <Link href="/docs" target="_blank" className="text-accent hover:underline text-[15px]">Explore the API Documentation →</Link>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-section landing-section-alt">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[16px] text-text-secondary max-w-[600px] mx-auto">Choose the plan that fits your needs. Start free and scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((p, i) => (
              <div key={i} className={`pricing-card ${p.featured ? 'featured' : ''}`}>
                {p.featured && <div className="pricing-badge">Most Popular</div>}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mx-auto mb-5">
                  <p.icon size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{p.title}</h3>
                <div className="text-4xl font-bold text-accent mb-1">{p.price}</div>
                {p.period && <div className="text-base text-text-muted mb-4">{p.period}</div>}
                {!p.period && <div className="mb-4" />}
                <p className="text-sm text-text-secondary mb-8 leading-relaxed">{p.desc}</p>
                <ul className="text-left space-y-3 mb-8">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-[15px] text-text-secondary">
                      <span className="text-green text-sm">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePricingCTA(p.plan)} disabled={loadingPlan === p.plan} className="block w-full py-3 text-center text-sm font-medium border border-border rounded-lg hover:border-accent hover:text-accent transition-colors text-text-secondary uppercase tracking-wider">
                  {loadingPlan === p.plan ? 'Loading...' : p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="services" className="landing-section">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Our Solutions</h2>
            <p className="text-[16px] text-text-secondary max-w-[600px] mx-auto">Comprehensive LLM development solutions designed to accelerate your AI journey from concept to production deployment.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <div key={i} className="solution-card">
                <s.icon size={36} className="text-accent mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-3">{s.title}</h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="landing-section landing-section-alt">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Built with KnowledgeDB</h2>
            <p className="text-[16px] text-text-secondary">Discover powerful applications created using our low-code LLM platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { name: 'ChaosAI', url: 'https://chaosai.knowledgedb.dev', icon: Zap, color: 'text-accent', desc: 'AI-powered chaos engineering platform for intelligent system failure simulation and management.' },
              { name: 'DocHuman', url: 'https://dochuman.knowledgedb.dev', icon: FileText, color: 'text-blue', desc: 'Revolutionary document processing platform for intelligent analysis and human-AI collaboration.' },
            ].map((app, i) => (
              <div key={i} className="showcase-app">
                <div className="showcase-browser-bar">
                  <div className="showcase-dots"><span /><span /><span /></div>
                  <div className="showcase-url-bar">🔒 {app.url.replace('https://', '')}</div>
                </div>
                <div className="showcase-preview">
                  <iframe src={app.url} scrolling="no" loading="lazy" title={app.name} />
                </div>
                <div className="showcase-info">
                  <div className="flex items-center gap-2.5 mb-3">
                    <app.icon size={22} className={app.color} />
                    <h4 className="text-xl font-bold text-text-primary">{app.name}</h4>
                  </div>
                  <p>{app.desc}</p>
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className={`btn-showcase ${i === 1 ? 'blue' : ''}`}>
                    Visit {app.name} <ExternalLink size={12} className="ml-1.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="landing-section">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Get in Touch</h2>
            <p className="text-[16px] text-text-secondary max-w-[600px] mx-auto">Ready to transform your business with AI? Contact us to discuss your LLM application needs and explore custom solutions.</p>
          </div>
          <div className="max-w-[500px] mx-auto mb-12">
            <div className="bg-bg-card border border-border rounded-2xl p-8 text-center hover:border-accent/40 transition-colors">
              <Mail size={36} className="text-accent mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-text-primary mb-2">Email Us</h4>
              <a href="mailto:director@entropyresearch.ai" className="text-accent hover:underline font-medium">director@entropyresearch.ai</a>
              <p className="text-sm text-text-muted mt-2">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="relative h-[300px]">
            <div className="absolute top-4 left-4 z-10 bg-bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <MapPin size={16} className="text-accent" />
              <span className="text-sm font-medium text-text-primary">Dublin, Ireland</span>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9528.516234567891!2d-6.2603097!3d53.3498053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670e99a9c0b2e7%3A0x9c9c0b2e7a9c0b2e!2sDublin+City+Centre%2C+Dublin%2C+Ireland!5e0!3m2!1sen!2sie!4v1640995200000"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Map"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-main">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Navigation</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#body" onClick={(e) => smoothScroll(e, '#body')} className="text-sm text-text-muted hover:text-text-primary transition-colors">Home</a>
                <a href="#about" onClick={(e) => smoothScroll(e, '#about')} className="text-sm text-text-muted hover:text-text-primary transition-colors">Features</a>
                <a href="#services" onClick={(e) => smoothScroll(e, '#services')} className="text-sm text-text-muted hover:text-text-primary transition-colors">Solutions</a>
                <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')} className="text-sm text-text-muted hover:text-text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Resources</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')} className="text-sm text-text-muted hover:text-text-primary transition-colors">Pricing</a>
                <Link href="/docs" target="_blank" className="text-sm text-text-muted hover:text-text-primary transition-colors">Documentation</Link>
                <Link href="/docs" target="_blank" className="text-sm text-text-muted hover:text-text-primary transition-colors">API Reference</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Legal</h4>
              <div className="flex flex-col gap-2.5">
                <Link href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-text-muted hover:text-text-primary transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Connect</h4>
              <p className="text-sm text-text-muted leading-relaxed mb-4">Building the future of AI-powered applications, one solution at a time.</p>
              <a href="https://www.linkedin.com/company/entropy-ai-research" target="_blank" rel="noopener noreferrer" className="linkedin-icon" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-bold text-lg text-text-primary" style={{ fontFamily: "'Orbitron', monospace" }}>Knowledge<span className="text-accent">DB</span></span>
            </div>
            <p className="text-text-muted text-sm">© 2026 Entropy AI Research Labs Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
