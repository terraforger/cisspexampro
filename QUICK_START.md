# Quick Start Guide - Step by Step

Follow these steps in order to get your CISSP Exam Prep app running.

## Step 1: Set Up Supabase

### 1.1 Create a New Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `cissp-exam-prep` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be created

### 1.2 Get Your Supabase Credentials
1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Click "Reveal" to see it

### 1.3 Set Up Database Tables
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `supabase/migrations.sql` from your project
4. Copy ALL the contents and paste into the SQL Editor
5. Click "Run" (or press Cmd+Enter)
6. You should see "Success. No rows returned"

### 1.4 Seed Sample Questions
1. Still in SQL Editor, click "New query"
2. Open the file `scripts/seed-questions.sql` from your project
3. Copy ALL the contents and paste into the SQL Editor
4. Click "Run"
5. You should see "Success. 10 rows inserted"

### 1.5 Verify Tables Were Created
1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - `questions` (should have 10 rows)
   - `user_attempts`
   - `user_answers`
   - `subscriptions`
   - `admin_users`

## Step 2: Set Up Stripe

### 2.1 Create a Product
1. Go to https://dashboard.stripe.com and sign in
2. Click **Products** in the left sidebar
3. Click **"+ Add product"**
4. Fill in:
   - **Name**: `CISSP Exam Prep Annual Subscription`
   - **Description**: `Annual subscription for premium practice exams`
   - **Pricing model**: `Standard pricing`
   - **Price**: `59.00`
   - **Currency**: `USD`
   - **Billing period**: `Yearly`
5. Click **"Save product"**
6. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`) - you'll need this!

### 2.2 Get Your Stripe API Keys
1. In Stripe, go to **Developers** → **API keys**
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy these values:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### 2.3 Set Up Webhook (For Local Testing)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
   ```bash
   brew install stripe/stripe-cli/stripe
   ```
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. In a new terminal window, start the webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. **IMPORTANT**: Copy the webhook signing secret (starts with `whsec_...`) that appears

**Note**: For production, you'll set up the webhook in Stripe Dashboard later.

## Step 3: Set Up Local Environment

### 3.1 Create Environment File
1. In your project folder, create a file named `.env.local`
2. Copy the contents from `.env.example`
3. Fill in all the values:

```env
# Supabase (from Step 1.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)

# Stripe (from Step 2.1 and 2.2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_ANNUAL_PRICE_ID=price_... (from Step 2.1)
STRIPE_WEBHOOK_SECRET=whsec_... (from Step 2.3)

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Install Dependencies
Open terminal in your project folder and run:

```bash
cd /Users/owner/cissp-exam-prep
npm install
```

This will install all required packages (may take 1-2 minutes).

## Step 4: Test Locally

### 4.1 Start Development Server
In your terminal, run:

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 4.2 Test the App
1. Open http://localhost:3000 in your browser
2. Try the **Free Quiz** (should work without login)
3. **Sign up** for an account:
   - Go to `/auth/signup`
   - Use a real email (you'll need to verify it)
   - Check your email for verification link
4. **Create an Admin User**:
   - After signing up, go to Supabase → **Authentication** → **Users**
   - Find your user and copy the **User UID**
   - Go to **SQL Editor** and run:
     ```sql
     INSERT INTO admin_users (user_id) VALUES ('paste-your-user-uid-here');
     ```
   - Now you can access `/admin`

### 4.3 Test Subscription Flow
1. Go to `/profile`
2. Click "Subscribe for $59/year"
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete checkout
5. Check that your subscription status updates

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub
1. Create a new repository on GitHub
2. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### 5.2 Deploy to Vercel
1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
5. **Add Environment Variables** (click "Environment Variables"):
   - Add ALL the variables from your `.env.local` file
   - **IMPORTANT**: For `NEXT_PUBLIC_APP_URL`, use your Vercel domain (e.g., `https://your-app.vercel.app`)
6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

### 5.3 Set Up Production Stripe Webhook
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Go back to Vercel → Your Project → **Settings** → **Environment Variables**
8. Update `STRIPE_WEBHOOK_SECRET` with the production webhook secret
9. Redeploy your app (Vercel will auto-redeploy when you update env vars)

### 5.4 Switch Stripe to Live Mode (When Ready)
1. In Stripe, toggle from **Test mode** to **Live mode**
2. Get your live API keys
3. Create a live product and price
4. Update environment variables in Vercel with live keys
5. Redeploy

## Troubleshooting

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then `npm install`

### Supabase connection errors
- Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces in `.env.local`

### Stripe checkout not working
- Verify `STRIPE_ANNUAL_PRICE_ID` is correct
- Make sure you're using test mode keys with test mode
- Check browser console for errors

### Webhook not working
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check the webhook secret matches
- Look at Stripe Dashboard → Developers → Webhooks for event logs

### Can't access admin panel
- Make sure you added your user to `admin_users` table in Supabase
- Check that you're logged in with the correct account

## Next Steps

1. ✅ Test all features locally
2. ✅ Deploy to Vercel
3. ✅ Set up production webhook
4. Add more questions to your database
5. Customize branding and colors
6. Switch to Stripe live mode when ready to accept real payments

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `DEPLOYMENT.md` for deployment details
- Review Supabase docs: https://supabase.com/docs
- Review Stripe docs: https://stripe.com/docs
- Review Next.js docs: https://nextjs.org/docs

