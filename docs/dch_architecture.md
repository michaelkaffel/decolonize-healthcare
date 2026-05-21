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
| SSR / Prerendering | Vike (`vite-plugin-ssr`) — static prerendering for all public SEO routes |
| Backend | Node.js / Express (ESM), hosted on Google Cloud Run |
| Database | MongoDB Atlas (users, enrollments, progress, courses) |
| CMS | Decap CMS — Git-based, free. Markdown files committed to repo, Vercel redeploys on publish. Client edits via `/admin` UI. |
| Auth | Passport.js — Local + Google OAuth |
| Payments | Stripe Checkout + webhooks |
| Newsletter | Resend — transactional + list emails, consistent with other projects in the portfolio |
| Video (dev) | YouTube unlisted |
| Video (production) | Bunny Stream (pay-as-you-go, ~$2–6/mo at small scale) |
| PDF storage | Google Cloud Storage (signed URLs) |
| Deploy — frontend | Vercel |
| Deploy — backend | Google Cloud Run (source-based deploy via buildpacks — no Dockerfile) |

---

## Prerendering Strategy

Vike (`vite-plugin-ssr`) handles static prerendering at build time. Public SEO-relevant routes get clean static HTML; auth-gated routes remain SPA.

### Prerendered routes (static HTML at build time)
| Route | Data source |
|---|---|
| `/` | Static |
| `/articles` | Markdown files in repo |
| `/articles/:slug` | Markdown files in repo — one HTML file per article |
| `/programs` | MongoDB — fetched at build time |
| `/programs/:slug` | MongoDB — fetched at build time, one HTML file per course |
| `/book` | Static / hardcoded |
| `/about` | Decap markdown |
| `/education` | Static |
| `/education/:slug` | Decap markdown |
| `/books` | Decap markdown |
| `/partners` | Decap markdown |

**Note on `/programs` and `/programs/:slug`:** course data is fetched from MongoDB at build time. A redeploy is required when the course catalogue changes. This is acceptable given infrequent updates.

### SPA routes (no prerender)
| Route | Reason |
|---|---|
| `/dashboard` | Auth-gated, no SEO value |
| `/login` | Auth page |
| `/register` | Auth page |
| `/courses/:slug/learn` | Enrollment-gated course player |
| `/courses/:slug/learn/:lessonId` | Enrollment-gated lesson view |

---

## Content Strategy

### Two distinct content types — different update cadence and ownership

| Section | Type | Updated by | How |
|---|---|---|---|
| **Articles** | Blog-style posts — regularly updated | Client (eventually) | Decap CMS |
| **Education** | Permanent sub-pages by topic — rarely updated | Developer initially, client later | Decap CMS |
| **Programs/Courses** | Course catalogue + landing pages | Developer initially, client later | Decap CMS (metadata) + MongoDB (content) |
| Books, Partners, About | Static or near-static | Developer | Decap CMS or hardcoded |

### Education sub-sections (from existing Wix nav)
Permanent topic pages — not a blog, more like evergreen reference content:
- Childhood Adversity
- Anatomy & Physiology
- Neurobiology
- Mental Health
- Movement
- How to Understand a Scientific Article
- Behavioral Biology

Each sub-section = its own Decap-managed markdown page, rendered at `/education/:slug`.
The Education nav item opens a dropdown to these sub-pages (matching current Wix behaviour).

### Articles
Standard blog. Listed at `/articles`, individual posts at `/articles/:slug`.
Client will eventually create/publish via Decap admin. Developer uploads all initial content.

### Newsletter
Signup form embedded on: home page hero/footer, article pages (inline CTA), dedicated `/newsletter` route (optional).
Form POSTs to `POST /api/newsletter/subscribe` → server forwards to Resend API.

**Service: Resend** — consistent with other projects in the portfolio. Lazy initialization via `getResend()` factory (same pattern as Stripe + GCS). Audience/contacts feature used to store subscribers. Transactional confirmation email sent on signup.

---

## Repository Structure

