# DecolonizeHealthcare — Architecture & Build Plan

## Project Overview

Full-stack platform replacing the existing Wix site at `decolonizehealthcare.com`. Handles marketing, free editorial content, newsletter signup, user auth, course purchasing, and gated course content delivery. Wix eliminated entirely.

---

## Goals

- Migrate all existing content off Wix ($200/yr savings)
- Sell and deliver online courses with video, written content, PDFs, and quizzes
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
| Newsletter | Resend — transactional + list emails, consistent with other projects in the portfolio |
| Video (dev) | YouTube unlisted |
| Video (production) | Bunny Stream (pay-as-you-go, ~$2–6/mo at small scale) |
| PDF storage | Google Cloud Storage (signed URLs) |
| Deploy — frontend | Vercel |
| Deploy — backend | Google Cloud Run |

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
Form POSTs to `POST /api/newsletter/subscribe` → server forwards to chosen email service API.
**Requires service decision before implementation.** Candidates: Mailchimp, Kit, Resend.

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
| `/books` | Book list | Decap markdown |
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
- Body: `{ email: string, name?: string }`
- Validates email format
- Forwards to chosen email service API
- Returns `200` on success, `400` on invalid email, `409` if already subscribed
- Anti-enumeration: `409` uses same generic copy as success on the frontend ("Check your inbox!")

**Frontend placements:**
- Home page — hero section or dedicated strip
- Article pages — inline CTA after article body
- Footer — one-line email input across all pages

**Service: Resend** — consistent with other projects in the portfolio. Lazy initialization via `getResend()` factory (same pattern as Stripe + GCS). Audience/contacts feature used to store subscribers. Transactional confirmation email sent on signup.

---

## Auth

- `passport-local-mongoose` for local auth
- `passport-google-oauth20` for Google login
- Express sessions with MongoDB session store (`connect-mongo`)
- Anti-enumeration: identical generic responses regardless of whether email exists
- `isAuthenticated` middleware on all protected routes

---

## Payment Flow (Stripe)

```
1. User clicks "Buy Course" on /programs/:slug
2. POST /api/checkout/create-session
3. Client redirects to Stripe hosted checkout
4. POST /api/webhooks/stripe → create Enrollment
5. User redirected to /dashboard
```

Enrollment created in webhook handler only — never on frontend redirect.

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
- [ ] Home page (hero, about strip, newsletter signup)
- [ ] Public content pages (Articles list + detail, Education landing + sub-pages, Books, Partners, About)
- [ ] Programs catalogue + course landing page + buy button
- [ ] Course player (video + content + PDF + quiz)
- [ ] Newsletter subscribe endpoint + frontend form
- [ ] Decap CMS config + content schema (so content can be loaded as pages are built)

### Phase 6 — CI/CD + Deploy 🔲
GitHub Actions, Cloud Run deploy, Vercel deploy, domain migration, env vars.

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
GCS_BUCKET_NAME
NEWSLETTER_API_KEY        # Mailchimp / Kit / Resend — TBD
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
- PDFs served via short-lived signed GCS URLs only
- Enrollment created in Stripe webhook handler only
- Video source abstracted behind `videoSource` — swap YouTube for Bunny with no component changes
- Decap for editorial content, MongoDB for transactional/course data — clean separation
- `checkEnrollment` middleware reusable across all course content routes
- Client self-publishing deferred to post-launch — developer uploads all initial content
- Lazy SDK initialization for Stripe + GCS clients