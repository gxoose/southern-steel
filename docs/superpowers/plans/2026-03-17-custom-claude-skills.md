# Custom Claude Code Skills Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 5 global Claude Code skills for repeated VantaPoint Systems workflows (audit, auth, rebrand, deploy, chat widget).

**Architecture:** Each skill is a standalone `SKILL.md` file in `~/.claude/skills/<skill-name>/`. No shared dependencies. Each skill contains full instructions inline — no supporting files needed since all are under 500 lines.

**Tech Stack:** Claude Code skills system (YAML frontmatter + markdown), targeting Next.js/Supabase/Tailwind/Vercel/Anthropic projects.

**Spec:** `docs/superpowers/specs/2026-03-17-custom-claude-skills-design.md`

---

### Task 1: Create skills directory and audit-project skill

**Files:**
- Create: `~/.claude/skills/audit-project/SKILL.md`

- [ ] **Step 1: Create the skills directory**

```bash
mkdir -p ~/.claude/skills/audit-project
```

- [ ] **Step 2: Write audit-project SKILL.md**

Write `~/.claude/skills/audit-project/SKILL.md` with:

```markdown
---
name: audit-project
description: Use when you want a full security and code quality audit of a Next.js or Supabase project — checks auth, RLS, rate limiting, validation, env vars, dependencies, error handling, and security headers
---
```

Body must include:
- Overview: read-only audit across 10 categories, terminal summary + AUDIT-REPORT.md
- The 10 audit categories table (Auth & Session, RLS, Rate Limiting, Input Validation, Environment Variables, Dependencies, Error Handling, Security Headers, CORS, Service-Role Key Exposure)
- Process: scan each category using Grep/Read tools, tally pass/warn/fail, generate terminal summary table with top 3 action items, write AUDIT-REPORT.md with full findings and severity levels (critical/warning/info) and remediation steps
- Dependencies audit: auto-detect package manager from lockfile (package-lock.json → npm audit, pnpm-lock.yaml → pnpm audit, yarn.lock → yarn audit)
- Guardrails: never modify code, skip node_modules/.git/build output, warn if no .env.example
- Common mistakes: checking only API routes but missing server actions, forgetting to check for service-role key exposure in client components
- Version comment at top: `<!-- v1.0.0 2026-03-17 -->`

- [ ] **Step 3: Verify skill is discoverable**

```bash
cat ~/.claude/skills/audit-project/SKILL.md | head -5
```

