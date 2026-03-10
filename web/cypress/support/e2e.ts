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

beforeEach(() => {
  cy.clearLocalStorage();
});
