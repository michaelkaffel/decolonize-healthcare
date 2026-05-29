# Build Log — decolonize-healthcare

## Phase 1 — Foundation ✅

### Scaffold
- Vite + React 18 client (`npm create vite@latest client -- --template react`)
- Extra client deps: `react-redux`, `@reduxjs/toolkit`, `react-router-dom`, `tailwindcss@^3.4.14`, `postcss`, `autoprefixer`, `eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals`
- Tailwind v3 pinned explicitly — Vite pulls v4 by default which is a breaking change
- Express server scaffolded manually in `server/`
- Extra server deps: `express`, `cors`, `dotenv`, `mongoose`, `express-session`, `connect-mongo`, `passport`, `passport-google-oauth20`, `passport-local-mongoose`, `stripe`, `@google-cloud/storage`, `globals` (devDep)
- `passport-local` not listed explicitly — included as a dep of `passport-local-mongoose`
- CI workflow: GitHub Actions, two steps — lint + build client, lint server
- Server ESLint config uses `globals.node` for Node built-ins (`process`, `console`)
- `.vscode/settings.json` added to client with `"css.validate": false` to suppress `@tailwind` directive warnings
- MongoDB Atlas cluster created under Owl's Gmail account (`decolonize-healthcare` cluster, Google Cloud, `us-central1`)
- Repo: github.com/michaelkaffel/decolonize-healthcare (public, pinned to portfolio)

### MongoDB Connection (`server/db.js`)
- Cached promise pattern — prevents duplicate connections on repeated calls
- `connectionPromise` reset to `null` on failure to allow retries
- `start()` async function in `index.js` awaits `connectDB()` before starting the server

### User Model (`server/models/User.js`)
- Fields: `name`, `email` (required, unique), `googleId`, `createdAt`
- `username`, `hash`, `salt` injected automatically by `passport-local-mongoose` plugin
- `hash` is `select: false` by default — must `.select('+hash')` in routes that need it

### Passport Config (`server/config/passport.js`)
- `serializeUser` / `deserializeUser` using MongoDB `_id`
- Google OAuth strategy wrapped in `configurePassport()` export — called after `dotenv/config` loads to ensure env vars are available
- Google OAuth callback handles three cases:
  - Existing user with `googleId` → log in
  - Existing user without `googleId` → link accounts, log in
  - New user → create with `googleId` + `username: email`, log in

### Session Middleware (`server/index.js`)
- `express-session` with `connect-mongo` session store
- `cookie.secure` set to `true` in production only
- Session `maxAge` 7 days
- `passport.initialize()` + `passport.session()` wired after session middleware

### Auth Routes (`server/routes/auth.js`)
- `POST /api/auth/register` — creates user with `passport-local-mongoose` `.register()`, logs in on success. Anti-enumeration: identical response whether email exists or not.
- `POST /api/auth/login` — checks for Google-only account via `.select('+hash')` before attempting local auth. Uses `passport.authenticate('local')` as callback (not middleware) to allow custom response handling.
- `POST /api/auth/logout` — calls `req.logout()` with callback (Passport v0.6+ requirement)
- `GET /api/auth/me` — session check, returns user data if authenticated
- `GET /api/auth/google` — initiates Google OAuth flow
- `GET /api/auth/google/callback` — handles OAuth callback, redirects to `/dashboard` on success or `/login?error=oauth` on failure

### isAuthenticated Middleware (`server/middleware/isAuthenticated.js`)
- Calls `req.isAuthenticated()` — returns `401` if false, calls `next()` if true
- Imported directly in route files that need it, not in `index.js`

---

## Phase 2 — Course Data ✅

### Data Models

**Course Model (`server/models/Course.js`)**
- Nested subdocument structure: Course → modules → lessons → quiz questions
- `correctIndex` on quiz questions has `select: false` — answers never leave the server
- `gcsPath` on PDF subdocuments has `select: false` — raw GCS paths never exposed to client
- `_id: true` on all subdocuments — each module, lesson, and question gets its own ObjectId for progress tracking and quiz submission
- `timestamps: true` on top-level schema for `createdAt`/`updatedAt`
- `slug` field with unique index
- `price` stored in cents (Stripe convention)
- `videoSource` enum: `'youtube'`, `'bunny'`, or `null`

