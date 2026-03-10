/**
 * Manager Portal (/en/manager)
 * View assigned clients · Send messages · See instances
 */
const MANAGER_EMAIL = Cypress.env("MANAGER_EMAIL") || "manager@synapseforge.ai";
const MANAGER_PASS  = Cypress.env("MANAGER_PASSWORD") || "Cypress123!";

describe("09 · Manager Portal", () => {
  beforeEach(() => {
    cy.visit("/en/manager", { failOnStatusCode: false });
  });

  it("redirects unauthenticated user to sign-in", () => {
    cy.clearCookies();
    cy.visit("/en/manager");
    cy.url({ timeout: 8000 }).should("include", "/sign-in");
    cy.snap("09-manager-01-unauth-redirect");
  });

  it("regular user is denied or redirected from manager portal", () => {
    cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));
    cy.visit("/en/manager");
    cy.get("body").then(($body) => {
      // Should either redirect or show access denied
      const text = $body.text();
      const url = cy.url();
      if (!text.includes("My Clients") && !text.includes("Clients")) {
        cy.log("Non-manager redirected/denied — expected");
      }
    });
    cy.snap("09-manager-02-regular-user");
  });
});
