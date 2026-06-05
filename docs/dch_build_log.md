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

### Seed Script (`server/scripts/buildProgramDatabase.js`)
- Run with `cd server && npm run seed`
- Wipes all courses (`deleteMany`) then inserts courses from `server/scripts/content/` — idempotent
- Named export aliasing: `import { courseData as meditationExploration }` from content files

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

## Phase 5 — Frontend ✅

### Scaffold ✅
- Vite + React 18 scaffolded under `client/`
- ESLint config updated with `react/jsx-uses-vars` and `react/jsx-uses-react` rules to prevent false unused-var warnings on JSX components

### Redux Slices ✅
- `userSlice` — auth state, `fetchSession`, `login`, `logout` thunks
- `enrollmentsSlice` — `fetchEnrollments` thunk, stores in `state.items`
- `progressSlice` — `fetchProgress(courseId)` thunk, stores in `state.byCourse[courseId]`
- `coursesSlice` — `fetchCourses` thunk for public catalogue

### Design System ✅
- Tailwind brand tokens: `brand-crimson`, `brand-gold`, `brand-cream`, `brand-cream2`, `brand-teal`, `brand-blush`, `brand-green`, `brand-blue`
- Arrow function syntax throughout, `export default` at bottom of files

### Layout Components ✅
- `Layout.jsx` — `<main>` with `min-h-screen flex flex-col` keeps footer below fold on short pages
- `Navbar.jsx` — sticky, scrolled shadow, desktop nav + mobile hamburger
- `Footer.jsx` — brand links, newsletter one-liner

---

### Auth Pages ✅

**Login (`client/src/pages/Login.jsx`)**
- Split-screen layout: illustration left (`bg-brand-blush`), form right (`bg-brand-cream`)
- Google OAuth button + local email/password form
- Reads `?redirect` query param on mount, navigates there after successful auth; param preserved when switching to Register
- Anti-enumeration handled on frontend: checks `data.id` presence rather than `res.ok`
- On success: `dispatch(setUser(data))` + `navigate(redirect || '/dashboard')`
- `credentials: 'include'` on all fetch calls

**Register (`client/src/pages/Register.jsx`)**
- Same split-screen layout
- Fields: name, email, password (`minLength={8}`)
- `?redirect` param read and forwarded on success — same pattern as Login
- Checks `res.status === 201` for confirmed account creation

---

### Backend Additions for Dashboard ✅

**`GET /api/enrollments` (`server/routes/enrollments.js`)**
- Protected by `isAuthenticated`
- Returns active enrollments with course `title`, `slug`, `description`, `thumbnail` populated
- Mounted at `/api/enrollments` in `index.js`

**`GET /api/courses/:courseId/lessons/progress` (added to `server/routes/lessons.js`)**
- Protected by `isAuthenticated` + `checkEnrollment`
- Returns `{ completed, total }` lesson counts for the enrolled course
- Placed above `/:lessonId` route to prevent `progress` being matched as a lessonId

**`POST /api/enrollments/free` (added to `server/routes/enrollments.js`)**
- Instant enrollment for `price: 0` courses — no Stripe involved
- Protected by `isAuthenticated`
- Validates course exists, is published, and price is 0
- Creates Enrollment directly (no `stripeSessionId` — uses a placeholder or omits field)
- Used by `EnrollButton` for free courses

---

### Mongoose `toJSON` Transforms ✅

Added `toJSON` transform to all schemas — top-level and all subdocuments:
- `User.js`, `Course.js` (top-level + `moduleSchema`, `lessonSchema`, `pdfSchema`, `quizQuestionSchema`, `surveyQuestionSchema`), `Enrollment.js`, `LessonProgress.js`, `QuizAttempt.js`, `SurveyResponse.js`

Transform: `ret.id = ret._id.toString(); delete ret._id; delete ret.__v;`

All `._id` references replaced with `.id` throughout frontend and route files.

---

### Course Content Pipeline ✅

**Content Strategy**
- First course: "Meditation Exploration" — 21-day program, 3 weeks, 86 lessons
- 4 lessons/day: 2 content lessons + 2 survey lessons
- No videos, no PDFs, no quizzes — lesson content + surveys only
- `published: true`, `price: 0` (free course)
- Thumbnail: `/images/courses/meditation-program.webp`
- Long description written collaboratively and stored in `longDescription` field

