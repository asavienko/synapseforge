/**
 * 17 · Chat Tab
 *
 * Tests real AI chat UI — the Chat tab on the instance detail page.
 * External LLM calls are intercepted so no real API keys are required.
 */

const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");

describe("17 · Chat Tab", () => {
  let instanceId: string;

  before(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']", { timeout: 10000 }).first().then(($link) => {
      const href = $link.attr("href") ?? "";
      const match = href.match(/instances\/([^/?]+)/);
      if (match) instanceId = match[1];
    });
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      } else {
        cy.visit("/en/dashboard/instances");
        cy.get("a[href*='/dashboard/instances/']", { timeout: 10000 }).first().click();
      }
    });
    cy.get("main", { timeout: 10000 }).should("be.visible");
  });

  // ── 01. Chat tab exists and is clickable ───────────────────────────────────
  it("Chat tab is visible in the tab bar", () => {
    cy.contains("button", "Chat").should("be.visible");
    cy.snap("17-chat-01-tab-visible");
  });

  // ── 02. Stopped state ─────────────────────────────────────────────────────
  it("shows stopped state when instance is not running", () => {
    // Ensure instance is stopped
    cy.request({
      method: "GET",
      url: instanceId ? `/api/instances/${instanceId}` : "/api/instances",
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body?.status === "running" && instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "stopped" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
      }
    });

    cy.wrap(null).then(() => {
      if (instanceId) cy.visit(`/en/dashboard/instances/${instanceId}`);
    });
    cy.contains("button", "Chat").click();
    cy.get("main").contains("Instance is stopped").should("be.visible");
    cy.snap("17-chat-02-stopped-state");
  });

  // ── 03. Start button from stopped state ───────────────────────────────────
  it("stopped state shows a Start button", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "stopped" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });
    cy.contains("button", "Chat").click();
    cy.get("main").contains("Instance is stopped").should("be.visible");
    // The Start button should be present inside the stopped state card
    cy.get("main").find("button").contains(/start/i).should("be.visible");
    cy.snap("17-chat-03-stopped-start-btn");
  });

  // ── 04. No credentials state ──────────────────────────────────────────────
  it("shows no-credentials state when API returns missingCredential", () => {
    // Ensure instance is running first
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 400,
      body: { error: "No API key configured", missingCredential: true, requiredKey: "openai_api_key" },
    }).as("chatNoCreds");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").should("be.visible").type("Hello");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatNoCreds");

    cy.get("main").contains("One step to start chatting").should("be.visible");
    cy.get("main").find("input[type='password']").should("be.visible");
    cy.snap("17-chat-04-no-credentials");
  });

  // ── 05. Configure credentials link ────────────────────────────────────────
  it("clicking Configure credentials navigates to Credentials tab", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 400,
      body: { error: "No API key configured", missingCredential: true, requiredKey: "openai_api_key" },
    }).as("chatNoCreds2");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").should("be.visible").type("Hello");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatNoCreds2");

    cy.get("main").contains("Advanced setup").click();
    // Should now be on Credentials tab
    cy.get("main").contains("OpenClaw Config").should("be.visible");
    cy.snap("17-chat-05-creds-tab-navigation");
  });

  // ── 06. Successful chat message ────────────────────────────────────────────
  it("sends a message and shows assistant response", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 200,
      body: { response: "Hello! How can I help you today?", latencyMs: 123, model: "gpt-4o", provider: "openai" },
    }).as("chatSuccess");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").should("be.visible").type("Hello there");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatSuccess");

    // User bubble
    cy.get("main").contains("Hello there").should("be.visible");
    // Assistant bubble (latency display removed — streaming rewrite no longer injects latencyMs into chat messages)
    cy.get("main").contains("Hello! How can I help you today?").should("be.visible");
    cy.snap("17-chat-06-successful-message");
  });

  // ── 07. Multi-turn conversation ────────────────────────────────────────────
  it("supports multi-turn conversation", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    let callCount = 0;
    cy.intercept("POST", "/api/instances/*/chat", (req) => {
      callCount++;
      req.reply({
        statusCode: 200,
        body: {
          response: callCount === 1 ? "I am an AI assistant." : "I can answer questions!",
          latencyMs: 100,
          model: "gpt-4o",
          provider: "openai",
        },
      });
    }).as("chatMulti");

    cy.contains("button", "Chat").click();

    // First message
    cy.get("main").find("textarea").type("What are you?");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatMulti");
    cy.get("main").contains("I am an AI assistant.").should("be.visible");

    // Second message
    cy.get("main").find("textarea").type("What can you do?");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatMulti");
    cy.get("main").contains("I can answer questions!").should("be.visible");

    // Both user messages should still be visible
    cy.get("main").contains("What are you?").should("be.visible");
    cy.get("main").contains("What can you do?").should("be.visible");

    cy.snap("17-chat-07-multi-turn");
  });

  // ── 08. Enter key sends message ────────────────────────────────────────────
  it("pressing Enter sends the message", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 200,
      body: { response: "Enter key works!", latencyMs: 50, model: "gpt-4o", provider: "openai" },
    }).as("chatEnter");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").type("Test enter key{enter}");
    cy.wait("@chatEnter");
    cy.get("main").contains("Enter key works!").should("be.visible");
    cy.snap("17-chat-08-enter-to-send");
  });

  // ── 09. Clear conversation ─────────────────────────────────────────────────
  it("clearing the conversation removes all messages", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 200,
      body: { response: "This will be cleared.", latencyMs: 42, model: "gpt-4o", provider: "openai" },
    }).as("chatClear");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").type("Clear me");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatClear");
    cy.get("main").contains("This will be cleared.").should("be.visible");

    // Click Clear button
    cy.get("main").contains("button", "Clear").click();

    // All messages should be gone
    cy.get("main").contains("This will be cleared.").should("not.exist");
    cy.get("main").contains("Clear me").should("not.exist");
    cy.snap("17-chat-09-cleared");
  });

  // ── 10. Error response from LLM ───────────────────────────────────────────
  it("shows error message in chat on gateway error", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.intercept("POST", "/api/instances/*/chat", {
      statusCode: 502,
      body: { error: "OpenAI error 401: Invalid API key" },
    }).as("chatError");

    cy.contains("button", "Chat").click();
    cy.get("main").find("textarea").type("This will fail");
    cy.get("main").find("[data-testid='chat-send-btn']").click();
    cy.wait("@chatError");

    // Error should appear as an assistant message
    cy.get("main").contains("OpenAI error 401: Invalid API key").should("be.visible");
    cy.snap("17-chat-10-error-response");
  });

  // ── 11. Model/provider badge visible ──────────────────────────────────────
  it("shows model name in chat tab header", () => {
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    cy.contains("button", "Chat").click();
    // Model label should be visible (default: gpt-4o)
    cy.get("main").contains(/gpt-4o|claude|gemini/i).should("be.visible");
    cy.snap("17-chat-11-model-badge");
  });

  // Cleanup: restore instance to running state so later specs aren't affected
  after(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "running" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
      }
    });
  });
});
