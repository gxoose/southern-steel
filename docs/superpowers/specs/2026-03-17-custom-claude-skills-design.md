# Custom Claude Code Skills — Design Spec

**Date:** 2026-03-17
**Author:** VantaPoint Systems
**Status:** Draft

## Overview

Five standalone Claude Code skills for repeated solo-developer workflows. Each skill lives in `~/.claude/skills/<skill-name>/SKILL.md`, is globally available across all projects, and has no dependencies on other custom skills.

**Target stack:** Next.js, Supabase, Tailwind CSS, Vercel, Anthropic API.

---

## Skill 1: `audit-project`

**Description (for discovery):** "Use when you want a full security and code quality audit of a Next.js or Supabase project — checks auth, RLS, rate limiting, validation, env vars, dependencies, error handling, and security headers"

### What it does

Runs a read-only, structured audit across 10 categories. Produces both a terminal summary and a written `AUDIT-REPORT.md`.

### Audit Categories

| # | Category | What it checks |
|---|----------|---------------|
| 1 | Auth & Session | Middleware protecting routes, token handling, session expiry |
| 2 | RLS | Supabase migrations for tables missing RLS policies |
| 3 | Rate Limiting | API routes for rate-limit guards |
| 4 | Input Validation | API routes for Zod/schema validation on request bodies |
| 5 | Environment Variables | `.env` gitignored, no hardcoded secrets, `process.env` references have fallbacks |
| 6 | Dependencies | `npm audit` / `pnpm audit` / `yarn audit` (auto-detect from lockfile), outdated packages |
| 7 | Error Handling | Error boundaries, try/catch in API routes, no leaked stack traces |
| 8 | Security Headers | CSP, X-Frame-Options in middleware or next.config |
| 9 | CORS | API routes serving public data have correct CORS config |
| 10 | Service-Role Key Exposure | `SUPABASE_SERVICE_ROLE_KEY` not referenced in client components or `NEXT_PUBLIC_` vars |

### Output

- **Terminal:** Summary table with pass/warn/fail per category + top 3 action items
- **File:** `AUDIT-REPORT.md` at project root with full findings, severity levels (critical/warning/info), and remediation steps

### Guardrails

- Never modifies code — read-only audit
- Flags findings, does not auto-fix
- Warns if no `.env.example` exists
- Skips `node_modules/`, `.git/`, build output

---

## Skill 2: `add-auth`

**Description (for discovery):** "Use when adding Supabase SSR authentication to a Next.js project — creates middleware, login page, AuthGuard, logout with dark theme"

### What it does

Adds a complete Supabase SSR auth flow with zinc/slate dark-themed UI.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Server-side Supabase client (cookie-based SSR) |
| `src/lib/supabase-browser.ts` | Browser-side Supabase client |
| `src/middleware.ts` | Route protection, session refresh, redirect unauthenticated |
| `src/app/login/page.tsx` | Login page — email/password + magic link |
| `src/components/AuthGuard.tsx` | Client wrapper that redirects if no session |
| `src/components/LogoutButton.tsx` | Logout with redirect to `/login` |

### Behavior

- Detects project structure: `src/app/` vs `app/` vs Pages Router — adapts file paths accordingly. Assumes App Router; does not support Pages Router (warns and exits)
- Checks if `@supabase/supabase-js` and `@supabase/ssr` are installed; installs if missing
- If `supabase.ts` or `supabase-browser.ts` already exist, does NOT overwrite them — verifies existing clients support auth flow and only adds what is missing
- Detects existing `middleware.ts` and merges rather than overwrites
- Protected routes default to `/dashboard/*` but asks which routes to protect
- Verifies `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` exist in `.env.local`
- If git history shows auth was previously removed, asks: "This project appears to have had auth removed. Are you sure you want to re-add it?"

### Dark Theme Defaults

- `bg-zinc-900` background
- `text-zinc-100` text
- `border-zinc-700` borders
- `bg-zinc-800` input backgrounds
- `bg-indigo-600 hover:bg-indigo-500` primary buttons

### Guardrails

- Warns if `middleware.ts` or `login/page.tsx` already exists before overwriting
- Does not create Supabase project or run migrations — client-side setup only
- On partial failure, reports what was created/modified so user can manually revert
- Runs `npm run build` after to verify no type errors introduced (avoids `tsc --noEmit` + `incremental` conflicts)

---

## Skill 3: `rebrand`

**Description (for discovery):** "Use when renaming or rebranding a project — replaces company name, tagline, package.json fields, and renames logo/favicon files with grep verification"

### What it does

Takes old/new company name (+ optional tagline), performs full text and file rename across the project with verification.

### Process

1. **Collect inputs** — old company name, new company name, old tagline (optional), new tagline (optional)
2. **Scan phase** — grep entire project for all occurrences (case-insensitive), display summary of files and match counts
3. **User approval gate** — show full list of planned changes, ask for confirmation
4. **Text replacements** — replace in all source files, preserving case variants:
   - `Old Name` → `New Name` (title case)
   - `old-name` → `new-name` (kebab-case)
   - `OLD_NAME` → `NEW_NAME` (screaming snake)
   - `oldName` → `newName` (camelCase)
   - `OldName` → `NewName` (PascalCase — component names, types, classes)
5. **File renames** — rename logo/favicon files containing old name, update all references
6. **Targeted files** — `package.json` (name, description), `README.md`, `<title>` tags, meta tags, `manifest.json`, `.env.example`, `vercel.json`, `docker-compose.yml`, footer text
7. **Migration warning** — if old name appears in `supabase/migrations/` files, warn that these may require a manual database migration
8. **Verification** — grep for remaining occurrences, report stragglers

