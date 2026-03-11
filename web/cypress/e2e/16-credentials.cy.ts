/**
 * Credentials & Config
 * Credential CRUD, config generation, wizard flow
 */
describe("16 · Credentials", () => {
  const EMAIL = () => Cypress.env("CYPRESS_USER_EMAIL") || "cypress@synapseforge.ai";
  const PASS = () => Cypress.env("CYPRESS_USER_PASS") || "cypress123";

  it("instance detail has Credentials tab", () => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().click();
    cy.contains("Credentials").should("be.visible");
    cy.snap("16-credentials-01-tab");
  });

  it("can save and see masked credential", () => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().invoke("attr", "href").then((href) => {
      const id = href!.split("/instances/")[1].split("/")[0];
      cy.visit(`/en/dashboard/instances/${id}`);
      cy.contains("Credentials").click();
      cy.snap("16-credentials-02-tab-open");
      // Save a test credential via API
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "telegram_bot_token", value: "1234567890:ABCdefGHIjklMNOpqrSTUvwxyz" },
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
      cy.reload();
      cy.contains("Credentials").click();
      cy.contains("Telegram Bot Token").should("be.visible");
      cy.snap("16-credentials-03-masked");
    });
  });

  it("credentials API rejects unknown keys", () => {
    cy.login(EMAIL(), PASS());
    cy.request({
      method: "GET",
      url: "/en/dashboard/instances",
    });
    // get instance id
    cy.request("/api/instances").then((res) => {
      const instances = res.body;
      if (instances.length === 0) return;
      const id = instances[0].id;
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "evil_injection", value: "hack" },
        failOnStatusCode: false,
      }).then((r) => {
        expect(r.status).to.eq(400);
      });
    });
  });

  it("config preview API returns masked config", () => {
    cy.login(EMAIL(), PASS());
    cy.request("/api/instances").then((res) => {
      const instances = res.body;
      if (instances.length === 0) return;
      const id = instances[0].id;
      cy.request({
        url: `/api/instances/${id}/config-preview`,
        failOnStatusCode: false,
      }).then((r) => {
        expect(r.status).to.be.oneOf([200, 404]);
        if (r.status === 200) {
          expect(r.body).to.be.a("string");
          // Should not contain real API keys
          expect(r.body).not.to.match(/sk-[a-zA-Z0-9]{20,}/);
        }
      });
    });
  });

  it("bootstrap API returns 401 without token", () => {
    cy.request({
      url: "/api/internal/bootstrap/fake-instance-id",
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.eq(401);
    });
  });

  it("instance setup wizard opens", () => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
    // Click new instance button
    cy.contains("New Instance").click();
    // Wizard should show
    cy.contains("Set Up Your AI Instance").should("be.visible");
    cy.snap("16-credentials-04-wizard");
  });
});
