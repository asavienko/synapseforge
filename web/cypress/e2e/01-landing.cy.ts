/**
 * Landing Page
 * Tests all visible sections and navigation links.
 */
describe("01 · Landing Page", () => {
  beforeEach(() => cy.visit("/en"));

  it("renders hero section with product-focused headline", () => {
    cy.contains("Your AI Agent").should("be.visible");
    cy.contains("Live in 3 Minutes").should("be.visible");
    cy.snap("01-landing-01-hero");
  });

  it("shows CTA buttons in hero", () => {
    cy.contains("Deploy free").should("be.visible");
    cy.contains("See how it works").should("be.visible");
    cy.snap("01-landing-01b-hero-cta");
  });

  it("shows channel badges (Telegram, Discord, Slack, etc.)", () => {
    cy.contains("Telegram").should("be.visible");
    cy.contains("Discord").should("be.visible");
    cy.contains("Slack").should("be.visible");
    cy.snap("01-landing-01c-channel-badges");
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

  it("How it works section shows 3 steps", () => {
    cy.contains("Up and running in minutes").should("be.visible");
    cy.contains("Step 01").should("be.visible");
    cy.contains("Step 02").should("be.visible");
    cy.contains("Step 03").should("be.visible");
    cy.snap("01-landing-04-how-it-works");
  });

  it("terminal demo is visible in How it works", () => {
    cy.contains("Deploying your agent").should("be.visible");
    cy.contains("Deployment complete").should("be.visible");
    cy.snap("01-landing-04b-terminal");
  });

  it("features section shows 6 feature cards", () => {
    cy.contains("Everything you need to run AI at scale").should("be.visible");
    cy.contains("Multi-channel by default").should("be.visible");
    cy.contains("OpenAI-compatible API").should("be.visible");
    cy.contains("Auto config sync").should("be.visible");
    cy.snap("01-landing-05-features");
  });

  it("pricing section shows all 3 plans with prices", () => {
    cy.contains("Simple, transparent pricing").should("be.visible");
    cy.contains("$0").should("be.visible");
    cy.contains("$499").should("be.visible");
    cy.contains("Custom").should("be.visible");
    cy.snap("01-landing-06-pricing");
  });

  it("about section shows stats", () => {
    cy.contains("Built different").should("be.visible");
    cy.contains("<3 min").should("be.visible");
    cy.snap("01-landing-07-about");
  });

  it("CTA banner at bottom has deploy button", () => {
    cy.contains("Ready to deploy your AI agent").should("be.visible");
    cy.snap("01-landing-07b-cta-banner");
  });

  it("footer has privacy and terms links + status indicator", () => {
    cy.contains("Privacy").should("be.visible");
    cy.contains("Terms").should("be.visible");
    cy.contains("All systems operational").should("be.visible");
    cy.snap("01-landing-08-footer");
  });

  it("locale switcher — switches to Spanish", () => {
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.contains("ES").click();
    cy.url({ timeout: 8000 }).should("include", "/es");
    cy.contains("Activo en 3 minutos").should("be.visible");
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
