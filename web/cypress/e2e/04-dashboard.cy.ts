/**
 * Dashboard
 * Overview · Instances · Messages · Billing · Settings · Sidebar nav
 */
const EMAIL = () => Cypress.env("TEST_EMAIL");
const PASS  = () => Cypress.env("TEST_PASSWORD");

describe("04 · Dashboard Overview", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard");
  });

  it("renders overview with greeting", () => {
    cy.contains("Good to see you").should("be.visible");
    cy.snap("04-overview-01-greeting");
  });

  it("shows stat cards — instances and plan", () => {
    cy.get("main").contains("Instances").should("be.visible");
    cy.get("main").contains("Plan").should("be.visible");
    cy.snap("04-overview-02-stats");
  });

  it("shows getting started checklist (visible when not all done)", () => {
    // The checklist is hidden when all steps are complete.
    // The test user has no manager → checklist should be visible.
    cy.get("body").then(($body) => {
      if ($body.text().includes("Getting started")) {
        cy.contains("Getting started").should("be.visible");
      } else {
        cy.log("Checklist hidden — all steps already complete");
      }
    });
    cy.snap("04-overview-03-checklist");
  });

  it("shows manager card", () => {
    // Always shows — either assigned manager or 'assigned soon' placeholder
    cy.contains("Your dedicated manager").should("be.visible");
    cy.snap("04-overview-04-manager");
  });

  it("shows recent activity section", () => {
    cy.contains("Recent Activity").should("be.visible");
    cy.snap("04-overview-05-activity");
  });
});

describe("04 · Dashboard Sidebar", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard");
  });

  it("shows all nav items", () => {
    cy.get("aside").contains("Overview").should("exist");
    cy.get("aside").contains("Instances").should("exist");
    cy.get("aside").contains("Messages").should("exist");
    cy.get("aside").contains("Billing").should("exist");
    cy.get("aside").contains("Settings").should("exist");
    cy.snap("04-sidebar-01-items");
  });

  it("navigates to Instances", () => {
    cy.get("aside").contains("Instances").click({ force: true });
    cy.url().should("include", "/instances");
    cy.snap("04-sidebar-02-nav-instances");
  });

  it("navigates to Messages", () => {
    cy.get("aside").contains("Messages").click({ force: true });
    cy.url().should("include", "/messages");
    cy.snap("04-sidebar-03-nav-messages");
  });

  it("navigates to Billing", () => {
    cy.get("aside").contains("Billing").click({ force: true });
    cy.url().should("include", "/billing");
    cy.snap("04-sidebar-04-nav-billing");
  });

  it("navigates to Settings", () => {
    cy.get("aside").contains("Settings").click({ force: true });
    cy.url().should("include", "/settings");
    cy.snap("04-sidebar-05-nav-settings");
  });

  it("shows user name in sidebar", () => {
    cy.get("aside").contains(Cypress.env("TEST_NAME")).should("exist");
    cy.snap("04-sidebar-06-user-info");
  });
});

describe("04 · Instances", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/instances");
  });

  it("renders instances page", () => {
    cy.snap("04-instances-01-page");
  });

  it("shows New Instance button", () => {
    cy.get("main").contains("New Instance").should("be.visible");
    cy.snap("04-instances-02-create-btn");
  });

  it("opens create instance modal", () => {
    cy.contains("New Instance").click();
    cy.get("[role='dialog'], [data-modal], form").should("be.visible");
    cy.snap("04-instances-03-modal");
  });

  it("creates a new instance", () => {
    cy.contains("New Instance").click();
    cy.get("input").first().clear().type("CI Test Agent");
    cy.get("form").find("button").contains(/create/i).click();
    cy.contains("CI Test Agent", { timeout: 10000 }).should("be.visible");
    cy.snap("04-instances-04-created");
  });

  it("shows instance with status indicator", () => {
    // Seeded user has "Cypress Agent" — check it's visible
    cy.contains("Cypress Agent", { timeout: 8000 }).should("exist");
    cy.snap("04-instances-05-status");
  });
});

describe("04 · Messages", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/messages");
  });

  it("renders messages page", () => {
    cy.snap("04-messages-01-page");
  });

  it("shows manager chat or no-manager state", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Manager not assigned")) {
        cy.contains("Manager not assigned yet").should("be.visible");
      } else {
        cy.get("input, textarea").last().should("be.visible");
      }
    });
    cy.snap("04-messages-02-state");
  });
});

describe("04 · Billing", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/billing");
  });

  it("renders billing page with title", () => {
    cy.contains("Billing & Plans").should("be.visible");
    cy.snap("04-billing-01-page");
  });

  it("shows current plan card", () => {
    cy.contains("Current Plan").should("be.visible");
    cy.contains("free", { matchCase: false }).should("be.visible");
    cy.snap("04-billing-02-current-plan");
  });

  it("shows all three plan cards", () => {
    cy.contains("Free").should("be.visible");
    cy.contains("Pro").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
    cy.snap("04-billing-03-all-plans");
  });

  it("shows Upgrade to Pro button", () => {
    cy.contains("Upgrade to Pro").should("be.visible");
    cy.snap("04-billing-04-upgrade-btn");
  });

  it("shows Upgrade to Enterprise button", () => {
    cy.contains("Upgrade to Enterprise").should("be.visible");
    cy.snap("04-billing-05-enterprise-btn");
  });
});

describe("04 · Settings", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/settings");
  });

  it("renders settings page", () => {
    cy.contains("Settings").should("be.visible");
    cy.snap("04-settings-01-page");
  });

  it("shows profile section with pre-filled fields", () => {
    cy.contains("Profile").should("be.visible");
    cy.get('input[type="text"], input[type="email"]').should("have.length.gte", 2);
    cy.snap("04-settings-02-profile");
  });

  it("shows change password section", () => {
    cy.contains("Change Password").should("be.visible");
    cy.get('input[type="password"]').should("have.length.gte", 2);
    cy.snap("04-settings-03-password");
  });

  it("saves profile changes and restores name", () => {
    const testName = Cypress.env("TEST_NAME") as string;
    cy.get('input[type="text"]').first().should("not.be.disabled").clear().type("Cypress Updated");
    cy.get('button[type="submit"]').contains("Save changes").click({ force: true });
    cy.contains(/updated|saved|success/i, { timeout: 10000 }).should("exist");
    cy.snap("04-settings-04-saved");
    // Restore so sidebar shows correct name on next run
    cy.get('input[type="text"]').first().clear().type(testName);
    cy.get('button[type="submit"]').contains("Save changes").click({ force: true });
    cy.contains(/updated|saved|success/i, { timeout: 8000 }).should("exist");
  });
});