**Survey Schema**
- `survey` field added to `lessonSchema` in `Course.js` alongside existing `quiz` field
- `surveyQuestionSchema` — `type` enum: `multiple_choice` or `open_text`; `options` array only for multiple_choice
- `longDescription` field added to top-level Course schema

**`SurveyResponse` Model (`server/models/SurveyResponse.js`)**
- `user`, `course`, `lesson` ObjectIds; `answers: [{ questionId, value: String }]`; `submittedAt`
- `value` always a string — selected option text or free text

**Survey Route (`POST /api/courses/:courseId/lessons/:lessonId/survey`)**
- No grading — all responses stored as-is
- Completing a survey upserts `LessonProgress` (counts as lesson completion)
- Returns `{ submittedAt }`

**Content Tooling (`server/scripts/tools/` — parser; `server/scripts/content/` — output)**
- `parse-course.mjs` — converts Google Docs plain text export to seed-ready JS object
- `meditation-exploration.mjs` — parser output, named export `courseData`

**Seed Script (`server/scripts/buildProgramDatabase.js`)**
- Renamed from `seedCourse.js`
- Imports named exports aliased per course: `import { courseData as meditationExploration } from './content/meditation-exploration.mjs'`

---

### Dashboard ✅

- Fetches enrollments on mount, then dispatches `fetchProgress` per enrolled course
- Course cards: thumbnail, title, description, progress bar, CTA
- CTA label: "Start course" / "Continue" / "Review course" based on percent complete
- Empty state with "Browse courses" CTA linking to `/programs`
- `firstName` derived from `name` via `.split(' ')[0]`, falls back to `"there"`

---

### Programs Catalogue (`client/src/pages/Programs.jsx`) ✅

- Fetches courses via `fetchCourses` on mount (`status === 'idle'` guard)
- Hero: `bg-brand-gold` banner with SVG illustration
- Skeleton loading — `SkeletonCard` mirrors `CourseCard` DOM structure, `animate-pulse`; both `'idle'` and `'loading'` states show 4 skeletons to prevent empty-state flash
- Course grid: `sm:grid-cols-2`, `max-w-4xl`
- `CourseCard` sub-component — links title/thumbnail to `/programs/:slug` (not directly to Stripe)
- Uses `EnrollButton` with `variant='card'`

**`EnrollButton` (`client/src/components/EnrollButton.jsx`)**
- `variant='card'` → "Learn more" link to `/programs/:slug`
- `variant='detail'` → full enrollment CTA: enrolled → "Go to course" link; free course → free enroll via `POST /api/enrollments/free`; paid + auth → `BuyButton` (POST to checkout); unauthenticated → link to `/register?redirect=...`

---

### Program Detail Page (`client/src/pages/Program.jsx`) ✅

- Route: `/programs/:slug` — public course landing and sales page
- Fetches course by slug from `GET /api/courses/:slug` (public endpoint — no auth required)
- Layout: full-width hero (thumbnail image or gold fallback) + two-column content area
- Left column: long description, module/lesson outline (survey lessons filtered out with label "(Reflection)")
- Right column: sticky CTA sidebar with price, enrollment count placeholder, `EnrollButton variant='detail'`
- `Login.jsx` and `Register.jsx` pass `?redirect=/programs/:slug` so post-auth users land back on the course page

---

### Article Detail Page ✅

**`client/src/utils/markdown.js`**
- `import.meta.glob` with `?raw` + `eager: true` — all articles parsed at module init
- `getAllArticles()` — sorted array of frontmatter attributes, no body
- `getArticleBySlug(slug)` — full article object including body string
- `vite.config.js` updated with `server.fs.allow: ['..']`

**`client/src/utils/formatDate.js`**
- Appends `T12:00:00` to date strings to prevent UTC midnight timezone shift
- Shared utility imported by `Article.jsx` and `RecentPosts.jsx`

**`client/src/pages/Article.jsx`**
- `react-markdown` + `remark-gfm` for body rendering
- Header: tags, H1 title, optional subtitle, author + date + read time
- Assembles: header → `<hr>` → article body → `ShareButtons` → `NewsletterSignup` → `RecentPosts`
- `useEffect` scroll-to-top on slug change (now redundant with global `useScrollToTop`, but harmless)

**`client/src/components/ShareButtons.jsx`** — Facebook, X, LinkedIn share links; copy link with 2s confirmation; all inline SVG

