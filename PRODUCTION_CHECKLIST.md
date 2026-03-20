# Production Deployment Checklist

## Environment Variables Required

### Critical (App won't work without these)
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your domain (https://openhelixai.com)
- [ ] `ENCRYPTION_KEY` - 32 character key for API key encryption
- [ ] `RESEND_API_KEY` - For sending emails
- [ ] `EMAIL_FROM` - Verified sender address in Resend

### For Google Sign-In
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] Add authorized redirect URI in Google Cloud Console:
  - `https://openhelixai.com/api/auth/callback/google`
  - `https://www.openhelixai.com/api/auth/callback/google`

### For Cron Jobs
- [ ] `CRON_SECRET` - Secret for securing cron endpoints

### Optional
- [ ] `REDIS_URL` - For better rate limiting
- [ ] `ADMIN_EMAILS` - Comma-separated admin emails

## Vercel Configuration

1. **Add Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from above
   - Deploy to apply changes

2. **Configure Domains**
   - Add `openhelixai.com` and `www.openhelixai.com`
   - Set up redirects (www → non-www or vice versa)

3. **Cron Jobs**
   - Already configured in `vercel.json`
   - Note: Hobby plan only supports daily cron jobs

## Database Setup

1. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Initial Data (Optional)**
   ```bash
   npx prisma db seed
   ```

## Post-Deployment Verification

- [ ] Sign up as new user → redirects to onboarding
- [ ] Complete onboarding → creates first instance
- [ ] Create instance → deploys successfully
- [ ] Add API keys in settings → saves correctly
- [ ] Health check shows instance status
- [ ] Email notifications arrive (if configured)

## Monitoring

- Check Vercel Analytics for errors
- Monitor database connection limits
- Set up uptime monitoring (e.g., UptimeRobot)
