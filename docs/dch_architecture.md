# DecolonizeHealthcare — Architecture & Build Plan

## Project Overview

Full-stack platform replacing the existing Wix site at `decolonizehealthcare.com`. Handles marketing, free editorial content, newsletter signup, user auth, course purchasing, book purchasing, and gated course content delivery. Wix eliminated entirely.

---

## Goals

- Migrate all existing content off Wix ($200/yr savings)
- Sell and deliver online courses with video, written content, PDFs, and quizzes
- Sell Owl's book in three formats — ebook, physical, audiobook — via Stripe Checkout
- Physical book orders fulfilled by Owl; she receives a Resend email notification on every physical sale
- Digital formats (ebook, audiobook) delivered via Resend transactional email with GCS signed download link
- User accounts with enrollment-based content gating
- Free public content (articles, education pages, book list, partners)
- Newsletter signup integrated into home page and article pages
- Client can self-publish articles, education pages, and courses via Decap CMS (implemented last — developer uploads content initially)
- Launch with 1–2 courses; architecture supports unlimited future courses

---

## Tech Stack

| Concern | Tool |
|---|---|
| Frontend | React + Redux Toolkit, Vite, Tailwind CSS v3, React Router v7 |
| Backend | Node.js / Express (ESM), hosted on Google Cloud Run |
| Database | MongoDB Atlas (users, enrollments, progress, courses) |
| CMS | Decap CMS — Git-based, free. Markdown files committed to repo, Vercel redeploys on publish. Client edits via `/admin` UI. |
| Auth | Passport.js — Local + Google OAuth |
| Payments | Stripe Checkout + webhooks |
| Newsletter | Resend — transactional + list emails |
| Video (dev) | YouTube unlisted |
| Video (production) | Bunny Stream (pay-as-you-go, ~$2–6/mo at small scale) |
| PDF storage | Google Cloud Storage (signed URLs) |
| Deploy — frontend | Vercel (auto-deploy on push to main) |
| Deploy — backend | Google Cloud Run (source-based deploy via buildpacks — no Dockerfile) |

**Note on prerendering:** Vike/vite-plugin-ssr was originally planned for static prerendering of public routes. This was not implemented — the site runs as a pure SPA on Vercel with `vercel.json` rewrites for hard-refresh routing. If SEO prerendering becomes a priority post-launch, Vike can be added at that point.

---

## Content Strategy

### Two distinct content types — different update cadence and ownership

| Section | Type | Updated by | How |
|---|---|---|---|
| **Articles** | Blog-style posts — regularly updated | Client (eventually) | Decap CMS |
| **Education** | Permanent sub-pages by topic — rarely updated | Developer initially, client later | Static React (stable content) |
| **Programs/Courses** | Course catalogue + landing pages | Developer initially, client later | Decap CMS (metadata) + MongoDB (content) |
| Books, Partners, About | Static or near-static | Developer | Hardcoded in JSX |

### Education sub-sections
Seven permanent topic pages (not a blog — evergreen reference content):
- Childhood Adversity
- Anatomy & Physiology
- Neurobiology
- Mental Health
- Movement
- How to Understand a Scientific Article
- Behavioral Biology

Implemented as static React components with curated resource links and YouTube embeds — not markdown-driven, because the content (external links, video IDs) is stable and this avoids over-engineering.

### Articles
Standard blog. Listed at `/articles`, individual posts at `/articles/:slug`. Parsed at build time via `import.meta.glob` + `front-matter`.

### Newsletter
Form POSTs to `POST /api/newsletter/subscribe` → server forwards to Resend API. Not yet implemented.

**Frontend placements:** Article pages, Articles list, Home page hero, Footer

---

## Repository Structure