**Enrollment Model (`server/models/Enrollment.js`)**
- Refs to User and Course
- `stripeSessionId` required — enrollment only created via Stripe webhook
- `status` enum: `'active'` or `'refunded'`
- Compound unique index on `{ user, course }` prevents duplicate enrollments (idempotent against duplicate webhook deliveries)

**LessonProgress Model (`server/models/LessonProgress.js`)**
- Refs to User, Course; plain ObjectId for lesson (subdocument reference)
- `quizPassed` boolean for lessons with quizzes
- Compound unique index on `{ user, course, lesson }`

**QuizAttempt Model (`server/models/QuizAttempt.js`)**
- Tracks individual quiz attempts with score and pass/fail
- Non-unique index on `{ user, lesson }` — multiple attempts allowed
- `attemptedAt` timestamp

### Seed Script (`server/scripts/seedCourse.js`)
- Run with `cd server && npm run seed`
- Wipes all courses (`deleteMany`) then inserts one dev course — idempotent
- Dev course: "Decolonizing Your Health Practice", 2 modules, 3 lessons total
- Includes quiz questions with `correctIndex`, PDF references with `gcsPath`, YouTube video placeholders
- Price set to 9900 (cents) to match Stripe convention

### Public Course Routes (`server/routes/courses.js`)
- `GET /api/courses` — returns published courses with summary fields only (`title`, `slug`, `description`, `price`, `thumbnail`)
- `GET /api/courses/:slug` — returns course with module/lesson outlines (titles and order) but no content, video IDs, quiz answers, or GCS paths
- Wired in `index.js` as `app.use('/api/courses', courseRoutes)`

### Database
- MongoDB Atlas database named `decolonize-healthcare` (explicitly set in `MONGODB_URI` path segment)
- Database name must be specified in connection string — defaults to `test` if omitted

---

## Key Decisions & Notes

- **Sessions over JWT** — DCH runs on Cloud Run (persistent Express server), not Cloud Functions. Sessions + cookies work naturally in a browser context. JWT would be needed for a native mobile client, which is not in scope.
- **Cloud Run vs Cloud Functions** — persistent server means standard Passport flow works without the stream consumption workarounds required in WWT.
- **Google OAuth credentials** — placeholder values in `.env` during development. Real credentials needed before OAuth flow can be tested.
- **Account linking** — local + Google OAuth accounts are linked by matching email. Google-only accounts detected by absence of `hash` field.
- **Anti-enumeration** — auth endpoints return identical generic responses regardless of whether email exists in DB.
- **Price in cents** — all prices stored as integers in cents to match Stripe's API convention and avoid floating point issues.
- **Subdocument `select: false`** — Mongoose `select: false` on nested subdocument fields (`correctIndex`, `gcsPath`) ensures sensitive data is excluded from queries by default. Must explicitly `.select('+field')` when server-side access is needed.

---

## Phase 3 — Payments ✅

