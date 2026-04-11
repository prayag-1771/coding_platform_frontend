# Bugs & Improvements

## CRITICAL

### 1. Exposed API Keys in `.env`
- **File:** `coding/.env`
- OpenAI API key, HuggingFace key, MongoDB URI with credentials, and live API key are all hardcoded
- `.env` is not in `.gitignore` — secrets are committed to git history
- **Fix:** Rotate all keys immediately, add `.env` to `.gitignore`, scrub git history

### 2. Client-Side API Key Exposure
- **File:** `coding/app/page.jsx:67`
- `NEXT_PUBLIC_API_KEY` exposes a live API key in the browser bundle
- Anyone can extract it from DevTools
- **Fix:** Move API calls server-side or use a proxy route

### 3. Weak JWT Secret Fallback
- **File:** `coding/lib/jwt.ts:3`
- `const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"` — if env var is missing, tokens can be forged
- **Fix:** Remove fallback, fail loudly if `JWT_SECRET` is not set

### 4. Hardcoded Localhost URL
- **File:** `coding/app/api/ai/author-problem/route.js:141`
- `fetch("http://localhost:11434/api/generate", ...)` — won't work in production
- **Fix:** Use an environment variable

### 5. Broken Navigation Link
- **File:** `coding/app/api/student/classrooms/[id]/StudentClassroomClient.tsx:25`
- Links to `/assignment/${a._id}` instead of `/assignments/${a._id}` (missing 's')

---

## HIGH

### 6. Mass Assignment Vulnerability
- **File:** `coding/app/api/problems/[id]/route.ts:144-147`
- `Object.assign(problem, body)` after only deleting `ownerId` — allows modifying any field
- **File:** `coding/app/api/problems/route.ts:153` — `...body` spread in `Problem.create()`
- **Fix:** Whitelist allowed fields explicitly

### 7. Score Manipulation in Submissions
- **File:** `coding/app/api/assignment-submissions/route.js:41-48`
- `score` and `total` values from request body are not validated
- Students can submit arbitrary scores (e.g., `score=999, total=1`)
- **Fix:** Validate scores server-side or compute them from test results

### 8. Missing Authorization on Assignment Delete
- **File:** `coding/app/api/assignments/[id]/route.js:89`
- `Assignment.findByIdAndDelete(id)` without verifying ownership
- Any teacher can delete any other teacher's assignment

### 9. Assignments Endpoint Returns All Assignments
- **File:** `coding/app/api/assignments/route.js:34-36`
- GET returns all assignments system-wide, not filtered by teacher
- **Fix:** Filter by `createdBy` or classroom ownership

### 10. No Password Strength Requirements
- **File:** `coding/app/api/auth/register/route.js:30`
- Single-character passwords accepted
- **Fix:** Enforce minimum length and complexity

### 11. No Email Format Validation
- **File:** `coding/app/api/auth/register/route.js:12-20`
- Invalid emails like `"@@"` are accepted
- **Fix:** Validate email format server-side

### 12. Console.log Leaking Sensitive Data
- **File:** `coding/lib/auth.js:12` — `console.log("AUTH USER:", user)` logs user objects
- **File:** `coding/app/page.jsx:131` — `console.log("RUN CLICKED")` debug leftover

### 13. No Rate Limiting
- No rate limiting on `/api/auth/login`, `/api/auth/register`, or submission endpoints
- Vulnerable to brute force and spam

### 14. Missing Error Boundaries
- No `error.tsx` files in any route segment
- Unhandled errors crash the entire page with no recovery UI

### 15. Path Traversal in Problem Save
- **File:** `coding/app/api/problems/save/route.js:44-48`
- File path constructed from `problem.id` without sanitization
- Could write files outside the `problems/` directory

---

## MEDIUM

### 16. Missing CSRF Protection
- All POST endpoints rely only on cookies — no CSRF tokens
- Cross-site request forgery possible for state-changing operations

