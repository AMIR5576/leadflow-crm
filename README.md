# LeadFlow CRM 🚀

A **production-ready, mobile-first SaaS CRM** built with Next.js 14, TypeScript, PostgreSQL/Prisma, and OpenAI — designed for B2C sales professionals who manage leads via WhatsApp and mobile.

---

## 🏗️ Architecture Overview

```
leadflow/
├── prisma/
│   ├── schema.prisma          # Full DB schema (16 models)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (marketing)
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Register page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx       # Home dashboard (stats + onboarding)
│   │   │   ├── clients/       # Lead management (list + detail + new)
│   │   │   ├── analytics/     # Charts and reporting
│   │   │   ├── automations/   # AI sequence builder
│   │   │   ├── activities/    # Activity log
│   │   │   ├── team/          # Team management
│   │   │   └── settings/      # Lead sources, templates, etc.
│   │   ├── admin/             # Admin panel (super admin only)
│   │   └── api/
│   │       ├── auth/          # Login, register, logout
│   │       ├── clients/       # CRUD + CSV export
│   │       ├── webhook/       # Inbound leads from Facebook, forms, etc.
│   │       ├── generate/      # OpenAI sequence + template generation
│   │       └── admin/         # Admin-only exports
│   ├── components/
│   │   └── dashboard/         # All UI components
│   ├── lib/
│   │   ├── prisma.ts          # DB client singleton
│   │   ├── auth.ts            # JWT auth + session management
│   │   ├── openai.ts          # AI generation (server-side only)
│   │   └── utils.ts           # Helpers, formatters, CSV export
│   └── types/
│       └── index.ts           # Full TypeScript types
├── .env.example               # Environment variables template
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**Tech Stack:**
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom JWT (jose) + bcrypt |
| AI | OpenAI GPT-4o-mini |
| Charts | Recharts |
| Payments | Stripe + Razorpay (hooks ready) |
| Hosting | Vercel |
| File Storage | AWS S3 / Cloudflare R2 (configured) |

---

## ⚙️ Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/leadflow-crm.git
cd leadflow-crm
npm install
```

---

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then fill in all values (see `.env.example` below for reference).

---

### Step 3: Set Up PostgreSQL Database

**Option A: Neon (Free, Recommended for Vercel)**
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the **Connection String**
3. Paste into `DATABASE_URL` in your `.env`

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to Settings → Database → Connection String (URI)
3. Paste into `DATABASE_URL` in your `.env`

**Option C: Local PostgreSQL**
```bash
# macOS
brew install postgresql && brew services start postgresql
createdb leadflow_dev

# Ubuntu/WSL
sudo apt install postgresql
sudo -u postgres createdb leadflow_dev
```
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadflow_dev"
```

---

### Step 4: Push Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# Seed with demo data (optional but recommended)
npm run db:seed
```

After seeding, two accounts are created:
```
Admin:  admin@leadflow.com  /  admin123456
Demo:   demo@leadflow.com   /  demo123456
```

---

### Step 5: Set Up OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env`:
```
OPENAI_API_KEY=sk-...
```
> The AI is used for generating follow-up sequences and message templates.

---

### Step 6: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Step 7: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel
# Follow prompts → link to your GitHub repo
```

**Option B: Vercel Dashboard**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add all environment variables (from `.env`) in the Vercel dashboard
5. Click **Deploy**

> **Important:** Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.

---

## 🔐 Environment Variables Reference

Create `.env` with these values:

```bash
# ── DATABASE ─────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# ── AUTH ─────────────────────────────────────────────────────────
# Generate a random 32+ character string for JWT signing
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# ── APP URL ──────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# On Vercel: https://your-app.vercel.app

# ── OPENAI ───────────────────────────────────────────────────────
OPENAI_API_KEY="sk-..."

# ── FACEBOOK (for Lead Ads integration) ──────────────────────────
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_WEBHOOK_VERIFY_TOKEN="your-custom-verify-token"

# ── PAYMENTS ─────────────────────────────────────────────────────
# Stripe (international)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay (India)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."

# ── EMAIL (pick one) ─────────────────────────────────────────────
# SendGrid
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"

# OR AWS SES
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SES_REGION="ap-south-1"

# ── FILE STORAGE (pick one) ──────────────────────────────────────
# AWS S3
AWS_S3_BUCKET="leadflow-content"
AWS_S3_REGION="ap-south-1"

# OR Cloudflare R2
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_R2_BUCKET="leadflow-content"
CLOUDFLARE_R2_ACCESS_KEY="..."
CLOUDFLARE_R2_SECRET_KEY="..."

# ── WHATSAPP BUSINESS API (pick a provider) ──────────────────────
# 360dialog
WHATSAPP_API_KEY="..."
WHATSAPP_PHONE_NUMBER_ID="..."

# ── PUSH NOTIFICATIONS (Firebase) ────────────────────────────────
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
```

---

## 📦 Available Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB (dev)
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:seed      # Seed demo data
```