Expected: frontmatter with name and description visible.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude && git init skills 2>/dev/null; cd ~/.claude/skills && git add audit-project/SKILL.md && git commit -m "feat: add audit-project skill"
```

Note: if `~/.claude/skills` is not a git repo, just skip the commit step.

---

### Task 2: Create add-auth skill

**Files:**
- Create: `~/.claude/skills/add-auth/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/add-auth
```

- [ ] **Step 2: Write add-auth SKILL.md**

Write `~/.claude/skills/add-auth/SKILL.md` with:

```markdown
---
name: add-auth
description: Use when adding Supabase SSR authentication to a Next.js project — creates middleware, login page, AuthGuard, logout with dark theme
---
```

Body must include:
- Overview: adds complete Supabase SSR auth flow with zinc/slate dark UI
- Project structure detection: check for `src/app/` vs `app/` vs `pages/` — warn and exit if Pages Router
- Pre-flight: check if `@supabase/supabase-js` and `@supabase/ssr` installed, install if missing. Verify env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Existing file detection: if `supabase.ts` or `supabase-browser.ts` already exist, DO NOT overwrite — verify they support auth and only add missing pieces
- Git history check: if `git log --oneline --all | grep -i "remove auth"` finds matches, ask user to confirm re-adding auth
- Files table: supabase.ts (server client), supabase-browser.ts (browser client), middleware.ts (route protection — merge if exists), login/page.tsx (email/password + magic link), AuthGuard.tsx (client redirect wrapper), LogoutButton.tsx
- Dark theme tokens: `bg-zinc-900`, `text-zinc-100`, `border-zinc-700`, `bg-zinc-800` inputs, `bg-indigo-600 hover:bg-indigo-500` primary buttons
- Ask which routes to protect (default `/dashboard/*`)
- Middleware merging: if middleware.ts exists, read it, add auth refresh logic without destroying existing matchers
- Validation: run `npm run build` after to catch type errors
- Guardrails: on partial failure, report what was created/modified
- Version comment at top: `<!-- v1.0.0 2026-03-17 -->`

Include inline code for each file — complete, copy-pasteable implementations using `@supabase/ssr` `createServerClient` and `createBrowserClient` patterns.

- [ ] **Step 3: Verify skill is discoverable**

```bash
cat ~/.claude/skills/add-auth/SKILL.md | head -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills && git add add-auth/SKILL.md && git commit -m "feat: add add-auth skill"
```

---

### Task 3: Create rebrand skill

**Files:**
- Create: `~/.claude/skills/rebrand/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/rebrand
```

- [ ] **Step 2: Write rebrand SKILL.md**

Write `~/.claude/skills/rebrand/SKILL.md` with:

```markdown
---
name: rebrand
description: Use when renaming or rebranding a project — replaces company name, tagline, package.json fields, and renames logo or favicon files with grep verification
---
```

Body must include:
- Overview: full project rebrand with text replacement, file renames, and verification
- Input collection: ask for old company name, new company name, old tagline (optional), new tagline (optional)
- Scan phase: grep entire project (case-insensitive) for old name, display file list with match counts. Exclude: `node_modules/`, `.git/`, lockfiles, binary files
- User approval gate: show all planned changes, require explicit "yes" before proceeding
- Case variant table with examples:
  - `Old Name` → `New Name` (title case, spaces)
  - `old-name` → `new-name` (kebab-case)
  - `OLD_NAME` → `NEW_NAME` (screaming snake)
  - `oldName` → `newName` (camelCase)
  - `OldName` → `NewName` (PascalCase)
- File renames: find files with old name in filename (logos, favicons), rename them, update all import/reference paths
- Targeted files list: package.json (name, description), README.md, `<title>` and meta tags, manifest.json, .env.example, vercel.json, docker-compose.yml, footer text
- Migration warning: if old name in `supabase/migrations/`, warn about manual DB migration
- Env var warning: if old name appears in env var VALUES (not keys), warn it may be external API reference
- Verification: grep for remaining occurrences, report stragglers needing manual attention
- Validation: run `npm run build` after to catch broken imports
- Version comment at top: `<!-- v1.0.0 2026-03-17 -->`

- [ ] **Step 3: Verify skill is discoverable**

```bash
cat ~/.claude/skills/rebrand/SKILL.md | head -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills && git add rebrand/SKILL.md && git commit -m "feat: add rebrand skill"
```

---

### Task 4: Create deploy-vercel skill

**Files:**
- Create: `~/.claude/skills/deploy-vercel/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/deploy-vercel
```

- [ ] **Step 2: Write deploy-vercel SKILL.md**

Write `~/.claude/skills/deploy-vercel/SKILL.md` with:

```markdown
---
name: deploy-vercel
description: Use when deploying a Next.js project to Vercel production — validates, builds, commits, pushes, and deploys
---
```

Body must include:
- Overview: pre-deploy validation pipeline → git → production deploy
- Pre-flight checks (fail fast, in order):
  1. Verify `vercel` CLI installed (`which vercel`), prompt to install if missing (`npm i -g vercel`)
  2. `npm run build` — production build + type checking
  3. `npm run lint` — only if lint script exists in package.json
  4. Any failure = stop, do not deploy
- Git stage:
  - `git status` to check for uncommitted changes
  - If dirty: show `git diff --stat`, ask user for confirmation, stage specific files (NEVER `git add -A` or `git add .`), commit with descriptive message, push
  - If clean: check if behind remote, push if needed
  - NEVER force-push
  - Warn if not on `main` branch
- Deploy:
  - `vercel --prod --yes`
  - Capture and display production URL
- Env var check:
  - Compare `.env.local` keys against `vercel env ls`
  - If `vercel env ls` fails (not linked/not authenticated), warn but continue
- Post-deploy:
  - Display production URL
  - Remind: `vercel rollback` to restore previous deployment if issues
  - Suggest running `audit-project` skill
- Version comment at top: `<!-- v1.0.0 2026-03-17 -->`

- [ ] **Step 3: Verify skill is discoverable**

```bash
cat ~/.claude/skills/deploy-vercel/SKILL.md | head -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills && git add deploy-vercel/SKILL.md && git commit -m "feat: add deploy-vercel skill"
```

---

### Task 5: Create add-chat-widget skill

**Files:**
- Create: `~/.claude/skills/add-chat-widget/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/add-chat-widget
```

- [ ] **Step 2: Write add-chat-widget SKILL.md**

Write `~/.claude/skills/add-chat-widget/SKILL.md` with:

```markdown
---
name: add-chat-widget
description: Use when adding a floating iframe chat bubble widget to a landing page or Next.js app — supports URL-only or full Anthropic streaming scaffold
---
```

Body must include:
- Overview: floating chat bubble (bottom-right, 56px circle) that opens iframe chat window. Two modes.
- Project structure detection: check for `src/app/` vs `app/`
- Mode selection: ask "Do you have an existing chat URL, or should I scaffold a chat page too?"

**Mode A — URL-only:**
- Create `ChatWidget.tsx` component:
  - Floating button: 56px circle, `fixed bottom-6 right-6`, `bg-indigo-600 hover:bg-indigo-500`, inline SVG chat icon
  - Open state: iframe overlay, `w-[400px] h-[600px]`, `rounded-2xl shadow-xl`, close button (X)
  - Animation: `transition-transform duration-200` scale from 0 to 100
  - Mobile: `max-sm:w-full max-sm:h-full max-sm:bottom-0 max-sm:right-0 max-sm:rounded-none`
  - `z-50` on container
  - Props: `url: string`
- Add component to root layout or user-specified page
- Check for existing chat widget first — warn on duplicate

**Mode B — Full scaffold:**
- Everything from Mode A, plus:
- `widget/chat/page.tsx`:
  - Standalone dark chat UI (zinc theme matching add-auth palette)
  - Message list with user/assistant bubbles
  - Input bar with send button
  - Streams responses from API endpoint
  - Sets response header `X-Frame-Options: SAMEORIGIN` for iframe compatibility
- API route (use `api/widget-chat/route.ts` if `api/chat/route.ts` already exists):
  - Import `@anthropic-ai/sdk` (install if missing)
  - Use `client.messages.stream()` method
  - Return `ReadableStream` with `text/event-stream` content type
  - System prompt from `process.env.CHAT_WIDGET_SYSTEM_PROMPT`
  - Include rate limiting from existing `rate-limit.ts` if present
  - NEVER hardcode API keys
- Ask user for system prompt, add to `.env.local`

Include complete inline code for ChatWidget.tsx, the chat page, and the API route.

- Guardrails: check for duplicates, validate URL reachability (Mode A), report partial failures
- Validation: run `npm run build` after
- Version comment at top: `<!-- v1.0.0 2026-03-17 -->`

- [ ] **Step 3: Verify skill is discoverable**

```bash
cat ~/.claude/skills/add-chat-widget/SKILL.md | head -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills && git add add-chat-widget/SKILL.md && git commit -m "feat: add add-chat-widget skill"
```

---

### Task 6: Final verification

- [ ] **Step 1: List all skills**

```bash
ls -la ~/.claude/skills/*/SKILL.md
```

Expected: 5 SKILL.md files (audit-project, add-auth, rebrand, deploy-vercel, add-chat-widget).

- [ ] **Step 2: Verify frontmatter format**

For each skill, verify:
- Frontmatter has only `name` and `description` fields
- `name` uses only letters, numbers, hyphens
- `description` starts with "Use when..."
- Total frontmatter under 1024 characters

```bash
for skill in audit-project add-auth rebrand deploy-vercel add-chat-widget; do
  echo "=== $skill ===" && head -4 ~/.claude/skills/$skill/SKILL.md
done
```

- [ ] **Step 3: Verify word counts**

```bash
for skill in audit-project add-auth rebrand deploy-vercel add-chat-widget; do
  echo "$skill: $(wc -w < ~/.claude/skills/$skill/SKILL.md) words"
done
```

Target: each under 500 words (technique/reference skills).

- [ ] **Step 4: Commit plan document**

```bash
cd /Users/poly/Desktop/southern-steel && git add docs/superpowers/plans/2026-03-17-custom-claude-skills.md && git commit -m "docs: add implementation plan for custom Claude Code skills"
```
