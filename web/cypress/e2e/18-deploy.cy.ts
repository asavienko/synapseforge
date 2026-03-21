/**
 * 18 · Deploy Tab
 *
 * Tests the Deploy tab which shows:
 * - Quick-connect banner when LLM is ready but no channel
 * - Channel setup options (Telegram, QR code, embed)
 * - Connection status
 *
 * Note: Instances now auto-start in sandbox mode, so there's no
 * manual "Deploy" button anymore.
 */

const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");

function getInstanceId() {
  return cy.request("/api/instances").then((res) => {
    expect(res.body).to.have.length.greaterThan(0);
    return res.body[0].id as string;
  });
}

describe("18 · Deploy Tab", () => {
  let instanceId: string;

  before(() => {
    cy.login(EMAIL(), PASS());
    getInstanceId().then((id) => { instanceId = id; });
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => {
      if (instanceId) cy.visit(`/en/dashboard/instances/${instanceId}`);
      else {
        cy.visit("/en/dashboard/instances");
        cy.get("a[href*='/dashboard/instances/']").first().click();
      }
    });
    cy.get("main", { timeout: 10000 }).should("be.visible");
  });

  // ── 01. Deploy tab is visible ──────────────────────────────────────────────
  it("Deploy tab is visible in the tab bar", () => {
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).should("be.visible");
    cy.snap("18-deploy-01-tab-visible");
  });

  // ── 02. Tab content loads ─────────────────────────────────────────────────
  it("Deploy tab shows channel setup section", () => {
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();
    // Should show channel options (Telegram, QR code, embed)
    cy.get("main").contains(/telegram|qr code|embed|channel/i).should("be.visible");
    cy.snap("18-deploy-02-content");
  });

  // ── 03. With LLM → shows quick-connect banner ────────────────────────────
  it("shows quick-connect banner when LLM is configured but no channels", () => {
    // Ensure LLM credential exists
    cy.wrap(null).then(() => {
      if (!instanceId) return;
      return cy.request({
        method: "POST",
        url: `/api/instances/${instanceId}/credentials`,
        body: { key: "openai_api_key", value: "sk-test-fake-key-for-testing" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });
    });

    // Remove any channel credentials to ensure we're in the "has LLM, no channels" state
    cy.wrap(null).then(() => {
      if (!instanceId) return;
      cy.request({
        method: "DELETE",
        url: `/api/instances/${instanceId}/credentials/telegram_bot_token`,
        failOnStatusCode: false,
      });
    });

    // Visit the page fresh
    cy.wrap(null).then(() => {
      if (instanceId) {
        cy.visit(`/en/dashboard/instances/${instanceId}`);
      }
    });

    // Wait for main content
    cy.get("main", { timeout: 10000 }).should("be.visible");

    // Open Deploy tab
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();

    // Should show the quick-connect banner (LLM ready, needs channel)
    cy.contains(/Your AI is ready|now connect a channel/i, { timeout: 10000 }).should("be.visible");

    cy.snap("18-deploy-03-quick-connect-banner");
  });

  // ── 04. With channel → shows live status ─────────────────────────────────
  it("shows live status when channel is connected", () => {
    // Add Telegram credential
    cy.wrap(null).then(() => {
      if (!instanceId) return;
      return cy.request({
        method: "POST",
        url: `/api/instances/${instanceId}/credentials`,
        body: { key: "telegram_bot_token", value: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });
    });

    cy.wrap(null).then(() => {
      if (instanceId) cy.visit(`/en/dashboard/instances/${instanceId}`);
    });
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();

    // Should show connected status
    cy.get("main").contains(/connected|live|active/i).should("be.visible");

    cy.snap("18-deploy-04-channel-connected");
  });

  // ── 05. QR code card is visible ──────────────────────────────────────────
  it("shows QR code for web chat", () => {
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();
    cy.get("main").contains(/qr code|scan|chat/i).should("be.visible");
    cy.snap("18-deploy-05-qr-code");
  });

  // ── 06. Embed code is available ──────────────────────────────────────────
  it("shows embed code options", () => {
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();
    cy.get("main").contains(/embed|script|iframe/i).should("be.visible");
    cy.snap("18-deploy-06-embed");
  });

  // ── 07. Telegram setup button navigates to Credentials ───────────────────
  it("clicking Telegram setup navigates to Credentials tab", () => {
    cy.get('button[data-tab="Deploy"]', { timeout: 10000 }).click();
    cy.contains("button", /telegram|connect/i, { timeout: 10000 }).click();
    // Should either open Telegram setup or navigate to Credentials
    cy.get("main").contains(/credentials|telegram|bot token/i).should("be.visible");
    cy.snap("18-deploy-07-telegram-nav");
  });
});