### Guardrails

- Never touches `node_modules/`, `.git/`, or lockfiles
- Shows diff preview before applying — no silent changes
- Skips binary files for text replacement
- Warns if old name appears in env var values (may be external API keys)
- Runs `npm run build` after to catch broken imports from file renames

---

## Skill 4: `deploy-vercel`

**Description (for discovery):** "Use when deploying a Next.js project to Vercel production — validates, builds, commits, pushes, and deploys"

### What it does

Runs a pre-deploy validation pipeline, handles git, and deploys to Vercel production.

### Process

1. **Pre-flight checks:**
   - `npm run build` — production build (includes type checking)
   - `npm run lint` (if script exists) — linting
   - Fails fast on any error
2. **Git stage:**
   - Check for uncommitted changes
   - If dirty: show `git diff --stat`, ask user for confirmation, then stage specific files (never `git add -A`), commit, push
   - If clean: push if behind remote
3. **Deploy:**
   - `vercel --prod --yes`
   - Capture and display production URL
   - Note: Vercel runs its own build remotely — the local pre-flight build is for early error detection
4. **Post-deploy:**
   - Display deployment URL
   - Remind user: if issues arise, run `vercel rollback` to restore previous deployment
   - Suggest `audit-project` if not run recently

### Guardrails

- Verifies `vercel` CLI is installed; prompts to install if missing
- Refuses to deploy if `tsc` or `build` fails — no override
- Never force-pushes
- Warns if deploying from a branch other than `main`
- Checks required env vars are set in Vercel (compares `.env.local` keys vs `vercel env ls`). If `vercel env ls` fails (project not linked or not authenticated), warns but does not block deployment

---

## Skill 5: `add-chat-widget`

**Description (for discovery):** "Use when adding a floating iframe chat bubble widget to a landing page or Next.js app — supports URL-only or full Anthropic streaming scaffold"

### What it does

Adds a bottom-right floating chat bubble (56px circle) that opens an iframe chat window. Two modes available.

### Mode Selection

Asks at invocation: "Do you have an existing chat URL, or should I scaffold a chat page too?"

### Mode A — URL-only

Creates `src/components/ChatWidget.tsx` (floating bubble + iframe overlay) and adds it to root layout or specified page.

### Mode B — Full Scaffold

Everything from Mode A, plus:

| File | Purpose |
|------|---------|
| `src/app/widget/chat/page.tsx` | Standalone chat UI (dark zinc theme, message bubbles, input bar). Sets `X-Frame-Options: SAMEORIGIN` to allow iframe embedding from same origin |
| `src/app/api/widget-chat/route.ts` | Anthropic streaming endpoint using SDK `stream()` method, returns `ReadableStream` with `text/event-stream` content type |

- If `src/app/api/chat/route.ts` already exists, uses `widget-chat` path to avoid conflicts
- Detects project structure: `src/app/` vs `app/` and adapts paths
- Uses project's existing Anthropic SDK if installed; installs if not
- Asks for the system prompt to use — stores it in `process.env.CHAT_WIDGET_SYSTEM_PROMPT` (added to `.env.local`)

### ChatWidget Component Spec

- **Floating button:** 56px circle, `bottom-6 right-6`, `bg-indigo-600`, chat icon SVG
- **Open state:** iframe overlay, 400x600px, rounded corners, shadow-xl, close button
- **Animation:** scale transition on open/close
- **Mobile:** full-width on `< 640px`
- **Z-index:** `z-50`

### Guardrails

- Checks if a chat widget already exists before adding a duplicate
- Validates chat URL is reachable (URL-only mode)
- API route includes rate limiting pattern from existing `rate-limit.ts` if present
- Never hardcodes API keys — uses `process.env.ANTHROPIC_API_KEY`
- On partial failure, reports what was created/modified so user can revert
- Runs `npm run build` after to verify no type errors

---

## Cross-Cutting Concerns

- **Project structure detection:** All skills that create files must detect `src/app/` vs `app/` vs Pages Router and adapt paths. Skills assume App Router; warn and exit if Pages Router is detected.
- **Type checking:** Use `npm run build` instead of `npx tsc --noEmit` to avoid `incremental` flag conflicts common in Next.js `tsconfig.json`.
- **Confirmation protocol:** `rebrand` and `deploy-vercel` require explicit user confirmation before changes. `add-auth` and `add-chat-widget` warn on conflicts and ask before overwriting. `audit-project` is read-only and needs no confirmation.
- **Partial failure handling:** Skills that create multiple files report what was created/modified on failure so the user can manually revert.
- **Versioning:** Each SKILL.md includes a version comment at the top (`<!-- v1.0.0 2026-03-17 -->`) for tracking deployed versions.

## Architecture Decisions

- **Standalone skills** — no shared dependencies between skills; each is self-contained
- **Global installation** — `~/.claude/skills/<name>/SKILL.md` so they work in any project
- **Read-only audit** — `audit-project` never modifies code
- **Merge, don't overwrite** — `add-auth` detects existing middleware and merges
- **Approval gates** — `rebrand` shows planned changes before applying
- **Fail-fast deploys** — `deploy-vercel` refuses to deploy broken builds
- **Two-mode widget** — `add-chat-widget` supports both URL-only and full scaffold

## File Locations

All skills installed to:

```
~/.claude/skills/
├── audit-project/SKILL.md
├── add-auth/SKILL.md
├── rebrand/SKILL.md
├── deploy-vercel/SKILL.md
└── add-chat-widget/SKILL.md
```
