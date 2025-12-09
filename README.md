# CISSP Exam Prep SaaS MVP

A production-ready CISSP exam preparation platform with free quizzes, premium practice exams, and subscription billing.

## Features

- **Authentication**: Email/password signup, login, password reset, email verification
- **Free Sample Quiz**: 10-question public quiz with explanations
- **Premium Practice Exam**: 100 questions, 60-minute timer, randomized selection
- **Subscription Billing**: $59 USD annual subscription via Stripe
- **Admin Panel**: Question management and statistics
- **Profile Page**: Subscription status and renewal date

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database & Auth**: Supabase (PostgreSQL)
- **Billing**: Stripe
- **Hosting**: Vercel
- **Styling**: Tailwind CSS with dark/light mode

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations.sql`
   - Configure email templates for auth

4. Set up Stripe:
   - Create a Stripe account
   - Create a product and price for $59 annual subscription
   - Set up webhook endpoint: `/api/webhooks/stripe`
   - Add webhook secret to environment variables

5. Run the development server:
```bash
npm run dev
```

## Database Schema

- `questions`: Question bank with choices, correct answer, explanation, and domain
- `user_attempts`: Tracks quiz/exam attempts
- `user_answers`: Stores individual answers for each attempt

## Deployment

Deploy to Vercel:
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy

