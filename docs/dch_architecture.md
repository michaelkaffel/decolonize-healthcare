# DecolonizeHealthcare — Architecture & Build Plan

## Project Overview

Full-stack course platform replacing the existing Wix site at `decolonizehealthcare.com`. Handles marketing, free editorial content, user auth, course purchasing, and gated course content delivery. Wix eliminated entirely.

---

## Goals

- Migrate all existing content off Wix ($200/yr savings)
- Sell and deliver online courses with video, written content, PDFs, and quizzes
- User accounts with enrollment-based content gating
- Free public content (articles, education pages, book list, partners)
- Launch with 1-2 courses, architecture supports unlimited future courses

---

## Tech Stack

| Concern | Tool |
|---|---|
| Frontend | React + Redux Toolkit, Vite, Tailwind CSS v3, React Router v7 |
| Backend | Node.js / Express (ESM), hosted on Google Cloud Run |
| Database | MongoDB Atlas (users, enrollments, progress, courses) |
| CMS | Sanity (free tier) — articles, education pages, book list, partners |
| Auth | Passport.js — Local + Google OAuth |
| Payments | Stripe Checkout + webhooks |
| Video (dev) | YouTube unlisted |
| Video (production) | Bunny Stream (pay-as-you-go, ~$2–6/mo at small scale) |
| PDF storage | Google Cloud Storage (signed URLs) |
| Deploy — frontend | Vercel |
| Deploy — backend | Google Cloud Run |

---

## Repository Structure

Separate repo from OCM and RethinkingBroken. Suggested name: `decolonize-healthcare`.

```
decolonize-healthcare/
├── client/               # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/        # Redux slices
│   │   └── hooks/
│   └── vite.config.js
├── server/               # Express app (ESM)
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── .github/workflows/    # CI/CD
```

---

## Data Models

### User
```js
{
  username: String,
  email: String,
  hash: { type: String, select: false },  // passport-local-mongoose
  googleId: String,                        // OAuth
  createdAt: Date
}
```

### Course
```js
{
  title: String,
  slug: String,
  description: String,
  price: Number,
  published: Boolean,
  thumbnail: String,
  modules: [{
    title: String,
    order: Number,
    lessons: [{
      title: String,
      order: Number,
      content: String,           // rich text (markdown or HTML)
      videoSource: 'youtube' | 'bunny',
      videoId: String,
      pdfs: [{
        title: String,
        gcsPath: String          // never exposed directly to client
      }],
      quiz: {
        questions: [{
          prompt: String,
          options: [String],
          correctIndex: Number   // never sent to client
        }]
      }
    }]
  }]
}
```

### Enrollment
```js
{
  user: ObjectId,               // ref: User
  course: ObjectId,             // ref: Course
  purchasedAt: Date,
  stripeSessionId: String,
  status: 'active' | 'refunded'
}
```

### LessonProgress
```js
{
  user: ObjectId,
  course: ObjectId,
  lesson: ObjectId,
  completedAt: Date,
  quizPassed: Boolean
}
```

### QuizAttempt
```js
{
  user: ObjectId,
  lesson: ObjectId,
  score: Number,
  passed: Boolean,
  attemptedAt: Date
}
```

---

## Site Structure

### Public Routes (no auth required)
| Route | Content |
|---|---|
| `/` | Home / marketing |
| `/articles` | Blog-style articles (Sanity) |
| `/articles/:slug` | Individual article (Sanity) |
| `/education` | Free educational pages (Sanity) |
| `/education/:slug` | Individual education page (Sanity) |
| `/books` | Book list (Sanity) |
| `/partners` | Partners page (Sanity) |
| `/programs` | Course catalogue / marketing |
| `/programs/:slug` | Course landing page + buy button |
| `/about` | About page |
| `/login` | Login (local + Google OAuth) |
| `/register` | Registration |

### Protected Routes (auth + enrollment required)
| Route | Content |
|---|---|
| `/dashboard` | User dashboard — enrolled courses + progress |
| `/courses/:slug/learn` | Course player — modules + lessons |
| `/courses/:slug/learn/:lessonId` | Individual lesson (video, content, PDF, quiz) |

---

## Auth

Same pattern as WWT:
- `passport-local-mongoose` for local auth (pulls in `passport-local` as a dependency — no need to list `passport-local` separately)
- `passport-google-oauth20` for Google login
- Express sessions with MongoDB session store (`connect-mongo`)
- Anti-enumeration: identical generic responses from auth endpoints regardless of whether email exists
- `isAuthenticated` middleware on all protected routes

---

## Payment Flow (Stripe)

```
1. User clicks "Buy Course" on /programs/:slug
2. POST /api/checkout/create-session
   → Express creates Stripe Checkout Session with course metadata
   → Returns session URL
3. Client redirects to Stripe hosted checkout
4. Stripe processes payment
5. POST /api/webhooks/stripe (Stripe calls this)
   → Verify request with stripe.webhooks.constructEvent + signing secret
   → On checkout.session.completed:
       → Create Enrollment document
       → Set status: 'active'
6. User redirected to /dashboard on success
   → Enrollment now exists → course visible in dashboard
```

**Critical:** Enrollment is created in the webhook handler only — never on the frontend redirect. The success redirect URL is for UX only.

---

## Content Gating (Backend)

