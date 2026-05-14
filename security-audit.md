# Security Audit Report — Ada2AI Production

**Date:** 2026-05-14  
**Auditor:** Automated security review  
**Scope:** RLS policies, CSP headers, HTTPS enforcement, secrets exposure, auth flow  
**Project:** OKComputer Frontend (Vite + React + Supabase)

---

## Executive Summary

**3 CRITICAL** and **2 MEDIUM** findings. The most severe issue is that Row-Level Security (RLS) is **not enforced on most public tables**, allowing any anonymous user with the public anon key to read all data—including PII like email addresses and phone numbers—from profiles, players, matches, organizations, and video_analyses tables.

---

## 1. Row-Level Security (RLS) Policies

### Severity: 🔴 CRITICAL

RLS was tested by making unauthenticated REST API calls using only the public anon key (no Authorization bearer token). Results:

| Table | RLS Enabled? | Unauth SELECT | Unauth INSERT | Unauth DELETE | Rows Exposed |
|-------|:---:|:---:|:---:|:---:|---:|
| `profiles` | ❌ NO | ✅ YES (all columns) | ✅ Returns "permission denied for view" | ⚠️ UUID parse error (no real filter match tested) | 5 |
| `players` | ❌ NO | ✅ YES (all columns) | ❌ JWT decode error | ⚠️ UUID parse error | 50 |
| `matches` | ❌ NO | ✅ YES (all columns) | ❌ JWT decode error | — | 6 |
| `organizations` | ❌ NO | ✅ YES (all columns) | ❌ JWT decode error | — | 14 |
| `video_analyses` | ❌ NO | ✅ YES (all columns) | ❌ JWT decode error | — | 3 |
| `reports` | ✅ YES (returns empty) | ❌ Empty result | — | — | 0 |

### Details

- **profiles** exposes: `id`, `email`, `full_name`, `role`, `user_type`, `phone`, `avatar_url`, `sport`, `region`, `city`, `is_active`, timestamps
- **players** exposes: `id`, `user_id`, `name`, `sport`, `rating`, `position`, `age`, `height_cm`, `weight_kg`, `photo_url`, `video_url`, etc.
- The `profiles` table **leaks PII** (email addresses of all users) to anyone with the anon key
- The `Content-Profile: public` header bypass in `supabasePublic` client further weakens RLS by routing queries to the public schema, which may lack the same policies as the api schema

### Remediation