**`client/src/components/RecentPosts.jsx`** — 3 recent article cards; returns `null` if empty

**`client/src/styles/article.css`** — scoped prose styles under `.article-body`

---

### Articles List Page ✅

**`client/src/pages/Articles.jsx`**
- Featured article: first in sorted array, large horizontal card
- Remaining articles: responsive grid (`sm:grid-cols-2 lg:grid-cols-3`)
- `ArticleCard` sub-component, `featured` boolean prop
- Cover image falls back to `<Placeholder>` gradient tile
- `NewsletterSignup` below grid

**`client/src/components/NewsletterSignup.jsx`**
- Fields: `firstName`, `lastName`, `email` — `flex-row` form on `sm:` and up
- Posts to `POST /api/newsletter/subscribe` — endpoint not yet implemented
- Four states: `idle`, `loading`, `success`, `error`

---

### Education Section ✅

**Hub landing page (`client/src/pages/Education.jsx`)**
- Full-width stacked sections per topic — background image + dark overlay + centered text
- Card height: `h-64 sm:h-[32rem]` for landscape image handling on mobile
- Links to 7 sub-pages

**Seven static sub-pages (`client/src/pages/education/`)**
- ChildhoodAdversity, Neurobiology, AnatomyPhysiology, MentalHealth, Movement, ScientificArticle, BehavioralBiology
- Each: hero section, curated resource links (`Resource` component with emoji, title, URL), embedded YouTube videos (`YouTubeEmbed` component)
- Content scraped from Wix site — YouTube IDs provided manually for Childhood Adversity and How to Understand a Scientific Article pages
- Seven stock images: download from Wix CDN, save to `client/public/images/education/`

**Navbar Education dropdown**
- Desktop: CSS `group-hover` dropdown revealing sub-page links
- Mobile: `eduOpen` accordion state wired to existing toggle (was already defined but unwired)
- Auto-close on route change via `useEffect` watching `location.pathname`

---

### About Page (`client/src/pages/About.jsx`) ✅

- Gold hero + illustration placeholder (`/illustrations/about-hero.svg`)
- Belief statement strip
- Content sections: vision, origin story, what we offer
- Core values/CTA strips
- Illustration SVG to be dropped in by designer

---

### Books Page (`client/src/pages/Books.jsx`) ✅

- **Referral strip** at top — `bg-brand-cream`, title + tagline + cover image + CTA linking to `rethinkingbroken.com`
- Cover image: `/images/rethinking-broken-cover.jpg`
- Reading list below: left-bordered `brand-teal` accent cards, title + author + optional "Start with this one" note badge + description
- Books: Ishmael, Braiding Sweetgrass, The Body Keeps the Score, In the Realm of Hungry Ghosts, Sapiens, When the Body Says No, and others sourced from Wix page

---

### Partners Page (`client/src/pages/Partners.jsx`) ✅

- Blue (`bg-brand-blue`) hero + illustration placeholder
- Partner cards with highlights grid (Expertise, Quality & Accreditation, Nationwide Network, Convenient Admissions)
- Currently one partner: South Jersey Recovery Village (The Recovery Village Cherry Hill at Cooper)
- Contact URL, phone number, and external links; `target='_blank' rel='noopener noreferrer'` on all external links
- Data in top-level `partners` array — easy to add more

---

### Home Page (`client/src/pages/Home.jsx`) ✅

- Hero section with illustration + headline + newsletter signup CTA
- About/mission strip
- Programs preview section linking to `/programs`
- Articles preview section linking to `/articles`
- `NewsletterSignup` component embedded in hero/footer strip

---

### Course Player ✅

**`CourseLearn.jsx` (`client/src/pages/CourseLearn.jsx`)**
- Route: `/courses/:slug/learn` and `/courses/:slug/learn/:lessonId` — both point to this component (consolidated after React Router conflict caused blank screen)
- Layout: `h-screen overflow-hidden` — sidebar scrolls independently, main area fills viewport
- Fetches course by slug (`GET /api/courses/:slug`) then full lesson list (`GET /api/courses/:courseId/lessons`)
- Sidebar: collapsible day/module tabs via `expandedModules` Set in state
  - Week labels calculated as `Math.ceil((mi + 1) / 7)` — rendered only when week number changes
  - Auto-expands active lesson's module on mount and lesson change via `useEffect`
  - Chevron icon rotates `rotate-180` when open
  - Three-state completion indicators: empty gray circle (not started), `X/Y` fraction (in-progress), filled crimson checkmark (all done)