```
decolonize-healthcare/
├── client/
│   ├── public/
│   │   ├── admin/              # Decap CMS admin UI (index.html + config.yml)
│   │   ├── images/             # Static images (education, courses, book cover)
│   │   └── illustrations/      # Hero SVGs per page
│   ├── src/
│   │   ├── components/         # Shared components (Navbar, Footer, EnrollButton, etc.)
│   │   ├── pages/              # Route-level pages
│   │   │   └── education/      # Seven static education sub-pages
│   │   ├── store/              # Redux slices
│   │   ├── styles/             # article.css (scoped prose styles)
│   │   └── utils/              # markdown.js, formatDate.js, scrollToTop.js
│   ├── index.html
│   └── vite.config.js
├── content/                    # Decap-managed markdown files (committed to repo)
│   ├── articles/
│   ├── education/
│   ├── books/
│   └── partners/
├── server/
│   ├── config/
│   │   ├── book.js             # Book variant config (Price IDs, GCS paths, shipping flags)
│   │   └── passport.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── scripts/
│   │   ├── buildProgramDatabase.js  # Seed script (renamed from seedCourse.js)
│   │   ├── content/                 # Parsed course content files (e.g., meditation-exploration.mjs)
│   │   └── tools/                   # parse-course.mjs and other tooling
│   └── index.js
├── vercel.json                 # SPA routing rewrites
└── .github/workflows/
```

---

## Data Models

### User
```js
{
  username: String,
  email: String,
  hash: { type: String, select: false },
  googleId: String,
  createdAt: Date
}
```

### Course
```js
{
  title: String,
  slug: String,
  description: String,
  longDescription: String,    // full marketing copy for /programs/:slug
  price: Number,              // cents
  published: Boolean,
  thumbnail: String,
  modules: [{
    title: String,
    order: Number,
    lessons: [{
      title: String,
      order: Number,
      content: String,
      videoSource: 'youtube' | 'bunny',
      videoId: String,
      pdfs: [{ title: String, gcsPath: String }],
      quiz: {
        questions: [{
          prompt: String,
          options: [String],
          correctIndex: Number   // never sent to client
        }]
      },
      survey: {
        questions: [{
          prompt: String,
          type: 'multiple_choice' | 'open_text',
          options: [String]     // only for multiple_choice
        }]
      }
    }]
  }]
}
```

### Enrollment
```js
{
  user: ObjectId,
  course: ObjectId,
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

### SurveyResponse
```js
{
  user: ObjectId,
  course: ObjectId,
  lesson: ObjectId,
  answers: [{ questionId: ObjectId, value: String }],
  submittedAt: Date
}
```

---

## Site Structure

### Public Routes
| Route | Content | Status |
|---|---|---|
| `/` | Home / marketing + newsletter signup | ✅ |
| `/articles` | Article list | ✅ |
| `/articles/:slug` | Individual article | ✅ |
| `/education` | Education landing (links to sub-sections) | ✅ |
| `/education/:slug` | Sub-section page (Childhood Adversity, etc.) | ✅ |
| `/books` | Book list / reading recommendations + referral strip | ✅ |
| `/book` | Owl's book — landing page + format selector + buy buttons | ✅ |
| `/partners` | Partners | ✅ |
| `/programs` | Course catalogue | ✅ |
| `/programs/:slug` | Course landing + buy button | ✅ |
| `/about` | About | ✅ |
| `/login` | Login (local + Google OAuth) | ✅ |
| `/register` | Registration | ✅ |

### Protected Routes (auth + enrollment required)
| Route | Content | Status |
|---|---|---|
| `/dashboard` | Enrolled courses + progress | ✅ |
| `/courses/:slug/learn` | Course player (redirects to first lesson) | ✅ |
| `/courses/:slug/learn/:lessonId` | Individual lesson (content, survey, mark complete) | ✅ |

---

## Decap CMS Setup

Decap runs entirely in the browser — no separate server needed.

**`client/public/admin/index.html`** — loads Decap from CDN  
**`client/public/admin/config.yml`** — defines collections

Authentication via GitHub OAuth (simpler for single-editor setup).

Content collections:
- `articles` — title, slug, publishedAt, tags, body (markdown)
- `education` — title, slug, category, body (markdown) *(currently static React — CMS migration deferred)*
- `books` — title, author, description, link, coverImage *(currently hardcoded in Books.jsx)*
- `partners` — name, description, url, logo *(currently hardcoded in Partners.jsx)*

**Status:** Not yet implemented.

---

## Newsletter

**Endpoint:** `POST /api/newsletter/subscribe` — **not yet implemented**
- Body: `{ email: string, firstName?: string, lastName?: string }`
- Validates email format
- Forwards to Resend API — adds contact to audience, sends confirmation email
- Returns `200` on success, `400` on invalid email, `409` if already subscribed

**Frontend:** `NewsletterSignup` component exists and is wired into Article, Articles, and Home pages. Form shows error state until endpoint is live.

---

## Auth

- `passport-local-mongoose` for local auth with explicit `LocalStrategy({ usernameField: 'email' })`
- `passport-google-oauth20` for Google login
- Express sessions with MongoDB session store (`connect-mongo`)
- Anti-enumeration: identical generic responses regardless of whether email exists
- `isAuthenticated` middleware on all protected routes
- `?redirect` query param on Login/Register — post-auth navigation for flows originating from course pages

---

## Payment Flow (Courses)

```
1. User clicks "Enroll" on /programs/:slug
2. POST /api/checkout/create-session
3. Client redirects to Stripe hosted checkout
4. POST /api/webhooks/stripe → create Enrollment
5. User redirected to /dashboard
```

For free courses (`price: 0`):
```
1. User clicks "Enroll for free" on /programs/:slug
2. POST /api/enrollments/free
3. Redirect to /courses/:slug/learn
```

Enrollment created in webhook/route handler only — never on frontend redirect.

---

## Payment Flow (Book)

```
1. User selects variant (ebook / physical / audiobook) on /book
2. POST /api/checkout/create-book-session { variant }
3. Server looks up Price ID + config from BOOK_VARIANTS
4. Client redirects to Stripe hosted checkout
   - Physical only: shipping address collection enabled