1. **Enable RLS on every table** in the Supabase dashboard or via SQL:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE players ENABLE ROW LEVEL SECURITY;
   ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
   ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
   ```

2. **Create RLS policies** following the principle of least privilege:
   ```sql
   -- Example: profiles — users can only read their own row
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   -- Example: players — public read for logged-in users
   CREATE POLICY "Authenticated users can view players" ON players
     FOR SELECT USING (auth.role() = 'authenticated');

   -- Example: coaches can manage their own club's players
   CREATE POLICY "Coaches can insert players" ON players
     FOR INSERT WITH CHECK (auth.uid() IN (
       SELECT id FROM profiles WHERE user_type = 'coach'
     ));
   ```

3. **Remove or restrict the `supabasePublic` client** — the `Content-Profile: public` header bypasses the api schema's RLS. Either:
   - Remove `supabasePublic` entirely and use the standard `supabase` client with proper RLS policies
   - Ensure the public schema also has equivalent RLS policies

4. **Add an RLS policy for `reports` table** to confirm it truly restricts access (empty results could mean the table is empty, not that RLS works)

---

## 2. Content Security Policy (CSP) Headers

### Severity: 🟡 MEDIUM

**File:** `vercel.json` (also duplicated in `dist/_headers` and `src/lib/security.ts`)

### Current CSP:
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://ujjmhqpyehymaavkawiv.supabase.co https://*.vercel-storage.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://ujjmhqpyehymaavkawiv.supabase.co wss://ujjmhqpyehymaavkawiv.supabase.co https://*.posthog.com https://*.sentry.io https://vercel.live;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

### Issues:

| Issue | Severity | Detail |
|-------|:---:|--------|
| `'unsafe-inline'` in script-src | 🟡 Medium | Inline scripts allowed — XSS vector. Required by Vite builds but should be scoped with a nonce if possible |
| `'unsafe-eval'` in script-src | 🟡 Medium | `eval()` allowed — major XSS risk. Check if Vite production build actually requires this |
| No `upgrade-insecure-requests` directive | 🟢 Low | Consider adding to force HTTPS on any mixed content |
| Supabase URL hardcoded with specific project ID | 🟢 Info | `ujjmhqpyehymaavkawiv.supabase.co` is hardcoded rather than using `*.supabase.co` wildcard — this is actually good (more restrictive) |

### Good Practices Already in Place:
- ✅ `object-src 'none'` — blocks Flash/plugin attacks
- ✅ `frame-src 'none'` — prevents clickjacking
- ✅ `frame-ancestors 'none'` — prevents iframe embedding
- ✅ `base-uri 'self'` — prevents base tag injection
- ✅ `form-action 'self'` — prevents form redirect attacks

### Remediation:
1. Test if `'unsafe-eval'` can be removed from production builds (Vite typically doesn't need it in production)
2. Consider adding nonce-based CSP for script-src instead of `'unsafe-inline'` if feasible
3. Add `upgrade-insecure-requests` directive

---

## 3. HTTPS Enforcement

### Severity: 🟢 PASS

| Check | Status |
|-------|--------|
| Strict-Transport-Security header | ✅ `max-age=31536000; includeSubDomains; preload` |
| X-Frame-Options | ✅ `DENY` |
| Vercel HTTPS enforcement | ✅ Vercel enforces HTTPS by default |
| HSTS preload-ready | ✅ Includes `preload` directive |

**No issues found.** HTTPS is properly enforced.

---

## 4. Exposed Secrets

### Severity: 🔴 CRITICAL (partially mitigated)

| Item | Status | Detail |
|------|--------|--------|
| `.env` file in gitignore | ✅ Good | `.env` is in `.gitignore` and not tracked |
| Service role key in source | ✅ Good | No service role key found in `src/` or `dist/` |
| Service role key (provided in task context) | 🔴 **CRITICAL** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqam1ocXB5ZWh5bWFhdmthd2l2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIs...` — this key was provided in plaintext in the task context. It must NEVER appear in source code or config files. |
| Anon key in `.env` | ✅ Acceptable | The `VITE_` prefixed key is designed to be public (client-side, embedded in SPA). Not a secret by design |
| Anon key in `dist/` bundle | ✅ Expected | The anon key appears in compiled JS — this is normal for Vite SPA apps |
| Backup files (`backups/env.backup`) | ✅ Good | Secrets are redacted in backup (`<REDACTED_ANON_KEY>`) |
| Backup files untracked | ⚠️ Warning | `backups/env.backup` and `backups/vercel.json.backup` are untracked (in `.gitignore` via `*.local` won't catch them). Add `backups/` to `.gitignore` |

### Remediation:
1. **Rotate the service role key immediately** if it was ever committed or shared through insecure channels
2. **Never commit the service role key** — it grants full admin access bypassing all RLS
3. Add `backups/` to `.gitignore`
4. Ensure Vercel environment variables are used for any server-side secrets (not `.env` files)

---

## 5. Auth Flow Security

### Severity: 🟡 MEDIUM

**Files reviewed:** `src/contexts/AuthContext.tsx`, `src/pages/LoginPage.tsx`, `src/components/ProtectedRoute.tsx`

### Positive Findings:
- ✅ Uses Supabase Auth (JWT-based) — industry standard
- ✅ `signInWithPassword` — no custom password handling
- ✅ Email confirmation required for sign-up (`signUp` → "verify your email" flow)
- ✅ Protected routes with role-based access (`allowedRoles` prop)
- ✅ Session restoration on mount via `getSession()`
- ✅ Auth state listener properly handles `INITIAL_SESSION` event to avoid double-fetch

### Issues:

| Issue | Severity | Detail |
|-------|:---:|--------|
| No minimum password complexity | 🟡 Medium | `minLength={6}` is weak; recommend 8+ with complexity requirements |
| No rate limiting on login | 🟡 Medium | Supabase handles this server-side (built-in brute force protection), but client has no CAPTCHA |
| No CSRF protection visible | 🟢 Low | Supabase Auth uses JWT tokens (not cookies), so CSRF is inherently mitigated |
| Client-side role redirection only | 🟡 Medium | `ProtectedRoute` does role-based redirects client-side. An authenticated user can bypass this by directly navigating to URLs. **This is acceptable IF RLS policies enforce server-side access** — which they currently don't (see Finding #1) |
| No account lockout mechanism | 🟢 Info | Supabase handles this server-side |
| Email enumeration via login error | 🟢 Low | Error messages from Supabase could reveal if an email exists |

### Remediation:
1. **Increase minimum password length** to 8+ characters and add complexity validation
2. **Add CAPTCHA** to login/signup forms (Supabase supports HCaptcha natively)
3. **Client-side role checks must be backed by RLS** — without server-side enforcement, any authenticated user can access any data

---

## 6. Additional Findings

### 6a. `usePlayers` Hook — No Auth-Gated Queries

**Severity:** 🔴 CRITICAL (consequence of Finding #1)

Multiple hooks (`usePlayers`, `useCoachPlayers`, `useScoutPlayers`) query tables like `players` with `.select('*')` and no `.eq()` filter on the authenticated user. While these are called from protected pages, the Supabase queries themselves don't include auth context filters. This means:
- If RLS were properly enabled, data would still be over-scoped
- Any logged-in user (or the anon key) can read ALL player data, not just their club's

### 6b. Duplicate Security Headers Configuration

**Severity:** 🟢 Low

Security headers are defined in three places:
1. `vercel.json` — production config
2. `dist/_headers` — Cloudflare Pages format
3. `src/lib/security.ts` — unused in production (Vite doesn't inject these at runtime)

The `security.ts` file is dead code. Consider removing it to avoid confusion.

### 6c. No CORS Configuration Visible

**Severity:** 🟢 Info

Supabase CORS is managed server-side. No client-side CORS issues detected. Supabase default CORS allows the project's own domain.

---

## Priority Remediation Checklist

| # | Priority | Action | Effort |
|---|:---:|--------|:---:|
| 1 | 🔴 P0 | **Enable RLS on all tables** (profiles, players, matches, organizations, video_analyses) | 1h |
| 2 | 🔴 P0 | **Create RLS policies** enforcing least-privilege access per role | 2-4h |
| 3 | 🔴 P0 | **Remove `supabasePublic` client** OR add equivalent RLS to the public schema | 1h |
| 4 | 🔴 P0 | **Rotate service role key** if it was ever shared insecurely | 30m |
| 5 | 🟡 P1 | Add auth-context filters to all data queries (`.eq('user_id', auth.uid())` etc.) | 2-3h |
| 6 | 🟡 P1 | Remove `'unsafe-eval'` from CSP if production build doesn't need it | 30m |
| 7 | 🟡 P1 | Increase minimum password length and add complexity | 30m |
| 8 | 🟡 P1 | Add `backups/` to `.gitignore` | 5m |
| 9 | 🟢 P2 | Consider adding HCaptcha to login forms | 1h |
| 10 | 🟢 P2 | Remove unused `src/lib/security.ts` | 5m |
| 11 | 🟢 P2 | Add `upgrade-insecure-requests` to CSP | 5m |

---

*End of audit report*