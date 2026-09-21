<div align="center">

# 🛍️ MyShop

A full-stack e-commerce platform built with **Next.js 16** (App Router), **TypeScript**, and **TailwindCSS** — powered by a custom **Node.js / Express** API, **MongoDB**, and **Stripe** for secure payments.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?logo=stripe)
![License](https://img.shields.io/badge/license-MIT-gold)

</div>

---

## ✨ Overview

**ShopSphere** is a complete, portfolio-quality online store with a violet/emerald design system, Sora + Inter typography, and a fixed light theme. It ships with real authentication (including Google sign-in), a guest cart that merges into your account on login, live Stripe payments verified server-side via webhooks, and a full admin dashboard — not a demo with hardcoded data.

## 🚀 Features

- **Browse & discover** — search, category/price/rating filters, sorting, and pagination, with a mobile bottom-sheet filter drawer
- **Product details** — image gallery, stock status, customer reviews, and real per-product SEO metadata (server component + `generateMetadata`)
- **Cart & Wishlist** — works for guests too (`guestId` cookie), automatically merged into the user's cart on login/register
- **Checkout** — multi-step flow (address → shipping method → payment), Cash on Delivery or **Stripe** card payment
- **Authentication** — email/password with access + refresh tokens (rotated on use), email verification, forgot/reset password, and **"Continue with Google"**
- **Profile** — edit info, change password, full address book (add/edit/delete/set default), unverified-email banner with resend
- **Orders** — status tracking timeline, **Reorder**, **Cancel** (restores stock, auto-refunds via Stripe if paid), and **Download Invoice (PDF)**
- **Real transactional emails** — welcome, verify-email, reset-password, and order-confirmation, sent via Nodemailer (skipped gracefully with a console warning if not configured)
- **Admin dashboard** — revenue/orders/users overview with charts, full product management with drag-and-drop image upload (Cloudinary), order management, user activation/deactivation, categories, and coupons (percentage or fixed, expiry, usage limits)
- **`sitemap.xml` / `robots.txt`**, custom 404 / 403 / 500 pages, and an offline-connection banner

## 🛠️ Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) — dev/build pinned to **Webpack**, not Turbopack (see [Notes](#-notes--known-issues)) |
| Language | TypeScript (both frontend and backend) |
| UI | TailwindCSS 4, Material UI (`@mui/material`) 7 |
| Data fetching | TanStack Query |
| Animation | Framer Motion |
| API | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh), Passport (Google OAuth) |
| Payments | Stripe (Payment Intents + Webhooks) |
| Image hosting | Cloudinary (via Multer) |
| Email | Nodemailer |
| PDF | PDFKit (invoices, streamed — no disk writes) |
| Validation | Zod |

## 📸 Screenshots

> Add a screenshot or short screen recording of the home page, a product page, checkout, and the admin dashboard here once deployed — it makes a big difference on GitHub and in a portfolio.

## 🧰 Getting Started

### Prerequisites