All course content routes check authentication and active enrollment before responding:

```js
// Middleware stack for lesson routes
router.get(
  '/:courseId/lessons/:lessonId',
  isAuthenticated,
  checkEnrollment,   // finds Enrollment doc, attaches to req
  lessonController
);
```

Quiz answers (`correctIndex`) are never included in API responses. Answers are validated server-side only:

```
POST /api/courses/:courseId/lessons/:lessonId/quiz
→ Express fetches correct answers from DB
→ Compares with submitted answers
→ Returns { score, passed, results }
→ Creates QuizAttempt document
→ Updates LessonProgress if passed
```

---

## PDF Delivery

PDFs are stored in GCS and never publicly accessible. The client receives a short-lived signed URL:

```
GET /api/courses/:courseId/lessons/:lessonId/pdf/:pdfId
→ isAuthenticated + checkEnrollment
→ Express generates signed GCS URL (15 min expiry)
→ Returns signed URL to client
→ Client opens PDF via signed URL directly
```

---

## Video Strategy

| Environment | Platform | Cost |
|---|---|---|
| Development | YouTube unlisted | Free |
| Production | Bunny Stream | ~$2–6/mo |

`Lesson.videoSource` field (`'youtube'` or `'bunny'`) drives the player component:

```jsx
// Player component switches on videoSource
const CoursePlayer = ({ lesson }) => {
  if (lesson.videoSource === 'youtube') {
    return <YouTubeEmbed videoId={lesson.videoId} />;
  }
  return <BunnyPlayer videoId={lesson.videoId} />;
};
```

Migration from YouTube to Bunny = update `videoSource` and `videoId` fields in DB. No component changes required.

### Bunny Stream Pricing Reference
- Storage: $0.01/GB/month
- CDN delivery (North America): $0.01/GB
- Encoding (one-time): $0.05/min for 1080p/720p
- Signed URLs: free, included
- No monthly base fee

---

## CMS (Sanity)

Sanity handles all editorial content so Owl can write and publish without touching code.

**Content types:**
- Article (title, slug, body, publishedAt, tags)
- EducationPage (title, slug, body)
- Book (title, author, description, link, coverImage)
- Partner (name, description, url, logo)

React app fetches from Sanity's API at build time (static) or request time (dynamic) depending on update frequency. Free tier is sufficient for this scale.

---

## Redux Slices

| Slice | Responsibility |
|---|---|
| `userSlice` | Auth state, login/logout, session |
| `enrollmentsSlice` | User's active enrollments, fetched on login |
| `progressSlice` | Lesson completion + quiz results per course |
| `coursesSlice` | Public course catalogue data |

---

## CI/CD

GitHub Actions — same two-job pattern as WWT:

| Job | Steps |
|---|---|
| `ci` | Lint + build (client + server) |
| `deploy` | Firebase/Vercel (frontend) + Cloud Run (backend) in parallel |

---

## Build Order

### Phase 1 — Foundation
1. Repo scaffold (client + server structure)
2. MongoDB connection (cached promise pattern)
3. User model + Passport local + Google OAuth
4. Express session middleware + `connect-mongo` session store
5. Auth routes (`/register`, `/login`, `/logout`, `/auth/google`)
6. `isAuthenticated` middleware

### Phase 2 — Course Data
1. Course model (modules + lessons + quiz schema)
2. Enrollment model
3. LessonProgress + QuizAttempt models
4. Seed script for dev course data
5. Minimal frontend route to render seeded course data (verifies API shape before full frontend build)

### Phase 3 — Payments
1. Stripe account setup + webhook endpoint
2. `POST /api/checkout/create-session` route
3. Webhook handler → Enrollment creation
4. Test full purchase → enrollment flow

### Phase 4 — Content Delivery
1. `checkEnrollment` middleware
2. Lesson content routes (gated)
3. Quiz submission + validation routes
4. GCS signed URL route for PDFs
5. LessonProgress tracking

### Phase 5 — Frontend
1. Public pages (home, about, programmes catalogue, course landing)
2. Auth pages (login, register)
3. Redux store setup (userSlice, enrollmentsSlice, progressSlice)
4. Dashboard (enrolled courses + progress)
5. Course player (video + content + PDF + quiz)
6. Sanity integration (articles, education, books, partners)

### Phase 6 — CI/CD + Deploy
1. GitHub Actions pipeline
2. Cloud Run backend deploy
3. Vercel frontend deploy
4. Domain migration from Wix
5. Environment variables + secrets

---

## Environment Variables

### Server
```
MONGODB_URI
SESSION_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
GCS_BUCKET_NAME
BUNNY_API_KEY          # production only
CLIENT_URL
```

### Client
```
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
VITE_SANITY_PROJECT_ID
VITE_SANITY_DATASET
VITE_BUNNY_STREAM_URL  # production only
```

---

## Key Architectural Principles

- Quiz answers never leave the server
- PDFs served via short-lived signed GCS URLs only
- Enrollment created in Stripe webhook handler only — never on frontend redirect
- Video source abstracted behind `videoSource` field — swap YouTube for Bunny with no component changes
- Sanity for editorial content, MongoDB for transactional data — clean separation
- `checkEnrollment` middleware reusable across all course content routes
- Lazy SDK initialization for Stripe + GCS clients (same pattern as WWT Cloud Functions)