5. POST /api/webhooks/stripe → branches on session.metadata.type === 'book'
   - Physical: send Owl fulfillment notification email via Resend
   - Ebook / Audiobook: generate 24hr GCS signed URL, send buyer delivery email via Resend
   - All variants: send buyer purchase confirmation email via Resend
```

**Status:** Frontend `/book` page built. Backend route and webhook handler not yet implemented.

No user account required for book purchase. Buyer email captured by Stripe Checkout.

---

## Book Store

One product, three variants. No DB model — variants hardcoded in server config.

**`server/config/book.js`**
```js
export const BOOK_VARIANTS = {
  ebook: {
    stripePriceId: process.env.STRIPE_BOOK_EBOOK_PRICE_ID,
    requiresShipping: false,
    gcsPath: 'book/ebook.pdf',
  },
  physical: {
    stripePriceId: process.env.STRIPE_BOOK_PHYSICAL_PRICE_ID,
    requiresShipping: true,
    gcsPath: null,
  },
  audiobook: {
    stripePriceId: process.env.STRIPE_BOOK_AUDIOBOOK_PRICE_ID,
    requiresShipping: false,
    gcsPath: 'book/audiobook.zip',
  },
};
```

Stripe Price IDs stored in env vars. Created once in Stripe dashboard (Owl's account).

**Signed URL expiry** — 24 hours for book downloads (vs. 15 minutes for course PDFs).

---

## Content Gating

```js
router.get('/:courseId/lessons/:lessonId', isAuthenticated, checkEnrollment, lessonController);
```

Quiz answers (`correctIndex`) never leave the server. PDF delivery via short-lived GCS signed URLs only.

---

## Video Strategy

| Environment | Platform |
|---|---|
| Development | YouTube unlisted |
| Production | Bunny Stream |

`videoSource` field drives the player component — swap YouTube for Bunny by updating DB fields only.

---

## Redux Slices

| Slice | Responsibility |
|---|---|
| `userSlice` | Auth state, login/logout, session |
| `enrollmentsSlice` | User's active enrollments |
| `progressSlice` | Lesson completion + quiz results per course |
| `coursesSlice` | Public course catalogue data |

---

## Build Order

### Phase 1 — Foundation ✅
Repo scaffold, MongoDB, User model, Passport, sessions, auth routes, isAuthenticated middleware.

### Phase 2 — Course Data ✅
Course/Enrollment/Progress models, seed script, public course routes.

### Phase 3 — Payments ✅
Stripe checkout session, webhook handler, enrollment creation.

### Phase 4 — Content Delivery ✅
checkEnrollment middleware, gated lesson routes, quiz submission, GCS signed URLs, progress tracking.

### Phase 5 — Frontend ✅
- [x] Scaffold, Redux slices, design system, layout components
- [x] Auth pages (Login, Register) — with `?redirect` param support
- [x] Dashboard
- [x] Article detail page (`/articles/:slug`)
- [x] Articles list page (`/articles`)
- [x] Programs catalogue (`/programs`) — skeleton loading, EnrollButton
- [x] Programs landing page (`/programs/:slug`) — course detail, sticky CTA sidebar
- [x] Course player (`/courses/:slug/learn` + `/:lessonId`) — content + survey lessons
- [x] Education landing + 7 sub-pages (`/education`, `/education/:slug`)
- [x] Books page (`/books`) — reading list + rethinkingbroken.com referral strip
- [x] Partners page (`/partners`)
- [x] About page (`/about`)
- [x] Home page (`/`)
- [x] Book landing page (`/book`) — format selector, buy buttons
- [x] Free enrollment route (`POST /api/enrollments/free`)
- [x] Favicon
- [x] `useScrollToTop` utility hook

### Phase 6 — CI/CD + Deploy ✅ (partial)
- [x] GitHub Actions → Cloud Run backend deploy
- [x] Vercel frontend deploy
- [x] `vercel.json` SPA routing fix
- [x] Cross-origin cookie fix (`trust proxy` + `sameSite: 'none'`)
- [x] `VITE_API_URL` wired across all fetch calls
- [ ] Domain migration from Wix
- [ ] Production environment variables + secrets
- [ ] Separate production MongoDB Atlas database

### Phase 7 — Backend Features 🔲
- [ ] `POST /api/checkout/create-book-session` route
- [ ] Webhook handler branch for book orders (Resend fulfillment to Owl + delivery to buyer)
- [ ] GCS assets uploaded — ebook PDF, audiobook file(s)
- [ ] `POST /api/newsletter/subscribe` + Resend wiring
- [ ] Decap CMS config + content schema

### Phase 8 — Client CMS Handoff 🔲
- Load initial article and education content (developer-uploaded)
- Client walkthrough: write and publish articles
- Test full editorial workflow

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
STRIPE_BOOK_EBOOK_PRICE_ID
STRIPE_BOOK_PHYSICAL_PRICE_ID
STRIPE_BOOK_AUDIOBOOK_PRICE_ID
GCS_BUCKET_NAME
NEWSLETTER_API_KEY        # Resend
BUNNY_API_KEY             # production only
CLIENT_URL
```

