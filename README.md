# Decolonize Healthcare

Full-stack course platform replacing the existing Wix site at [decolonizehealthcare.com](https://www.decolonizehealthcare.com). Handles marketing, free editorial content, user auth, course purchasing, and gated course content delivery.

## Tech Stack

| Concern | Tool |
|---|---|
| Frontend | React 18, Redux Toolkit, Vite, Tailwind CSS v3, React Router v7 |
| Backend | Node.js / Express (ESM) |
| Database | MongoDB Atlas |
| CMS | Sanity (free tier) |
| Auth | Passport.js — Local + Google OAuth |
| Payments | Stripe Checkout + webhooks |
| Video | YouTube unlisted (dev) / Bunny Stream (production) |
| PDF storage | Google Cloud Storage (signed URLs) |
| Deploy — frontend | Vercel |
| Deploy — backend | Google Cloud Run |

## Repository Structure

```
decolonize-healthcare/
├── client/               # React app (Vite)
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── store/        # Redux slices
├── server/               # Express app (ESM)
│   ├── middleware/
│   ├── models/
│   └── routes/
└── .github/workflows/    # GitHub Actions CI
```

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB Atlas connection string
- Google OAuth credentials

### Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. API requests to `/api` are proxied to the server at `http://localhost:8080`.

### Server

```bash
cd server
npm install
cp .env.example .env   # fill in values
npm run dev
```

Runs on `http://localhost:8080`. Confirm with `GET /api/health`.

## Environment Variables

### Server (`server/.env`)

```
MONGODB_URI=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GCS_BUCKET_NAME=
CLIENT_URL=http://localhost:5173
PORT=8080
```

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
```

## CI

GitHub Actions runs lint and build checks on every push and pull request to `main`. See `.github/workflows/ci.yml`.
