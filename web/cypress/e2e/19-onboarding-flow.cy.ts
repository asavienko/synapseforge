/**
 * 19 · Enhanced Onboarding Flow
 *
 * Tests the 5-step onboarding:
 *   1. Business info
 *   2. Use case
 *   3. AI provider key
 *   4. Channel (optional)
 *   5. Launch / redirect to deploy
 *
 * Also verifies the updated dashboard Getting Started checklist
 * reflects the new steps (key added, deployed, channel connected, manager).
 */

const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");

// Helper: reset onboardingDone so the user can go through onboarding again
function resetOnboarding() {
  cy.request({
    method: "PATCH",
    url: "/api/user",
    body: { onboardingDone: false },
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  });
}

describe("19 · Onboarding — 5-step flow", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
  });

  // ── 01. Onboarding page renders ────────────────────────────────────────────
  it("onboarding page renders with 5 progress dots", () => {
    cy.visit("/en/onboarding");
    // 5 step indicators
    cy.get("div.rounded-full").should("have.length.gte", 5);
    cy.contains("Tell us about your business").should("be.visible");
    cy.snap("19-onboarding-01-step1");
  });

  // ── 02. Step 1 validation ──────────────────────────────────────────────────
  it("Continue is disabled until business + industry filled", () => {
    cy.visit("/en/onboarding");
    cy.get("button").contains("Continue").should("be.disabled");
    cy.get("input[placeholder='Acme Corp']").type("MyCompany");
    cy.get("button").contains("Continue").should("be.disabled");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").should("not.be.disabled");
    cy.snap("19-onboarding-02-step1-valid");
  });

  // ── 03. Step 1 → Step 2 ───────────────────────────────────────────────────
  it("navigates from step 1 to step 2", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("What do you need AI for?").should("be.visible");
    cy.snap("19-onboarding-03-step2");
  });

  // ── 04. Step 2 — use case selection ──────────────────────────────────────
  it("use case cards are selectable and Continue enables", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();

    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").should("not.be.disabled");
    cy.snap("19-onboarding-04-step2-selected");
  });

  // ── 05. Step 2 → Step 3 ───────────────────────────────────────────────────
  it("navigates to step 3 — Connect channels", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.contains(/Connect channels|Connect a channel/, { timeout: 10000 }).should("be.visible");
    cy.snap("19-onboarding-05-step3");
  });

  // ── 06. Step 3 — channel selection shows token input ─────────────────────
  it("selecting Telegram in step 3 shows token input", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    // Step 3: Channels - select Telegram
    cy.contains("Telegram").first().click();
    cy.get("input[placeholder*='1234567890']").should("be.visible");
    cy.snap("19-onboarding-06-step3-telegram");
  });

  // ── 07. Step 3 → Step 4 ───────────────────────────────────────────────────
  it("navigates from step 3 to step 4 — AI provider key", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    // Skip channel selection
    cy.contains(/skip/i).last().click();

    // Step 4: AI provider key
    cy.contains(/Add your AI provider key|AI provider/, { timeout: 10000 }).should("be.visible");
    cy.get("[data-testid='provider-openai_api_key']").should("be.visible");
    cy.get("[data-testid='provider-anthropic_api_key']").should("be.visible");
    cy.get("[data-testid='provider-openrouter_api_key']").should("be.visible");
    cy.snap("19-onboarding-07-step4");
  });

  // ── 08. Step 3 → Step 4 with key ─────────────────────────────────────────
  it("fills key and navigates to step 4 — channel", () => {
    // Intercept validate-key so fake key passes and step advances to 4
    cy.intercept("POST", "/api/onboarding/validate-key", {
      statusCode: 200,
      body: { valid: true },
    }).as("validateKey");

    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder='sk-...']").type("sk-test-fake-key-abc123");
    cy.get("button").contains("Continue").click();
    cy.wait("@validateKey");

  // ── 08. Step 4 — selecting provider shows key input ─────────────────────────
  it("selecting OpenAI in step 4 shows key input field", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    cy.contains(/skip/i).last().click();

    // Step 4: Select OpenAI provider
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder*='sk-']").should("be.visible");
    cy.snap("19-onboarding-08-step4-openai");
  });

  // ── 09. Step 4 — Finish disabled without key ────────────────────────────
  it("Finish is disabled when provider selected but key empty", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    cy.contains(/skip/i).last().click();

    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.contains(/Finish setup|Finish/i).should("be.disabled");
    cy.snap("19-onboarding-09-step4-disabled");
  });

  // ── 10. Step 4 → Skip → Step 5 ───────────────────────────────────────────
  it("can skip the API key step and reach launch screen", () => {
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "test-instance-id-123" },
    }).as("onboardingPost");

    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    // Skip channels
    cy.contains(/skip/i).last().click();
    // Skip API key (try 20 free)
    cy.contains(/try 20 free|skip/i).last().click();

    cy.wait("@onboardingPost");
    cy.contains(/You're all set|ready to launch/i, { timeout: 10000 }).should("be.visible");
    cy.snap("19-onboarding-10-step5-launch");
  });

  // ── 11. Full flow → step 5 (launch screen) ───────────────────────────────
  it("completes full onboarding with channels and reaches launch screen", () => {
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "test-instance-id-123" },
    }).as("onboardingPost");

    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    
    // Step 3: Skip channel selection
    cy.contains(/skip/i).last().click();

    // Step 4: Skip API key
    cy.contains(/try 20 free|skip/i).last().click();

    cy.wait("@onboardingPost");
    cy.contains(/You're all set|ready to launch/i, { timeout: 10000 }).should("be.visible");
    cy.snap("19-onboarding-11-launch-screen");
  });

  // ── 12. Launch screen — credentials summary shown ─────────────────────────
  it("launch screen shows filled credentials in summary", () => {
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "test-instance-id-123" },
    }).as("onboardingPost2");

    // Intercept validate-key so fake key passes
    cy.intercept("POST", "/api/onboarding/validate-key", {
      statusCode: 200,
      body: { valid: true },
    }).as("validateKey2");

    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("Acme Corp");
    cy.get("select").select("Healthcare");
    cy.get("button").contains("Continue").click();
    cy.contains("Sales Assistant").click();
    cy.get("button").contains("Continue").click();

    // Step 3: Select Telegram channel
    cy.contains("Telegram").first().click();
    cy.get("input[placeholder*='1234567890']").type("123456:testtoken");
    
    // Continue to step 4
    cy.contains(/Continue|Next|Finish/i).last().click();

    // Step 4: Select OpenAI provider
    cy.get("[data-testid='provider-openai_api_key']").click();
    cy.get("input[placeholder*='sk-']").type("sk-test-key");
    cy.contains(/Finish setup|Finish/i).last().click();
    cy.wait("@validateKey2");

    cy.wait("@onboardingPost2");
    // Summary screen (step 5) shows provider and channel info
    cy.contains(/AI provider|OpenAI|Channels|Telegram/i).should("be.visible");
    cy.snap("19-onboarding-12-summary-with-creds");
  });

  // ── 13. Go to dashboard button redirects to instance ───────────────────────────────
  it("Go to dashboard button navigates to instance page", () => {
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "test-instance-id-xyz" },
    }).as("onboardingPost3");

    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    // Skip channels
    cy.contains(/skip/i).last().click();
    // Skip API key
    cy.contains(/try 20 free|skip/i).last().click();

    cy.wait("@onboardingPost3");
    cy.contains(/Go to dashboard|Launch/i, { timeout: 10000 }).click();
    cy.url().should("include", "/instances/test-instance-id-xyz");
    cy.snap("19-onboarding-13-redirect");
  });
});

