# WhatsApp Business API Setup Guide

This guide walks you through setting up WhatsApp Business API integration for your SynapseForge AI agent using Meta's official Business API.

## Overview

SynapseForge supports two WhatsApp integration methods:
1. **Meta Business API** (Recommended) - Direct integration with Meta's official API
2. **Twilio** - Integration via Twilio's WhatsApp sandbox

## Prerequisites

Before you begin, you'll need:
- A Meta Business Account
- A verified business (for production use)
- A phone number that can receive SMS/calls for verification

## Setup Steps

### Step 1: Create a Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click "Create Account" and follow the prompts
3. Complete your business profile

### Step 2: Create a WhatsApp Business App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Give your app a name (e.g., "SynapseForge WhatsApp")
5. Select your business account
6. Click "Create"

### Step 3: Add WhatsApp Product

1. In your app's dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. You'll be taken to the WhatsApp Getting Started page

### Step 4: Add a Phone Number

1. In the WhatsApp section, go to "Getting Started"
2. Under "Add a phone number":
   - Select your country
   - Enter your business phone number
   - Click "Next"
3. Choose verification method (SMS or Voice Call)
4. Enter the verification code you receive

### Step 5: Get Your Credentials

1. **App ID and App Secret**:
   - Go to App Dashboard → Settings → Basic
   - Copy the "App ID"
   - Click "Show" next to "App Secret" and copy it

2. **Phone Number ID**:
   - Go to WhatsApp → API Setup
   - The Phone Number ID is shown in the "Phone Number" section

3. **WhatsApp Business Account ID (WABA)**:
   - In the same page, find "Business Account ID"
   - Copy this value

### Step 6: Configure SynapseForge

1. Set the environment variables in your SynapseForge deployment:
   ```
   META_APP_ID=your-app-id
   META_APP_SECRET=your-app-secret
   ```

2. In the SynapseForge dashboard:
   - Go to your instance → Credentials tab
   - Find the WhatsApp section
   - Click "Connect WhatsApp"
   - Select "Meta Business API"
   - Enter your business phone number and business name
   - Click "Connect"

3. You'll be redirected to Meta's OAuth flow:
   - Log in with your Meta account
   - Grant permissions for WhatsApp Business Management and Messaging
   - You'll be redirected back to SynapseForge

### Step 7: Send a Test Message

1. After successful connection, click "Send Test Message"
2. Enter your personal phone number
3. You should receive a message from your WhatsApp Business number

## Webhook Configuration

SynapseForge automatically configures webhooks to receive incoming messages. The webhook URL is:

```
https://yourdomain.com/api/webhooks/whatsapp/meta
```

This is configured automatically during the OAuth flow.

## Troubleshooting

### "No WhatsApp Business Account found"

- Ensure you've completed the WhatsApp setup in Meta Business Manager
- Verify your phone number is added and verified
- Check that your Meta app has the WhatsApp product added

### "Phone number not found"

- The phone number must match exactly what's registered in Meta Business Manager
- Include the country code (e.g., +1 for US)
- Remove any spaces or special characters

### Messages not being received

1. Check webhook configuration:
   - Go to Meta App Dashboard → WhatsApp → Configuration
   - Verify the webhook URL is set and showing "Active"
   
2. Check webhook fields are subscribed:
   - messages
   - message_deliveries
   - message_reads

3. Verify your instance is running in SynapseForge

### "Invalid signature" errors

- Ensure the `ENCRYPTION_KEY` environment variable is set correctly
- The webhook secret is encrypted using this key

## Rate Limits

Meta WhatsApp Business API has the following rate limits:
- 80 messages per second per app
- 1000 messages per day for unverified businesses
- Higher limits available for verified businesses

## Going to Production

For production use:

1. **Verify your business** with Meta:
   - Go to Meta Business Manager → Business Info → Verification
   - Submit verification documents

2. **Increase messaging limits**:
   - Verified businesses get higher rate limits
   - Apply for higher tiers through Meta Business Manager

3. **Set up message templates** for business-initiated conversations:
   - Go to WhatsApp Manager → Message Templates
   - Create templates for notifications, alerts, etc.

## Security Considerations

- Never commit `META_APP_SECRET` to version control
- Rotate your app secret periodically
- Use environment variables for all credentials
- Enable two-factor authentication on your Meta account

## Support

If you encounter issues:
1. Check the [Meta for Developers documentation](https://developers.facebook.com/docs/whatsapp)
2. Review [Meta's error codes](https://developers.facebook.com/docs/whatsapp/api/errors)
3. Contact SynapseForge support

## Migration from Twilio

If you're currently using Twilio for WhatsApp and want to migrate to Meta Business API:

1. Set up Meta Business API (follow steps above)
2. Test the new integration
3. Once confirmed working, disconnect Twilio in SynapseForge
4. Update any customer-facing documentation with your new WhatsApp number

Both integrations can coexist during the migration period.
