# Ada2AI — Authentication Flow

## Overview

All authentication in Ada2AI flows through **Supabase Auth** (GoTrue). There are no custom JWTs or alternative auth providers. The same Supabase project serves both the client SPA and server-side verification.

## Registration Flow

```
LoginPage.tsx
  │
  ├─ User fills email + password + user_type
  │
  ▼
AuthContext.signUp(email, password, { full_name, user_type })
  │
  ▼
supabase.auth.signUp({ email, password, options: { data: metadata } })
  │
  ▼
Supabase Auth creates auth.users row
  │
  ▼
TRIGGER on_auth_user_created → handle_new_user()
  │  INSERT INTO profiles (id, email, full_name, user_type)
  │  VALUES (NEW.id, NEW.email, metadata.full_name, metadata.user_type)
  │
  ▼
onAuthStateChange fires (event = "SIGNED_IN")
  │
  ▼
AuthContext updates: user + session state populated
```

**Note**: If email confirmation is enabled, the user must verify their email before the session becomes active. The profile row is still created immediately by the trigger.

## Login Flow

```
LoginPage.tsx
  │
  ▼
AuthContext.signIn(email, password)
  │
  ▼
supabase.auth.signInWithPassword({ email, password })
  │
  ▼
Supabase Auth validates credentials → returns session + JWT
  │
  ▼
onAuthStateChange fires (event = "SIGNED_IN")
  │
  ▼
AuthContext updates:
  - session = Supabase session (with access_token)
  - user = authenticated user object
  - loading = false
```

## Session Management

- **Provider**: `AuthProvider` wraps the app in `main.tsx`
- **Hook**: `useAuth()` returns `{ user, session, loading, signUp, signIn, signOut }`
- **Initialization**: `supabase.auth.getSession()` runs once on mount, then `onAuthStateChange` subscribes to real-time changes
- **Token**: The Supabase client automatically refreshes the JWT before expiry
- **loading state**: Set to `true` on mount, flips to `false` once the initial session resolves

```tsx
// AuthContext lifecycle:
useEffect(() => {
  supabase.auth.getSession()         // One-shot: resolve initial state
  supabase.auth.onAuthStateChange()  // Subscribe to all auth events
  return () => subscription.unsubscribe()
}, [])
```

## Logout Flow

```
AuthContext.signOut()
  │
  ▼
supabase.auth.signOut()
  │
  ▼
onAuthStateChange fires (event = "SIGNED_OUT")
  │
  ▼
AuthContext clears state:
  - session = null
  - user = null
  │
  ▼
App redirects to /login (via route guard)
```

## API Authentication — Vercel Serverless Functions

Every handler in `api/` follows the same pattern:

```
Client request with Authorization: Bearer <supabase-access-token>
  │
  ▼
getSupabase() — creates SupabaseClient with SUPABASE_URL + SUPABASE_ANON_KEY
  │
  ▼
verifyAuth(req, supabase):
  - Extract "Bearer <token>" from Authorization header
  - supabase.auth.getUser(token)
  - Return { user } or null
  │
  ▼
If auth fails → 401 Unauthorized
If auth succeeds → proceed to handler logic
```

**For public reads** (GET): Some handlers skip auth for read operations.
**For writes** (POST, DELETE): Auth is always required.

## API Authentication — tRPC

```
Client request to /api/trpc/...
  │
  ▼
api/trpc/[trpc].ts → fetchRequestHandler()
  │
  ▼
createContext({ req }):
  - Extract Authorization: Bearer <token>
  - supabase.auth.getUser(token)
  - Return { req, res, user } or { req, res, user: null }
  │
  ▼
Procedure checks ctx.user:
  - Public procedures: work without auth
  - Protected procedures: throw if ctx.user is null
```

## Row Level Security (RLS)

RLS is enabled on every table. Key policies:

**profiles**
- `profiles_select_own`: `auth.uid() = id` — users read their own profile
- `profiles_insert_own`: `auth.uid() = id` — users can insert their own profile
- `profiles_update_own`: `auth.uid() = id` — users update their own profile
- `profiles_service_role`: `auth.role() = 'service_role'` — full access for service role

**players / academies / scouts**
- `*_select_public`: `true` — anyone can read
- `*_insert_own`: `auth.uid() = user_id` — owners can insert
- `*_update_own` / `*_delete_own`: `auth.uid() = user_id` — owners manage their own rows
- `*_service_role`: `auth.role() = 'service_role'` — full access

**waitlist**
- `waitlist_insert_public`: `true` — anyone can join the waitlist
- `waitlist_service_role`: `auth.role() = 'service_role'` — admin management

**clubs / coaches / parents**
- Follow the same pattern: linked via `profile_id` to `profiles`, with service_role access and owner-based policies