- `LessonRow` sub-component — dot styling consistent with completion indicators
- Top bar: course title + lesson title

**`Lesson.jsx` (`client/src/pages/Lesson.jsx`)**
- Renders active lesson content — HTML body via `dangerouslySetInnerHTML`, `article-body` CSS class applied
- Survey questions: `multiple_choice` rendered as radio buttons, `open_text` as textarea
- Mark complete button — `POST /api/courses/:courseId/lessons/:lessonId/complete` for non-survey lessons
- Survey submit — `POST /api/courses/:courseId/lessons/:lessonId/survey`
- Prev/next navigation buttons
- All `useState` hooks declared before any conditional early returns (required — CI lint failure otherwise)

---

### Navbar Fixes ✅

- **Logout bug** — desktop and mobile "Log Out" changed from `<Link to='/'>` to `<button onClick={handleLogout}>` dispatching the `logout` thunk. Without the dispatch, Redux `state.user.data` was never cleared so the navbar/header stayed in logged-in state.
- `useDispatch`, `useNavigate`, and `logout` thunk imported in `Navbar.jsx`
- `handleLogout` — `closeMenu()` → `dispatch(logout())` → `navigate('/')`

---

### Utility Additions ✅

**`useScrollToTop` (`client/src/utils/scrollToTop.js`)**
- Custom hook — `useEffect` watches `pathname` and calls `window.scrollTo(0, 0)` on change
- Called at the top of `App.jsx` (inside router) to cover all route transitions globally
- `Article.jsx` also has its own slug-change scroll-to-top; both can coexist

---

### Favicon ✅

