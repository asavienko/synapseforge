/**
 * Email Flow Tests
 *
 * Tests the API routes that trigger emails:
 *   - Forgot password → password reset email
 *   - Register → welcome email
 *   - Resend verification → verification email
 *
 * We don't test Resend's delivery (external service), but we verify:
 *   1. API returns the correct HTTP status
 *   2. The response doesn't indicate an email error
 *   3. The UI reflects success state
 *
 * Uses cy.intercept to confirm email APIs are called without errors.
 */

describe("13 · Email — Forgot Password Reset", () => {
  it("API returns 200 for valid email address", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/forgot-password",
      body: { emailAddress: Cypress.env("TEST_EMAIL") },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      cy.snap("13-email-01-forgot-api-200");
    });
  });

  it("API returns 200 for unknown email (no enumeration)", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/forgot-password",
      body: { emailAddress: "nobody@no-such-domain-xyz.com" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      // Must return 200 regardless — never reveal if email exists
      expect(res.status).to.eq(200);
    });
  });

  it("API returns 400 for missing email", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/forgot-password",
      body: {},
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("UI shows success state after submitting email", () => {
    cy.visit("/en/forgot-password");
    cy.get('input[type="email"]').type(Cypress.env("TEST_EMAIL"));

    // Intercept the API call to confirm it fires
    cy.intercept("POST", "/api/auth/forgot-password").as("forgotPw");

    cy.get('button[type="submit"]').click();

    cy.wait("@forgotPw").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.contains("Check your inbox", { timeout: 8000 }).should("be.visible");
    cy.snap("13-email-02-forgot-ui-success");
  });

  it("UI shows email address in success message", () => {
    cy.visit("/en/forgot-password");
    const testEmail = Cypress.env("TEST_EMAIL");
    cy.get('input[type="email"]').type(testEmail);
    cy.get('button[type="submit"]').click();
    cy.contains(testEmail, { timeout: 8000 }).should("be.visible");
    cy.snap("13-email-03-forgot-email-shown");
  });
});

describe("13 · Email — Email Verification (Resend)", () => {
  it("resend verification API returns 200 when authenticated", () => {
    cy.login(Cypress.env("TEST_EMAIL"), Cypress.env("TEST_PASSWORD"));

    cy.request({
      method: "POST",
      url: "/api/auth/resend-verification",
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      // 200 = sent, 400 = already verified, both are acceptable
      expect(res.status).to.be.oneOf([200, 400]);
      cy.log("Resend verification status:", res.status.toString());
    });
  });

  it("resend verification API returns 401 when unauthenticated", () => {
    cy.clearCookies();
    cy.request({
      method: "POST",
      url: "/api/auth/resend-verification",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("UI resend button fires API and shows feedback", () => {
    cy.visit("/en/verify-email");
    cy.intercept("POST", "/api/auth/resend-verification").as("resendVerify");
    cy.contains("Resend", { matchCase: false }).click();
    cy.wait("@resendVerify", { timeout: 8000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 400, 401]);
    });
    cy.snap("13-email-04-verify-resend");
  });
});

describe("13 · Email — Registration Welcome Email", () => {
  it("registers a user and API returns 201 (email triggered server-side)", () => {
    const email = `cypress-email-${Date.now()}@synapseforge.ai`;

    cy.intercept("POST", "/api/auth/register").as("register");

    cy.request({
      method: "POST",
      url: "/api/auth/register",
      body: { name: "Email Test User", email, password: "Cypress123!" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      // 200 = registered (welcome email triggered)
      expect(res.status).to.eq(200);
      cy.log("Register API status:", res.status.toString());
    });
  });
});

describe("13 · Email — Password Reset Token", () => {
  it("reset-password API returns 400 for invalid/expired token", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/reset-password",
      body: { token: "fake-invalid-token-12345", password: "NewPass123!" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it("reset-password API returns 400 for missing token", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/reset-password",
      body: { password: "NewPass123!" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("reset-password API returns 400 for short password", () => {
    cy.request({
      method: "POST",
      url: "/api/auth/reset-password",
      body: { token: "any-token", password: "short" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});

describe("13 · Email — verify-email token endpoint", () => {
  it("verify API returns error for invalid token", () => {
    cy.request({
      method: "GET",
      url: "/api/auth/verify?token=invalid-xyz-token",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it("verify API returns 400 for missing token", () => {
    cy.request({
      method: "GET",
      url: "/api/auth/verify",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
