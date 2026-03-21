# Deployment Guide

This guide covers deploying SynapseForge (OpenHelix AI) to production.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Resend account for email
- Stripe account for billing (optional)
- Vercel account (recommended)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"
ENCRYPTION_KEY="$(openssl rand -hex 32)"
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAILS="your@email.com"

# Optional but recommended
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
POSTHOG_KEY="phc_..."
```

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/asavienko/synapseforge)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Select the `web` directory as root

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set `NEXTAUTH_URL` to your production domain

4. **Deploy**
   - Vercel will build and deploy automatically
   - Note the deployment URL

## Database Setup

1. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Create Admin User**
   ```bash
   npx tsx scripts/create-admin.ts
   # Enter your email when prompted
   ```

3. **(Optional) Seed Templates**
   ```bash
   npx prisma db seed
   ```

## Post-Deployment Checklist

- [ ] Sign up as a new user to test registration flow
- [ ] Verify email sending works
- [ ] Create an AI instance and test the chat
- [ ] Add API key and test credential storage
- [ ] Check Stripe billing (if configured)
- [ ] Verify cron jobs are running (check Vercel dashboard)
- [ ] Test feedback widget submission
- [ ] Check status page at `/status`
- [ ] Verify API docs at `/api-docs`

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Vercel IPs
- Check SSL mode is configured properly

### Email Not Sending
- Verify `RESEND_API_KEY` is valid
- Check `EMAIL_FROM` domain is verified in Resend
- Look for errors in Vercel function logs

### Stripe Webhook Failing
- Configure webhook URL: `https://yourdomain.com/api/billing/webhook`
- Add `STRIPE_WEBHOOK_SECRET` to env vars
- Ensure webhook events are configured in Stripe dashboard

### Cron Jobs Not Running
- Check Vercel dashboard > Cron Jobs
- Verify all 8 jobs are listed
- Check Vercel logs for errors

## Monitoring

- **Status Page**: `/status`
- **Health Check**: `/api/health`
- **Analytics**: `/admin/analytics`
- **Vercel Dashboard**: Check function logs and analytics

## Updates

To deploy updates:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy.

## Support

- Check the [README](./README.md) for setup instructions
- Review [API Docs](./API.md) for integration details
- Contact support at your configured support email