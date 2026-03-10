/**
 * Sign Out
 * Sign out from sidebar · Session cleared · Can't access dashboard after
 */
describe("10 · Sign Out", () => {
  const email = Cypress.env("TEST_EMAIL");
  const pass  = Cypress.env("TEST_PASSWORD");

  it("signs out from sidebar and lands on home", () => {
    cy.login(email, pass);
    cy.visit("/en/dashboard");
    cy.get("aside").contains("Sign out").click({ force: true });
    cy.url({ timeout: 12000 }).should("not.include", "/dashboard");
    cy.snap("10-signout-01-home");
  });

  it("cannot access dashboard after sign out", () => {
    cy.login(email, pass);
    cy.visit("/en/dashboard");
    cy.get("aside").contains("Sign out").click({ force: true });
    cy.url({ timeout: 12000 }).should("not.include", "/dashboard");
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en/dashboard");
    cy.url({ timeout: 8000 }).should("include", "/sign-in");
    cy.snap("10-signout-02-dashboard-blocked");
  });

  it("can sign back in after sign out", () => {
    cy.login(email, pass);
    cy.visit("/en/dashboard");
    cy.get("aside").contains("Sign out").click({ force: true });
    cy.url({ timeout: 12000 }).should("not.include", "/dashboard");

    cy.clearCookies();
    cy.visit("/en/sign-in");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(pass);
    cy.get('button[type="submit"]').should("not.be.disabled").click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.snap("10-signout-03-sign-back-in");
  });
});
