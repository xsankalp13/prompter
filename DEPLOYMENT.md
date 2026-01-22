# PromptVault Deployment Guide

Complete guide for deploying PromptVault to Vercel with Supabase backend.

## Prerequisites

- Node.js 18+
- Supabase account
- Vercel account
- GitHub repository (optional, for Vercel Git integration)

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose organization, enter project name, create strong database password
4. Select region closest to your users
5. Click **Create new project**

### Configure Database

1. Navigate to **SQL Editor** in sidebar
2. Run `supabase/schema.sql` - creates tables and triggers
3. Run `supabase/rls-policies.sql` - enables Row Level Security

### Get API Keys

1. Go to **Settings > API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Enable Google OAuth (Optional)

1. **Google Cloud Console**:
   - Create project at [console.cloud.google.com](https://console.cloud.google.com)
   - Enable **Google+ API**
   - Create OAuth 2.0 credentials
   - Add authorized redirect: `https://your-project.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**:
   - Go to **Authentication > Providers > Google**
   - Enable and add Client ID + Secret

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cp .env.local.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## 3. Vercel Deployment

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, add environment variables when asked
```

### Option B: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain)
4. Click **Deploy**

---

## 4. Post-Deployment

### Update OAuth Redirect URLs

After deployment, add your Vercel URL to:
1. **Supabase** → Authentication → URL Configuration → Site URL
2. **Google Cloud Console** → Authorized redirect URIs

### Create Admin User

1. Sign up normally at your deployed app
2. In Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for OAuth) |

---

## Troubleshooting

**Auth not working**: Check Supabase URL Configuration matches your domain

**RLS errors**: Ensure RLS policies were applied correctly

**Google OAuth fails**: Verify redirect URLs match exactly in both Google Console and Supabase

---

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
