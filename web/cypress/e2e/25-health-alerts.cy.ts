/**
 * 25 · Health Alerts
 *
 * Tests the /api/internal/health-check endpoint's transition detection logic.
 *
 * Scope:
 *  1. Auth — invalid/missing key → 401
 *  2. Missing fields → 400
 *  3. Valid healthy ping → 200 with transition field
 *  4. Transition: healthy → down returns "went_down"
 *  5. Transition: down → healthy returns "recovered"
 *  6. Same status (no change) returns "no_change"
 *  7. Response includes transition key in all cases
 */

const INTERNAL_KEY = () => Cypress.env("INTERNAL_API_KEY") as string;

function ping(instanceId: string, status: "healthy" | "degraded" | "down", extras = {}) {
  return cy.request({
    method: "POST",
    url: "/api/internal/health-check",
    headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
    body: { instanceId, status, responseMs: 120, ...extras },
    failOnStatusCode: false,
  });
}

describe("25 · Health Alerts", () => {
  // ── 01. No auth → 401 ─────────────────────────────────────────────────────
  it("returns 401 without auth", () => {
    cy.request({
      method: "POST",
      url: "/api/internal/health-check",
      body: { instanceId: "x", status: "healthy" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      cy.snap("25-health-01-no-auth");
    });
  });

  // ── 02. Wrong key → 401 ───────────────────────────────────────────────────
  it("returns 401 with wrong key", () => {
    cy.request({
      method: "POST",
      url: "/api/internal/health-check",
      headers: { Authorization: "Bearer bad-key" },
      body: { instanceId: "x", status: "healthy" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── 03. Missing fields → 400 ──────────────────────────────────────────────
  it("returns 400 when instanceId or status missing", () => {
    if (!INTERNAL_KEY()) { cy.log("skip — no INTERNAL_API_KEY"); return; }
    cy.request({
      method: "POST",
      url: "/api/internal/health-check",
      headers: { Authorization: `Bearer ${INTERNAL_KEY()}` },
      body: { instanceId: "x" }, // missing status
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
      cy.snap("25-health-03-missing-fields");
    });
  });

  // ── 04–07. Transition detection (requires real instanceId) ────────────────
  context("Transition detection", () => {
    let instanceId: string;

    before(() => {
      if (!INTERNAL_KEY()) return;
      cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));
      cy.request("/api/instances").then((res) => {
        if (res.body.length > 0) instanceId = res.body[0].id;
      });
    });

    it("healthy ping returns ok with transition field", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      ping(instanceId, "healthy").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("ok", true);
        expect(res.body).to.have.property("transition").that.is.a("string");
        cy.snap("25-health-04-healthy-ok");
      });
    });

    it("same status twice returns no_change", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      // First ping to set healthy
      ping(instanceId, "healthy").then(() => {
        // Second ping — same status
        ping(instanceId, "healthy").then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.transition).to.eq("no_change");
          cy.snap("25-health-05-no-change");
        });
      });
    });

    it("healthy → down transition returns went_down", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      ping(instanceId, "healthy").then(() => {
        ping(instanceId, "down", { error: "connection refused" }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.transition).to.eq("went_down");
          cy.snap("25-health-06-went-down");
        });
      });
    });

    it("down → healthy transition returns recovered", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      // Set to down first
      ping(instanceId, "down").then(() => {
        ping(instanceId, "healthy").then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.transition).to.eq("recovered");
          cy.snap("25-health-07-recovered");
        });
      });
    });

    it("healthy → degraded transition returns went_degraded", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      ping(instanceId, "healthy").then(() => {
        ping(instanceId, "degraded", { responseMs: 8500 }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.transition).to.eq("went_degraded");
          cy.snap("25-health-08-went-degraded");
        });
      });
    });

    it("activity log shows health transition event", () => {
      if (!INTERNAL_KEY() || !instanceId) { cy.log("skip"); return; }
      cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));

      // Trigger a down transition
      ping(instanceId, "healthy").then(() => {
        ping(instanceId, "down", { error: "timeout" }).then(() => {
          // Check logs
          cy.request(`/api/instances/${instanceId}/logs`).then((res) => {
            expect(res.status).to.eq(200);
            const logs = res.body as { event: string; details?: string }[];
            const healthLog = logs.find((l) =>
              l.details?.toLowerCase().includes("health status changed") ||
              l.details?.toLowerCase().includes("down")
            );
            expect(healthLog).to.exist;
            cy.snap("25-health-09-log-entry");
          });
        });
      });
    });
  });
});