### Stripe Setup
- Using Michael's Stripe account in sandbox/test mode for development
- Owl will create her own Stripe account for production — swap keys at deploy time
- Test mode keys in `server/.env`: `STRIPE_SECRET_KEY` (`sk_test_...`) and `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
- Local webhook testing via Stripe CLI: `stripe listen --forward-to localhost:8080/api/webhooks/stripe`

### Raw Body Middleware (`server/index.js`)
- `express.raw({ type: 'application/json' })` mounted on `/api/webhooks/stripe` **above** `express.json()` in the middleware stack
- Required for Stripe signature verification — `constructEvent` needs the raw request body, not parsed JSON

### Checkout Route (`server/routes/checkout.js`)
- `POST /api/checkout/create-session` — protected by `isAuthenticated`
- Validates `courseId`, checks course exists and is published, checks for existing active enrollment
- Lazy Stripe initialization via `getStripe()` factory (same pattern as Resend on WWT)
- Creates Stripe Checkout Session with `price_data` built from course record (price in cents, no pre-created Stripe products needed)
- Attaches `userId` and `courseId` in session `metadata` — round-trips through webhook for enrollment creation
- `success_url` redirects to `/dashboard?purchased={slug}`, `cancel_url` back to course landing page
- Returns `{ url }` for client-side redirect to Stripe hosted checkout

### Webhook Route (`server/routes/webhooks.js`)
- `POST /api/webhooks/stripe` — no auth middleware (Stripe calls this directly)
- Verifies webhook signature with `constructEvent` + `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`: reads `userId` and `courseId` from `session.metadata`
- Uses `findOneAndUpdate` with `upsert: true` — idempotent against duplicate webhook deliveries (compound unique index on Enrollment prevents duplicates)
- Enrollment created in webhook handler only — never on frontend redirect (per architecture doc)

### Wiring
- Both routes mounted in `index.js`: `/api/checkout` and `/api/webhooks`
- Full end-to-end test deferred to Phase 5 when browser auth + buy button are available

---

## Phase 4 — Content Delivery ✅

### checkEnrollment Middleware (`server/middleware/checkEnrollment.js`)
- Looks up active Enrollment for `req.user._id` + `req.params.courseId`
- Returns `403` if no active enrollment found
- Attaches enrollment to `req.enrollment` for downstream use
- Used on all gated lesson routes alongside `isAuthenticated`

### Lesson Routes (`server/routes/lessons.js`)
- Mounted as `app.use('/api/courses/:courseId/lessons', lessonRoutes)` in `index.js`
- Router created with `{ mergeParams: true }` — required for `req.params.courseId` to be available from the parent route
- Lazy GCS `Storage` initialization via `getStorage()` factory
- `findLesson` helper iterates modules to locate a lesson subdocument by `_id`

**`GET /api/courses/:courseId/lessons`** — all lessons for enrolled user
- Returns full lesson content, video source/ID, PDF titles (no `gcsPath`), `hasQuiz` boolean (no answers), and per-lesson progress
- Progress built as a lookup map from `LessonProgress.find()` for efficient per-lesson matching

**`GET /api/courses/:courseId/lessons/:lessonId`** — single lesson
- Same shape as above for a single lesson with its progress

**`POST /api/courses/:courseId/lessons/:lessonId/quiz`** — quiz submission
- Fetches course with `.select('+modules.lessons.quiz.questions.correctIndex')` — answers only loaded server-side for grading
- Validates `answers` array length matches question count
- Grades quiz, calculates percentage score, pass threshold is 70%
- Creates `QuizAttempt` document on every submission
- Updates `LessonProgress` with `quizPassed: true` if passed (upsert)
- Returns `{ score, passed, results }` — results include per-question correct/incorrect but never the correct answer

**`POST /api/courses/:courseId/lessons/:lessonId/complete`** — manual lesson completion
- For lessons without quizzes only — returns `400` if lesson has quiz questions
- Creates/updates `LessonProgress` with `quizPassed: false` (upsert)

**`GET /api/courses/:courseId/lessons/:lessonId/pdf/:pdfId`** — PDF signed URL
- Fetches course with `.select('+modules.lessons.pdfs.gcsPath')` — raw GCS path only loaded server-side
- Generates v4 signed URL with 15-minute expiry via `@google-cloud/storage`
- Returns `{ url }` for client to open directly

---

## Phase 5 — Frontend (in progress)

### Scaffold ✅
*(existing entry — unchanged)*

### Redux Slices ✅
*(existing entry — unchanged)*

### Design System ✅
*(existing entry — unchanged)*

### Layout Components ✅
*(existing entry — unchanged)*

---

### Auth Pages ✅

**Login (`client/src/pages/Login.jsx`)**
- Split-screen layout: illustration left (`bg-brand-blush`), form right (`bg-brand-cream`)
- Google OAuth button + local email/password form
- Anti-enumeration handled on frontend: checks `data.id` presence rather than `res.ok` (both success and invalid-creds return `200`)
- On success: `dispatch(setUser(data))` + `navigate('/dashboard')`
- `credentials: 'include'` on all fetch calls for session cookie across Vite proxy

**Register (`client/src/pages/Register.jsx`)**
- Same split-screen layout
- Fields: name, email, password (`minLength={8}`)
- Username derived from email on backend — not a form field
- Checks `res.status === 201` for confirmed account creation; `200` = anti-enumeration path

---

### Backend additions for Dashboard ✅

**`GET /api/enrollments` (`server/routes/enrollments.js`)**
- Protected by `isAuthenticated`
- Returns active enrollments with course `title`, `slug`, `description`, `thumbnail` populated
- Mounted at `/api/enrollments` in `index.js`

**`GET /api/courses/:courseId/lessons/progress` (added to `server/routes/lessons.js`)**
- Protected by `isAuthenticated` + `checkEnrollment`
- Returns `{ completed, total }` lesson counts for the enrolled course
- Placed above `/:lessonId` route to prevent `progress` being matched as a lessonId
- Used by Dashboard to display per-course progress without fetching full lesson content

---

### Redux Slices — updated ✅

**`enrollmentsSlice`**
- `fetchEnrollments` thunk hits `GET /api/enrollments` with `credentials: 'include'`
- Stores results in `state.items`

**`progressSlice`**
- `fetchProgress(courseId)` thunk hits `GET /api/courses/:courseId/lessons/progress`
- Stores results in `state.byCourse[courseId] = { completed, total }`
- Fixed from stub: was incorrectly pointing at `GET /api/courses`

---

### Dashboard (`client/src/pages/Dashboard.jsx`) ✅

- Fetches enrollments on mount, then dispatches `fetchProgress` per enrolled course
- Displays course cards with thumbnail, title, description, progress bar, and CTA
- CTA label cycles: "Start course" / "Continue" / "Review course" based on percent complete
- Empty state with "Browse courses" CTA linking to `/programs`
- `firstName` derived from `name` in `userSlice` via `.split(' ')[0]`, falls back to `"there"`
- Layout: outer `flex-1` div + `min-h-screen` on `<main>` in `Layout.jsx` keeps footer below fold

---

### Refactor: Mongoose `toJSON` transforms ✅

Added `toJSON` transform to all schemas — top-level and all subdocuments:
- `User.js`
- `Course.js` — top-level + `moduleSchema`, `lessonSchema`, `pdfSchema`, `quizQuestionSchema`
- `Enrollment.js`
- `LessonProgress.js`
- `QuizAttempt.js`

Transform: `ret.id = ret._id.toString(); delete ret._id; delete ret.__v;`

`pdfs` array in `Course.js` extracted from inline schema to named `pdfSchema` to support `toJSON`.

All `._id` references replaced with `.id` in `Dashboard.jsx` and `server/routes/auth.js`.

---

### Article Detail Page ✅

**`client/src/utils/markdown.js`**
- `import.meta.glob` with `?raw` + `eager: true` — all articles parsed at module init, no runtime re-parsing
- Uses `front-matter` package (already in deps) for YAML frontmatter parsing
- Glob path: `'../../../content/articles/*.md'` — reaches repo root from `client/src/utils/`
- `vite.config.js` updated with `server.fs.allow: ['..']` to permit Vite dev server to serve files above `client/` project root
- `getAllArticles()` — returns sorted array of frontmatter attributes, no body
- `getArticleBySlug(slug)` — returns full article object including body string
- `front-matter` triggers a harmless `buffer` browser warning — cosmetic only, no functional impact

**`client/src/utils/formatDate.js`**
- Shared date formatting utility — appends `T12:00:00` to date strings to prevent UTC midnight timezone shift
- Imported by `Article.jsx` and `RecentPosts.jsx`

**`client/src/pages/Article.jsx`**
- Matches existing route `articles/:slug` in `App.jsx`
- `react-markdown` + `remark-gfm` for body rendering — no `dangerouslySetInnerHTML`
- Cover image NOT rendered from frontmatter — placed inline in markdown body by author wherever they choose
- No avatar, no category link, no three-dot share modal — dropped per design spec
- Header: tags, H1 title, optional subtitle, author name + date + read time (single line, no avatar)
- Assembles: header → `<hr>` → article body → `ShareButtons` → `NewsletterSignup` → `RecentPosts`
- `useEffect` scroll-to-top on slug change

**`client/src/components/ShareButtons.jsx`**
- Facebook, X, LinkedIn share links built from `window.location.href`
- Copy link button with 2s "Copied!" confirmation + `clipboard.writeText` async with `execCommand` fallback
- All icons inline SVG — no icon library needed
- Arrow function component, `export default` at bottom of file

**`client/src/components/RecentPosts.jsx`**
- Receives `articles` array as prop from `Article.jsx` (current slug already filtered out, sliced to 3)
- Cards: thumbnail, date, title, optional excerpt — no heart/comment/view icons
- "See all" link to `/articles`
- Returns `null` if empty array passed — safe to render unconditionally

**`client/src/styles/article.css`**
- Scoped prose styles under `.article-body` selector
- Uses `@apply` with existing brand tokens (`brand-crimson`, `brand-blush`, `brand-cream`, `brand-teal`)
- `pre code` rule resets inline code styles inside fenced blocks
- Imported locally in `Article.jsx` only — not global

**Packages added**
- `react-markdown`
- `remark-gfm`

**Bugs fixed during build**
- `articles/:slug` route path was missing the `s` — matched `article/:slug` instead, causing NotFound
- `getAllArticlesBySlug` had `attributes.slig` typo — slug lookup always returned `null`
- `react-markdown` swap left orphaned `marked.parse(body)` call — caused ReferenceError
- `brand-forest` used throughout — token does not exist in `tailwind.config.js`; replaced with `brand-crimson`
- `handleCopy` in `ShareButtons` missing `async` keyword — `await` inside non-async function caused parse error
- Import paths for `ShareButtons`/`RecentPosts` in `Article.jsx` used `./` instead of `../components/`

---

### Articles List Page ✅

**`client/src/pages/Articles.jsx`**
- Markdown files parsed at module init via `import.meta.glob` + `front-matter` — same pattern as `Article.jsx`
- `fmt()` inline date formatter (locale `en-US`, no separate utility needed here)
- Featured article: first in sorted array rendered as a large horizontal card (`md:flex-row`, `md:w-2/5` image)
- Remaining articles rendered in a responsive grid (`sm:grid-cols-2 lg:grid-cols-3`)
- `ArticleCard` component handles both featured and standard layouts via `featured` boolean prop
- Cover image falls back to `<Placeholder>` — gradient tile with article title text, no broken image states
- Tags: first tag only displayed as an uppercase label above the title
- `NewsletterSignup` rendered below the grid with `mt-10` spacing
- Page background `bg-brand-cream2`

**`client/src/components/NewsletterSignup.jsx`**
- Fields: `firstName`, `lastName`, `email` — all in a single `flex-row` form on `sm:` and up
- Posts to `POST /api/newsletter/subscribe` — endpoint not yet implemented; form shows error state until wired up
- Four states: `idle`, `loading`, `success`, `error`
- Success state replaces form with inline confirmation copy — no page navigation
- `409` (already subscribed) and other non-ok responses use `data.message` if present, fall back to generic copy
- `className` prop forwarded to wrapper `<div>` for spacing control at call sites
- Used in: `Article.jsx` (after article body), `Articles.jsx` (below grid)

---

### Programs Page ✅

**`client/src/pages/Programs.jsx`**
- Fetches courses via `fetchCourses` thunk on mount (skips if already loaded — `status === 'idle'` guard)
- Hero: `bg-brand-gold` banner with SVG illustration background (`/illustrations/programs-hero.svg`)
- Heading + description strip below hero, same gold background, centered
- Course grid: `sm:grid-cols-2`, `max-w-4xl` container
- Empty state and loading state handled inline
- `CourseCard` sub-component — thumbnail, title, description (`line-clamp-3`), price, CTA
- CTA logic:
  - Enrolled → "Go to course" link to `/courses/:slug/learn` (`bg-brand-green`)
  - Authenticated but not enrolled → `BuyButton` (`bg-brand-crimson`)
  - Unauthenticated → "Enroll now" link to `/register` (`bg-brand-crimson`)
- `BuyButton` sub-component — `POST /api/checkout/create-session`, redirects to `data.url` on success
- Enrollment check uses `enrolledCourseIds` Set built from `state.enrollments.items`
- Enrolled courses fetched from Redux store — assumes `fetchEnrollments` has already been called (dispatched on auth in `userSlice` or `Dashboard`)

---

---

## Phase 5 (continued) — Course Content Pipeline ✅

### Content Strategy Decision
- First course: "Meditation Exploration" — 21-day program, 3 weeks
- Content sourced from existing Wix program (Wix stock template — to be rewritten by Owl in her voice)
- Structure: Day 1–21 as modules, each with 2 lesson + 2 survey lessons (4 lessons/day), 86 lessons total
- No videos, no PDFs, no quizzes for this course — lesson content + surveys only

### Survey Schema (new)
- `survey` field added to `lessonSchema` in `Course.js` alongside existing `quiz` field
- Survey questions have two types: `multiple_choice` (options array, no correct answer) and `open_text` (free text, no options)
- New `SurveyResponse` model (`server/models/SurveyResponse.js`):
  ```js
  {
    user: ObjectId,
    course: ObjectId,
    lesson: ObjectId,
    answers: [{ questionId: ObjectId, value: String }],
    submittedAt: Date
  }
  ```
- `value` always a string — either selected option text or open text response
- New route: `POST /api/courses/:courseId/lessons/:lessonId/survey`
- Survey responses stored for future engagement analytics (per-user history, aggregate trends)
- Completing a survey counts as lesson completion for progress tracking purposes

### Content Tooling (`dc-scrape-project/` — outside repo)
- `scrape-program.mjs` — Puppeteer scraper (not used — Wix participant page requires login)
- `parse-course.mjs` — converts Google Doc plain text export to seed-ready JS object
  - Handles: `MODULE:`, `LESSON:`, `CONTENT:`, `SURVEY:`, `SURVEY QUESTION (multiple_choice/open_text)`, `---` separators
  - Strips BOM from Google Docs export
  - Outputs `meditation-program-parsed.mjs` with `courseData` export
- `meditation-program.txt` — Google Docs plain text export (source of truth for course content)
- `meditation-program-parsed.mjs` — parser output, copied to `server/scripts/`

### Seed Script — updated (`server/scripts/seedCourse.js`)
- Imports `courseData` from `meditation-program-parsed.mjs`
- Replaces dev placeholder course with full 21-day Meditation Exploration course
- `PUBLISHED: false` — course not visible until content is rewritten and approved by Owl

---

### Bugs fixed (global)

- **`passport.js`** — missing `passport.use(User.createStrategy())` caused `Unknown authentication strategy "local"` error on login
- **`LocalStrategy`** — `passport-local` defaults to `username` field; replaced `User.createStrategy()` with explicit `new LocalStrategy({ usernameField: 'email' }, User.authenticate())` so email is used for login
- **`vite.config.js`** — proxy URL malformed: `'http://:localhost8080'` → `'http://localhost:8080'`
- **`ProtectedRoute`** — race condition on refresh: `fetchSession` dispatched but redirect fired before it resolved; fixed by treating `status === 'idle' && user === null` as loading state
- **`auth.js`** — `_password` typo in login route destructuring meant password was never passed to Passport
- **`Layout.jsx`** — `<main>` needed `min-h-screen flex flex-col` to keep footer below fold on short pages
- **`App.jsx`** — `articles/:slug` route path was `article/:slug` (missing `s`) — all article detail links resolved to NotFound
- **`markdown.js`** — `attributes.slig` typo in `getArticleBySlug` meant slug lookup always returned `null`

---

## Phase 6 — CI/CD + Deploy 🔲
1. GitHub Actions deploy job
2. Cloud Run backend deploy
3. Vercel frontend deploy
4. Domain migration from Wix
5. Environment variables + secrets