---

## 🗄️ Database Models Overview

| Model | Purpose |
|-------|---------|
| `User` | Accounts (owner, manager, agent, admin) |
| `Team` | Group of users sharing leads |
| `Session` | JWT sessions (stored for revocation) |
| `Client` | Leads / contacts (core entity) |
| `Activity` | Timeline of all interactions per client |
| `Template` | WhatsApp/SMS/Email message templates |
| `Sequence` | Multi-step follow-up automation |
| `SequenceStep` | Individual step within a sequence |
| `SequenceRun` | Tracks sequence execution per client |
| `ContentFile` | Uploaded PDFs, images, brochures |
| `ContentShare` | Trackable link per client per file |
| `LeadSource` | Connected integrations (Facebook, webhooks) |
| `Notification` | In-app alert system |
| `OnboardingProgress` | Tracks 8-step onboarding checklist |
| `ToolUsage` | Usage analytics per user per action |
| `Subscription` | Billing / plan management |

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → set session cookie |
| GET | `/api/auth/logout` | Clear session |
| GET | `/api/clients` | List clients (paginated, filtered) |
| POST | `/api/clients` | Create client (with deduplication) |
| GET | `/api/clients/:id` | Get client + activities |
| PATCH | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |
| GET | `/api/clients/export` | Download CSV of all clients |
| POST | `/api/webhook/:userId` | Receive inbound leads (Facebook, forms) |
| GET | `/api/webhook/:userId` | Facebook webhook verification |
| POST | `/api/generate/sequence` | AI-generate follow-up sequence |
| GET | `/api/admin/export-emails` | Admin: export all user emails |

---

## 📱 Webhook Integration Guide

Every user gets a unique webhook URL:
```
https://yourapp.vercel.app/api/webhook/USER_ID
```

**POST a lead:**
```json
{
  "name": "Amit Kumar",
  "phone": "+919800000000",
  "email": "amit@email.com",
  "source": "Facebook Ads",
  "notes": "Interested in 2BHK"
}
```

**Response:**
```json
{ "success": true, "action": "created", "clientId": "clxyz..." }
```

**Connect via Zapier:**
1. Create a Zapier Zap with your trigger (Facebook Lead Ads, Google Ads, etc.)
2. Add a "Webhooks by Zapier" action → POST
3. Enter your webhook URL
4. Map fields: name, phone, email, source

---

## 🧪 Testing the App

After `npm run db:seed`, log in as the demo user:
```
Email:    demo@leadflow.com
Password: demo123456
```

You'll see:
- ✅ 12 demo leads with various statuses
- ✅ Sample templates and a default sequence
- ✅ Onboarding checklist (partially complete)
- ✅ Activity log for each lead
- ✅ Analytics with real data

**Test webhook (add a lead via API):**
```bash
curl -X POST https://localhost:3000/api/webhook/DEMO_USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","phone":"+919900000001","source":"Test"}'
```

---

## 🛣️ Development Roadmap

### Phase 1 (Current — MVP) ✅
- [x] Auth (login, register, JWT sessions)
- [x] Dashboard with stats + onboarding checklist
- [x] Full client management (list, detail, create, update, delete)
- [x] Activity timeline per client
- [x] Webhook for inbound leads with deduplication
- [x] WhatsApp/Call/SMS one-tap outreach
- [x] Analytics charts (status, source, trends)
- [x] AI sequence generator (OpenAI)
- [x] CSV export
- [x] Admin panel with user stats + email export
- [x] Lead sources settings + webhook URL

### Phase 2 (Next)
- [ ] Message templates CRUD UI
- [ ] Content library (file upload + tracking)
- [ ] Sequence execution engine (cron-based)
- [ ] Email notifications via SendGrid
- [ ] CSV import
- [ ] Facebook Lead Ads OAuth flow
- [ ] Follow-up reminder notifications

### Phase 3
- [ ] Team management full flow (invite via email)
- [ ] Lead assignment rules (round-robin, by source)
- [ ] WhatsApp Business API integration
- [ ] Bulk messaging
- [ ] Stripe + Razorpay billing

### Phase 4
- [ ] Mobile app (React Native — shared types)
- [ ] Zapier integration
- [ ] Public REST API with docs
- [ ] IndiaMART lead integration
- [ ] AI lead scoring

---

## 🔒 Security Notes

- All passwords hashed with bcrypt (cost factor 12)
- Sessions use signed JWT (HS256) stored in httpOnly cookies
- All API routes validate session server-side
- Input validation via Zod on all endpoints
- Rate limiting on login (10/min) and AI generation (5/min)
- RBAC enforced: agents can only see their own leads
- Admin routes check `role === "ADMIN"`
- OpenAI key is server-side only — never exposed to client

---

## 📄 License

MIT — build your own SaaS on top of this freely.

---

Built with ❤️ using the LeadFlow CRM PRD as the product specification.
