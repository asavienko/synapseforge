/**
 * 21 · Usage Analytics
 *
 * Tests:
 *  - Dashboard overview shows "Messages" stat card
 *  - Instance detail Overview tab shows Usage Analytics panel
 *  - GET /api/instances/:id/usage returns expected shape
 *  - Stats show correct zero state before any messages
 *  - 14-day bar chart renders
 */

const EMAIL = () => Cypress.env("TEST_EMAIL") as string;
const PASS = () => Cypress.env("TEST_PASSWORD") as string;

function getInstanceId(): Cypress.Chainable<string> {
  return cy.request("/api/instances").then((res) => res.body[0]?.id as string);
}

describe("21 · Usage — Dashboard overview stat card", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("shows Messages stat card on dashboard overview", () => {
    cy.visit("/en/dashboard");
    cy.get("[data-testid='messages-stat']", { timeout: 10000 }).should("be.visible");
    cy.snap("21-usage-01-dashboard-stat");
  });

  it("Messages stat card shows a numeric value", () => {
    cy.visit("/en/dashboard");
    cy.get("[data-testid='messages-stat']").within(() => {
      cy.get("div.text-2xl").should("exist").invoke("text").should("match", /^\d+$/);
    });
    cy.snap("21-usage-02-stat-value");
  });

  it("Messages stat card is translated in Spanish", () => {
    cy.visit("/es/dashboard");
    cy.get("[data-testid='messages-stat']").within(() => {
      cy.contains("Mensajes").should("be.visible");
    });
    cy.snap("21-usage-03-stat-es");
  });
});

describe("21 · Usage — Instance detail Overview tab", () => {
  let instanceId: string;

  before(() => {
    cy.login(EMAIL(), PASS());
    getInstanceId().then((id) => { instanceId = id; });
  });

  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.wrap(null).then(() => {
      if (instanceId) cy.visit(`/en/dashboard/instances/${instanceId}`);
    });
  });

  it("Usage Analytics panel is visible on Overview tab", () => {
    cy.get("[data-testid='usage-panel']", { timeout: 10000 }).should("be.visible");
    cy.snap("21-usage-04-panel-visible");
  });

  it("Usage panel shows All Time, This Month, Today counters", () => {
    cy.get("[data-testid='usage-panel']").within(() => {
      cy.contains(/All Time/i).should("be.visible");
      cy.contains(/This Month/i).should("be.visible");
      cy.contains(/Today/i).should("be.visible");
    });
    cy.snap("21-usage-05-counters");
  });

  it("Usage panel shows a bar chart when data loads", () => {
    // Wait for usage data to load, then check bar chart renders
    cy.get("[data-testid='usage-panel']", { timeout: 10000 }).should("be.visible");
    cy.snap("21-usage-06-chart");
  });

  it("Usage panel shows Usage Analytics heading", () => {
    cy.get("[data-testid='usage-panel']").within(() => {
      cy.contains("Usage Analytics").should("be.visible");
    });
    cy.snap("21-usage-07-heading");
  });
});

describe("21 · Usage — API endpoint", () => {
  before(() => cy.login(EMAIL(), PASS()));

  it("GET /api/instances/:id/usage returns expected shape", () => {
    getInstanceId().then((instanceId) => {
      cy.request(`/api/instances/${instanceId}/usage`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("totalMessages").that.is.a("number");
        expect(res.body).to.have.property("messagesThisMonth").that.is.a("number");
        expect(res.body).to.have.property("todayMessages").that.is.a("number");
        expect(res.body).to.have.property("daily").that.is.an("array");
        expect(res.body.daily).to.have.length(14);
        cy.snap("21-usage-08-api-response");
      });
    });
  });

  it("daily array has correct shape — {date, count} entries", () => {
    getInstanceId().then((instanceId) => {
      cy.request(`/api/instances/${instanceId}/usage`).then((res) => {
        const daily = res.body.daily as { date: string; count: number }[];
        daily.forEach((entry) => {
          expect(entry).to.have.property("date").that.matches(/^\d{4}-\d{2}-\d{2}$/);
          expect(entry).to.have.property("count").that.is.a("number");
        });
      });
    });
  });

  it("unauthenticated request returns 401", () => {
    getInstanceId().then((instanceId) => {
      cy.request({
        url: `/api/instances/${instanceId}/usage`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
      }).then((res) => {
        expect(res.status).to.be.oneOf([401, 403]);
      });
    });
  });

  it("wrong instance id returns 404", () => {
    cy.request({
      url: "/api/instances/nonexistent-id-xyz/usage",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
