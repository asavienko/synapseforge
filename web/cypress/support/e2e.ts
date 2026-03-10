import "./commands";

// Suppress Next.js hydration noise in tests
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

// Clear cookies + storage before each test to prevent session bleed
// cy.session() will restore sessions when cy.login() is called
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
