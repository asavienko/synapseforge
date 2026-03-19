/**
 * 03 · Onboarding Flow
 *
 * Tests the 5-step onboarding wizard:
 *   1. Business info (name + industry)
 *   2. Use case selection
 *   3. Channel integration (optional, can skip)
 *   4. AI provider key (optional, can skip)
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

  // ── Step 3 — Channels ────────────────────────────────────────────────────

  it("step 2 → step 3 — shows channel selection screen", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Connect channels").should("be.visible");
    cy.contains("Telegram").should("be.visible");
    cy.contains("Discord").should("be.visible");
    cy.contains("Slack").should("be.visible");
    cy.snap("03-onboard-06-step3-channels");
  });

  it("step 3 — can go back to step 2", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Back").click();
    cy.contains("What do you need AI for?").should("be.visible");
    cy.snap("03-onboard-07-step3-back");
  });

  // ── Step 4 — AI provider key ─────────────────────────────────────────────

  it("step 3 → step 4 — shows AI provider key screen", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.contains("Add your AI provider key").should("be.visible");
    cy.get("[data-testid='provider-openai_api_key']").should("be.visible");
    cy.get("[data-testid='provider-anthropic_api_key']").should("be.visible");
    cy.get("[data-testid='provider-openrouter_api_key']").should("be.visible");
    cy.snap("03-onboard-08-step4-ai-key");
  });

  it("step 4 — selecting provider shows key input", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder='sk-...']", { timeout: 8000 }).should("be.visible");
    cy.snap("03-onboard-09-step4-provider-selected");
  });

  it("step 4 — can skip API key and go to launch screen", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Co");
    cy.get("select").select("Finance");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.contains(/try 20 free sandbox messages first/i).click();
    cy.contains("You're all set!").should("be.visible");
    cy.snap("03-onboard-10-step4-skipped");
  });

  // ── Step 5 — Launch screen ────────────────────────────────────────────────

  it("shows launch screen after skipping API key", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Inc");
    cy.get("select").select("Healthcare");
    cy.contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.contains(/try 20 free sandbox messages first/i).click(); // skip API key

    cy.contains("You're all set!").should("be.visible");
    cy.contains("Go to Dashboard").should("be.visible");
    cy.snap("03-onboard-11-step5-launch");
  });

  it("step 5 — shows business name in summary", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("Acme Business");
    cy.get("select").select("E-commerce");
    cy.contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.contains(/try 20 free sandbox messages first/i).click(); // skip API key

    cy.contains("Acme Business").should("be.visible");
    cy.snap("03-onboard-12-step5-summary");
  });

  // ── Full flow → dashboard ─────────────────────────────────────────────────

  it("completes full onboarding and reaches dashboard via 'Go to Dashboard'", () => {
    registerFreshUser();
    cy.get("input[placeholder='Acme Corp']").type("My Business");
    cy.get("select").select("SaaS / Software");
    cy.contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.contains("Continue").click();
    cy.contains("Continue").click(); // Continue through channels step
    cy.contains(/try 20 free sandbox messages first/i).click(); // skip API key

    // Launch screen — use "Go to Dashboard" button
    cy.contains("Go to Dashboard").click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.snap("03-onboard-13-complete");
  });

  it("completes onboarding with OpenAI key filled — summary shows provider", () => {
    // Mock the onboarding POST so we don't write to DB
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "mock-instance-id" },
    }).as("onboardingPost");

    // Intercept validate-key so fake key passes and step advances to 5
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
    cy.contains("Continue").click(); // Continue through channels step

    // Step 4: pick OpenAI + enter key
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder='sk-...']", { timeout: 8000 }).type("sk-test-key-1234");
    cy.contains("Finish setup").click();
    cy.wait("@validateKey");

    // Wait for step 5 to appear (validateAndFinish has a 400ms setTimeout before setStep(5))
    cy.contains("You're all set!", { timeout: 5000 }).should("be.visible");

    cy.wait("@onboardingPost");

    // Summary should show OpenAI provider label (step 5 summary row)
    cy.contains("AI provider").should("be.visible");
    cy.contains("OpenAI").should("be.visible");
    cy.snap("03-onboard-14-summary-with-key");
  });
});
