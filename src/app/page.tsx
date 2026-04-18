// src/app/page.tsx
import Link from "next/link";
import {
  Zap, Users, BarChart3, MessageCircle, Bell, Shield,
  CheckCircle, ArrowRight, Star, Phone, Mail
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00B4C8] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">LeadFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E0F7FA] text-[#00B4C8] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Star className="w-3.5 h-3.5 fill-current" />
          Trusted by 10,000+ sales professionals
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Convert More Leads Into Clients
          <span className="block text-[#00B4C8]">From Your Phone</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Instant lead alerts, one-tap WhatsApp outreach, automated follow-up sequences.
          The only CRM built for B2C salespeople who work on mobile.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
            Start Free — No Credit Card
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
            Sign In to Dashboard
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">Free forever plan • Setup in 5 minutes</p>
      </section>

      {/* Stats bar */}
      <section className="bg-[#1A1A2E] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "100M+", label: "Leads Managed" },
            { val: "300K+", label: "Sales Professionals" },
            { val: "80%", label: "Time Saved" },
            { val: "3×", label: "More Conversions" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-[#00B4C8]">{s.val}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Close More Deals
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Built for real estate agents, insurance professionals, coaches, and solopreneurs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: f.color + "20" }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#00B4C8] text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`card p-6 flex flex-col ${p.highlighted ? "border-[#00B4C8] border-2 relative" : ""}`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#00B4C8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-500 mb-1">{p.name}</div>
                <div className="text-3xl font-bold text-gray-900">{p.price}</div>
                <div className="text-sm text-gray-400">{p.period}</div>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={p.highlighted ? "btn-primary text-center text-sm" : "btn-secondary text-center text-sm"}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-[#1A1A2E] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Sales Professionals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/10 rounded-xl p-6 border border-white/10">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
                <div className="text-white font-medium text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#00B4C8]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Convert More Leads?
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of sales professionals who save 3+ hours a day with LeadFlow.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-[#00B4C8] font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Start for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#00B4C8] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">LeadFlow CRM</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 LeadFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Bell,
    color: "#00B4C8",
    title: "Instant Lead Alerts",
    desc: "Get push notifications the second a new lead comes in from Facebook, Google, your website, or any other source.",
  },
  {
    icon: MessageCircle,
    color: "#7B2FBE",
    title: "One-Tap WhatsApp Outreach",
    desc: "Send personalized WhatsApp messages to any lead with a single tap. Auto-fill their name and details.",
  },
  {
    icon: Zap,
    color: "#F59E0B",
    title: "Automated Follow-up Sequences",
    desc: "Set up multi-step sequences once. LeadFlow automatically follows up across WhatsApp, SMS, and email.",
  },
  {
    icon: BarChart3,
    color: "#22C55E",
    title: "Analytics & Reporting",
    desc: "Track lead sources, conversion rates, team performance, and content engagement from one dashboard.",
  },
  {
    icon: Users,
    color: "#EF4444",
    title: "Team Management",
    desc: "Assign leads to agents, track team performance, and auto-route leads based on source or criteria.",
  },
  {
    icon: Shield,
    color: "#6366F1",
    title: "Secure & Private",
    desc: "End-to-end encrypted. Your lead data is private by default. GDPR compliant with full data control.",
  },
];

const STEPS = [
  { title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card required." },
  { title: "Connect Lead Sources", desc: "Link Facebook Ads, your website, or any form — takes 2 minutes." },
  { title: "Get Instant Alerts", desc: "New leads appear in your app instantly. Tap to contact them." },
  { title: "Close More Deals", desc: "Automated follow-ups ensure no lead ever falls through the cracks." },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlighted: false,
    cta: "Get Started",
    features: [
      "Unlimited lead alerts",
      "Unlimited lead sources",
      "5 message templates",
      "Basic client management",
      "Email notifications",
    ],
  },
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    highlighted: false,
    cta: "Start Starter",
    features: [
      "Everything in Free",
      "Unlimited templates",
      "3 follow-up sequences",
      "500 MB content library",
      "Content tracking",
      "5 custom fields",
    ],
  },
  {
    name: "Pro",
    price: "₹2,499",
    period: "/month",
    highlighted: true,
    cta: "Start Pro",
    features: [
      "Everything in Starter",
      "Unlimited sequences",
      "WhatsApp auto-responder",
      "Bulk messaging",
      "5 GB content library",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "₹5,999",
    period: "/month",
    highlighted: false,
    cta: "Start Team",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team analytics dashboard",
      "20 GB content library",
      "API access",
      "Auto lead assignment",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Sharma",
    role: "Real Estate Agent, Mumbai",
    quote:
      "I used to lose leads because I couldn't follow up fast enough. With LeadFlow, I contact every lead within seconds. My conversions went up 3x.",
  },
  {
    name: "Priya Nair",
    role: "Insurance Advisor, Bangalore",
    quote:
      "The automated sequences are a game changer. I set it up once and LeadFlow follows up with my leads for me. Saves me 4 hours every single day.",
  },
  {
    name: "Amit Gupta",
    role: "Digital Marketing Consultant, Delhi",
    quote:
      "Connecting my Facebook Lead Ads took 2 minutes. Now every lead pops up on my phone instantly with a WhatsApp button. Incredible tool.",
  },
];
