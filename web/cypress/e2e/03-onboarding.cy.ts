/**
 * 03 · Onboarding Flow
 *
 * Tests the 5-step onboarding wizard:
 *   1. Business info (name + industry)
 *   2. Use case selection
 *   3. AI provider key (optional, can skip)
 *   4. Channel integration (optional, can skip)
 *   5. Launch screen → redirect to dashboard
 *
 * Each test registers a fresh user so the onboarding is never "done".
 */
describe("03 · Onboarding", () => {
  function registerFreshUser() {
    const email = `cypress-ob-${Date.now()}@synapseforge.ai`;
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en/sign-up");
    cy.url({ timeout: 8000 }).should("include", "/sign-up");
    cy.get('input[type="text"]', { timeout: 8000 }).first().type("Onboard Tester");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type("cypress123");
    cy.get('button[type="submit"]').should("not.be.disabled").click();
    cy.url({ timeout: 15000 }).should("include", "/onboarding");
  }

  // ── Step 1 ───────────────────────────────────────────────────────────────

  it("renders step 1 — business info", () => {
    registerFreshUser();
    cy.contains("Tell us about your business").should("be.visible");
    cy.snap("03-onboard-01-step1");
  });

  it("step 1 — Continue is disabled without business name and industry", () => {
    registerFreshUser();
    cy.contains("Continue").should("be.disabled");
    cy.snap("03-onboard-02-step1-validation");
  });

  it("step 1 — Continue enabled after filling both fields", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Corp");
    cy.get("select").select("Agency");
    cy.contains("Continue").should("not.be.disabled");
    cy.snap("03-onboard-02b-step1-valid");
  });

  // ── Step 2 ───────────────────────────────────────────────────────────────

  it("step 1 → step 2 — shows use case options", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Corp");
    cy.get("select").select("Agency");
    cy.contains("Continue").click();
    cy.contains("What do you need AI for?").should("be.visible");
    cy.contains("Customer Support").should("be.visible");
    cy.contains("Sales Assistant").should("be.visible");
    cy.snap("03-onboard-03-step2");
  });

  it("step 2 — can go back to step 1", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Test Biz");
    cy.get("select").select("Education");
    cy.contains("Continue").click();
    cy.contains("Back").click();
    cy.contains("Tell us about your business").should("be.visible");
    cy.snap("03-onboard-04-step2-back");
  });

  it("step 2 — selecting a use case enables Continue", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Company");
    cy.get("select").select("SaaS / Software");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").should("not.be.disabled");
    cy.snap("03-onboard-05-step2-selected");
  });

  // ── Step 3 — AI provider key ─────────────────────────────────────────────

  it("step 2 → step 3 — shows AI provider key screen", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Add your AI provider key").should("be.visible");
    cy.get("[data-testid='provider-openai_api_key']").should("be.visible");
    cy.get("[data-testid='provider-anthropic_api_key']").should("be.visible");
    cy.get("[data-testid='provider-openrouter_api_key']").should("be.visible");
    cy.snap("03-onboard-06-step3-ai-key");
  });

  it("step 3 — selecting provider shows key input", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder='sk-...']", { timeout: 8000 }).should("be.visible");
    cy.snap("03-onboard-07-step3-provider-selected");
  });

  it("step 3 — can skip API key", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Connect a channel").should("be.visible");
    cy.snap("03-onboard-08-step3-skipped");
  });

  // ── Step 4 — Channel ─────────────────────────────────────────────────────

  it("step 4 — shows channel options (Telegram, Discord, Slack)", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Telegram").should("be.visible");
    cy.contains("Discord").should("be.visible");
    cy.contains("Slack").should("be.visible");
    cy.snap("03-onboard-09-step4-channels");
  });

  it("step 4 — can go back to step 3", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Back").click();
    cy.contains("Add your AI provider key").should("be.visible");
    cy.snap("03-onboard-10-step4-back");
  });

  // ── Step 5 — Launch screen ────────────────────────────────────────────────

  it("step 4 → step 5 — shows launch screen after skipping channel", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Inc");
    cy.get("select").select("Healthcare");
    cy.contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();    // skip API key
    cy.contains("Skip").last().click();      // skip channel

    cy.contains("ready to launch", { matchCase: false }).should("be.visible");
    cy.contains("Deploy my agent").should("be.visible");
    cy.snap("03-onboard-11-step5-launch");
  });

  it("step 5 — shows business name in summary", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Business");
    cy.get("select").select("E-commerce");
    cy.contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Skip").last().click();

    cy.contains("Acme Business").should("be.visible");
    cy.snap("03-onboard-12-step5-summary");
  });

  // ── Full flow → dashboard ─────────────────────────────────────────────────

  it("completes full onboarding and reaches dashboard via 'Go to dashboard instead'", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Business");
    cy.get("select").select("SaaS / Software");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();    // skip API key
    cy.contains("Skip").last().click();      // skip channel

    // Launch screen — use "Go to dashboard instead" (secondary CTA)
    cy.contains("Go to dashboard instead").click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.snap("03-onboard-13-complete");
  });

  it("completes onboarding with OpenAI key filled — summary shows provider", () => {
    // Mock the onboarding POST so we don't write to DB
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "mock-instance-id" },
    }).as("onboardingPost");

    // Intercept validate-key so fake key passes and step advances to 4
    cy.intercept("POST", "/api/onboarding/validate-key", {
      statusCode: 200,
      body: { valid: true },
    }).as("validateKey");

    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Test Corp");
    cy.get("select").select("Agency");
    cy.contains("Continue").click();
    cy.contains("Data & Analytics").click();
    cy.contains("Continue").click();

    // Step 3: pick OpenAI + enter key
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder='sk-...']", { timeout: 8000 }).type("sk-test-key-1234");
    cy.contains("Continue").click();
    cy.wait("@validateKey");

    // Wait for step 4 to appear (validateAndAdvance has a 600ms setTimeout before setStep(4))
    cy.contains("Connect a channel", { timeout: 5000 }).should("be.visible");

    // Step 4: skip channel
    cy.contains("Skip").last().click();

    cy.wait("@onboardingPost");

    // Summary should show OpenAI provider label (step 5 summary row)
    cy.contains("AI provider").should("be.visible");
    cy.contains("OpenAI").should("be.visible");
    cy.snap("03-onboard-14-summary-with-key");
  });
});
