# Copy & Paste Deployment Guide

Everything is ready! Just follow these steps:

## Step 1: Create GitHub Repository (2 minutes)

1. Go to: https://github.com/new
2. Repository name: `cissp-exam-prep` (or any name you want)
3. Make it **Private** (or Public)
4. **DO NOT** check "Initialize with README"
5. Click **"Create repository"**

## Step 2: Push to GitHub (Copy & Paste)

Open terminal in your project folder and run:

```bash
cd /Users/owner/cissp-exam-prep
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` = Your GitHub username
- `YOUR_REPO_NAME` = The repository name you just created

## Step 3: Deploy to Vercel (5 minutes)

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repository
4. Click **"Import"**
5. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Open the file `VERCEL_ENV_VARS.txt` in your project
   - Copy each variable one by one and add them to Vercel
   - (You can leave `NEXT_PUBLIC_APP_URL` as localhost for now)
6. Click **"Deploy"**
7. Wait 2-3 minutes
8. **Copy your Vercel URL** (looks like: `https://cissp-exam-prep.vercel.app`)

## Step 4: Update Vercel Environment Variable

1. In Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update it to your Vercel URL: `https://your-app.vercel.app`
4. Vercel will auto-redeploy

## Step 5: Configure Supabase (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Select your project: **CisspExamPro**
3. Go to: **Authentication** → **URL Configuration**
4. Set **Site URL** to: `https://your-app.vercel.app` (your Vercel URL)
5. In **Redirect URLs**, add:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```
6. Click **"Save"**

## Step 6: Set Up Stripe Webhook (3 minutes)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Go to Vercel → Your Project → **Settings** → **Environment Variables**
8. Update `STRIPE_WEBHOOK_SECRET` with the secret you just copied
9. Vercel will auto-redeploy

## Step 7: Test Everything! 🎉

1. Go to your app: `https://your-app.vercel.app`
2. **Test Free Quiz** - Should work without login
3. **Sign Up** - Use a real email
4. **Check Email** - Click verification link (should work now!)
5. **Sign In** - Login to your account
6. **Subscribe** - Go to Profile, click Subscribe, use test card: `4242 4242 4242 4242`
7. **Take Premium Exam** - Should work after subscription

## That's It! 🚀

Your app is now fully deployed and operational!

---

## Quick Reference

- **Your Vercel URL**: `https://your-app.vercel.app` (you'll get this after Step 3)
- **Environment Variables**: See `VERCEL_ENV_VARS.txt`
- **Detailed Guide**: See `DEPLOY_NOW.md`

