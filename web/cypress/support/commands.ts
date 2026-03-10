/// <reference types="cypress" />

/**
 * cy.login(email, password)
 * Fast session-cached login — reuses cookie across tests in same spec.
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit("/en/sign-in");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    },
    { cacheAcrossSpecs: true }
  );
});

/**
 * cy.snap(name)
 * Take a named screenshot — saved to cypress/screenshots/
 */
Cypress.Commands.add("snap", (name: string) => {
  cy.screenshot(name, { overwrite: true });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      snap(name: string): Chainable<void>;
    }
  }
}

export {};
