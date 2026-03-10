/// <reference types="cypress" />

/**
 * cy.login(email, password)
 * Session-cached login with cacheAcrossSpecs.
 * The validate function re-establishes sessions that have been cleared.
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      // Setup: perform UI login
      cy.visit("/en/sign-in");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').should("not.be.disabled").click();
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.request({ url: "/api/auth/session", failOnStatusCode: false })
          .then((res) => {
            if (!res.body?.user?.id) {
              throw new Error("Session invalid — will re-login");
            }
          });
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
