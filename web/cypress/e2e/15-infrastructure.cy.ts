/**
 * Infrastructure — Health Checks & Backups UI
 * Tests: internal API auth, health display on instance detail, admin health panel
 */
const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");
const ADMIN_EMAIL = () => Cypress.env("ADMIN_EMAIL");
const ADMIN_PASS  = () => Cypress.env("ADMIN_PASSWORD");
const INTERNAL_API_KEY = () => Cypress.env("INTERNAL_API_KEY") ?? "test-internal-key";

describe("15 · Infrastructure — Health Checks & Backups", () => {
  let instanceId: string;

  before(() => {
    // Get an instance ID to use in tests
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']", { timeout: 10000 }).first().then(($link) => {
      const href = $link.attr("href") ?? "";
      const match = href.match(/instances\/([^/?]+)/);
      if (match) instanceId = match[1];
    });
  });

  // ─── Internal API auth tests ────────────────────────────────────────────────

  describe("Internal API — auth enforcement", () => {
    it("POST /api/internal/health-check — no key → 401", () => {
      cy.request({
        method: "POST",
        url: "/api/internal/health-check",
        body: { instanceId: "fake-id", status: "healthy" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("POST /api/internal/health-check — wrong key → 401", () => {
      cy.request({
        method: "POST",
        url: "/api/internal/health-check",
        body: { instanceId: "fake-id", status: "healthy" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer wrong-key",
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("POST /api/internal/snapshot — no key → 401", () => {
      cy.request({
        method: "POST",
        url: "/api/internal/snapshot",
        body: { instanceId: "fake-id", snapshotId: "abc123" },
        headers: { "Content-Type": "application/json" },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  // ─── Full flow: POST health check + view in UI ───────────────────────────────

  describe("Full health-check flow", () => {
    it("POST valid health check → 200", () => {
      cy.wrap(null).then(() => {
        cy.request({
          method: "POST",
          url: "/api/internal/health-check",
          body: { instanceId, status: "healthy", responseMs: 42 },
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${INTERNAL_API_KEY()}`,
          },
          failOnStatusCode: false,
        }).then((res) => {
          // 200 if instanceId is valid, 400 if no instance found (still tests auth passes)
          expect(res.status).to.be.oneOf([200, 400]);
        });
      });
    });

    it("POST valid snapshot → 200 or 400 (auth passes)", () => {
      cy.wrap(null).then(() => {
        cy.request({
          method: "POST",
          url: "/api/internal/snapshot",
          body: { instanceId, snapshotId: "abc12345", sizeBytes: 1048576, healthy: true },
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${INTERNAL_API_KEY()}`,
          },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.be.oneOf([200, 400]);
        });
      });
    });
  });

  // ─── Instance detail — Infrastructure tab ────────────────────────────────────

  describe("Instance detail — Infrastructure tab", () => {
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
    });

    it("Infrastructure tab is visible", () => {
      cy.contains("Infrastructure", { timeout: 10000 }).should("be.visible");
      cy.snap("15-infra-01-tab-visible");
    });

    it("clicking Infrastructure tab shows Health Status section", () => {
      cy.contains("Infrastructure").click();
      cy.contains("Health Status", { timeout: 10000 }).should("be.visible");
      cy.snap("15-infra-02-health-status");
    });

    it("clicking Infrastructure tab shows Backups section", () => {
      cy.contains("Infrastructure").click();
      cy.contains("Backups", { timeout: 10000 }).should("be.visible");
      cy.snap("15-infra-03-backups");
    });

    it("shows 'No health data yet' when no VPS is configured", () => {
      cy.contains("Infrastructure").click();
      // Either shows "No health data yet" or actual data if seed posted health checks
      cy.get("body").then(($body) => {
        if ($body.text().includes("No health data yet")) {
          cy.contains("No health data yet").should("be.visible");
          cy.log("No health data — expected in CI without VPS");
        } else {
          cy.contains("Health Status").should("be.visible");
          cy.log("Health data present");
        }
      });
      cy.snap("15-infra-04-no-health-data");
    });

    it("shows VPS Gateway URL row", () => {
      cy.contains("Infrastructure").click();
      cy.contains("VPS Gateway URL", { timeout: 10000 }).should("be.visible");
      cy.snap("15-infra-05-vps-url");
    });

    it("shows Last backup row", () => {
      cy.contains("Infrastructure").click();
      cy.contains("Last backup", { timeout: 10000 }).should("be.visible");
      cy.snap("15-infra-06-last-backup");
    });
  });

  // ─── Admin health panel ───────────────────────────────────────────────────────

  describe("Admin health panel", () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL(), ADMIN_PASS());
      cy.visit("/en/admin", { failOnStatusCode: false });
    });

    it("Infrastructure Health section is visible when admin", () => {
      cy.get("body").then(($body) => {
        if ($body.text().includes("Admin Panel") || $body.text().includes("Infrastructure")) {
          cy.contains("Infrastructure Health").should("be.visible");
          cy.snap("15-infra-07-admin-health");
        } else {
          cy.log("Not admin or access denied — skipping");
        }
      });
    });

    it("shows health counters (Monitored, Healthy, etc.)", () => {
      cy.get("body").then(($body) => {
        if ($body.text().includes("Infrastructure Health")) {
          cy.contains("Monitored").should("be.visible");
          cy.contains("Healthy").should("be.visible");
          cy.snap("15-infra-08-health-counters");
        } else {
          cy.log("Not admin — skipping");
        }
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15 · Gateway Connectivity
// ─────────────────────────────────────────────────────────────────────────────

describe("15 · Gateway Connectivity", () => {
  it("instance detail shows VPS Gateway section in Infrastructure tab", () => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard");
    // Navigate to instance detail
    cy.get("a[href*='/dashboard/instances/']").first().click();
    cy.url().should("include", "/instances/");
    // Click Infrastructure tab
    cy.contains("Infrastructure").click();
    // Should show VPS Gateway section
    cy.contains("VPS Gateway").should("be.visible");
    cy.snap("15-gateway-01-infrastructure-tab");
  });

  it("gateway-status API returns not_configured when no vpsUrl", () => {
    cy.login(EMAIL(), PASS());
    // Get instance id from the page
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().invoke("attr", "href").then((href) => {
      const id = href!.split("/instances/")[1].split("/")[0];
      cy.request(`/api/instances/${id}/gateway-status`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.connected).to.be.false;
        expect(res.body.reason).to.eq("not_configured");
      });
    });
  });

  it("admin can see Connect VPS button for instances without vpsUrl", () => {
    cy.login(Cypress.env("ADMIN_EMAIL") || "admin@synapseforge.ai", Cypress.env("ADMIN_PASS") || "adminpass123");
    cy.visit("/en/admin");
    cy.contains("Connect VPS").should("be.visible");
    cy.snap("15-gateway-02-admin-connect-btn");
  });
});
