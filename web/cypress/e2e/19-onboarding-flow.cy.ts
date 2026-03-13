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
  it("navigates to step 3 — AI provider key", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.contains("Add your AI provider key").should("be.visible");
    cy.contains("OpenAI").should("be.visible");
    cy.contains("Anthropic").should("be.visible");
    cy.contains("OpenRouter").should("be.visible");
    cy.snap("19-onboarding-05-step3");
  });

  // ── 06. Step 3 — provider picker shows key input ──────────────────────────
  it("selecting OpenAI shows key input field", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.contains("OpenAI").click();
    cy.get("input[placeholder='sk-...']").should("be.visible");
    cy.snap("19-onboarding-06-step3-openai-selected");
  });

  // ── 07. Step 3 — Continue disabled without key ────────────────────────────
  it("Continue is disabled when provider selected but key empty", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.contains("OpenAI").click();
    cy.get("button").contains("Continue").should("be.disabled");
    cy.snap("19-onboarding-07-step3-disabled");
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

    cy.contains("OpenAI").click();
    cy.get("input[placeholder='sk-...']").type("sk-test-fake-key-abc123");
    cy.get("button").contains("Continue").click();
    cy.wait("@validateKey");

    cy.contains("Connect a channel").should("be.visible");
    cy.contains("Telegram").should("be.visible");
    cy.contains("Discord").should("be.visible");
    cy.snap("19-onboarding-08-step4");
  });

  // ── 09. Step 3 → Skip → Step 4 ───────────────────────────────────────────
  it("can skip the API key step", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();

    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Connect a channel").should("be.visible");
    cy.snap("19-onboarding-09-step3-skipped");
  });

  // ── 10. Step 4 — channel selection shows token input ─────────────────────
  it("selecting Telegram in step 4 shows token input", () => {
    cy.visit("/en/onboarding");
    cy.get("input[placeholder='Acme Corp']").type("TestCo");
    cy.get("select").select("SaaS / Software");
    cy.get("button").contains("Continue").click();
    cy.contains("Customer Support").click();
    cy.get("button").contains("Continue").click();
    cy.contains(/try 20 free|skip for now/i).click();

    cy.get("button").contains("Telegram").first().click();
    cy.get("input").should("have.attr", "placeholder").and("include", "1234567890");
    cy.snap("19-onboarding-10-step4-telegram");
  });

  // ── 11. Full flow → step 5 (launch screen) ───────────────────────────────
  it("completes full onboarding and reaches launch screen", () => {
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
    cy.contains(/try 20 free|skip for now/i).click(); // skip API key

    // Step 4: finish without channel
    cy.contains("Skip").last().click();

    cy.wait("@onboardingPost");
    cy.contains("You're ready to launch").should("be.visible");
    cy.contains("Deploy my agent").should("be.visible");
    cy.snap("19-onboarding-11-launch-screen");
  });

  // ── 12. Launch screen — credentials summary shown ─────────────────────────
  it("launch screen shows filled credentials in summary", () => {
    cy.intercept("POST", "/api/onboarding", {
      statusCode: 200,
      body: { ok: true, instanceId: "test-instance-id-123" },
    }).as("onboardingPost2");

    // Intercept validate-key so fake key passes and step advances to 4
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

    cy.contains("OpenAI").click();
    cy.get("input[placeholder='sk-...']").type("sk-test-key");
    cy.get("button").contains("Continue").click();
    cy.wait("@validateKey2");

    cy.get("button").contains("Telegram").first().click();
    cy.get("input").filter("[placeholder*='1234567890']").type("123456:testtoken");
    cy.contains("button", "Finish setup").click();

    cy.wait("@onboardingPost2");
    cy.contains("OpenAI").should("be.visible");
    cy.contains("Telegram").should("be.visible");
    cy.snap("19-onboarding-12-summary-with-creds");
  });

  // ── 13. Deploy button redirects to instance ───────────────────────────────
  it("Deploy my agent button navigates to instance page", () => {
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
    cy.contains(/try 20 free|skip for now/i).click();
    cy.contains("Skip").last().click();

    cy.wait("@onboardingPost3");
    cy.contains("Deploy my agent").click();
    cy.url().should("include", "/instances/test-instance-id-xyz");
    cy.snap("19-onboarding-13-redirect");
  });
});

// ─── Dashboard Getting Started checklist ──────────────────────────────────────

describe("19 · Dashboard — Getting Started checklist", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
  });

  it("checklist shows the new steps", () => {
    cy.visit("/en/dashboard");
    // Should show new step labels
    cy.get("main").contains(/Account created|AI provider key|Deploy|channel|Manager/i).should("exist");
    cy.snap("19-dashboard-checklist-new-steps");
  });

  it("Account created step is always checked", () => {
    cy.visit("/en/dashboard");
    // Find the getting started section if visible
    cy.get("main").then(($main) => {
      if ($main.text().includes("Account created")) {
        cy.get("main").contains("Account created")
          .parents("div").first()
          .find("svg").should("exist"); // CheckCircle2
      }
    });
    cy.snap("19-dashboard-checklist-account-checked");
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
    cy.get("main").then(($main) => {
      if ($main.text().includes("AI provider key")) {
        // The step should be undone (no LLM key) → renders as <a> link
        cy.get("main").contains(/AI provider key/i)
          .closest("a, [href]")
          .should("have.attr", "href")
          .and("include", "/instances/");
      }
    });
    cy.snap("19-dashboard-checklist-llm-link");
  });
});