```
decolonize-healthcare/
├── client/
│   ├── public/
│   │   └── admin/              # Decap CMS admin UI (index.html + config.yml)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/              # Redux slices
│   │   └── hooks/
│   └── vite.config.js
├── content/                    # Decap-managed markdown files (committed to repo)
│   ├── articles/
│   ├── education/
│   ├── books/
│   └── partners/
├── server/
│   ├── config/
│   │   └── book.js             # Book variant config (Price IDs, GCS paths, shipping flags)
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
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
  price: Number,          // cents
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

---

## Site Structure

### Public Routes
| Route | Content | Source |
|---|---|---|
| `/` | Home / marketing + newsletter signup | Static + newsletter API |
| `/articles` | Article list | Decap markdown |
| `/articles/:slug` | Individual article | Decap markdown |
| `/education` | Education landing (links to sub-sections) | Static |
| `/education/:slug` | Sub-section page (Childhood Adversity, etc.) | Decap markdown |
| `/books` | Book list / reading recommendations | Decap markdown |
| `/book` | Owl's book — landing page + format selector + buy buttons | Static / hardcoded |
| `/partners` | Partners | Decap markdown |
| `/programs` | Course catalogue | MongoDB API |
| `/programs/:slug` | Course landing + buy button | MongoDB API |
| `/about` | About | Decap markdown or static |
| `/login` | Login (local + Google OAuth) | — |
| `/register` | Registration | — |

### Protected Routes (auth + enrollment required)
| Route | Content |
|---|---|
| `/dashboard` | Enrolled courses + progress |
| `/courses/:slug/learn` | Course player |
| `/courses/:slug/learn/:lessonId` | Individual lesson (video, content, PDF, quiz) |

---

## Decap CMS Setup

Decap runs entirely in the browser — no separate server needed.

**`client/public/admin/index.html`** — loads Decap from CDN
**`client/public/admin/config.yml`** — defines collections (articles, education, books, partners)

Authentication via **Netlify Identity** (works on Vercel with a small proxy) or **GitHub OAuth** (client logs into `/admin` with their GitHub account). GitHub OAuth is simpler for a single-editor setup.

Content collections needed:
- `articles` — title, slug, publishedAt, tags, body (markdown)
- `education` — title, slug, category, body (markdown)
- `books` — title, author, description, link, coverImage
- `partners` — name, description, url, logo

React app reads markdown files at build time via `import.meta.glob` (Vite) or at runtime via fetch from `/content/`.

**Content workflow:**
1. Client logs into `decolonizehealthcare.com/admin`
2. Creates/edits content in Decap UI
3. Decap commits markdown file to GitHub repo
4. Vercel detects push → rebuilds and redeploys frontend (~1 min)

**Phase order:** Set up Decap config and content schema as part of Phase 5. Client self-publishing training deferred to post-launch.

---

## Newsletter

**Endpoint:** `POST /api/newsletter/subscribe`
- Body: `{ email: string, firstName?: string, lastName?: string }`
- Validates email format
- Forwards to Resend API — adds contact to audience, sends confirmation email
- Returns `200` on success, `400` on invalid email, `409` if already subscribed
- Anti-enumeration: `409` uses same generic copy as success on the frontend

**Frontend placements:**
- Article pages — inline CTA after article body
- Articles list — below article grid
- Home page — hero section or dedicated strip (not yet built)
- Footer — one-line email input across all pages (not yet built)

---

## Auth

- `passport-local-mongoose` for local auth
- `passport-google-oauth20` for Google login
- Express sessions with MongoDB session store (`connect-mongo`)
- Anti-enumeration: identical generic responses regardless of whether email exists
- `isAuthenticated` middleware on all protected routes

---

## Payment Flow (Courses)

```
1. User clicks "Buy Course" on /programs/:slug
2. POST /api/checkout/create-session
3. Client redirects to Stripe hosted checkout
4. POST /api/webhooks/stripe → create Enrollment
5. User redirected to /dashboard
```

Enrollment created in webhook handler only — never on frontend redirect.

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

No user account required for book purchase. Buyer email captured by Stripe Checkout.
Variants are strictly separate — no digital bundling with physical purchase.

---

## Book Store

One product, three variants with separate prices. No DB model needed — variants are hardcoded in a server-side config file.

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

Stripe product and all three Price IDs created once in the Stripe dashboard (Owl's account). Price IDs stored in env vars — no dynamic pricing, no DB writes.

**Separate route** — `POST /api/checkout/create-book-session` kept separate from `POST /api/checkout/create-session` (courses) to keep logic clean. Both mounted under `/api/checkout`.

**Signed URL expiry** — 24 hours for book downloads (vs. 15 minutes for course PDFs) to account for email delivery delay before buyer opens link.

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

### Phase 5 — Frontend (in progress)
- [x] Scaffold, Redux slices, design system, layout components
- [x] Auth pages (Login, Register)
- [x] Dashboard
- [x] Article detail page (`/articles/:slug`)
- [x] Articles list page (`/articles`)
- [x] Programs catalogue (`/programs`) — course grid, buy button, enrolled state
- [ ] Vike (`vite-plugin-ssr`) integration + prerender config
- [ ] Home page (hero, about strip, newsletter signup)
- [ ] Programs landing page (`/programs/:slug`) — course detail + buy button
- [ ] Course player (`/courses/:slug/learn` + `/:lessonId`)
- [ ] Education landing + sub-pages (`/education`, `/education/:slug`)
- [ ] Books page (`/books`)
- [ ] Partners page (`/partners`)
- [ ] About page (`/about`)
- [ ] Book landing page (`/book`) — format selector, three buy buttons, book info
- [ ] Newsletter subscribe endpoint (`POST /api/newsletter/subscribe`) + Resend wiring
- [ ] Decap CMS config + content schema
- [ ] `POST /api/checkout/create-book-session` route
- [ ] Webhook handler branch for book orders (fulfillment email to Owl, delivery email to buyer)
- [ ] GCS assets uploaded — ebook PDF, audiobook file(s)
- [ ] Resend transactional emails — fulfillment alert to Owl + delivery email to buyer

### Phase 6 — CI/CD + Deploy 🔲
1. Cloud Run backend deploy (source-based, no Dockerfile)
2. Vercel frontend deploy
3. GitHub Actions deploy jobs
4. Domain migration from Wix
5. Environment variables + secrets

### Phase 7 — Client CMS Handoff 🔲
- Load initial article and education content (developer-uploaded)
- Decap admin UI polish
- Client walkthrough: how to write and publish articles, education pages, courses
- Test full editorial workflow end-to-end

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
- Enrollment created in Stripe webhook handler only — never on frontend redirect
- Book orders handled in webhook handler only — no fulfillment on frontend redirect
- Video source abstracted behind `videoSource` — swap YouTube for Bunny with no component changes
- Decap for editorial content, MongoDB for transactional/course data — clean separation
- Book variants hardcoded in server config — no DB model needed for a single product
- No account required for book purchase — buyer email captured by Stripe
- Variants strictly separate — no digital bundling with physical book purchase
- `checkEnrollment` middleware reusable across all course content routes
- Client self-publishing deferred to post-launch — developer uploads all initial content
- Lazy SDK initialization for Stripe + GCS clients
- Public SEO routes prerendered as static HTML via Vike at build time — SPA only for auth-gated routes
- `/programs` and `/programs/:slug` fetch from MongoDB at build time — redeploy required on course catalogue changes (acceptable)
- Cloud Run deployed via source-based buildpacks — no Dockerfile required