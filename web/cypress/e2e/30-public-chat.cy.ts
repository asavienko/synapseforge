/**
 * Spec 30 — Public Chat Page + Embeddable Widget
 *
 * Covers:
 *  1. Public chat page renders branded UI (agent name, welcome, badge, input)
 *  2. Sending a message renders the assistant reply (intercepted)
 *  3. Non-existent instance returns 404
 *  4. widget.js injects the chat bubble button and container
 *  5. Widget bubble opens and closes the iframe on click
 */

const EMAIL = "cypress@synapseforge.ai";
const PASS = "cypress123";

describe("30 · Public Chat Page + Widget", () => {
  let instanceId: string;

  before(() => {
    // Login and grab the Cypress Agent instance ID
    cy.login(EMAIL, PASS);
    cy.request("/api/instances").then((res) => {
      const inst = (res.body as Array<{ id: string; name: string }>).find(
        (i) => i.name === "Cypress Agent"
      );
      expect(inst, "Cypress Agent instance must exist").to.exist;
      instanceId = inst!.id;

      // Ensure instance is running — production build page.tsx calls notFound() if not
      cy.request({
        method: "PATCH",
        url: `/api/instances/${inst!.id}`,
        body: { status: "running" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });
    });
  });

  // ── Test 1: Branded UI renders ────────────────────────────────────────────
  it("renders the public chat page with agent name and welcome message", () => {
    cy.visit(`/chat/${instanceId}`);

    // Agent name in header
    cy.contains("Cypress Agent").should("be.visible");

    // Welcome message (set by server: `Hi! I'm ${instance.name}. How can I help you today?`)
    cy.contains(/Hi! I'm Cypress Agent/i).should("be.visible");

    // "Powered by SynapseForge" badge in header
    cy.contains("Powered by SynapseForge").should("be.visible");

    // Message input visible
    cy.get('input[placeholder]').should("be.visible");

    cy.snap("30-public-01-initial");
  });

  // ── Test 2: Send a message and receive reply ──────────────────────────────
  it("sends a message and renders the assistant reply", () => {
    cy.intercept("POST", `/api/chat/${instanceId}`, {
      statusCode: 200,
      body: {
        response: "Hello! I'm happy to help you today.",
        model: "gpt-4o-mini",
        provider: "openai",
        latencyMs: 245,
        inputTokens: 10,
        outputTokens: 12,
      },
    }).as("chatReply");

    cy.visit(`/chat/${instanceId}`);

    // Type and submit via Enter key (onKeyDown handler in PublicChatUI)
    cy.get('input[placeholder="Type a message…"]').type("Hello there{enter}");

    cy.wait("@chatReply");

    // User message visible
    cy.contains("Hello there").should("be.visible");

    // Assistant reply visible
    cy.contains("Hello! I'm happy to help you today.").should("be.visible");

    cy.snap("30-public-02-message-reply");
  });

  // ── Test 3: 404 for unknown / non-running instance ────────────────────────
  it("returns 404 for unknown instance ID", () => {
    cy.request({
      url: "/chat/nonexistent-instance-id-00000000",
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 404);
  });

  // ── Helper: inject widget on current page ─────────────────────────────────
  function injectWidget(instanceIdVal: string) {
    cy.visit("/", {
      onLoad: (win) => {
        (win as Window & { SynapseForge?: unknown }).SynapseForge = {
          instanceId: instanceIdVal,
          baseUrl: "http://localhost:3000",
        };
      },
    });

    cy.window().then((win) => {
      const script = win.document.createElement("script");
      script.src = "http://localhost:3000/widget.js";
      win.document.body.appendChild(script);
    });
  }

  // ── Test 4: Widget injects bubble + container ─────────────────────────────
  it("widget.js injects the chat bubble and iframe container", () => {
    injectWidget(instanceId);

    // Button must appear
    cy.get("#sf-chat-btn", { timeout: 5000 }).should("be.visible");

    // Container must exist (closed by default)
    cy.get("#sf-chat-container").should("exist");

    cy.snap("30-public-04-widget-injected");
  });

  // ── Test 5: Widget opens and closes on click ──────────────────────────────
  it("widget bubble opens and closes the iframe on click", () => {
    injectWidget(instanceId);

    cy.get("#sf-chat-btn", { timeout: 5000 }).should("be.visible");

    // Initially the container is hidden (display:none)
    cy.get("#sf-chat-container").should("have.css", "display", "none");

    // Click to open → display:block
    cy.get("#sf-chat-btn").click();
    cy.get("#sf-chat-container").should("have.css", "display", "block");

    // Click to close → widget.js uses a 200 ms setTimeout before setting display:none
    cy.get("#sf-chat-btn").click();
    cy.get("#sf-chat-container", { timeout: 2000 }).should(
      "have.css",
      "display",
      "none"
    );

    cy.snap("30-public-05-widget-closed");
  });
});
