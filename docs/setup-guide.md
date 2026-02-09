# AGS NoteApp & ReminderApp — Integration Setup Guide

## Table of Contents
1. [Railway + n8n Deployment](#1-railway--n8n-deployment)
2. [Telegram Bot Setup](#2-telegram-bot-setup)
3. [WhatsApp Business API (Meta Cloud)](#3-whatsapp-business-api-meta-cloud)
4. [Email SMTP Configuration](#4-email-smtp-configuration)
5. [n8n Workflow Import & Configuration](#5-n8n-workflow-import--configuration)
6. [Testing & Verification](#6-testing--verification)

---

## 1. Railway + n8n Deployment

### Create Railway Account
1. Go to [railway.app](https://railway.app) and sign up (GitHub login recommended)
2. You get a free $5/month trial — enough for n8n

### Deploy n8n
1. In Railway dashboard, click **"New Project"**
2. Click **"Deploy a Template"**
3. Search for **"n8n"** and select the official template
4. Configure environment variables:
   ```
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=<choose-a-strong-password>
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://<your-railway-domain>
   ```
5. Click **"Deploy"** — wait 2-3 minutes
6. Once deployed, click **"Settings"** → **"Networking"** → **"Generate Domain"**
7. Copy the generated URL (e.g., `https://n8n-production-xxxx.up.railway.app`)
8. Update `WEBHOOK_URL` env var to match this domain
9. Open the URL — login with admin credentials you set

> **Save this URL** — you'll need it for Telegram webhook and WhatsApp webhook configuration.

---

## 2. Telegram Bot Setup

### Create Bot via @BotFather
1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter bot name: `AGS Meeting Reminder`
4. Enter bot username: `ags_reminder_bot` (must end in `bot`)
5. **Copy the API token** — looks like: `7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Set Bot Commands
Send these to @BotFather:
```
/setcommands
```
Select your bot, then paste:
```
meeting - Schedule a new meeting
status - Check meeting status
help - Show available commands
```

### Set Webhook (after n8n is deployed)
The webhook will be set automatically by the n8n Telegram Trigger node.

> **Save the bot token** — add it to your `.env` file as `TELEGRAM_BOT_TOKEN`

---

## 3. WhatsApp Business API (Meta Cloud)

### Prerequisites
- A Facebook account
- A Meta Business account

### Setup Steps
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** type → **"Next"**
4. Name: `AGS Reminder Bot`, select your Business account
5. In the app dashboard, find **"WhatsApp"** → **"Set up"**
6. You'll get:
   - **Phone Number ID** — the WhatsApp sender number
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (valid 24h — generate a permanent one later)

### Generate Permanent Token
1. Go to **"System Users"** in Meta Business Settings
2. Create a system user with **Admin** role
3. Assign the WhatsApp app with **full control**
4. Click **"Generate Token"** → select `whatsapp_business_messaging` permission
5. **Copy the permanent token**

### Configure Webhook
1. In your Meta App → WhatsApp → Configuration
2. Set Webhook URL: `https://<your-n8n-domain>/webhook/whatsapp`
3. Set Verify Token: `ags-whatsapp-verify-token` (must match n8n config)
4. Subscribe to: `messages`

> **Save these values** — add them to your `.env`:
> - `WHATSAPP_ACCESS_TOKEN`
> - `WHATSAPP_PHONE_NUMBER_ID`
> - `WHATSAPP_BUSINESS_ACCOUNT_ID`
> - `WHATSAPP_VERIFY_TOKEN`

---

## 4. Email SMTP Configuration

Add your SMTP server details to `.env`:
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=your-email-password
SMTP_FROM=AGS Reminders <notifications@yourdomain.com>
```

Common ports:
- **587** — STARTTLS (recommended)
- **465** — SSL/TLS
- **25** — Plain (not recommended)

---

## 5. n8n Workflow Import & Configuration

### Import Workflows
1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Import these files from `config/n8n/`:
   - `telegram-meeting-bot.json` — Telegram bot ↔ Supabase
   - `whatsapp-meeting-bot.json` — WhatsApp ↔ Supabase
   - `reminder-cron.json` — Scheduled reminder sender

### Configure Credentials in n8n
For each workflow, you need to set up credentials:

**Supabase:**
1. In n8n → Settings → Credentials → Add: "Supabase API"
2. Host: `https://iniqnmvdkgqbkfiduqdx.supabase.co`
3. Service Role Key: (get from Supabase Dashboard → Settings → API → service_role key)

**Telegram:**
1. Add credential: "Telegram API"
2. Access Token: your bot token from @BotFather

**SMTP:**
1. Add credential: "SMTP"
2. Fill in host, port, user, password

### Activate Workflows
1. Open each imported workflow
2. Toggle **"Active"** switch (top right)
3. The Telegram webhook registers automatically
4. Test each workflow manually first

---

## 6. Testing & Verification

### Test Telegram Bot
1. Open Telegram → search for your bot
2. Send: `/meeting`
3. Follow the prompts to schedule a test meeting
4. Check `reminderApp.html` — the meeting should appear with source: `telegram`

### Test WhatsApp Bot
1. From your WhatsApp, send a message to the business number
2. Type: `meeting` and follow prompts
3. Verify it appears in the app with source: `whatsapp`

### Test Email Reminders
1. Create a meeting 2 minutes from now (for testing)
2. The cron workflow checks every 15 minutes
3. Verify email arrives at the contact email

### Test Real-Time Updates
1. Keep `reminderApp.html` open in browser
2. Send a meeting via Telegram
3. It should auto-appear on the page (Supabase real-time subscription)

---

## Environment Variables Summary
```env
# Supabase
SUPABASE_URL=https://iniqnmvdkgqbkfiduqdx.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>

# n8n
N8N_URL=https://<your-railway-domain>

# Telegram
TELEGRAM_BOT_TOKEN=<from-botfather>

# WhatsApp (Meta Cloud API)
WHATSAPP_ACCESS_TOKEN=<permanent-token>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<business-account-id>
WHATSAPP_VERIFY_TOKEN=ags-whatsapp-verify-token

# Email SMTP
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=<your-password>
SMTP_FROM=AGS Reminders <notifications@yourdomain.com>
```
