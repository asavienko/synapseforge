/**
 * Authentication
 * Sign up · Sign in · Forgot password · Reset password · Auth redirects
 */
describe("02 · Sign Up", () => {
  it("renders sign up page", () => {
    cy.visit("/en/sign-up");
    cy.contains("Create your account").should("be.visible");
    cy.snap("02-signup-01-page");
  });

  it("shows free plan benefits on sign up", () => {
    cy.visit("/en/sign-up");
    cy.contains("Free plan includes").should("be.visible");
    cy.snap("02-signup-02-free-benefits");
  });

  it("registers a new user and lands on onboarding", () => {
    const email = `cypress-reg-${Date.now()}@synapseforge.ai`;
    cy.clearCookies();
    cy.clearAllSessionStorage();
    cy.visit("/en/sign-up");
    cy.get('input[type="text"]').type("New User");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type("Cypress123!");
    cy.get('button[type="submit"]').should("not.be.disabled").click();
    cy.url({ timeout: 15000 }).should("include", "/onboarding");
    cy.snap("02-signup-03-success");
  });

  it("shows error on duplicate email", () => {
    cy.visit("/en/sign-up");
    cy.get('input[type="text"]').type("Cypress Test");
    cy.get('input[type="email"]').type(Cypress.env("TEST_EMAIL"));
    cy.get('input[type="password"]').type("Cypress123!");
    cy.get('button[type="submit"]').click();
    cy.contains("already", { matchCase: false, timeout: 8000 }).should("be.visible");
    cy.snap("02-signup-04-duplicate");
  });

  it("sign up has link to sign in", () => {
    cy.visit("/en/sign-up");
    cy.contains("Sign in").click();
    cy.url().should("include", "/sign-in");
    cy.snap("02-signup-05-to-signin");
  });
});

describe("02 · Sign In", () => {
  const email = Cypress.env("TEST_EMAIL");
  const password = Cypress.env("TEST_PASSWORD");

  it("renders sign in page", () => {
    cy.visit("/en/sign-in");
    cy.contains("Welcome back").should("be.visible");
    cy.snap("02-signin-01-page");
  });

  it("shows forgot password link", () => {
    cy.visit("/en/sign-in");
    cy.contains("Forgot password?").should("be.visible");
    cy.snap("02-signin-02-forgot-link");
  });

  it("shows error on wrong credentials", () => {
    cy.visit("/en/sign-in");
    cy.get('input[type="email"]').type("nobody@nowhere.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();
    cy.contains("Invalid email or password", { timeout: 8000 }).should("be.visible");
    cy.snap("02-signin-03-wrong-creds");
  });

  it("signs in successfully and reaches dashboard", () => {
    cy.visit("/en/sign-in");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.snap("02-signin-04-success");
  });

  it("sign in has link to sign up", () => {
    cy.visit("/en/sign-in");
    cy.contains("Sign up").click();
    cy.url().should("include", "/sign-up");
    cy.snap("02-signin-05-to-signup");
  });
});

describe("02 · Forgot Password", () => {
  it("renders forgot password page", () => {
    cy.visit("/en/forgot-password");
    cy.contains("Forgot your password?").should("be.visible");
    cy.snap("02-forgot-01-page");
  });

  it("shows success state after submitting email", () => {
    cy.visit("/en/forgot-password");
    cy.get('input[type="email"]').type("anyone@test.com");
    cy.get('button[type="submit"]').click();
    cy.contains("Check your inbox", { timeout: 8000 }).should("be.visible");
    cy.snap("02-forgot-02-success");
  });

  it("back to sign in link works", () => {
    cy.visit("/en/forgot-password");
    cy.contains("Back to sign in").click();
    cy.url().should("include", "/sign-in");
    cy.snap("02-forgot-03-back");
  });
});

describe("02 · Auth Redirects", () => {
  const email = Cypress.env("TEST_EMAIL");
  const password = Cypress.env("TEST_PASSWORD");

  it("redirects unauthenticated user away from dashboard", () => {
    cy.clearCookies();
    cy.visit("/en/dashboard");
    cy.url({ timeout: 8000 }).should("include", "/sign-in");
    cy.snap("02-redirect-01-unauth-dashboard");
  });

  it("redirects signed-in user away from sign-in page", () => {
    cy.login(email, password);
    cy.visit("/en/sign-in");
    cy.url({ timeout: 8000 }).should("include", "/dashboard");
    cy.snap("02-redirect-02-auth-signin");
  });
});
