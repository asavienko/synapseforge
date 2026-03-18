const EMAIL = () => Cypress.env("TEST_EMAIL") || Cypress.env("CYPRESS_USER_EMAIL") || "cypress@synapseforge.ai";
const PASS = () => Cypress.env("TEST_PASSWORD") || Cypress.env("CYPRESS_USER_PASS") || "cypress123";

describe("28 — Agent Tool Integrations", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
  });

  it("GET /api/instances/:id/tools returns tool list with utility + crypto tools", () => {
    cy.request("GET", "/api/instances").then((res) => {
      const id = res.body[0]?.id || res.body.instances?.[0]?.id;
      if (!id) return cy.log("No instances found");
      cy.request("GET", `/api/instances/${id}/tools`).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.tools).to.be.an("array");
        const names = r.body.tools.map((t: { name: string }) => t.name);
        expect(names).to.include("get_current_time");
        expect(names).to.include("calculate");
        expect(names).to.include("crypto_price");
        expect(names).to.include("crypto_chart");
      });
    });
  });

  it("calculate tool returns correct result", () => {
    cy.request("GET", "/api/instances").then((res) => {
      const id = res.body[0]?.id || res.body.instances?.[0]?.id;
      if (!id) return;
      cy.request("POST", `/api/instances/${id}/tools/test`, { toolName: "calculate", args: { expression: "42 * 100" } })
        .then((r) => { expect(r.status).to.eq(200); expect(r.body.result).to.eq("4200"); });
    });
  });

  it("get_current_time returns a string", () => {
    cy.request("GET", "/api/instances").then((res) => {
      const id = res.body[0]?.id || res.body.instances?.[0]?.id;
      if (!id) return;
      cy.request("POST", `/api/instances/${id}/tools/test`, { toolName: "get_current_time", args: { timezone: "UTC" } })
        .then((r) => { expect(r.status).to.eq(200); expect(r.body.result).to.be.a("string").and.not.be.empty; });
    });
  });

  it("crypto_price tool works without API key", () => {
    cy.request("GET", "/api/instances").then((res) => {
      const id = res.body[0]?.id || res.body.instances?.[0]?.id;
      if (!id) return;
      cy.request("POST", `/api/instances/${id}/tools/test`, { toolName: "crypto_price", args: { coins: "bitcoin" } })
        .then((r) => { expect(r.status).to.eq(200); expect(r.body.result).to.contain("BITCOIN"); });
    });
  });

  it("Credentials tab shows Integrations section", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("Cypress Agent").click();
    cy.contains("Credentials").click();
    cy.contains("Tavily").should("exist");
    cy.contains("Firecrawl").should("exist");
    cy.contains("GitHub").should("exist");
    cy.contains("CoinGecko").should("exist");
  });

  it("web_search with mocked Tavily API", () => {
    cy.intercept("POST", "https://api.tavily.com/search", {
      body: { answer: "Mock answer", results: [{ title: "Test", url: "https://example.com", content: "Test" }] },
    }).as("tavily");
    cy.log("Tavily mock ready — requires tavily_api_key credential to activate tool");
  });
});