- Full favicon set generated via realfavicongenerator.net, placed in `client/public/`
- Files: `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, `site.webmanifest`
- `client/index.html` updated with all `<link>` tags
- `site.webmanifest`: `name: "Decolonize Healthcare"`, `short_name: "DCH"`

---

### Bugs Fixed (Phase 5)

- **`passport.js`** — missing `passport.use(User.createStrategy())` caused `Unknown authentication strategy "local"` on login
- **`LocalStrategy`** — `passport-local` defaults to `username` field; replaced `User.createStrategy()` with explicit `new LocalStrategy({ usernameField: 'email' }, User.authenticate())`
- **`vite.config.js`** — proxy URL malformed: `'http://:localhost8080'` → `'http://localhost:8080'`
- **`ProtectedRoute`** — race condition on refresh: treating `status === 'idle' && user === null` as loading state fixed
- **`auth.js`** — `_password` typo in login route destructuring meant password was never passed to Passport
- **`Layout.jsx`** — `<main>` needed `min-h-screen flex flex-col` to keep footer below fold
- **`App.jsx`** — `articles/:slug` route path was `article/:slug` (missing `s`)
- **`markdown.js`** — `attributes.slig` typo in `getArticleBySlug`
- **`App.jsx`** — React Router conflict: `/courses/:slug/learn` and `/courses/:slug/learn/:lessonId` pointed to different components (`CourseLearn` and `Lesson`); consolidated both to `CourseLearn`
- **`Lesson.jsx`** — hooks called after conditional early return caused CI lint failure; all `useState` calls moved above guard
- **`CourseLearn.jsx`** — `coueseData` typo in `useEffect` dependency array
- **`CourseLearn.jsx`** — unused `useSelector` import
- **`CourseLearn.jsx`** — leftover `console.log` calls
- **`CourseLearn.jsx`** — assignment `=` instead of strict equality `===` in `allDone` calculation
- **`CourseLearn.jsx`** — malformed Tailwind class `flex-` with stray hyphen
- **`Partners.jsx`** — `bt-white` → `bg-white`; `leading-relaced` → `leading-relaxed`; `tartget` → `target`
- **`Navbar.jsx`** — stray space `< NavLink` in mobile nav map caused parse error
- **`Navbar.jsx`** — stray `import { isAction } from '@reduxjs/toolkit'` causing mobile rendering failure
- **Atlas** — stale Enrollment document pointing to deleted course caused Dashboard crash; removed manually via Atlas UI
- **Dev/prod DB** — dev and prod currently share one MongoDB Atlas database; acknowledged as gap to address before launch

---

## Phase 6 — CI/CD + Deploy ✅ (partial)

### Frontend Deploy — Vercel ✅
- Vercel connected directly to GitHub repo — redeploys automatically on every push to `main`
- Root directory set to `client`; Vite detected automatically
- `VITE_API_URL` env var set to Cloud Run service URL
- PR preview deployments enabled automatically
- `vercel.json` at repo root: `{ "rewrites": [{ "source": "/:path*", "destination": "/index.html" }] }` — fixes SPA hard-refresh 404s (the `(.*)` regex syntax was rejected by Vercel's validator; `/:path*` is correct)

### Backend Deploy — GitHub Actions → Cloud Run ✅

**Workflow file: `.github/workflows/deploy.yml`**
- Triggers on push to `main` when `server/**` or `.github/workflows/deploy.yml` changes
- Runs independently of `ci.yml` (parallel)
- Auth via Workload Identity Federation — no long-lived JSON key stored in GitHub secrets

**GCP resources created:**
- Service account: `github-actions-deploy@decolonize-healthcare.iam.gserviceaccount.com`
- Workload Identity Pool: `github-pool`
- OIDC Provider: `github-provider` — issuer `https://token.actions.githubusercontent.com`, attribute condition locked to `michaelkaffel/decolonize-healthcare` repo

**IAM roles granted to service account:**
- `roles/run.admin`, `roles/storage.admin`, `roles/iam.serviceAccountUser`, `roles/artifactregistry.admin`, `roles/cloudbuild.builds.editor`

**GCP APIs enabled during setup:**
- `iamcredentials.googleapis.com` — required for Workload Identity Federation token exchange
- `cloudbuild.googleapis.com` — required for source-based buildpack deploys

**GitHub secrets added:**
- `GCP_PROJECT_ID` — `decolonize-healthcare`
- `GCP_WIF_PROVIDER` — full provider resource name
- `GCP_SA_EMAIL` — service account email

**Deploy command:**
```
gcloud run deploy decolonize-healthcare \
  --source ./server \
  --region us-central1 \
  --project $GCP_PROJECT_ID \
  --quiet
```

### Cross-Origin Cookie Fix ✅
- Problem: Cloud Run terminates HTTPS at the load balancer; Express doesn't see HTTPS without `trust proxy`, so `secure: true` cookies were never set
- Fix: `app.set('trust proxy', 1)` added before session middleware in `server/index.js`
- Fix: `sameSite: isProd ? 'none' : 'lax'` added to cookie config — required for cross-origin cookie transmission between Vercel frontend and Cloud Run backend
- `CLIENT_URL` env var on Cloud Run updated to production Vercel URL

### API URL Fix ✅
- All frontend fetch calls updated from bare relative paths (e.g., `/api/auth/login`) to `${import.meta.env.VITE_API_URL}/api/auth/login`
- Affected files: `Login.jsx`, `Register.jsx`, `userSlice.js`, `enrollmentsSlice.js`, `progressSlice.js`, `coursesSlice.js`
- Bare paths hit Vercel instead of Cloud Run in split-deploy setup

### Remaining Phase 6 items 🔲
4. Domain migration from Wix
5. Environment variables + secrets (production)
6. Separate production MongoDB Atlas database before launch

---

## Phase 7 — Backend Features 🔲

### Book Store
- `POST /api/checkout/create-book-session` route
- `server/config/book.js` — `BOOK_VARIANTS` config (Price IDs, GCS paths, shipping flags)
- Webhook handler branch for `session.metadata.type === 'book'`
  - Physical → Resend fulfillment notification to Owl (name, email, shipping address, variant, total)
  - Ebook / Audiobook → 24hr GCS signed URL, Resend delivery email to buyer
  - All variants → Resend purchase confirmation to buyer
- GCS assets uploaded — ebook PDF, audiobook file(s)
- Stripe Price IDs created in Owl's Stripe account (3 variants)

### Newsletter
- `POST /api/newsletter/subscribe` endpoint + Resend wiring
- Resend audience/contacts feature for subscriber list
- Transactional confirmation email on signup

### Decap CMS
- `client/public/admin/index.html` and `config.yml`
- Collections: articles, education, books, partners
- GitHub OAuth for single-editor auth

---

## Phase 8 — Client CMS Handoff 🔲
- Load initial article and education content (developer-uploaded)
- Decap admin UI polish
- Client walkthrough: publish articles, education pages
- Test full editorial workflow end-to-end