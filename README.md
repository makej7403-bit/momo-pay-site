# MoMo Manual Store

A Next.js + Firebase store that accepts manual MoMo payments:
- Customers send MoMo to your number (env) and upload receipt
- Admin verifies receipts, marks orders paid and attaches download URLs
- Optional: Flutterwave (card) payments, OpenAI content generator
- Notifications: email via SendGrid and SMS via Twilio (optional)

## Setup
1. Create Firebase project (Auth, Firestore, Storage). Seed `products` collection.
2. Create GitHub repo and push this project.
3. Deploy to Vercel and add env vars (see below).
4. Set `NEXT_PUBLIC_ADMIN_EMAIL` to your admin email (sokpahakinsaye@gmail.com).
5. Test flow: buy a product, send MoMo to your number, upload receipt, admin verify.

## Env variables (Vercel)
See next section.
