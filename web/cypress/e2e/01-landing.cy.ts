/**
 * Landing Page
 * Tests all visible sections and navigation links.
 */
describe("01 · Landing Page", () => {
  beforeEach(() => cy.visit("/en"));

  it("renders hero section", () => {
    cy.contains("Your AI Stack, Fully Managed").should("be.visible");
    cy.contains("Get started free").should("be.visible");
    cy.snap("01-landing-01-hero");
  });

  it("shows nav with sign in and get started links", () => {
    cy.get("nav").within(() => {
      cy.contains("Sign in").should("be.visible");
      cy.contains("Get started free").should("be.visible");
    });
    cy.snap("01-landing-02-nav");
  });

  it("shows language switcher in nav", () => {
    cy.get("nav").find("button").contains(/EN|ES|UK|RU/i).should("be.visible");
    cy.snap("01-landing-03-locale-switcher");
  });

  it("services section is visible", () => {
    cy.get("a[href='#services']").first().click({ force: true });
    cy.contains("What We Build For You").should("be.visible");
    cy.snap("01-landing-04-services");
  });

  it("pricing section shows all plans", () => {
    cy.get("a[href='#pricing']").first().click({ force: true });
    cy.contains("Simple, Transparent Pricing").should("be.visible");
    cy.contains("Pro").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
    cy.snap("01-landing-05-pricing");
  });

  it("about section shows stats", () => {
    cy.get("a[href='#about']").first().click({ force: true });
    cy.contains("We Forge the AI Stack").should("be.visible");
    cy.snap("01-landing-06-about");
  });

  it("footer has privacy and terms links", () => {
    cy.contains("Privacy Policy").should("be.visible");
    cy.contains("Terms of Service").should("be.visible");
    cy.snap("01-landing-07-footer");
  });

  it("locale switcher — switches to Spanish", () => {
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.contains("ES").click();
    cy.url({ timeout: 8000 }).should("include", "/es");
    cy.contains("Empieza gratis").should("be.visible");
    cy.snap("01-landing-08-locale-es");
  });

  it("locale switcher — switches to Ukrainian", () => {
    cy.visit("/en");
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.contains("UK").click();
    cy.url({ timeout: 8000 }).should("include", "/uk");
    cy.snap("01-landing-09-locale-uk");
  });

  it("locale switcher — switches to Russian", () => {
    cy.visit("/en");
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.contains("RU").click();
    cy.url({ timeout: 8000 }).should("include", "/ru");
    cy.snap("01-landing-10-locale-ru");
  });

  it("CTA navigates to sign up (logged out)", () => {
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en");
    cy.contains("Get started free").first().click();
    cy.url().should("include", "/sign-up");
    cy.snap("01-landing-11-cta-to-signup");
  });

  it("nav sign in navigates to sign in (logged out)", () => {
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en");
    cy.get("nav").contains("Sign in").click();
    cy.url().should("include", "/sign-in");
    cy.snap("01-landing-12-nav-to-signin");
  });
});
