/// <reference types="cypress" />

/**
 * cy.login(email, password)
 * Session-cached login with validation. If session is invalid, re-runs login flow.
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.clearCookies();
      cy.visit("/en/sign-in");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').should("not.be.disabled").click();
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        // Re-run login if session cookie is missing/expired
        cy.request({
          url: "/api/auth/session",
          failOnStatusCode: false,
        }).its("body.user").should("exist");
      },
    }
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
