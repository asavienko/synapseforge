/**
 * Landing Page
 * Tests all visible sections and navigation links.
 */
describe("01 · Landing Page", () => {
  beforeEach(() => cy.visit("/en"));

  it("renders hero section with product-focused headline", () => {
    cy.contains("Deploy AI agents in minutes").should("be.visible");
    cy.contains("not months.").should("be.visible");
    cy.snap("01-landing-01-hero");
  });

  it("shows CTA buttons in hero", () => {
    cy.contains("Start for free").should("be.visible");
    cy.contains("Try Demo").should("be.visible");
    cy.snap("01-landing-01b-hero-cta");
  });

  it("shows trust signals bar", () => {
    cy.contains("24/7").should("be.visible");
    cy.snap("01-landing-01c-trust");
  });

  it("shows nav with sign in and get started links", () => {
    cy.get("nav").within(() => {
      cy.contains("Sign in").should("be.visible");
      cy.contains("Get started").should("be.visible");
    });
    cy.snap("01-landing-02-nav");
  });

  it("shows language switcher in nav", () => {
    cy.get("nav").find("button").contains(/EN|ES|UK|RU/i).should("be.visible");
    cy.snap("01-landing-03-locale-switcher");
  });

  it("How it works section shows steps", () => {
    cy.contains("Everything AI, handled.").should("be.visible");
    cy.contains("Add your AI provider key").should("be.visible");
    cy.contains("Deploy to the cloud").should("be.visible");
    cy.contains("Go live on your channels").should("be.visible");
    cy.snap("01-landing-04-how-it-works");
  });

  it("features section shows service cards", () => {
    cy.contains("Multi-channel by default").should("be.visible");
    cy.contains("Your keys, your data").should("be.visible");
    cy.snap("01-landing-05-features");
  });

  it("pricing section shows all 3 plans with prices", () => {
    cy.contains("Simple, transparent pricing").should("be.visible");
    cy.contains("$0").should("be.visible");
    cy.contains("$49").should("be.visible");
    cy.contains("$299").should("be.visible");
    cy.snap("01-landing-06-pricing");
  });

  it("about section shows content", () => {
    // Section is below fold — scroll to it first to trigger FadeInView
    cy.get("#about").scrollIntoView();
    cy.contains("Who we are.").should("be.visible");
    cy.contains("Time to first live agent").should("be.visible");
    cy.snap("01-landing-07-about");
  });

  it("CTA banner at bottom has get started button", () => {
    cy.contains("Ready to deploy your AI agent?").should("be.visible");
    cy.snap("01-landing-07b-cta-banner");
  });

  it("footer has privacy and terms links", () => {
    cy.contains("Privacy").should("be.visible");
    cy.contains("Terms").should("be.visible");
    cy.snap("01-landing-08-footer");
  });

  it("locale switcher — switches to Spanish", () => {
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.contains("ES").click();
    cy.url({ timeout: 8000 }).should("include", "/es");
    cy.snap("01-landing-09-locale-es");
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
    cy.contains("Start for free").first().click();
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
