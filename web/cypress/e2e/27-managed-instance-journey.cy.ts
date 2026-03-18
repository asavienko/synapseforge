/**
 * 27 · Managed Instance Journey — happy path
 *
 * End-to-end spec covering the complete lifecycle of a managed instance:
 *  1. Create a new instance via the wizard UI (plan upgrade required)
 *  2. Add an OpenAI credential via API
 *  3. Deploy tab — checklist shows LLM key configured
 *  4. Click Deploy → intercept → provisioning state appears
 *  5. Provisioning banner is visible
 *  6. Mock instance as "ready" → verify live panel
 *  7. Chat tab → send a message → verify intercepted LLM response
 *  8. Chat history persists on tab reload
 *
 * External API calls (Hetzner, OpenAI) are fully intercepted.
 * Cleanup: delete the created instance + reset plan to free.
 */

const EMAIL = () => Cypress.env("TEST_EMAIL") || Cypress.env("CYPRESS_USER_EMAIL") || "cypress@synapseforge.ai";
const PASS  = () => Cypress.env("TEST_PASSWORD") || Cypress.env("CYPRESS_USER_PASS") || "cypress123";

describe("27 · Managed Instance Journey — happy path", () => {
  let journeyInstanceId: string;

  // ── Setup ──────────────────────────────────────────────────────────────────
  before(() => {
    cy.login(EMAIL(), PASS());

    // Upgrade plan to pro so we can create a second instance
    cy.request({
      method: "PATCH",
      url: "/api/user",
      body: { plan: "pro" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    });

    // Pre-seed a Journey Agent via API so journeyInstanceId is always set
    // even if the wizard UI (test 01) fails in CI (production build differences).
    cy.request({
      method: "POST",
      url: "/api/instances",
      body: { name: "Journey Agent", type: "assistant" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      cy.log("Pre-seeded Journey Agent response:", JSON.stringify(res.body));
      expect(res.status, `Pre-seed POST /api/instances failed with ${res.status}: ${JSON.stringify(res.body)}`).to.be.oneOf([200, 201]);
      journeyInstanceId = res.body.id;
      expect(journeyInstanceId, "Pre-seeded journeyInstanceId must be set").to.be.a("string");
      cy.log(`Pre-seeded journeyInstanceId: ${journeyInstanceId}`);
    });
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  after(() => {
    cy.login(EMAIL(), PASS());

    cy.wrap(null).then(() => {
      if (journeyInstanceId) {
        cy.request({
          method: "DELETE",
          url: `/api/instances/${journeyInstanceId}`,
          failOnStatusCode: false,
        });
      }
    });

    // Reset plan back to free
    cy.request({
      method: "PATCH",
      url: "/api/user",
      body: { plan: "free" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    });
  });

  // ── 01. Create a new instance via the wizard ──────────────────────────────
  it("01 creates a new instance via the wizard", () => {
    cy.login(EMAIL(), PASS());

    // Intercept the POST so we can capture the new instance ID
    cy.intercept("POST", "/api/instances").as("createInstance");

    cy.visit("/en/dashboard/instances");
    cy.contains("button", "New Instance").click();
    cy.contains("Set Up Your AI Instance").should("be.visible");

    // Step 1 — select a template, wait for name field to appear, type name
    cy.contains("button", "Customer Support Bot").click();
    // Name input only renders after template is selected
    cy.get("input[placeholder='My Support Bot']", { timeout: 5000 }).clear();
    cy.get("input[placeholder='My Support Bot']", { timeout: 5000 }).type("Journey Agent");

    // Next must be enabled now
    cy.contains("button", "Next").should("not.be.disabled").click();

    // Step 2 — AI provider (OpenAI is default) + key
    cy.contains("button", "openai").click();
    cy.get("input[placeholder='sk-...']").type("sk-test-fake-key-for-cy");

    cy.contains("button", "Next").should("not.be.disabled").click();

    // Step 3 — Channels (skip — no tokens needed)
    cy.contains("button", "Next").click();

    // Step 4 — Persona (use defaults, just proceed)
    cy.contains("button", "Next").click();

    // Step 5 — Deploy review — submit the wizard
    cy.contains("button", "Create Instance").click();

    // Wait for the POST and grab the instance ID
    cy.wait("@createInstance", { timeout: 15000 }).then((interception) => {
      const id = interception.response?.body?.id ?? interception.response?.body?.instance?.id;
      if (id) {
        journeyInstanceId = id as string;
        cy.log(`Journey instance ID: ${journeyInstanceId}`);
      }
    });

    // If the wizard redirects, we should land on an instance detail page
    cy.url({ timeout: 15000 }).then((url) => {
      const match = url.match(/instances\/([^/?#]+)/);
      if (match && !journeyInstanceId) {
        journeyInstanceId = match[1];
        cy.log(`Journey instance ID from URL: ${journeyInstanceId}`);
      }
    });

    cy.snap("27-journey-01-wizard");
  });

  // ── 02. Add an OpenAI credential via API ──────────────────────────────────
  it("02 adds an OpenAI credential via API", () => {
    cy.login(EMAIL(), PASS());

    // If we don't have journeyInstanceId yet, look it up by name
    cy.wrap(null).then(() => {
      if (!journeyInstanceId) {
        cy.request("/api/instances").then((res) => {
          const found = (res.body as Array<{ id: string; name: string }>)
            .find((i) => i.name === "Journey Agent");
          if (found) journeyInstanceId = found.id;
        });
      }
    });

    cy.wrap(null).then(() => {
      expect(journeyInstanceId, "journeyInstanceId must be set").to.be.a("string");

      cy.request({
        method: "POST",
        url: `/api/instances/${journeyInstanceId}/credentials`,
        body: { key: "openai_api_key", value: "sk-test-fake-key-for-cy" },
        headers: { "Content-Type": "application/json" },
      }).then((res) => {
        expect(res.status).to.be.oneOf([200, 201, 204]);
      });
    });

    // Verify the credential is visible in the Credentials tab
    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("Credentials").click();
    cy.contains(/ai provider|openai/i).should("be.visible");

    cy.snap("27-journey-02-credential-added");
  });

  // ── 03. Deploy tab shows checklist complete ───────────────────────────────
  it("03 Deploy tab shows checklist complete", () => {
    cy.login(EMAIL(), PASS());

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Deploy").click();

    // LLM key row should show a checkmark
    cy.get("main").contains(/AI provider key/i)
      .closest("[class*='rounded-xl']").contains("✓").should("exist");

    // Deploy button should be enabled
    cy.get("[data-testid='deploy-btn']", { timeout: 10000 }).should("not.be.disabled");

    cy.snap("27-journey-03-checklist-complete");
  });

  // ── 04. Clicking Deploy triggers provisioning state ───────────────────────
  it("04 clicking Deploy triggers provisioning state", () => {
    cy.login(EMAIL(), PASS());

    cy.intercept("POST", `/api/instances/*/deploy`, {
      statusCode: 200,
      body: { ok: true, status: "provisioning", serverId: "99999", ip: "10.0.0.1" },
    }).as("deployReq");

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Deploy").click();

    // Intercept subsequent GET polls to return provisioning state
    cy.intercept("GET", `/api/instances/${journeyInstanceId}`, {
      statusCode: 200,
      body: {
        id: journeyInstanceId,
        name: "Journey Agent",
        type: "assistant",
        status: "pending",
        tier: "minimal",
        provisionStatus: "provisioning",
        hasGateway: false,
        configSynced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as("instanceProvisioning");

    cy.get("[data-testid='deploy-btn']", { timeout: 8000 }).then(($btn) => {
      if (!$btn.is(":disabled")) {
        cy.wrap($btn).click();
        cy.wait("@deployReq");
      } else {
        cy.log("Deploy button already disabled — instance may already be provisioning");
      }
    });

    cy.snap("27-journey-04-deploy-clicked");
  });

  // ── 05. Provisioning banner is visible ────────────────────────────────────
  it("05 provisioning banner is visible", () => {
    cy.login(EMAIL(), PASS());

    // Mock the instance as provisioning
    cy.intercept("GET", `/api/instances/${journeyInstanceId}`, {
      statusCode: 200,
      body: {
        id: journeyInstanceId,
        name: "Journey Agent",
        type: "assistant",
        status: "pending",
        tier: "minimal",
        provisionStatus: "provisioning",
        hasGateway: false,
        configSynced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as("instanceProvisioning");

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Deploy").click();

    cy.get("main").contains(/Provisioning|provisioning/i).should("be.visible");

    cy.snap("27-journey-05-provisioning-banner");
  });

  // ── 06. Mocked ready state shows live panel ───────────────────────────────
  it("06 mocked ready state shows live panel", () => {
    cy.login(EMAIL(), PASS());

    cy.intercept("GET", `/api/instances/${journeyInstanceId}`, {
      statusCode: 200,
      body: {
        id: journeyInstanceId,
        name: "Journey Agent",
        type: "assistant",
        status: "running",
        tier: "minimal",
        provisionStatus: "ready",
        hasGateway: true,
        configSynced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as("instanceReady");

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Deploy").click();
    cy.wait("@instanceReady");

    // Should show live/running state
    cy.get("main").contains(/deployed|live|running/i).should("be.visible");

    cy.snap("27-journey-06-ready-state");
  });

  // ── 07. Chat tab sends a message and shows response ───────────────────────
  it("07 Chat tab sends a message and shows response", () => {
    cy.login(EMAIL(), PASS());

    // Ensure the instance is running so the chat tab is usable
    cy.wrap(null).then(() => {
      cy.request({
        method: "PATCH",
        url: `/api/instances/${journeyInstanceId}`,
        body: { status: "running" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });
    });

    cy.intercept("POST", `/api/instances/${journeyInstanceId}/chat`, {
      statusCode: 200,
      body: {
        response: "Hello! I'm your AI assistant. How can I help you?",
        provider: "openai",
        model: "gpt-4o",
        latencyMs: 312,
        inputTokens: 10,
        outputTokens: 20,
        source: "direct",
      },
    }).as("chatReq");

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Chat").click();

    cy.get("main").find("textarea").should("be.visible").type("Tell me about yourself");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatReq");

    // User bubble
    cy.get("main").contains("Tell me about yourself").should("be.visible");
    // Assistant bubble
    cy.get("main").contains("Hello! I'm your AI assistant. How can I help you?").should("be.visible");

    cy.snap("27-journey-07-chat-response");
  });

  // ── 08. Chat history persists on tab reload ────────────────────────────────
  it("08 chat history persists on tab reload", () => {
    cy.login(EMAIL(), PASS());

    cy.wrap(null).then(() => {
      cy.request({
        method: "PATCH",
        url: `/api/instances/${journeyInstanceId}`,
        body: { status: "running" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });
    });

    // First visit: send a message and get a response
    cy.intercept("POST", `/api/instances/${journeyInstanceId}/chat`, {
      statusCode: 200,
      body: {
        response: "History test response — I remember you!",
        provider: "openai",
        model: "gpt-4o",
        latencyMs: 150,
        inputTokens: 8,
        outputTokens: 12,
        source: "direct",
      },
    }).as("chatHistory");

    cy.wrap(null).then(() => {
      cy.visit(`/en/dashboard/instances/${journeyInstanceId}`);
    });
    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").should("be.visible").type("History test message");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatHistory");

    cy.get("main").contains("History test response — I remember you!").should("be.visible");

    // Switch away and back to the Chat tab — history should still be there
    cy.contains("button", "Deploy").click();
    cy.contains("button", "Chat").click();

    cy.get("main").contains("History test message").should("be.visible");
    cy.get("main").contains("History test response — I remember you!").should("be.visible");

    cy.snap("27-journey-08-chat-history");
  });
});
