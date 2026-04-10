# Authentication and Authorization (Supabase + Next.js)

## Auth flow
- Email/password authentication is implemented with Supabase Auth (`signInWithPassword`, `signUp`).
- Signup triggers automatic profile creation in Postgres via `public.handle_new_user()`.

## Role model
- `profiles.role` has 3 roles: `user`, `moderator`, `admin`.
- Role helper functions:
  - `public.current_user_role()`
  - `public.is_moderator_or_admin()`

## Protected routes strategy
- **Middleware layer (`middleware.ts`)**
  - Anonymous users are redirected away from `/dashboard` and `/admin` to `/sign-in`.
  - Signed-in users are redirected away from `/sign-in` and `/sign-up` to `/dashboard`.
- **Server-layout guard layer**
  - `src/app/(dashboard)/layout.tsx` enforces authentication with `requireUser()`.
  - `src/app/(admin)/layout.tsx` enforces role-based access with `requireRole(['moderator', 'admin'])`.
- **Database layer (RLS)**
  - Row-level policies enforce ownership and moderation privileges even if route checks are bypassed.

## RLS coverage
Policies are defined for:
- `profiles`
- `deals`
- `deal_votes`
- `deal_comments`
- `deal_bookmarks`
- `deal_reports`

The migration file is `supabase/migrations/20260410010000_auth_rls.sql`.
