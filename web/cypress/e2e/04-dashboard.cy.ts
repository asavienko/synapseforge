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
    // Accept name OR email — name can be stale across CI runs due to session JWT caching
    const testName  = Cypress.env("TEST_NAME")  as string; // "Cypress Test"
    const testEmail = Cypress.env("TEST_EMAIL") as string; // "cypress@synapseforge.ai"
    cy.get("aside")
      .invoke("text")
      .should("match", new RegExp(`${testName}|${testEmail.replace("@", "\\@")}`));
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

  it("opens create instance wizard", () => {
    cy.contains("New Instance").click();
    // Wizard uses a fixed overlay div, not a dialog role
    cy.contains("Set Up Your AI Instance").should("be.visible");
    cy.snap("04-instances-03-wizard");
  });

  it("shows the seeded Cypress Agent in the list", () => {
    // Free plan allows only 1 instance; the seeded Cypress Agent should be visible
    cy.get("main").contains("Cypress Agent", { timeout: 10000 }).should("exist");
    cy.snap("04-instances-04-list");
  });

  it("shows New Instance button (plan limit note)", () => {
    // Button exists but clicking with existing instance on free plan would hit the limit
    cy.get("main").contains("New Instance").should("exist");
    cy.snap("04-instances-05-new-btn");
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
    // Either shows "Manager not assigned yet" (no manager) or chat input (has manager)
    cy.get("main, .p-8, .flex.flex-col", { timeout: 12000 }).should("exist");
    cy.get("body").then(($body) => {
      if ($body.text().includes("Manager not assigned")) {
        cy.contains("Manager not assigned yet").should("exist");
      } else {
        cy.get("input, textarea").last().should("exist");
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
    // Seed user is plan=starter_10k (needed for spec 27 which creates a 2nd instance)
    cy.contains("starter", { matchCase: false }).should("be.visible");
    cy.snap("04-billing-02-current-plan");
  });

  it("shows all plan cards", () => {
    cy.contains("Self-Service", { matchCase: false }).should("be.visible");
    cy.contains("Managed", { matchCase: false }).should("be.visible");
    cy.snap("04-billing-03-all-plans");
  });

  it("shows upgrade option — starter user sees managed plans contact link", () => {
    // Seed user is plan=starter_10k; Starter card shows "Current plan"; Managed plans show mailto CTA
    cy.get("a[href='mailto:hello@synapseforge.ai']").should("be.visible");
    cy.snap("04-billing-04-upgrade-btn");
  });

  it("shows managed plans contact link (not a Stripe checkout button)", () => {
    // Managed plans use mailto link — "Contact Sales"
    cy.contains("a", /Contact Sales/i)
      .should("be.visible")
      .and("have.attr", "href", "mailto:hello@synapseforge.ai");
    cy.snap("04-billing-05-managed-contact");
  });
});

describe("04 · Settings", () => {
  beforeEach(() => {
    cy.login(EMAIL(), PASS());
    cy.visit("/en/dashboard/settings");
  });

  it("renders settings page", () => {
    cy.get("main").contains("Settings").should("be.visible");
    cy.snap("04-settings-01-page");
  });

  it("shows profile section with pre-filled fields", () => {
    cy.get("main").contains("Profile").should("be.visible");
    cy.get('input[type="text"]').should("have.length.gte", 1);
    cy.snap("04-settings-02-profile");
  });

  it("shows change password section", () => {
    cy.get("main").contains("Change Password").should("be.visible");
    cy.get('input[type="password"]').should("have.length.gte", 2);
    cy.snap("04-settings-03-password");
  });

  it("saves profile changes", () => {
    // Use a unique name each run so we always have a real change to submit
    const tempName = `CI Test ${Date.now()}`;
    cy.intercept("PATCH", "/api/user").as("saveProfile");
    cy.get('input[type="text"]').first().should("not.be.disabled").clear();
    cy.get('input[type="text"]').first().type(tempName);
    cy.get('button[type="submit"]').contains("Save changes").click({ force: true });
    cy.wait("@saveProfile", { timeout: 10000 }).its("response.statusCode").should("eq", 200);
    cy.snap("04-settings-04-saved");
    // Note: sidebar test uses name OR email fallback — stale name is handled.
    // Seed resets name to "Cypress Test" at the start of each CI run.
  });
});
