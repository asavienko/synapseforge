/**
 * Spec 31 — Version Management / Infrastructure Tab
 *
 * Tests:
 *  1. Infrastructure tab renders version panel + empty snapshots state
 *  2. Snapshots table renders rows from API response
 *  3. Two-step restore confirm flow
 *  4. Command queue renders with status badges
 *  5. GET /api/admin/versions returns 401 for non-admin (API contract)
 *  6. Auto-update toggle fires PATCH /api/instances/[id] with autoUpdate
 */

const EMAIL = () => Cypress.env("TEST_EMAIL") || Cypress.env("CYPRESS_USER_EMAIL") || "cypress@synapseforge.ai";
const PASS = () => Cypress.env("TEST_PASSWORD") || Cypress.env("CYPRESS_USER_PASS") || "cypress123";
let instanceId: string;

before(() => {
  cy.login(EMAIL(), PASS());
  cy.request("/api/instances").then((res) => {
    const inst = (res.body as Array<{ id: string; name: string }>).find(
      (i) => i.name === "Cypress Agent"
    );
    expect(inst, "Cypress Agent must exist").to.exist;
    instanceId = inst!.id;

    // Ensure instance status is running so the Infrastructure tab loads data
    cy.request({
      method: "PATCH",
      url: `/api/instances/${instanceId}`,
      body: { status: "running" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    });
  });
});

beforeEach(() => {
  cy.login(EMAIL(), PASS());
});

// ---------------------------------------------------------------------------
// Test 1 — Infrastructure tab renders version panel + empty snapshots state
// ---------------------------------------------------------------------------
it("Infrastructure tab shows version panel and empty snapshots", () => {
  // Intercepts MUST be set up before visiting so they're ready
  // when loadInfra() fires after the tab becomes active
  cy.intercept("GET", `/api/instances/*/snapshots`, {
    body: { lastBackupAt: null, snapshots: [] },
  }).as("snapshots");
  cy.intercept("GET", `/api/instances/*/commands`, {
    body: { commands: [] },
  }).as("commands");

  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("button", "Infrastructure").click();
  cy.wait(["@snapshots", "@commands"]);

  // Empty snapshots state
  cy.contains("No snapshots yet").should("be.visible");

  // Version panel exists
  cy.contains("OpenClaw Version").should("be.visible");

  // Auto-update toggle is present
  cy.contains("Auto-update").should("be.visible");

  cy.snap("31-infra-01-empty");
});

// ---------------------------------------------------------------------------
// Test 2 — Snapshots table renders rows from API response
// ---------------------------------------------------------------------------
it("snapshots table renders rows from API response", () => {
  const mockSnapshots = [
    {
      id: "snap-1",
      snapshotId: "abc123def456",
      sizeBytes: 52428800, // 50.0 MB
      healthy: true,
      label: "pre-deploy",
      tag: null,
      triggeredBy: "system",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "snap-2",
      snapshotId: "xyz789abc012",
      sizeBytes: 48234496,
      healthy: false,
      label: null,
      tag: null,
      triggeredBy: "manual",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  cy.intercept("GET", `/api/instances/*/snapshots`, {
    body: { lastBackupAt: mockSnapshots[0].createdAt, snapshots: mockSnapshots },
  }).as("snapshots");
  cy.intercept("GET", `/api/instances/*/commands`, {
    body: { commands: [] },
  }).as("commands");

  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("button", "Infrastructure").click();
  cy.wait(["@snapshots", "@commands"]);

  // Snapshot IDs shown (first 12 chars sliced)
  cy.contains("abc123def456").should("be.visible");
  cy.contains("xyz789abc012").should("be.visible");

  // Size rendered
  cy.contains("50.0 MB").should("be.visible");

  // Healthy/unhealthy badges (from infrastructure.health.healthy / infrastructure.health.down)
  cy.contains("Healthy").should("be.visible");
  cy.contains("Down").should("be.visible");

  // Label badge
  cy.contains("pre-deploy").should("be.visible");

  // Restore buttons visible
  cy.contains("Restore").should("be.visible");

  cy.snap("31-infra-02-snapshots");
});

// ---------------------------------------------------------------------------
// Test 3 — Two-step restore confirm flow
// ---------------------------------------------------------------------------
it("restore button shows confirm step, confirm triggers request-rollback", () => {
  const mockSnapshot = {
    id: "snap-confirm-1",
    snapshotId: "confirm123456",
    sizeBytes: 10485760,
    healthy: true,
    label: "test",
    tag: null,
    triggeredBy: "system",
    createdAt: new Date().toISOString(),
  };

  cy.intercept("GET", `/api/instances/*/snapshots`, {
    body: { lastBackupAt: null, snapshots: [mockSnapshot] },
  }).as("snapshots");
  cy.intercept("GET", `/api/instances/*/commands`, {
    body: { commands: [] },
  }).as("commands");
  // Intercept rollback — seed user has no managerId so real endpoint returns 400
  cy.intercept("POST", `/api/instances/*/request-rollback`, {
    statusCode: 200,
    body: { ok: true },
  }).as("rollback");

  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("button", "Infrastructure").click();
  cy.wait(["@snapshots", "@commands"]);

  // Step 1: click Restore
  cy.contains("Restore").click();

  // Step 2: confirm button appears
  cy.contains("Confirm restore").should("be.visible");
  cy.contains("Cancel").should("be.visible");

  // Confirm
  cy.contains("Confirm restore").click();
  cy.wait("@rollback");

  // Success state (restoreRequested set, shows for 4s)
  cy.contains("Restore request sent to your manager").should("be.visible");

  cy.snap("31-infra-03-restore-confirm");
});

// ---------------------------------------------------------------------------
// Test 4 — Command queue renders with status badges
// ---------------------------------------------------------------------------
it("command queue shows commands with status colors", () => {
  const mockCommands = [
    {
      id: "cmd-1",
      type: "update_version",
      status: "pending",
      note: "Auto-update to 2026.3.3",
      createdAt: new Date().toISOString(),
      payload: { targetVersion: "2026.3.3" },
    },
    {
      id: "cmd-2",
      type: "take_restic_snapshot",
      status: "done",
      note: "pre-update snapshot",
      createdAt: new Date(Date.now() - 60000).toISOString(),
      payload: {},
    },
    {
      id: "cmd-3",
      type: "rollback_restic",
      status: "failed",
      note: "Rollback",
      createdAt: new Date(Date.now() - 120000).toISOString(),
      payload: {},
    },
  ];

  cy.intercept("GET", `/api/instances/*/snapshots`, {
    body: { lastBackupAt: null, snapshots: [] },
  }).as("snapshots");
  cy.intercept("GET", `/api/instances/*/commands`, {
    body: { commands: mockCommands },
  }).as("commands");

  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("button", "Infrastructure").click();
  cy.wait(["@snapshots", "@commands"]);

  // Command Queue section visible (only shown when commands.length > 0)
  cy.contains("Command Queue").should("be.visible");

  // Commands rendered with type (font-mono) + status
  cy.contains("update_version").should("be.visible");
  cy.contains("take_restic_snapshot").should("be.visible");
  cy.contains("rollback_restic").should("be.visible");

  // Status text visible
  cy.contains("pending").should("be.visible");
  cy.contains("done").should("be.visible");
  cy.contains("failed").should("be.visible");

  cy.snap("31-infra-04-commands");
});

// ---------------------------------------------------------------------------
// Test 5 — Admin versions API returns 401 for unauthenticated request
// ---------------------------------------------------------------------------
it("GET /api/admin/versions returns 401 for unauthenticated request", () => {
  // Clear cookies so there is no session at all — an unauthenticated request
  // always returns 401, regardless of what ADMIN_EMAILS contains in CI.
  cy.clearCookies();
  cy.request({
    url: "/api/admin/versions",
    failOnStatusCode: false,
  })
    .its("status")
    .should("equal", 401);
});

// ---------------------------------------------------------------------------
// Test 6 — Auto-update toggle fires PATCH /api/instances/[id] with autoUpdate
// ---------------------------------------------------------------------------
it("auto-update toggle fires PATCH /api/instances/[id] with autoUpdate", () => {
  cy.intercept("GET", `/api/instances/*/snapshots`, {
    body: { lastBackupAt: null, snapshots: [] },
  }).as("snapshots");
  cy.intercept("GET", `/api/instances/*/commands`, {
    body: { commands: [] },
  }).as("commands");
  cy.intercept("PATCH", `/api/instances/${instanceId}`, (req) => {
    req.reply({
      statusCode: 200,
      body: { ...req.body, id: instanceId },
    });
  }).as("patchInstance");

  cy.visit(`/en/dashboard/instances/${instanceId}`);
  cy.contains("button", "Infrastructure").click();
  cy.wait(["@snapshots", "@commands"]);

  cy.contains("Auto-update").should("be.visible");

  // The toggle button is adjacent to the "Auto-update" label inside a flex container.
  // The parent div has class bg-white/3 rounded-xl p-4 → find the button within that panel
  cy.contains("Auto-update")
    .parent() // div.flex.items-center.gap-2
    .find("button")
    .click();

  cy.wait("@patchInstance")
    .its("request.body")
    .should("have.property", "autoUpdate");

  cy.snap("31-infra-06-autoupdate");
});
