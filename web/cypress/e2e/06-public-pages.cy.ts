/**
 * Public Pages
 * Privacy · Terms · Contact · Pricing · 404
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

describe("06 · Pricing Page", () => {
  beforeEach(() => {
    cy.visit("/en/pricing");
  });

  it("pricing page loads with title", () => {
    cy.contains("Simple, transparent pricing").should("be.visible");
    cy.snap("06-pricing-01-title");
  });

  it("shows self-service and managed plan sections", () => {
    cy.contains("Self-Service", { matchCase: false }).should("be.visible");
    cy.contains("Managed", { matchCase: false }).should("be.visible");
    cy.contains("Free").should("be.visible");
    cy.contains("Starter").should("be.visible");
    cy.contains("Growth").should("be.visible");
    cy.snap("06-pricing-02-plans");
  });

  it("Free plan links to sign-up", () => {
    cy.contains("a", /Start free/i)
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", "sign-up");
    cy.snap("06-pricing-03-free-cta");
  });

  it("Starter plan links to sign-up", () => {
    cy.contains("a", /Get Starter/i)
      .first()
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", "sign-up");
    cy.snap("06-pricing-04-starter-cta");
  });

  it("Managed plans show contact link", () => {
    cy.contains("a", /Contact Sales/i)
      .should("be.visible")
      .and("have.attr", "href", "mailto:hello@synapseforge.ai");
    cy.snap("06-pricing-05-managed-cta");
  });

  it("has a back-to-home link", () => {
    cy.get("a").filter('[href="/"], [href="/en"]').should("exist");
    cy.snap("06-pricing-06-nav");
  });

  it("pricing page loads in Spanish", () => {
    cy.visit("/es/pricing");
    cy.contains("Precios simples y transparentes").should("be.visible");
    cy.snap("06-pricing-07-es");
  });

  it("pricing page loads in Ukrainian", () => {
    cy.visit("/uk/pricing");
    cy.contains("прозоре ціноутворення", { matchCase: false }).should("be.visible");
    cy.snap("06-pricing-08-uk");
  });
});