- **Node.js 20+**
- **MongoDB** — local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Stripe](https://dashboard.stripe.com/register) account (Test Mode) + the [Stripe CLI](https://docs.stripe.com/stripe-cli) for local webhook testing
- Optional: a free [Cloudinary](https://cloudinary.com/console) account (image uploads) and a [Google Cloud](https://console.cloud.google.com/apis/credentials) OAuth client (Google sign-in) — the app degrades gracefully without either

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env.local
```

Fill in your own values — see the [Environment Variables](#-environment-variables) tables below. **Never commit `.env` or `.env.local`.**

### 3. Seed the database (once)

```bash
cd backend
npm run seed
```

Fetches ~100 products + categories from [DummyJSON](https://dummyjson.com) into your own MongoDB. If products already exist, this is a no-op — the app relies entirely on your database from then on.

### 4. Run the dev servers

```bash
# terminal 1
cd backend && npm run dev     # http://localhost:5000

# terminal 2
cd frontend && npm run dev    # http://localhost:3000
```

Verify the API is alive: `GET http://localhost:5000/api/health`

## 🔑 Environment Variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | – | API port (default `5000`) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | ✅ | Access token secret & lifetime (`15m`) |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRES_IN` | ✅ | Refresh token secret & lifetime (`30d`) |
| `CLIENT_URL` | ✅ | Frontend URL, used for CORS |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`) |
| `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` | optional | Gmail + App Password for Nodemailer. Emails are skipped (not crashed) if unset |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | optional | Required for the admin image-upload feature |
| `GOOGLE_CLIENT_ID` / `_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | optional | Required for "Continue with Google". Disabled gracefully if unset |

### `frontend/.env.local`

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (`pk_test_...`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Used by `sitemap.ts` / `robots.ts`, e.g. `http://localhost:3000` |

## 👤 Creating an Admin Account

There's no public "sign up as admin" option, by design. To promote an account:

1. Register normally via `/register`.
2. Open MongoDB (Compass or `mongosh`) and find your user in the `users` collection.
3. Change `role` from `"user"` to `"admin"`.
4. Log out and back in — you now have access to `/admin`.

```js
// mongosh
use ecommerce
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## 💳 Testing Stripe Payments Locally

```bash
stripe login
stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to localhost:5000/api/payments/webhook
```

Copy the printed `whsec_...` into `backend/.env` as `STRIPE_WEBHOOK_SECRET` and restart the backend. At checkout, use Stripe's test card:

| Field | Value |
| --- | --- |
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |

## 📁 Project Structure

```
backend/
  src/
    config/        # db, stripe, cloudinary, passport (Google OAuth)
    models/         # User, Product, Category, Cart, Wishlist, Order, Review, Coupon
    controllers/     # auth, product, category, cart, wishlist, order, payment,
                      # review, coupon, admin, upload
    services/         # auth, product, order (server-side pricing lives here)
    routes/            # one file per resource, mounted under /api/*
    middleware/         # protect / isAdmin / identify (guest), validate, errors
    validators/          # Zod schemas (auth, product, order, misc)
    utils/                # tokens, email, invoice PDF generation, ApiError
    seed/                  # one-time DummyJSON → MongoDB seeder

frontend/
  app/
    (storefront pages)      # / products/ products/[id] cart/ checkout/ wishlist/
    login/ register/ forgot-password/ reset-password/ verify-email/
    profile/ profile/orders/
    admin/                   # layout + page, products, orders, users, categories, coupons
    order/success/[orderId] order/failed
    403/ not-found.tsx error.tsx sitemap.ts robots.ts
  components/
    layout/                  # Navbar, Footer, OfflineBanner
    products/                # ProductCard, ProductDetailClient
    checkout/                # StripePaymentForm
    admin/                   # ImageUploadField (Cloudinary drag-and-drop)
    home/                    # HeroSlider, TrustBadges
    auth/                    # ProtectedRoute
  providers/                 # AuthProvider, ColorModeProvider, QueryProvider, ThemeRegistry
  services/                  # one file per resource — the only layer that calls the API
  hooks/                      # useCart, useWishlist, useDebounce
  types/                        # shared TypeScript types
```

## 🔒 Security Notes

- Order totals are **always** computed server-side (`order.service.ts`) from live database prices — client-submitted amounts are never trusted.
- Payment success is confirmed **only** through the Stripe webhook, never the client-side redirect.
- Passwords are hashed with bcrypt; access tokens are short-lived (15m) and refresh tokens are rotated on every use.
- All admin routes are protected by a two-layer `protect` + `isAdmin` middleware.
- Promoting a user to `admin` is intentionally **not** exposed through any UI or API — database-only, by design.
- `TMDB`-style key leakage doesn't apply here, but the same principle does: Cloudinary/Stripe secret keys and the Google OAuth client secret live only in `backend/.env` and are never sent to the browser.

## ⚠️ Notes & Known Issues

- **Turbopack disabled on purpose**: `next dev` / `next build` are pinned to `--webpack`. Next.js 16's default Turbopack dev server has a known persistent-cache corruption bug (especially on Windows) that produces `Unexpected end of input` errors in the browser after a restart. Webpack is slightly slower but reliable.
- Admin "activity log" (audit trail of admin actions) is not implemented — would need a new backend model.
- No automated test suite yet (Jest + Supertest are installed as dev dependencies but no tests are written).
- No Postman collection / Swagger docs yet.

## 🗺️ Possible Next Steps

- Admin activity log
- Automated tests (Jest/Supertest on the API, Playwright/Cypress on the frontend)
- Postman collection / OpenAPI (Swagger) docs
- Product-level analytics (views, conversion rate)

## ☁️ Deployment

| Layer | Suggested host |
| --- | --- |
| Frontend (Next.js) | [Vercel](https://vercel.com) |
| Backend (Express) | [Render](https://render.com) or [Railway](https://railway.app) |
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) |

When deploying: point `MONGODB_URI` at Atlas, set `CLIENT_URL` (backend) and `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` (frontend) to your real deployed URLs, register a **production** Stripe webhook endpoint at `https://<your-backend>/api/payments/webhook`, and update `GOOGLE_CALLBACK_URL` if Google sign-in is enabled.

## 📄 License

MIT — feel free to use this project for learning or as a portfolio piece.

## 👤 Author

**Masyu Magdy**

- Portfolio: [masyu](https://masyu-portfolio-sx7u.vercel.app/)
- LinkedIn: [masyu-magdy](https://www.linkedin.com/in/masyu-magdy)
- GitHub: [Masyu-Magdy](https://github.com/Masyu-Magdy)
