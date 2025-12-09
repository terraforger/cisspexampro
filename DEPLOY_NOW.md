# Deploy to Vercel - Step by Step

Follow these steps to deploy your app so everything works in production.

## Step 1: Push Code to GitHub

### 1.1 Create GitHub Repository
1. Go to https://github.com and sign in
2. Click the "+" icon → "New repository"
3. Name it: `cissp-exam-prep` (or any name)
4. Make it **Private** (or Public, your choice)
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### 1.2 Push Your Code
Open terminal in your project folder and run:

```bash
cd /Users/owner/cissp-exam-prep
git init
git add .
git commit -m "Initial commit - CISSP Exam Prep MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Click "Import" next to your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 2.2 Add Environment Variables
Click "Environment Variables" and add ALL of these:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_ANNUAL_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**IMPORTANT**: For `NEXT_PUBLIC_APP_URL`, wait until after deployment to add it (we'll get the URL from Vercel).

### 2.3 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. Once done, you'll see a URL like: `https://cissp-exam-prep.vercel.app`
4. **Copy this URL** - you'll need it for the next steps

## Step 3: Configure Supabase Email Redirect

### 3.1 Update Supabase Auth Settings
1. Go to Supabase Dashboard → Your Project
2. Go to **Authentication** → **URL Configuration**
3. Find **Site URL** and set it to your Vercel URL: `https://your-app.vercel.app`
4. Find **Redirect URLs** and add:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`
5. Click "Save"

### 3.2 Update Environment Variable
1. Go back to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add or update:
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
   (Replace with your actual Vercel URL)
3. Vercel will automatically redeploy

## Step 4: Set Up Stripe Webhook (Production)

### 4.1 Create Webhook in Stripe
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)

### 4.2 Update Webhook Secret in Vercel
1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `STRIPE_WEBHOOK_SECRET`
3. Update it with the production webhook secret you just copied
4. Vercel will automatically redeploy

## Step 5: Test Everything

### 5.1 Test Email Verification
1. Go to your deployed app: `https://your-app.vercel.app`
2. Sign up with a new email
3. Check your email for verification link
4. Click the link - it should work now!

### 5.2 Test Subscription
1. Sign in to your account
2. Go to Profile
3. Click "Subscribe for $59/year"
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify subscription appears in profile

### 5.3 Test Premium Exam
1. With active subscription, go to Practice Exam
2. Start an exam
3. Verify it works

## Troubleshooting

### Email links still not working?
- Double-check Supabase Redirect URLs include your Vercel domain
- Make sure `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
- Check Supabase email templates in Authentication → Email Templates

### Webhook not working?
- Verify webhook URL in Stripe matches your Vercel URL
- Check Stripe webhook logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is correct in Vercel

### Build errors?
- Check Vercel build logs
- Make sure all environment variables are set
- Verify your code is pushed to GitHub

## Next Steps

Once everything works:
1. ✅ Test all features in production
2. ✅ Share your app URL with others
3. ✅ When ready for real payments, switch Stripe to Live mode
4. ✅ Update environment variables with live Stripe keys

