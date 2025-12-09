# Deployment Guide

## Prerequisites

1. **Supabase Account**
   - Create a new project at https://supabase.com
   - Note your project URL and anon key
   - Get your service role key from Settings > API

2. **Stripe Account**
   - Create an account at https://stripe.com
   - Get your API keys from Dashboard > Developers > API keys
   - Create a product with a $59/year recurring price
   - Note the Price ID (starts with `price_`)
   - Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

3. **Vercel Account**
   - Sign up at https://vercel.com
   - Connect your GitHub repository

## Setup Steps

### 1. Database Setup (Supabase)

1. Go to your Supabase project SQL Editor
2. Run the migration file: `supabase/migrations.sql`
3. Run the seed file: `scripts/seed-questions.sql`
4. Create an admin user:
   ```sql
   -- First, sign up a user through the app, then note their user_id
   -- Then run:
   INSERT INTO admin_users (user_id) VALUES ('your-user-id-here');
   ```

### 2. Environment Variables

Create a `.env.local` file (for local development) or add to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_ANNUAL_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_APP_URL` to your production domain.

### 3. Stripe Webhook Setup

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### 5. Post-Deployment

1. Update Stripe webhook URL to production domain
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. Test the complete flow:
   - Sign up a user
   - Verify email
   - Subscribe
   - Take a practice exam
   - Access admin panel

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`

3. Run migrations in Supabase SQL Editor

4. Start development server:
   ```bash
   npm run dev
   ```

5. For Stripe webhooks locally, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Security Notes

- Never commit `.env.local` or `.env` files
- Keep service role key secure (only used server-side)
- Regularly rotate API keys
- Monitor Stripe webhook logs for failures
- Set up Supabase RLS policies correctly (already in migrations)

## Troubleshooting

- **Webhook not working**: Check webhook secret and endpoint URL
- **Subscription not updating**: Verify webhook events are being received
- **RLS errors**: Ensure user is authenticated and policies are correct
- **Admin access denied**: Verify user is in `admin_users` table

