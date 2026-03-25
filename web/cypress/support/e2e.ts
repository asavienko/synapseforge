import "./commands";

// Suppress Next.js hydration noise and known benign errors
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration") ||
    err.message.includes("hydration") ||
    err.message.includes("NEXT_NOT_FOUND") ||
    err.message.includes("ResizeObserver") ||
    err.message.includes("Minified React error #177")
  ) {
    return false;
  }
});

// Clear localStorage before each test.
// NOTE: Do NOT clear cookies globally — it breaks cy.session() session restoration.
// Tests that need a logged-out state should call cy.clearCookies() explicitly.
beforeEach(() => {
  cy.clearLocalStorage();

  // Emulate prefers-reduced-motion so scroll-reveal animations
  // (FadeInView) render immediately without waiting for IntersectionObserver.
  cy.on("window:before:load", (win) => {
    const original = win.matchMedia;
    win.matchMedia = (query: string) => {
      if (query === "(prefers-reduced-motion: reduce)") {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as MediaQueryList;
      }
      return original.call(win, query);
    };
  });
});
