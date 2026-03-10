/**
 * Public Pages
 * Privacy · Terms · Contact · 404
 */
describe("06 · Public Pages", () => {
  it("Privacy Policy page loads", () => {
    cy.visit("/en/privacy");
    cy.contains("Privacy", { matchCase: false }).should("be.visible");
    cy.snap("06-public-01-privacy");
  });

  it("Terms of Service page loads", () => {
    cy.visit("/en/terms");
    cy.contains("Terms", { matchCase: false }).should("be.visible");
    cy.snap("06-public-02-terms");
  });

  it("Contact page loads", () => {
    cy.visit("/en/contact");
    cy.get("body").should("not.be.empty");
    cy.snap("06-public-03-contact");
  });

  it("unknown route shows 404", () => {
    cy.visit("/en/does-not-exist", { failOnStatusCode: false });
    cy.get("body").should("not.be.empty");
    cy.snap("06-public-04-404");
  });
});
