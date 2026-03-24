# Mobile Audit Report

**Date:** 2026-03-20  
**Auditor:** Mobile-first CSS Audit Subagent  
**Breakpoints Tested:** 320px, 375px, 414px, 768px

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 (Broken)** | 4 | Blocking usability issues |
| **P1 (Poor UX)** | 6 | Significant friction on mobile |
| **P2 (Polish)** | 4 | Minor improvements needed |

---

## P0 Issues (Broken)

### 1. `/dashboard/instances/[id]` - Tab Navigation Overflow
**Issue:** 11 tabs overflow horizontally with no clear visual affordance  
**Current:** `overflow-x-auto` with `scrollbar-hide` hides scrollability  
**Impact:** Users don't know tabs are scrollable  
**Fix:** Added gradient fade indicators + snap scrolling

### 2. `/dashboard/billing` - Plan Cards Too Wide
**Issue:** Self-service plans use `xl:grid-cols-5` which doesn't collapse gracefully  
**Current:** Cards squash at 320px, text wraps poorly  
**Impact:** Unreadable pricing, cramped layout  
**Fix:** Adjusted grid breakpoints + card min-width

### 3. `/onboarding` - Step Indicators Overflow  
**Issue:** Progress bar with 5 steps + connectors overflows at 320px  
**Current:** Fixed `w-8 h-8` circles with `w-8` connecting lines  
**Impact:** Steps wrap awkwardly or get cut off  
**Fix:** Responsive sizing `w-6 sm:w-8` + flex-wrap fallback

### 4. `/templates` - Filter Bar Horizontal Scroll
**Issue:** Category filter buttons overflow container  
**Current:** `flex-wrap` not enabled, buttons push off-screen  
**Impact:** Can't access all filters on mobile  
**Fix:** Added `flex-wrap` + `overflow-x-auto` for graceful degradation

---

## P1 Issues (Poor UX)

### 5. `/dashboard/instances/[id]` - Tables Without Horizontal Scroll
**Issue:** Infrastructure health/snapshots tables overflow at 320px  
**Current:** `overflow-x-auto` on container but no visual indicator  
**Impact:** Data columns cut off, unreadable  
**Fix:** Added `MobileTableWrapper` component with scroll hint

### 6. `/dashboard/instances/[id]` - Chat Input Too Small
**Issue:** Chat textarea + button stack poorly at 320px  
**Current:** `flex-col sm:flex-row` but min-height issues  
**Impact:** Hard to type, button hard to tap  
**Fix:** Touch target sizing + flex layout improvements

### 7. `/dashboard/instances/[id]` - Credential Cards Stack Poorly
**Issue:** Integration cards in Credentials tab overflow  
**Current:** Fixed padding + wide content  
**Impact:** Horizontal scrolling within cards  
**Fix:** Adjusted padding + text truncation

### 8. `/dashboard/billing` - Cancellation Survey Modal Too Wide
**Issue:** Modal doesn't adapt to 320px viewport  
**Current:** `max-w-md` (448px) too wide  
**Impact:** Modal edges cut off  
**Fix:** `max-w-sm` (320px) + responsive padding

### 9. Global - Touch Targets Below 44px
**Issue:** Many buttons use `px-2 py-1` (32px height)  
**Current:** No minimum size enforcement  
**Impact:** Hard to tap on mobile  
**Fix:** Added `.touch-target` utility (44px min)

### 10. Global - Text Doesn't Wrap Safely
**Issue:** Long URLs, API keys, tokens overflow containers  
**Current:** No `overflow-wrap` or `word-break`  
**Impact:** Layout breakage, horizontal scroll  
**Fix:** Added `.text-wrap-safe` utility

---

## P2 Issues (Polish)

### 11. Global - No Safe Area Padding
**Issue:** Notched devices (iPhone X+) have content in unsafe zones  
**Current:** No `env(safe-area-inset-*)` usage  
**Impact:** Content behind notch/status bar  
**Fix:** Added `.mobile-safe` utility

### 12. `/dashboard/instances/[id]` - Modal Backdrop Scroll
**Issue:** Long modals don't scroll properly on small screens  
**Current:** Fixed positioning without scroll handling  
**Impact:** Can't access modal buttons  
**Fix:** `max-h-screen overflow-y-auto` on modal containers

### 13. `/templates` - Search Input Too Narrow
**Issue:** Search bar doesn't use full width on mobile  
**Current:** `w-full md:w-96` limits to 384px  
**Impact:** Wasted space, harder to see query  
**Fix:** Full width on mobile breakpoints

### 14. Global - Font Size Too Small on Mobile
**Issue:** `text-xs` (12px) hard to read on small screens  
**Current:** No responsive text sizing  
**Impact:** Accessibility concerns  
**Fix:** Minimum 14px on mobile for body text

---

## CSS Utilities Added

```css
/* Mobile-safe areas for notched devices */
.mobile-safe {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Touch target enforcement (44px minimum) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
button.touch-target,
a.touch-target {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Safe text wrapping for long content */
.text-wrap-safe {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Mobile-optimized container */
.mobile-container {
  width: 100%;
  max-width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}
@media (min-width: 640px) {
  .mobile-container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
```

---

## Components Created

### `MobileTableWrapper`
A responsive table wrapper that:
- Provides horizontal scroll with visual hint
- Adds fade indicators on edges
- Optional card view for mobile (<640px)

---

## Testing Checklist

- [x] 320px viewport - all pages scrollable vertically only
- [x] 375px viewport - comfortable tap targets
- [x] 414px viewport - improved spacing
- [x] Touch targets all ≥44px
- [x] Tables scroll horizontally when needed
- [x] Text wraps without breaking layout
- [x] Modals fit within viewport
- [x] Safe area insets handled

---

## Files Modified

1. `src/app/globals.css` - Added mobile utility classes
2. `src/app/[locale]/dashboard/instances/[id]/page.tsx` - Tab fixes, table wrappers
3. `src/app/[locale]/dashboard/billing/BillingClient.tsx` - Grid fixes
4. `src/app/[locale]/onboarding/page.tsx` - Progress bar responsive sizing
5. `src/app/[locale]/templates/page.tsx` - Filter bar fixes
6. `src/components/MobileTableWrapper.tsx` - New component

---

## Commit Message

```
fix(mobile): systematic mobile-first improvements

- Add mobile-safe, touch-target, text-wrap-safe CSS utilities
- Create MobileTableWrapper component for responsive tables
- Fix tab overflow on instance detail with gradient hints
- Fix plan card grid on billing page for small screens
- Fix onboarding step indicators responsive sizing
- Fix template filter bar flex-wrap behavior
- Ensure 44px minimum touch targets throughout
- Add safe area padding for notched devices
```
