/**
 * 29 · Sandbox Mode — free-to-paid conversion funnel
 *
 * Tests the full sandbox lifecycle:
 *  01. Fresh instance shows violet sandbox banner in Chat tab (20 remaining)
 *  02. Overview tab shows sandbox progress bar widget
 *  03. Banner turns amber when ≤5 messages remain (sandboxUsed=16)
 *  04. Banner turns red + shows "Add API Key" button when exhausted (sandboxUsed=20)
 *  05. Sending chat when exhausted triggers 402 → out-of-credits inline message
 *  06. Saving an LLM credential graduates instance → banner disappears
 *
 * State manipulation strategy:
 *  - cy.task("setSandboxState") talks directly to Prisma — no real messages sent.
 *  - For the 402 flow, we inject a fake chat history (so the textarea renders)
 *    then intercept the chat POST to return 402.
 *  - Graduation is tested by POSTing a real credential via cy.request.
 *
 * UX note: In sandbox mode the proactive credential check sets chatNoCredentials=true
 * (no LLM key exists), which hides the regular chat textarea. The sandbox BANNER
 * still renders above it (using the `credentials` React state, which is empty on
 * the Chat tab and is loaded separately). For test 05, we inject fake chat history
 * so chatMessages.length > 0, which makes the textarea visible.
 */

const EMAIL = () => Cypress.env("CYPRESS_USER_EMAIL") || Cypress.env("TEST_EMAIL") || "cypress@synapseforge.ai";
const PASS  = () => Cypress.env("CYPRESS_USER_PASS")  || Cypress.env("TEST_PASSWORD") || "cypress123";

// Fake OpenAI key format — passes save (no ?validate=true), triggers sandboxMode=false
const FAKE_OPENAI_KEY = "sk-proj-testkeyfortestingpurposes1234567890abcdef";

let instanceId: string;

// ── helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the instance page and click the Chat tab. */
function openChatTab() {
  cy.visit(`/en/dashboard/instances/${instanceId}`);
  // "Cypress Agent" in the heading confirms the instance loaded
  cy.contains("Cypress Agent", { timeout: 15000 }).should("be.visible");
  cy.contains("button", "Chat").click();
}

/** Navigate to the instance page (Overview is the default tab). */
function openOverviewTab() {
  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("Cypress Agent", { timeout: 15000 }).should("be.visible");
}

// ─────────────────────────────────────────────────────────────────────────────

