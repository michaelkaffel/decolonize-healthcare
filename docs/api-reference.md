# API Reference — decolonize-healthcare

Base URL: `http://localhost:8080` (development)

All request/response bodies are JSON unless noted otherwise.

---

## Auth

### POST /api/auth/register

Create a new user account and log in.

**Auth:** None

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string"
}
```

**Responses:**
- `201` — `{ id, name, email }`
- `200` — generic message (anti-enumeration: same response whether email exists or not)
- `500` — server error

---

### POST /api/auth/login

Log in with email and password.

**Auth:** None

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- `200` — `{ id, name, email }`
- `200` — generic error message (anti-enumeration)
- `500` — server error

---

### POST /api/auth/logout

End the current session.

**Auth:** Session cookie

**Responses:**
- `200` — `{ message: "Logged out" }`

---

### GET /api/auth/me

Check current session and return user data.

**Auth:** Session cookie

**Responses:**
- `200` — `{ id, name, email }`
- `401` — not authenticated

---

### GET /api/auth/google

Initiate Google OAuth flow. Redirects to Google.

**Auth:** None

---

### GET /api/auth/google/callback

Google OAuth callback. Handled by Passport.

**Auth:** None

**Redirects:**
- Success → `/dashboard`
- Failure → `/login?error=oauth`

---

## Courses (Public)

### GET /api/courses

List all published courses (catalogue view).

**Auth:** None

**Response:**
```json
[
  {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "price": 9900,
    "thumbnail": "string"
  }
]
```

---

### GET /api/courses/:slug

Get a single course by slug (landing page view). Returns module and lesson outlines but no content, video IDs, quiz answers, or GCS paths.

**Auth:** None

**Response:**
```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "price": 9900,
  "thumbnail": "string",
  "modules": [
    {
      "title": "string",
      "order": 1,
      "lessons": [
        { "title": "string", "order": 1 }
      ]
    }
  ]
}
```

**Errors:**
- `404` — course not found or not published

---

## Checkout

### POST /api/checkout/create-session

Create a Stripe Checkout Session for a course purchase.

**Auth:** Session cookie (isAuthenticated)

**Request body:**
```json
{
  "courseId": "string"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Errors:**
- `400` — `courseId` missing or already enrolled
- `401` — not authenticated
- `404` — course not found or not published
- `500` — server error

---

## Webhooks

### POST /api/webhooks/stripe

Stripe webhook endpoint. Called by Stripe, not by the client.

**Auth:** Stripe signature verification (`stripe-signature` header)

**Request body:** Raw JSON (parsed by `express.raw()`, not `express.json()`)

**Handled events:**
- `checkout.session.completed` — creates Enrollment document from session metadata (`userId`, `courseId`)

**Response:**
- `200` — `{ received: true }`
- `400` — invalid signature
- `500` — enrollment creation failed

---

## Enrollments

### GET /api/enrollments

Get the authenticated user's active course enrollments.

**Auth:** Session cookie

**Response:**
```json
[
  {
    "id": "string",
    "course": {
      "id": "string",
      "title": "string",
      "slug": "string",
      "description": "string",
      "thumbnail": "string"
    },
    "purchasedAt": "ISO date",
    "status": "active"
  }
]
```

**Errors:**
- `401` — not authenticated
- `500` — server error

---

## Progress

### GET /api/courses/:courseId/lessons/progress

Get lesson completion counts for an enrolled course. Used by the Dashboard to display progress without fetching full lesson content.

**Auth:** Session cookie + active enrollment

**Response:**
```json
{
  "completed": 3,
  "total": 8
}
```

**Errors:**
- `401` — not authenticated
- `403` — not enrolled
- `404` — course not found
- `500` — server error

## Lessons (Protected)

All lesson routes require authentication and active enrollment. Middleware stack: `isAuthenticated` → `checkEnrollment`.

### GET /api/courses/:courseId/lessons

Get all lessons for an enrolled course with progress.

**Auth:** Session cookie + active enrollment

**Response:**
```json
{
  "course": { "_id": "string", "title": "string", "slug": "string" },
  "modules": [
    {
      "_id": "string",
      "title": "string",
      "order": 1,
      "lessons": [
        {
          "_id": "string",
          "title": "string",
          "order": 1,
          "content": "string (HTML)",
          "videoSource": "youtube | bunny | null",
          "videoId": "string | null",
          "hasQuiz": true,
          "pdfs": [
            { "_id": "string", "title": "string" }
          ],
          "progress": {
            "completedAt": "ISO date",
            "quizPassed": true
          }
        }
      ]
    }
  ]
}
```

**Errors:**
- `401` — not authenticated
- `403` — not enrolled
- `404` — course not found

---

### GET /api/courses/:courseId/lessons/:lessonId

Get a single lesson with progress.

**Auth:** Session cookie + active enrollment

**Response:** Same shape as a single lesson object from the list endpoint above.

**Errors:**
- `401` — not authenticated
- `403` — not enrolled
- `404` — course or lesson not found

---

### POST /api/courses/:courseId/lessons/:lessonId/quiz

Submit quiz answers. Graded server-side. Correct answers are never sent to the client.

**Auth:** Session cookie + active enrollment

**Request body:**
```json
{
  "answers": [1, 0, 2]
}
```

Array of integers — each value is the selected option index for the corresponding question in order.

**Response:**
```json
{
  "score": 67,
  "passed": false,
  "results": [
    { "questionId": "string", "correct": true },
    { "questionId": "string", "correct": false },
    { "questionId": "string", "correct": true }
  ]
}
```

Pass threshold: 70%.

**Errors:**
- `400` — wrong number of answers
- `401` — not authenticated
- `403` — not enrolled
- `404` — course, lesson, or quiz not found

---

### POST /api/courses/:courseId/lessons/:lessonId/complete

Mark a lesson as complete. Only for lessons without quizzes.

**Auth:** Session cookie + active enrollment

**Request body:** None

**Response:**
```json
{
  "completedAt": "ISO date"
}
```

**Errors:**
- `400` — lesson has a quiz (must complete quiz instead)
- `401` — not authenticated
- `403` — not enrolled
- `404` — course or lesson not found

---

### GET /api/courses/:courseId/lessons/:lessonId/pdf/:pdfId

Get a short-lived signed URL for a PDF download.

**Auth:** Session cookie + active enrollment

**Response:**
```json
{
  "url": "https://storage.googleapis.com/..."
}
```

URL expires after 15 minutes.

**Errors:**
- `401` — not authenticated
- `403` — not enrolled
- `404` — course, lesson, or PDF not found

---

## Health

### GET /api/health

**Auth:** None

**Response:**
- `200` — server is running