### 17. Wildcard CORS in Landroid Backend
- **File:** `landroid/backend/main.py:24-30`
- `allow_origins=["*"]` with `allow_credentials=True` — insecure combination

### 18. Raw Error Messages Returned to Client
- **File:** `coding/app/api/ai/author-problem/route.js:91-95` — returns raw AI response in error
- **File:** `coding/app/api/ai/author-problem/route.js:130-135` — returns raw `err.message`
- Exposes internal details to users

### 19. Excessive `any` Types
- **File:** `coding/app/api/problems/route.ts:28,34,124` — `let filter: any = {}`
- Defeats TypeScript's type checking throughout API routes

### 20. Missing `verifyToken` Try-Catch
- **File:** `coding/app/api/problems/[id]/route.ts:120,187`
- PUT and DELETE handlers don't wrap `verifyToken` in try-catch (GET does)

### 21. Infinite Polling Loop
- **File:** `coding/components/codeExecutorApi.js:46-82`
- `pollJobResult` polls indefinitely with no max retry count
- **Fix:** Add maximum retry limit and timeout

### 22. No Input Validation on Problem Testcases
- **File:** `coding/app/api/problems/route.ts:154`
- POST accepts testcase data without validating structure, weights, or format

### 23. Using Index as List Key
- **Files:**
  - `coding/app/author/problems/new/NewAuthorProblemClient.tsx:194`
  - `coding/app/teacher/problems/new/NewProblemForm.jsx:227`
  - `coding/components/author/ProblemForm.jsx:134`
- Using array index as React key — causes bugs when items are reordered/deleted

### 24. Missing Security Headers
- No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, or `Strict-Transport-Security` configured in `next.config.ts`

### 25. Accessibility Violations
- **Files:** `coding/app/student/StudentDashboardClient.tsx:48,60,79,104`, `coding/app/practice/page.tsx:26-34`, `coding/app/my-problems/page.tsx:46-84`
- Clickable `<div>` elements without `role="button"`, keyboard support, or ARIA attributes
- **Fix:** Use `<button>` or `<Link>` components

---

## LOW

### 26. `window.location.href` Instead of Router
- **File:** `coding/app/page.jsx:713-796`
- Multiple `window.location.href` and `window.location.reload()` calls
- Should use Next.js `router.push()` for client-side navigation

### 27. Missing Loading/Error States
- **Files:** `coding/app/teacher/classrooms/ClassroomsClient.tsx`, `coding/app/assignments/[id]/AssignmentClient.tsx`, `coding/app/classroom/page.tsx`
- Fetch calls without error state handling — failures are silent

### 28. Browser `alert()` for Form Validation
- **Files:** `coding/app/student/ai-generate/page.tsx`, `coding/app/author/problems/new/NewAuthorProblemClient.tsx:67-78`, `coding/app/teacher/classrooms/[id]/ClassroomClient.tsx:52-66`
- Uses `alert()` instead of inline validation messages

### 29. Inconsistent API Response Formats
- Some endpoints return `{ error: "..." }`, others return `[]` with error status codes
- **Examples:** `/api/problems/my/route.ts:19` and `/api/student/classrooms/route.ts:30` return `[]` with 401

### 30. Hacky Model Registration Pattern
- **File:** `coding/app/api/student/classrooms/route.ts:17-24`
- Uses `void Assignment; void Problem; void User;` to force Mongoose model registration

### 31. Variable Typo in Landroid
- **File:** `landroid/backend/routers/health_dashboard.py:120`
- `rainfall_mm = chrip_month = ...` — `chrip_month` assigned but never used

### 32. Deadline Timezone Issues
- **Files:** `coding/app/page.jsx:182-184`, `coding/app/api/assignment-submissions/route.js:62-67`
- `new Date(deadline) < new Date()` comparison doesn't account for timezones

### 33. Fallback Values Hide Data Problems (Landroid)
- **File:** `landroid/backend/routers/health_dashboard.py:96-99`
- Returns fixed fallback NDVI values (0.45) when raster data is missing — client can't distinguish real from fake data
