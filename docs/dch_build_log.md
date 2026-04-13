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

### Bugs fixed

- **`passport.js`** — missing `passport.use(User.createStrategy())` caused `Unknown authentication strategy "local"` error on login
- **`LocalStrategy`** — `passport-local` defaults to `username` field; replaced `User.createStrategy()` with explicit `new LocalStrategy({ usernameField: 'email' }, User.authenticate())` so email is used for login
- **`vite.config.js`** — proxy URL malformed: `'http://:localhost8080'` → `'http://localhost:8080'`
- **`ProtectedRoute`** — race condition on refresh: `fetchSession` dispatched but redirect fired before it resolved; fixed by treating `status === 'idle' && user === null` as loading state
- **`auth.js`** — `_password` typo in login route destructuring meant password was never passed to Passport
- **`Layout.jsx`** — `<main>` needed `min-h-screen flex flex-col` to keep footer below fold on short pages

## Phase 6 — CI/CD + Deploy 🔲
1. GitHub Actions deploy job
2. Cloud Run backend deploy
3. Vercel frontend deploy
4. Domain migration from Wix
5. Environment variables + secrets
