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
    // Create a fresh instance to use across all tests in this file
    cy.login(EMAIL(), PASS());
    cy.request({
      method: "POST",
      url: "/api/instances",
      body: { name: "Detail Test Agent", type: "assistant", tier: "minimal" },
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      instanceId = res.body.id;
    });
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => cy.visit(`/en/dashboard/instances/${instanceId}`));
  });

  it("renders the instance detail page — Overview tab", () => {
    cy.contains("Detail Test Agent").should("be.visible");
    cy.contains("Overview").should("be.visible");
    cy.snap("07-detail-01-overview");
  });

  it("shows instance metadata — type, tier, created date", () => {
    cy.contains("Type").should("be.visible");
    cy.contains("Tier").should("be.visible");
    cy.contains("Created").should("be.visible");
    cy.snap("07-detail-02-metadata");
  });

  it("shows start/stop button", () => {
    cy.get("button").contains(/start|stop/i).should("be.visible");
    cy.snap("07-detail-03-start-stop-btn");
  });

  it("starts the instance", () => {
    cy.get("button").contains(/start/i).click();
    cy.contains("running", { timeout: 10000 }).should("be.visible");
    cy.snap("07-detail-04-started");
  });

  it("stops the instance", () => {
    cy.get("button").contains(/stop/i).click();
    cy.contains("stopped", { timeout: 10000 }).should("be.visible");
    cy.snap("07-detail-05-stopped");
  });

  it("shows delete button", () => {
    cy.get("button").find("svg").parents("button").last().should("be.visible");
    cy.snap("07-detail-06-delete-btn");
  });

  describe("Configuration Tab", () => {
    beforeEach(() => cy.contains("Configuration").click());

    it("renders configuration tab", () => {
      cy.contains("AI Model").should("be.visible");
      cy.contains("System Prompt").should("be.visible");
      cy.contains("Temperature").should("be.visible");
      cy.snap("07-detail-07-config-tab");
    });

    it("can change model", () => {
      cy.get("select").select("claude-3-5-sonnet");
      cy.get("select").should("have.value", "claude-3-5-sonnet");
      cy.snap("07-detail-08-config-model");
    });

    it("can edit system prompt", () => {
      cy.get("textarea").clear().type("You are a sales assistant for Cypress Corp.");
      cy.get("textarea").should("contain.value", "sales assistant");
      cy.snap("07-detail-09-config-prompt");
    });

    it("saves configuration and shows success toast", () => {
      cy.get("textarea").clear().type("Updated by Cypress test.");
      cy.contains("Save Configuration").click();
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
      cy.contains("Generate").click();
      cy.contains("New key generated", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-12-apikey-generated");
    });

    it("shows the new key value once", () => {
      cy.get('input[placeholder*="Key name"]').type("Show Once Key");
      cy.contains("Generate").click();
      cy.get("code, pre, .font-mono", { timeout: 8000 }).should("be.visible");
      cy.snap("07-detail-13-apikey-revealed");
    });

    it("shows copy button for new key", () => {
      cy.get('input[placeholder*="Key name"]').type("Copy Key Test");
      cy.contains("Generate").click();
      cy.get("button").find("svg").parents("button").should("be.visible");
      cy.snap("07-detail-14-apikey-copy");
    });

    it("shows usage example curl command", () => {
      cy.contains("curl").should("be.visible");
      cy.snap("07-detail-15-apikey-usage");
    });

    it("revokes an API key", () => {
      cy.get('input[placeholder*="Key name"]').type("To Be Revoked");
      cy.contains("Generate").click();
      cy.wait(500);
      cy.reload();
      cy.contains("API Keys").click();
      cy.contains("To Be Revoked").should("be.visible");
      // Click the X revoke button next to it
      cy.contains("To Be Revoked").closest("div[class]").find("button").last().click();
      cy.on("window:confirm", () => true);
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
      cy.get("body").then(($body) => {
        if ($body.text().includes("No activity")) {
          cy.contains("No activity yet").should("be.visible");
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
