# AGENTS.md — SynapseForge Web Dev Rules

These rules apply to every agent working on this project. No exceptions.

---

## 🗺️ Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript — `npx tsc --noEmit` must pass before every push
- **Styles:** Tailwind CSS v4
- **DB:** Prisma + PostgreSQL (Neon)
- **Auth:** NextAuth v5
- **i18n:** next-intl — 4 locales: `en`, `es`, `ru`, `uk`
- **Branch:** always `develop` — `git pull origin develop` before starting

---

## 📱 Rule 1: Mobile First — Always

**Every UI component and page must work on mobile.** This is not optional.

### Required patterns

```tsx
// ✅ Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ Responsive flex
<div className="flex flex-col sm:flex-row gap-4">

// ✅ Table with horizontal scroll
<div className="overflow-x-auto">
  <table className="w-full min-w-[500px]">

// ✅ Responsive width
<div className="w-full max-w-2xl">

// ✅ Tap target minimum
<button className="py-2.5 px-4 ...">  {/* min 44px height */}
```

### Banned patterns

```tsx
// ❌ Fixed pixel widths without responsive fallback
<div className="w-[600px]">

// ❌ Table without overflow wrapper
<table className="w-full">

// ❌ Multi-column grid without mobile fallback
<div className="grid grid-cols-4 gap-4">

// ❌ Flex row that will overflow on small screens
<div className="flex flex-row gap-4">  {/* missing flex-wrap or flex-col sm:flex-row */}
```

### Mobile checklist before committing:
- [ ] No horizontal scroll on 375px viewport
- [ ] All tables have `overflow-x-auto` wrapper
- [ ] All grids have `grid-cols-1` as base
- [ ] All flex rows have `flex-col sm:flex-row` or `flex-wrap`
- [ ] Buttons have adequate tap targets (min `py-2 px-4`)
- [ ] Modals/drawers don't overflow viewport

---

## 🌍 Rule 2: i18n — Every String Must Be Translated

**Never hardcode user-visible text in JSX.** Every string goes through next-intl.

### Locale files: `messages/en.json`, `messages/es.json`, `messages/ru.json`, `messages/uk.json`

All 4 files must stay in sync. When you add a key to `en.json`, add it to all 4 with accurate translations (not English copies).

### Client components
```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("myNamespace");
  return <button>{t("saveChanges")}</button>;
}
```

### Server components
```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("myNamespace");
  return <h1>{t("pageTitle")}</h1>;
}
```

### What requires i18n (must use `t()`)
- All visible text in JSX: labels, buttons, headings, descriptions, placeholders, error messages
- `aria-label` and `title` attributes that users see
- Toast / notification messages shown to users

### What does NOT require i18n
- Technical format tokens: `"sk-..."`, `"EAA..."`, `"fc-..."` (these are format hints)
- Code/API values: `"gpt-4o-mini"`, `"openai"`, `"pending"`, `"running"`
- Console.log strings, developer-facing error details
- URLs and domain names

### i18n checklist before committing:
- [ ] Zero hardcoded English strings in JSX
- [ ] All new keys added to `en.json`, `es.json`, `ru.json`, `uk.json`
- [ ] Translations are accurate for each locale (not copy-pasted English)
- [ ] `npx tsc --noEmit` passes (catches missing i18n key type errors)

---

## 🚀 Rule 3: CI/CD — Verify After Every Push

After every `git push origin develop`:
1. Wait ~15 minutes
2. Check: `gh run list --branch develop --limit 3 --json status,conclusion,headSha`
3. If failed: `gh run view <id> --log-failed` → fix immediately → push fix
4. **A push is not "done" until CI shows `conclusion: success`**

CI pipeline: Cypress E2E (30 min) → Vercel deploy (15 min, only on success)

---

## ⚡ Rule 4: Sub-Agent Workflow

- Always `git pull origin develop` before starting
- Always `npx tsc --noEmit` before pushing
- Always `git push origin develop --no-verify` (pre-push hook OOM-kills on Mac Mini)
- One commit per logical unit of work — clear, descriptive messages
- Never commit directly to `main`

---

## 🗂️ Key Paths

| What | Where |
|------|-------|
| Main app pages | `src/app/[locale]/` |
| API routes | `src/app/api/` |
| Components | `src/components/` |
| i18n strings | `messages/*.json` |
| Prisma schema | `prisma/schema.prisma` |
| Lib utilities | `src/lib/` |
| E2E specs | `cypress/e2e/` |
| E2E seed | `cypress/support/seed.ts` |

---

*Last updated: 2026-03-13 — Anton's explicit requirement*
