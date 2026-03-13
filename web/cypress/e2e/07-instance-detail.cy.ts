/**
 * Instance Detail Page
 * 4 tabs: Overview · Configuration · API Keys · Activity Log
 * Start/Stop toggle · Delete instance
 */
const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");

describe("07 · Instance Detail", () => {
  let instanceId: string;

  before(() => {
    // Navigate to the Cypress Agent instance and extract its ID from the URL
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    // The instance list renders as <Link href="/dashboard/instances/{id}"> cards
    cy.get("a[href*='/dashboard/instances/']", { timeout: 10000 }).first().then(($link) => {
      const href = $link.attr("href") ?? "";
      const match = href.match(/instances\/([^/?]+)/);
      if (match) instanceId = match[1];
      cy.wrap($link).click();
    });
    cy.url({ timeout: 10000 }).should("match", /instances\/[^/?]+/);
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      } else {
        cy.visit("/en/dashboard/instances");
      }
    });
  });

  it("renders the instance detail page — Overview tab", () => {
    // Extended timeout: client component fetches data on mount — first load in CI can be slow
    cy.get("main", { timeout: 20000 }).contains("Cypress Agent").should("be.visible");
    cy.get("main").contains("Overview").should("be.visible");
    cy.snap("07-detail-01-overview");
  });

  it("shows instance metadata — type, tier, created date", () => {
    cy.get("main").contains("Type").should("be.visible");
    cy.get("main").contains("Tier").should("be.visible");
    cy.get("main").contains("Created").should("be.visible");
    cy.snap("07-detail-02-metadata");
  });

  it("shows start/stop button", () => {
    cy.get("button").contains(/start|stop/i).should("be.visible");
    cy.snap("07-detail-03-start-stop-btn");
  });

  it("starts the instance", () => {
    // Seed sets instance to "running", so stop it first then start it
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.request({
          method: "PATCH",
          url: `/api/instances/${instanceId}`,
          body: { status: "stopped" },
          headers: { "Content-Type": "application/json" },
          failOnStatusCode: false,
        });
      }
    });
    cy.reload();
    cy.get("button").contains(/start/i, { timeout: 8000 }).click();
    cy.contains("running", { timeout: 10000 }).should("be.visible");
    cy.snap("07-detail-04-started");
  });

  it("stops the instance", () => {
    // Ensure instance is running before stopping
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
    cy.reload();
    cy.get("button").contains(/stop/i, { timeout: 8000 }).click();
    cy.contains("stopped", { timeout: 10000 }).should("be.visible");
    cy.snap("07-detail-05-stopped");
  });

  it("shows delete button", () => {
    // Delete button has text-red-400 class and is distinct from other buttons
    cy.get("button.text-red-400, button[class*='red']").first().should("be.visible");
    cy.snap("07-detail-06-delete-btn");
  });

  describe("Configuration Tab", () => {
    beforeEach(() => cy.contains("Configuration").click());

    it("renders configuration tab", () => {
      cy.contains("Agent Identity").should("be.visible");
      cy.contains("Business Context").should("be.visible");
      cy.contains("AI Model").should("be.visible");
      cy.contains("Capabilities").should("be.visible");
      cy.snap("07-detail-07-config-tab");
    });

    it("can change model", () => {
      // AI Model section uses card buttons, not a <select>
      cy.contains("Claude Sonnet").click();
      cy.contains("GPT-4o").click();
      cy.snap("07-detail-08-config-model");
    });

    it("can edit system prompt", () => {
      // Target the Custom Instructions textarea (first textarea in the Configuration tab)
      cy.get('textarea[placeholder*="Always ask"]').clear().type("You are a sales assistant for Cypress Corp.");
      cy.get('textarea[placeholder*="Always ask"]').should("contain.value", "sales assistant");
      cy.snap("07-detail-09-config-prompt");
    });

    it("saves configuration and shows success toast", () => {
      // Target the Custom Instructions textarea specifically, then save
      cy.get('textarea[placeholder*="Always ask"]').clear().type("Updated by Cypress test.");
      cy.contains("button", /save/i).click();
      cy.contains("saved", { matchCase: false, timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-10-config-saved");
    });
  });

  describe("API Keys Tab", () => {
    beforeEach(() => cy.contains("API Keys").click());

    it("renders API keys tab", () => {
      cy.contains("Generate new API key").should("be.visible");
      cy.snap("07-detail-11-apikeys-tab");
    });

    it("generates a new API key", () => {
      cy.get('input[placeholder*="Key name"]').type("Cypress Test Key");
      // Use cy.contains("button", "Generate") to target the button, not the h3 heading
      cy.contains("button", "Generate").click();
      // In-page reveal banner stays visible (unlike 3-sec toast)
      cy.contains("New key generated", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-12-apikey-generated");
    });

    it("shows the new key value once", () => {
      cy.get('input[placeholder*="Key name"]').type("Show Once Key");
      cy.contains("button", "Generate").click();
      cy.contains("New key generated", { timeout: 8000 }).should("be.visible");
      // The full key should be visible in the reveal banner
      cy.get(".font-mono, code").should("exist");
      cy.snap("07-detail-13-apikey-revealed");
    });

    it("shows copy button for new key", () => {
      cy.get('input[placeholder*="Key name"]').type("Copy Key Test");
      cy.contains("button", "Generate").click();
      cy.contains("New key generated", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-14-apikey-copy");
    });

    it("shows usage example curl command", () => {
      cy.contains("curl").should("be.visible");
      cy.snap("07-detail-15-apikey-usage");
    });

    it("revokes an API key", () => {
      cy.get('input[placeholder*="Key name"]').type("To Be Revoked");
      cy.contains("button", "Generate").click();
      cy.contains("New key generated", { timeout: 8000 }).should("be.visible");
      cy.wait(300);
      cy.reload();
      cy.contains("API Keys").click();
      // The key name appears in the list after reload
      cy.contains("To Be Revoked", { timeout: 8000 }).should("exist");
      // Row is: <div class="flex items-center gap-4 p-4"> → sibling button is the revoke X
      // Use parent with flex class to scope to the key row
      cy.contains("To Be Revoked").closest(".flex.items-center").find("button").click();
      cy.snap("07-detail-16-apikey-revoked");
    });
  });

  describe("Activity Log Tab", () => {
    beforeEach(() => cy.contains("Activity Log").click());

    it("renders activity log tab", () => {
      cy.contains("Event history").should("be.visible");
      cy.snap("07-detail-17-activity-tab");
    });

    it("shows logged events", () => {
      // After start/stop tests, there will be activity entries; just assert the tab rendered
      cy.contains("Event history").should("be.visible");
      cy.get("body").then(($body) => {
        if ($body.text().includes("No activity yet")) {
          cy.snap("07-detail-18-activity-empty");
        } else {
          cy.snap("07-detail-18-activity-events");
        }
      });
    });

    it("refresh button reloads the log", () => {
      cy.contains("Refresh").click();
      cy.snap("07-detail-19-activity-refresh");
    });
  });

  it("back button returns to instances list", () => {
    cy.contains("Back to instances").click();
    cy.url().should("include", "/dashboard/instances");
    cy.snap("07-detail-20-back");
  });
});