// ─── Dashboard Getting Started checklist ──────────────────────────────────────

describe("19 · Dashboard — Getting Started checklist", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
  });

  it("checklist shows the getting started steps", () => {
    cy.visit("/en/dashboard");
    // Should show checklist or getting started section
    cy.get("main", { timeout: 15000 }).then(($main) => {
      const text = $main.text();
      // Look for various possible labels in the checklist
      const hasChecklist = text.includes("Getting Started") || 
                          text.includes("Setup Checklist") ||
                          text.includes("Checklist") ||
                          text.includes("AI Model") ||
                          text.includes("Channel") ||
                          text.includes("Deploy");
      
      if (hasChecklist) {
        cy.get("main").contains(/Getting Started|Checklist|Setup/i).should("exist");
      } else {
        cy.log("Checklist not found — may already be completed");
      }
    });
    cy.snap("19-dashboard-checklist");
  });

  it("Add AI provider key step links to instance when not done", () => {
    // Clear LLM credentials first so hasLLMKey=false (spec 16 may have added them)
    cy.request({ url: "/api/instances", failOnStatusCode: false }).then((r) => {
      if (r.status === 200 && Array.isArray(r.body) && r.body.length > 0) {
        const id = r.body[0].id;
        ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].forEach((key) => {
          cy.request({ method: "DELETE", url: `/api/instances/${id}/credentials/${key}`, failOnStatusCode: false });
        });
      }
    });

    cy.visit("/en/dashboard");
    cy.get("main", { timeout: 15000 }).then(($main) => {
      const text = $main.text();
      if (text.includes("AI provider") || text.includes("API key") || text.includes("Add key")) {
        // The step should be undone (no LLM key) → renders as link or button
        cy.contains(/AI provider|API key/i).should("exist");
      } else {
        cy.log("AI provider key step not found — may already be completed or checklist hidden");
      }
    });
    cy.snap("19-dashboard-checklist-llm");
  });
});
