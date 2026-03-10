/**
 * Onboarding Flow
 * 3-step wizard: business info → use case → confirmation
 */
describe("03 · Onboarding", () => {
  function registerFreshUser() {
    const email = `cypress-ob-${Date.now()}@synapseforge.ai`;
    // Ensure no active session — sign-up page redirects logged-in users to dashboard
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en/sign-up");
    cy.get('input[type="text"]').type("Onboard Tester");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type("Cypress123!");
    cy.get('button[type="submit"]').should("not.be.disabled").click();
    cy.url({ timeout: 15000 }).should("include", "/onboarding");
  }

  it("renders step 1 — business info", () => {
    registerFreshUser();
    cy.contains("Tell us about your business").should("be.visible");
    cy.snap("03-onboard-01-step1");
  });

  it("step 1 — blocks proceed without business name", () => {
    registerFreshUser();
    cy.contains("Continue").click();
    cy.url().should("include", "/onboarding");
    cy.snap("03-onboard-02-step1-validation");
  });

  it("step 1 — proceeds after filling business name + industry", () => {
    registerFreshUser();
    cy.get("input").first().type("Acme Corp");
    cy.get("select").select("Agency");
    cy.contains("Continue").click();
    cy.contains("What do you need AI for?").should("be.visible");
    cy.snap("03-onboard-03-step2");
  });

  it("step 2 — can go back to step 1", () => {
    registerFreshUser();
    cy.get("input").first().type("Test Biz");
    cy.get("select").select("Education");
    cy.contains("Continue").click();
    cy.contains("Back").click();
    cy.contains("Tell us about your business").should("be.visible");
    cy.snap("03-onboard-04-step2-back");
  });

  it("step 2 — shows use case options", () => {
    registerFreshUser();
    cy.get("input").first().type("My Company");
    cy.get("select").select("SaaS / Software");
    cy.contains("Continue").click();
    cy.contains("Customer Support").should("be.visible");
    cy.contains("Sales Assistant").should("be.visible");
    cy.contains("Content Creation").should("be.visible");
    cy.snap("03-onboard-05-step2-options");
  });

  it("step 3 — shows confirmation with business name", () => {
    registerFreshUser();
    cy.get("input").first().type("Acme Inc");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("all set", { matchCase: false }).should("be.visible");
    cy.contains("Acme Inc").should("be.visible");
    cy.snap("03-onboard-06-step3-confirmation");
  });

  it("completes onboarding and reaches dashboard", () => {
    registerFreshUser();
    cy.get("input").first().type("My Business");
    cy.get("select").select("E-commerce");
    cy.contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.contains("Continue").click();
    cy.contains("Go to Dashboard").click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.snap("03-onboard-07-complete");
  });
});