describe("29 · Sandbox Mode — free-to-paid funnel", () => {
  before(() => {
    cy.login(EMAIL(), PASS());

    // Resolve the seeded Cypress Agent ID
    cy.request("/api/instances").then((res: Cypress.Response<{ id: string; name: string }[]>) => {
      const inst = res.body.find((i) => i.name === "Cypress Agent");
      expect(inst, "Cypress Agent must exist — run: npx tsx cypress/support/seed.ts").to.exist;
      instanceId = inst!.id;

      // Ensure clean sandbox state (seed already does this, but be safe)
      cy.task("setSandboxState", { instanceId: inst!.id, sandboxMode: true, sandboxUsed: 0 });
    });
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
  });

  // ── 01 ── violet banner on fresh instance ───────────────────────────────────
  it("01 Chat tab shows violet sandbox banner on fresh instance", () => {
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 0 });

    openChatTab();

    // Sandbox banner must be visible and violet
    // The banner element contains "Sandbox mode — 20 free messages remaining"
    cy.contains(/sandbox mode.*20 free messages remaining/i, { timeout: 15000 })
      .should("be.visible");

    // The subtitle
    cy.contains(/add your own api key in credentials/i).should("be.visible");

    // "Add API Key →" button must NOT appear yet (only on exhausted)
    cy.contains(/add api key →/i).should("not.exist");

    // Violet colour is on the banner wrapper — confirm via the text being in
    // a violet-coloured ancestor (class bg-violet-500/10)
    cy.contains(/sandbox mode.*20 free messages remaining/i)
      .closest("div.rounded-xl")
      .should("have.class", "bg-violet-500/10");
  });

  // ── 02 ── overview sandbox widget ──────────────────────────────────────────
  it("02 Overview tab shows sandbox progress bar widget", () => {
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 0 });

    openOverviewTab();

    // "Sandbox Mode" label from t("overview.sandboxMode")
    cy.contains(/sandbox mode/i, { timeout: 10000 }).should("be.visible");

    // "0/20 messages used"
    cy.contains(/0\/20/i).should("be.visible");

    // Progress bar wrapper exists
    cy.get(".bg-violet-500\\/5").should("exist");

    // Hint text
    cy.contains(/add your api key in credentials/i).should("be.visible");
  });

  // ── 03 ── amber banner at ≤5 remaining ─────────────────────────────────────
  it("03 banner turns amber when ≤5 messages remain", () => {
    // sandboxUsed=16 → remaining=4 → amber
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 16 });

    openChatTab();

    // "Sandbox mode — 4 free messages remaining"
    cy.contains(/sandbox mode.*4 free messages remaining/i, { timeout: 15000 })
      .should("be.visible");

    // Amber colour
    cy.contains(/sandbox mode.*4 free messages remaining/i)
      .closest("div.rounded-xl")
      .should("have.class", "bg-amber-500/10");

    // No "Add API Key" button in amber state
    cy.contains(/add api key →/i).should("not.exist");
  });

  // ── 04 ── red banner + Add API Key button when exhausted ───────────────────
  it("04 banner turns red and shows Add API Key button when exhausted", () => {
    // sandboxUsed=20 → remaining=0 → red + button
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 20 });

    openChatTab();

    // "Free messages used up" — from t("chat.sandboxExhausted")
    cy.contains(/free messages used up/i, { timeout: 15000 }).should("be.visible");

    // "Add your API key to continue chatting" — from t("chat.sandboxExhaustedDesc")
    cy.contains(/add your api key to continue chatting/i).should("be.visible");

    // Red colour
    cy.contains(/free messages used up/i)
      .closest("div.rounded-xl")
      .should("have.class", "bg-red-500/10");

    // "Add API Key →" button must be visible
    cy.contains(/add api key →/i).should("be.visible");
  });

  // ── 05 ── 402 → out-of-credits inline message ──────────────────────────────
  it("05 sending chat when exhausted triggers 402 → out-of-credits inline message", () => {
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 20 });

    // Inject fake chat history so chatMessages.length > 0, which makes the
    // regular chat textarea visible even when chatNoCredentials=true.
    cy.intercept("GET", `/api/instances/${instanceId}/chat`, {
      statusCode: 200,
      body: [
        { role: "user", content: "Hello there", isError: false },
      ],
    }).as("chatHistory");

    // Intercept the chat POST to return 402 sandbox_exhausted
    cy.intercept("POST", `/api/instances/${instanceId}/chat`, {
      statusCode: 402,
      body: {
        error: "sandbox_exhausted",
        message:
          "Your 20 free messages have been used. Please add your API key in the Credentials tab to continue.",
      },
    }).as("chatPost402");

    openChatTab();

    // Wait for chat history to load (our fake message should appear)
    cy.wait("@chatHistory");
    cy.contains("Hello there", { timeout: 10000 }).should("be.visible");

    // The chat textarea should be visible (chatMessages.length > 0 satisfies the condition)
    cy.get('textarea[placeholder*="message"]', { timeout: 10000 }).should("be.visible").type("One more");

    // Send button
    cy.contains("button", /^Send$/).click();

    cy.wait("@chatPost402");

    // The inline out-of-credits message — from t("chat.sandboxOutOfCredits")
    cy.contains(/you've used all 20 free sandbox messages/i, { timeout: 10000 }).should("be.visible");
  });

  // ── 06 ── save LLM credential → banner disappears ──────────────────────────
  it("06 saving LLM credential graduates instance — banner disappears", () => {
    // Start with fresh sandbox state — banner should be visible on Chat tab
    cy.task("setSandboxState", { instanceId, sandboxMode: true, sandboxUsed: 0 });

    // Confirm banner shows before graduation
    openChatTab();
    cy.contains(/sandbox mode.*20 free messages remaining/i, { timeout: 15000 })
      .should("be.visible");

    // Save a fake LLM key via API → this flips sandboxMode=false on the instance
    cy.request({
      method: "POST",
      url: `/api/instances/${instanceId}/credentials`,
      body: { key: "openai_api_key", value: FAKE_OPENAI_KEY },
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });

    // Reload on Chat tab — sandbox banner must be gone
    // (sandboxMode is now false; banner condition fails at the first check)
    cy.reload();
    cy.contains("Cypress Agent", { timeout: 15000 }).should("be.visible");
    cy.contains("button", "Chat").click();

    // Wait enough time for the page to settle
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // No sandbox banner at all
    cy.contains(/sandbox mode.*free messages remaining/i).should("not.exist");
    cy.contains(/free messages used up/i).should("not.exist");
  });

  // ── cleanup ─────────────────────────────────────────────────────────────────
  after(() => {
    cy.login(EMAIL(), PASS());

    cy.then(() => {
      if (!instanceId) return;

      // Remove the test LLM credential added in test 06
      cy.request({
        method: "DELETE",
        url: `/api/instances/${instanceId}/credentials`,
        body: { key: "openai_api_key" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      });

      // Reset sandbox state back to clean for the next spec run
      cy.task("setSandboxState", {
        instanceId,
        sandboxMode: true,
        sandboxUsed: 0,
      });
    });
  });
});