### Client
```
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
VITE_BUNNY_STREAM_URL     # production only
```

---

## Key Architectural Principles

- Quiz answers never leave the server
- PDFs served via short-lived signed GCS URLs only (15 min for course PDFs, 24 hr for book downloads)
- Enrollment created in Stripe webhook handler or free-enrollment route only — never on frontend redirect
- Book orders handled in webhook handler only — no fulfillment on frontend redirect
- Video source abstracted behind `videoSource` — swap YouTube for Bunny with no component changes
- Decap for editorial content, MongoDB for transactional/course data — clean separation
- Book variants hardcoded in server config — no DB model needed for a single product
- No account required for book purchase — buyer email captured by Stripe
- Variants strictly separate — no digital bundling with physical book purchase
- Education pages are static React components, not markdown-driven — pragmatic choice for stable content (curated links, YouTube IDs)
- `checkEnrollment` middleware reusable across all course content routes
- Client self-publishing deferred to post-launch — developer uploads all initial content
- Lazy SDK initialization for Stripe, GCS, and Resend clients
- Pure SPA deployed on Vercel — Vike/SSR prerendering deferred (not implemented)
- Cloud Run deployed via source-based buildpacks — no Dockerfile required
- Dev and prod share one MongoDB Atlas database — acknowledged gap; separate prod database needed before launch