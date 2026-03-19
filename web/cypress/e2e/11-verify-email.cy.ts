/**
 * Email Verification
 * Verify email page renders · Error states · API token handling
 */
describe("11 · Email Verification Page", () => {
  it("renders verify email page — check inbox state when no token", () => {
    cy.visit("/en/verify-email");
    // No token in URL → shows "check inbox" screen (user arrived from dashboard gate)
    cy.contains(/inbox|verify|synapseforge/i).should("be.visible");
    cy.snap("11-verify-01-page");
  });

  it("shows OpenHelix AI logo", () => {
    cy.visit("/en/verify-email");
    cy.contains("OpenHelix AI").should("be.visible");
    cy.snap("11-verify-02-logo");
  });

  it("shows error state for invalid token in URL", () => {
    cy.visit("/en/verify-email?error=invalid");
    cy.contains("not found", { matchCase: false }).should("be.visible");
    cy.snap("11-verify-03-invalid-error");
  });

  it("shows error state for expired token in URL", () => {
    cy.visit("/en/verify-email?error=expired");
    cy.contains("expired", { matchCase: false }).should("be.visible");
    cy.snap("11-verify-04-expired-error");
  });

  it("shows error state for missing token in URL", () => {
    cy.visit("/en/verify-email?error=missing");
    cy.contains("Invalid link", { matchCase: false }).should("be.visible");
    cy.snap("11-verify-05-missing-error");
  });

  it("error state shows resend button", () => {
    cy.visit("/en/verify-email?error=invalid");
    cy.contains(/resend/i).should("be.visible");
    cy.snap("11-verify-06-resend-btn");
  });
});

describe("11 · Email Verification API", () => {
  it("verify API redirects to error page for invalid token", () => {
    // API returns 302 redirect → Cypress follows → lands on verify-email?error=invalid (200)
    cy.request({
      method: "GET",
      url: "/api/auth/verify?token=invalid-token-12345",
      failOnStatusCode: false,
    }).then((res) => {
      // After redirect: 200 (verify-email page) or 302/400/404 if redirects not followed
      expect(res.status).to.be.oneOf([200, 302, 400, 404]);
    });
  });

  it("verify API redirects for missing token", () => {
    cy.request({
      method: "GET",
      url: "/api/auth/verify",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 302, 400]);
    });
  });

  it("resend verification API returns 401 for unauthenticated user", () => {
    cy.clearCookies();
    cy.request({
      method: "POST",
      url: "/api/auth/resend-verification",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("resend verification API returns success/already-verified for authenticated user", () => {
    cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));
    cy.request({
      method: "POST",
      url: "/api/auth/resend-verification",
      failOnStatusCode: false,
    }).then((res) => {
      // 200 = email sent, 400 = already verified
      expect(res.status).to.be.oneOf([200, 400]);
    });
  });
});
