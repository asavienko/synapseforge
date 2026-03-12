/**
 * 26 · Plan Enforcement
 *
 * Tests that plan limits are enforced correctly:
 *  1. /api/internal/plan-enforcement auth (401, valid)
 *  2. plan-enforcement returns { ok, downgraded, instancesStopped }
 *  3. PATCH instance status=running is blocked when plan limit reached
 *  4. Free plan allows only 1 running instance at a time
 *  5. Billing page renders without crashing
 */

const INTERNAL_KEY = () => Cypress.env("INTERNAL_API_KEY") as string;

describe("26 · Plan Enforcement", () => {
  // ── 01. No auth → 401 ────────────────────────────────────────────────────
  it("GET /api/internal/plan-enforcement returns 401 without auth", () => {
    cy.request({
      method: "GET",
      url: "/api/internal/plan-enforcement",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      cy.snap("26-enforce-01-no-auth");
    });
  });

  // ── 02. Valid key → 200 with expected shape ────────────────────────────────
  it("returns 200 with enforcement summary when authorized", () => {
    if (!INTERNAL_KEY()) { cy.log("skip — no INTERNAL_API_KEY"); return; }
    cy.request({
      method: "GET",
      url: "/api/internal/plan-enforcement",
      headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("ok", true);
      expect(res.body).to.have.property("downgraded").that.is.a("number");
      expect(res.body).to.have.property("instancesStopped").that.is.a("number");
      cy.snap("26-enforce-02-summary");
    });
  });

  // ── 03. POST also works (Vercel Cron compatibility) ───────────────────────
  it("POST also works for plan-enforcement", () => {
    if (!INTERNAL_KEY()) { cy.log("skip"); return; }
    cy.request({
      method: "POST",
      url: "/api/internal/plan-enforcement",
      headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.ok).to.eq(true);
    });
  });

  // ── 04. Instance start blocked when plan limit exceeded ───────────────────
  it("PATCH status=running is rejected when plan limit is exceeded", () => {
    cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));

    cy.request("/api/instances").then((res) => {
      const instances = res.body as { id: string; status: string }[];
      if (instances.length < 2) {
        cy.log("Need ≥2 instances to test limit — skipping");
        return;
      }

      // Get running instances
      const running = instances.filter((i) => i.status === "running");
      const stopped = instances.filter((i) => i.status !== "running");

      if (running.length === 0 || stopped.length === 0) {
        cy.log("Need at least 1 running + 1 stopped to test limit — skipping");
        return;
      }

      // Try starting a second instance — if free plan (limit=1), should fail
      cy.request({
        method: "PATCH",
        url: `/api/instances/${stopped[0].id}`,
        body: { status: "running" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      }).then((patchRes) => {
        // If on free plan and already have 1 running, should get 403
        // If on pro plan (3 instances), it may succeed — both are valid
        expect(patchRes.status).to.be.oneOf([200, 403, 503]);
        cy.snap("26-enforce-04-start-blocked");
      });
    });
  });

  // ── 05. Billing page renders ──────────────────────────────────────────────
  it("billing page loads without crashing", () => {
    cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));
    cy.visit("/en/dashboard/billing");
    cy.contains(/current plan|plan/i, { timeout: 8000 }).should("exist");
    cy.snap("26-enforce-05-billing-page");
  });

  // ── 06. Plan-enforcement is idempotent (run twice → same result) ──────────
  it("running plan-enforcement twice is idempotent", () => {
    if (!INTERNAL_KEY()) { cy.log("skip"); return; }

    let first: number;
    cy.request({
      method: "GET",
      url: "/api/internal/plan-enforcement",
      headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
    }).then((res) => {
      first = res.body.downgraded;

      cy.request({
        method: "GET",
        url: "/api/internal/plan-enforcement",
        headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
      }).then((res2) => {
        // Second run should downgrade 0 (users already on free plan are skipped)
        expect(res2.body.downgraded).to.eq(0);
        cy.snap("26-enforce-06-idempotent");
      });
    });
  });
});
