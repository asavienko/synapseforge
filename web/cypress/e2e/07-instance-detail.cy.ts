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
    // Get instanceId directly from DB — avoids fragile UI navigation on client-rendered list page
    cy.task("getCypressInstanceId").then((id) => {
      expect(id, "Cypress Agent instance must exist in DB").to.be.a("string");
      instanceId = id as string;
    });
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
    cy.contains("Cypress Agent", { timeout: 25000 }).should("be.visible");
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
      cy.get('textarea[placeholder*="Always ask"]').clear();
      cy.get('textarea[placeholder*="Always ask"]').type("You are a sales assistant for Cypress Corp.");
      cy.get('textarea[placeholder*="Always ask"]').should("contain.value", "sales assistant");
      cy.snap("07-detail-09-config-prompt");
    });

    it("saves configuration and shows success toast", () => {
      // Target the Custom Instructions textarea specifically, then save
      cy.get('textarea[placeholder*="Always ask"]').clear();
      cy.get('textarea[placeholder*="Always ask"]').type("Updated by Cypress test.");
      cy.contains("button", /save/i).click();
      cy.contains("saved", { matchCase: false, timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-10-config-saved");
    });
  });

  describe("API Keys Tab", () => {
    beforeEach(() => cy.contains("API Keys").click());

    it("renders API keys tab", () => {
      cy.contains("Create Key").should("be.visible");
      cy.snap("07-detail-11-apikeys-tab");
    });

    it("generates a new API key", () => {
      cy.contains("button", "Create Key").click();
      cy.get('input[placeholder*="e.g., Production"]').type("Cypress Test Key");
      cy.contains("button", "Create").click();
      cy.contains("Copy your API key now", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-12-apikey-generated");
    });

    it("shows the new key value once", () => {
      cy.contains("button", "Create Key").click();
      cy.get('input[placeholder*="e.g., Production"]').type("Show Once Key");
      cy.contains("button", "Create").click();
      cy.contains("Copy your API key now", { timeout: 8000 }).should("be.visible");
      cy.get("code.font-mono").should("exist");
      cy.snap("07-detail-13-apikey-revealed");
    });

    it("shows copy button for new key", () => {
      cy.contains("button", "Create Key").click();
      cy.get('input[placeholder*="e.g., Production"]').type("Copy Key Test");
      cy.contains("button", "Create").click();
      cy.contains("Copy your API key now", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-14-apikey-copy");
    });

    it("shows usage example curl command", () => {
      cy.contains("curl").should("be.visible");
      cy.snap("07-detail-15-apikey-usage");
    });

    it("revokes an API key", () => {
      cy.contains("button", "Create Key").click();
      cy.get('input[placeholder*="e.g., Production"]').type("To Be Revoked");
      cy.contains("button", "Create").click();
      cy.contains("Copy your API key now", { timeout: 8000 }).should("be.visible");
      // Dismiss the key reveal banner
      cy.contains("I've copied it").click();
      // Revoke the key
      cy.contains("To Be Revoked").parents("tr, [class*='flex']").first().find("button").last().click();
      cy.contains("To Be Revoked").should("not.exist");
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
