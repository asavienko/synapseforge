/**
 * Email Verification
 * Verify email page · Resend flow · Bad token handling
 */
describe("11 · Email Verification", () => {
  it("renders verify email page", () => {
    cy.visit("/en/verify-email");
    cy.contains("Verify", { matchCase: false }).should("be.visible");
    cy.snap("11-verify-01-page");
  });

  it("shows resend button", () => {
    cy.visit("/en/verify-email");
    cy.contains("Resend", { matchCase: false }).should("be.visible");
    cy.snap("11-verify-02-resend-btn");
  });

  it("back to sign in link works", () => {
    cy.visit("/en/verify-email");
    cy.contains("Back to sign in").click();
    cy.url().should("include", "/sign-in");
    cy.snap("11-verify-03-back");
  });

  it("bad verification token shows error", () => {
    cy.request({
      method: "GET",
      url: "/api/auth/verify?token=invalid-token-12345",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401, 404]);
    });
    cy.snap("11-verify-04-bad-token-api");
  });
});
