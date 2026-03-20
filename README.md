# SynapseForge

**AI Agent Platform for Businesses**

SynapseForge (branded as OpenHelix AI) is a managed platform for deploying AI agents across multiple channels. Businesses can create, configure, and deploy AI assistants without managing infrastructure.

## Features

- **Multi-Channel Deployment**: Deploy agents to Telegram, Discord, Slack, WhatsApp, and web chat
- **Managed Infrastructure**: We handle hosting, scaling, and maintenance
- **Customizable Personas**: Configure system prompts, temperature, and model selection
- **Real-Time Monitoring**: Health checks, logs, and usage analytics
- **Manager Portal**: White-glove onboarding with dedicated account managers
- **Secure Credential Vault**: Encrypted storage for API keys

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js App Router API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with email/password and Google OAuth
- **Email**: Resend API
- **Hosting**: Vercel

## Quick Start

```bash
# Install dependencies
cd web && npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for required variables. Critical ones:

- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - 32-char key for API encryption
- `RESEND_API_KEY` - For email delivery

## Project Structure

```
web/
├── src/
│   ├── app/[locale]/          # i18n routes (en, uk, es)
│   │   ├── (marketing)/       # Landing pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin panel
│   │   └── manager/           # Manager portal
│   ├── components/            # React components
│   ├── lib/                   # Utilities, API clients
│   └── messages/              # i18n translations
├── prisma/                    # Database schema
└── cypress/                   # E2E tests
```

## Key Workflows

### User Sign-Up Flow
1. User signs up at `/sign-up`
2. Email verification sent
3. Onboarding captures business info
4. Manager auto-assigned
5. First instance created

### Instance Deployment
1. User creates instance in dashboard
2. Configures system prompt and model
3. Adds API keys (OpenAI, Anthropic, etc.)
4. Deploys to VPS (Hetzner)
5. Health checks monitor status

### Manager Workflow
1. Manager sees assigned clients
2. Receives email for new signups
3. Can message clients via platform
4. Provisions instances manually or via wizard

## Deployment

See `PRODUCTION_CHECKLIST.md` for detailed deployment steps.

Quick deploy to Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

## License

Private - All rights reserved
