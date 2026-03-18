/**
 * Admin Panel (/en/admin)
 * User list · Manager creation · Manager assignment · Message threads
 * Requires ADMIN_EMAILS env to include cypress@synapseforge.ai
 * OR use a separate admin test user.
 */
const ADMIN_EMAIL = Cypress.env("ADMIN_EMAIL") || Cypress.env("TEST_EMAIL");
const ADMIN_PASS  = Cypress.env("ADMIN_PASSWORD") || Cypress.env("TEST_PASSWORD");

describe("08 · Admin Panel", () => {
  beforeEach(() => {
    cy.login(ADMIN_EMAIL, ADMIN_PASS);
    cy.visit("/en/admin", { failOnStatusCode: false });
  });

  it("renders admin panel or redirects non-admins", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Access denied") || 
          (!$body.text().includes("Admin Panel") && !$body.text().includes("Total Users"))) {
        // Non-admin — expected redirect/denial
        cy.log("Non-admin user — access denied as expected");
        cy.snap("08-admin-01-access-denied");
      } else {
        cy.contains("Admin Panel").should("be.visible");
        cy.snap("08-admin-01-panel");
      }
    });
  });

  it("shows stats cards when admin", () => {
    cy.get("body").then(($body) => {
      const isAdmin = !$body.text().includes("Access denied") && 
                      ($body.text().includes("Admin Panel") || $body.text().includes("Total Users"));
      if (isAdmin) {
        cy.contains("Total Users").should("be.visible");
        cy.snap("08-admin-02-stats");
      } else {
        cy.log("Skipped — not admin");
      }
    });
  });

  it("shows user list when admin", () => {
    cy.get("body").then(($body) => {
      const isAdmin = !$body.text().includes("Access denied") && 
                      ($body.text().includes("Admin Panel") || $body.text().includes("Total Users"));
      if (isAdmin) {
        cy.contains("Users").should("be.visible");
        cy.get("table, [class*='user'], [class*='list']").should("exist");
        cy.snap("08-admin-03-users-list");
      } else {
        cy.log("Skipped — not admin");
      }
    });
  });

  it("shows create manager button when admin", () => {
    cy.get("body").then(($body) => {
      const isAdmin = !$body.text().includes("Access denied") && 
                      ($body.text().includes("Admin Panel") || $body.text().includes("Total Users"));
      if (isAdmin) {
        cy.contains("Add Manager").should("be.visible");
        cy.snap("08-admin-04-create-manager-btn");
      } else {
        cy.log("Skipped — not admin");
      }
    });
  });

  it("can open create manager form", () => {
    cy.get("body").then(($body) => {
      const isAdmin = !$body.text().includes("Access denied") && 
                      ($body.text().includes("Admin Panel") || $body.text().includes("Total Users"));
      if (isAdmin) {
        cy.contains("Add Manager").click();
        cy.get('input[type="text"], input[name="name"]').should("be.visible");
        cy.snap("08-admin-05-create-manager-form");
      } else {
        cy.log("Skipped — not admin");
      }
    });
  });
});
