import "./commands";

// Suppress Next.js hydration noise and known benign errors
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration") ||
    err.message.includes("hydration") ||
    err.message.includes("NEXT_NOT_FOUND") ||
    err.message.includes("ResizeObserver")
  ) {
    return false;
  }
});

// Clear localStorage before each test.
// NOTE: Do NOT clear cookies globally — it breaks cy.session() session restoration.
// Tests that need a logged-out state should call cy.clearCookies() explicitly.
beforeEach(() => {
  cy.clearLocalStorage();
});
