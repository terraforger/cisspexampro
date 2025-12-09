# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_ANNUAL_PRICE_ID` - Stripe price ID for $59/year subscription
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for local)

## 3. Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run `supabase/migrations.sql` to create tables and RLS policies
4. Run `scripts/seed-questions.sql` to add 10 sample questions

## 4. Create Admin User

1. Sign up through the app
2. Note your user ID from Supabase Auth > Users
3. Run this SQL in Supabase:

```sql
INSERT INTO admin_users (user_id) VALUES ('your-user-id-here');
```

## 5. Stripe Setup

1. Create a Stripe account
2. Create a product:
   - Name: "CISSP Exam Prep Annual Subscription"
   - Price: $59.00
   - Billing period: Yearly
   - Copy the Price ID (starts with `price_`)
3. Set up webhook:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe` (or use Stripe CLI for local)
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - Copy the webhook signing secret

## 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 7. Test the Application

1. **Free Quiz**: Visit `/quiz/free` (no login required)
2. **Sign Up**: Create an account at `/auth/signup`
3. **Subscribe**: Go to profile and subscribe
4. **Premium Exam**: Take a practice exam at `/exam/premium`
5. **Admin Panel**: Access at `/admin` (admin users only)

## Features Implemented

✅ Email/password authentication with verification
✅ Password reset functionality
✅ Free 10-question quiz (public)
✅ Premium 100-question exam with 60-minute timer
✅ Question randomization logic (repeats if bank < 100)
✅ Stripe subscription integration ($59/year)
✅ Subscription management portal
✅ Admin panel for question management
✅ CSV import for questions
✅ Statistics dashboard
✅ Dark/light mode toggle
✅ Responsive mobile-first design
✅ Row-level security (RLS) policies
✅ Profile page with subscription status

## Project Structure

```
cissp-exam-prep/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── quiz/              # Free quiz
│   ├── exam/              # Premium exam
│   ├── profile/           # User profile
│   ├── admin/             # Admin panel
│   └── api/               # API routes (Stripe webhooks, checkout)
├── components/            # React components
├── lib/                   # Utilities and clients
├── supabase/              # Database migrations
└── scripts/               # Seed data scripts
```

## Next Steps

1. Add more questions to the database
2. Customize branding and styling
3. Add email notifications
4. Implement analytics
5. Add more exam features (domain filtering, etc.)

