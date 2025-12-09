# Setup Checklist

Use this checklist to track your progress. Check off each item as you complete it.

## Supabase Setup
- [ ] Created new Supabase project
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Copied service_role key
- [ ] Ran `supabase/migrations.sql` in SQL Editor
- [ ] Ran `scripts/seed-questions.sql` in SQL Editor
- [ ] Verified tables exist in Table Editor
- [ ] Verified 10 questions were added

## Stripe Setup
- [ ] Created product "CISSP Exam Prep Annual Subscription"
- [ ] Set price to $59/year
- [ ] Copied Price ID (starts with `price_`)
- [ ] Copied Publishable key (starts with `pk_test_`)
- [ ] Copied Secret key (starts with `sk_test_`)
- [ ] Installed Stripe CLI (`brew install stripe/stripe-cli/stripe`)
- [ ] Logged into Stripe CLI (`stripe login`)
- [ ] Started webhook listener (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] Copied webhook signing secret (starts with `whsec_`)

## Local Environment
- [ ] Created `.env.local` file
- [ ] Added all Supabase credentials
- [ ] Added all Stripe credentials
- [ ] Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] Ran `npm install`
- [ ] Started dev server (`npm run dev`)
- [ ] Opened http://localhost:3000

## Testing Locally
- [ ] Tested free quiz (no login)
- [ ] Created user account
- [ ] Verified email
- [ ] Added user to `admin_users` table
- [ ] Accessed admin panel at `/admin`
- [ ] Tested subscription checkout with test card
- [ ] Verified subscription appears in profile
- [ ] Tested premium exam access

## Deployment
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Created Vercel project
- [ ] Connected GitHub repository
- [ ] Added all environment variables to Vercel
- [ ] Updated `NEXT_PUBLIC_APP_URL` to Vercel domain
- [ ] Deployed to Vercel
- [ ] Set up production Stripe webhook
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Tested production deployment

## Production Ready
- [ ] Tested all features in production
- [ ] Switched Stripe to live mode (when ready)
- [ ] Updated environment variables with live Stripe keys
- [ ] Added more questions to database
- [ ] Customized branding (optional)

---

**Current Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

