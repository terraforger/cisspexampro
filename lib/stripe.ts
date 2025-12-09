import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual_59' // Set this in your Stripe dashboard

