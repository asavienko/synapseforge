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

## 🌍 Rule 2: i18n — MANDATORY for Every Task

> **This is a hard requirement, not a suggestion.**
> Every feature, component, or page you implement must be fully internationalized before it is considered done.
> Shipping English-only text is a bug, not a "to-do".

### Supported locales (all 4 must be updated every time)

| File | Language |
|------|----------|
| `messages/en.json` | English — source of truth |
| `messages/es.json` | Spanish |
| `messages/ru.json` | Russian |
| `messages/uk.json` | Ukrainian |

### Workflow — follow this order for every task

1. **Implement the feature** using `t("key")` / `useTranslations` — no hardcoded strings.
2. **Add keys to `en.json`** with the English text.
3. **Add the same keys to `es.json`, `ru.json`, `uk.json`** with accurate translations (not English copies).
4. **Verify**: `node scripts/check-translations.js` — must show 0 missing keys for your new additions.
5. **Then** run `npx tsc --noEmit` and commit.

### Code patterns

**Client component:**
```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("myNamespace");
  return <button>{t("saveChanges")}</button>;
}
```

**Server component / page:**
```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("myNamespace");
  return <h1>{t("pageTitle")}</h1>;
}
```

**Namespace convention:** use the feature/section name as the namespace (`instanceDetail`, `billing`, `settings`, `landing`, etc.). Match existing namespaces in `en.json` when extending existing features.

### What MUST use `t()`
- All text in JSX: headings, labels, buttons, descriptions, placeholders, helper text
- Error and success messages shown to users
- Toast/notification content
- `aria-label` and `title` attributes visible to users
- Empty-state messages

### What does NOT need `t()`
- Technical tokens/format hints: `"sk-..."`, `"EAA..."`, `"fc-..."`
- Internal code values: `"gpt-4o-mini"`, `"running"`, `"pending"`, `"openai"`
- `console.log` / developer-facing error strings
- URLs, domain names, API endpoints
- SEO-only pages under `[locale]/compare/`, `[locale]/blog/`, `[locale]/use-cases/` — these are standalone marketing pages, not app UI, and use hardcoded English copy intentionally

### Adding translations

```jsonc
// messages/en.json
{
  "myFeature": {
    "title": "My Feature",
    "saveBtn": "Save changes",
    "emptyState": "Nothing here yet."
  }
}

// messages/es.json — accurate Spanish, not English copy
{
  "myFeature": {
    "title": "Mi Función",
    "saveBtn": "Guardar cambios",
    "emptyState": "Nada aquí todavía."
  }
}

// messages/ru.json — accurate Russian
{
  "myFeature": {
    "title": "Моя функция",
    "saveBtn": "Сохранить изменения",
    "emptyState": "Здесь пока ничего нет."
  }
}

// messages/uk.json — accurate Ukrainian
{
  "myFeature": {
    "title": "Моя функція",
    "saveBtn": "Зберегти зміни",
    "emptyState": "Тут поки нічого немає."
  }
}
```

### Verification command

```bash
# Check all locales for missing keys (run before every commit that touches UI)
node scripts/check-translations.js

# Strict mode — exits 1 if any key is missing
node scripts/check-translations.js --strict

# Check specific locale only
node scripts/check-translations.js es

# npm shorthand
npm run check-i18n
npm run check-i18n:strict
```

### Definition of Done for any UI task

A task is **not complete** until:
- [ ] Zero hardcoded English strings in new JSX
- [ ] All new i18n keys exist in all 4 locale files
- [ ] `node scripts/check-translations.js` shows 0 missing keys for new additions
- [ ] Translations are accurate (not English copy-pasted into other locales)
- [ ] `npx tsc --noEmit` passes

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
