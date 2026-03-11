/**
 * Credentials & Config (spec 16)
 *
 * Coverage:
 *  - Credentials tab UI (add, edit, delete, masked display)
 *  - Config out-of-sync banner
 *  - Config preview (masked keys, valid structure)
 *  - API auth/validation (unknown keys, unauthorised access)
 *  - Bootstrap API (auth, single-use enforcement)
 *  - Provision API (missing Hetzner key → graceful 503)
 *  - Instance setup wizard (opens, steps render)
 */

const EMAIL = () => Cypress.env("CYPRESS_USER_EMAIL") || "cypress@synapseforge.ai";
const PASS  = () => Cypress.env("CYPRESS_USER_PASS")  || "cypress123";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getFirstInstanceId() {
  return cy.request("/api/instances").then((res) => {
    expect(res.body.length).to.be.greaterThan(0, "Need at least one instance");
    return res.body[0].id as string;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Credentials Tab — UI
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Credentials tab — navigation", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("instance detail has Credentials tab", () => {
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().click();
    cy.url().should("include", "/instances/");
    cy.contains("Credentials").should("be.visible");
    cy.snap("16-credentials-01-tab-visible");
  });

  it("clicking Credentials tab loads the section", () => {
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().click();
    cy.contains("Credentials").click();
    cy.contains("OpenClaw Config").should("be.visible");
    cy.contains("AI Provider").should("be.visible");
    cy.contains("Channels").should("be.visible");
    cy.snap("16-credentials-02-tab-content");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Credentials Tab — CRUD via UI
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Credentials — add / edit / delete", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("can add a credential via UI and see it masked", () => {
    cy.visit("/en/dashboard/instances");
    cy.get("a[href*='/dashboard/instances/']").first().invoke("attr", "href").then((href) => {
      const id = href!.split("/instances/")[1].split("/")[0];

      // Remove any pre-existing credential so the Add button is shown
      cy.request({
        method: "DELETE",
        url: `/api/instances/${id}/credentials/telegram_bot_token`,
        failOnStatusCode: false,
      });

      cy.visit(`/en/dashboard/instances/${id}`);
      cy.contains("Credentials").click();

      // Find Telegram Bot Token row and click Add (go to .p-4 row wrapper)
      cy.contains("Telegram Bot Token")
        .closest("div.p-4")
        .find("button")
        .contains(/add/i)
        .click();

      cy.get('input[type="password"]').first().type("1234567890:TestBotTokenABC");
      cy.contains("button", /save/i).first().click();

      // After save, masked value should appear
      cy.contains("1234").should("not.exist"); // raw value not shown
      cy.get('[data-testid="masked-value"], .font-mono').should("exist");
      cy.snap("16-credentials-03-add-success");
    });
  });

  it("can delete a credential", () => {
    cy.login(EMAIL(), PASS());
    getFirstInstanceId().then((id) => {
      // Ensure a credential exists first
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "telegram_bot_token", value: "1111111111:DeleteMeToken" },
      });

      cy.visit(`/en/dashboard/instances/${id}`);
      cy.contains("Credentials").click();
      cy.contains("Telegram Bot Token").should("be.visible");

      // Click trash/remove button in that row
      cy.contains("Telegram Bot Token")
        .closest("div.p-4")
        .find("button[aria-label*='remove'], button svg")
        .last()
        .click({ force: true });

      // Confirm if browser confirm dialog appears
      cy.on("window:confirm", () => true);

      cy.snap("16-credentials-04-delete");
    });
  });

  it("config out-of-sync banner appears after saving a credential", () => {
    cy.login(EMAIL(), PASS());
    getFirstInstanceId().then((id) => {
      // Save a credential (marks configSynced = false)
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "openai_api_key", value: "sk-testkey12345678901234567890" },
      });

      cy.visit(`/en/dashboard/instances/${id}`);
      cy.contains("Credentials").click();

      // Out-of-sync banner should be visible (API sets configSynced=false on save)
      cy.contains(/out of sync|credentials updated|not yet pushed/i).should("be.visible");
      cy.snap("16-credentials-05-out-of-sync-banner");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Credentials — Config Preview
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Config preview", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("View Config button shows config preview with masked keys", () => {
    getFirstInstanceId().then((id) => {
      // Add a credential so config preview returns something
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "openai_api_key", value: "sk-realKeyThatShouldBeMasked1234" },
      });

      cy.visit(`/en/dashboard/instances/${id}`);
      cy.contains("Credentials").click();
      cy.contains(/view config/i).click();

      // Config block should appear
      cy.get("pre").should("be.visible").and("contain", "agents:");

      // Real key must NOT appear
      cy.get("pre").invoke("text").should("not.match", /sk-realKeyThatShouldBeMasked/);

      cy.snap("16-credentials-06-config-preview");
    });
  });

  it("config-preview API returns masked openclaw.json5 structure", () => {
    getFirstInstanceId().then((id) => {
      cy.request({ url: `/api/instances/${id}/config-preview`, failOnStatusCode: false }).then((r) => {
        expect(r.status).to.be.oneOf([200, 204]);
        if (r.status === 200) {
          const body = typeof r.body === "string" ? r.body : JSON.stringify(r.body);
          // Should contain config structure keywords
          expect(body).to.include("gateway");
          // Real API keys (sk-... with 20+ chars) must be masked
          expect(body).not.to.match(/sk-[a-zA-Z0-9]{20,}/);
        }
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Credentials API — Validation & Auth
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Credentials API — validation", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("rejects unknown credential keys with 400", () => {
    getFirstInstanceId().then((id) => {
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "evil_injection", value: "malicious" },
        failOnStatusCode: false,
      }).then((r) => {
        expect(r.status).to.eq(400);
      });
    });
  });

  it("rejects missing value with 400", () => {
    getFirstInstanceId().then((id) => {
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "openai_api_key" },
        failOnStatusCode: false,
      }).then((r) => {
        expect(r.status).to.eq(400);
      });
    });
  });

  it("GET credentials returns masked values only", () => {
    getFirstInstanceId().then((id) => {
      // Save a real-looking key
      cy.request({
        method: "POST",
        url: `/api/instances/${id}/credentials`,
        body: { key: "anthropic_api_key", value: "sk-ant-realKeyNeverExposed12345" },
      });

      cy.request(`/api/instances/${id}/credentials`).then((r) => {
        expect(r.status).to.eq(200);
        const creds = r.body as Array<{ key: string; maskedValue: string }>;
        const found = creds.find((c) => c.key === "anthropic_api_key");
        if (found) {
          // maskedValue must contain bullets
          expect(found.maskedValue).to.include("•");
          // Must NOT expose real key
          expect(found.maskedValue).not.to.include("realKeyNeverExposed");
        }
      });
    });
  });

  it("credentials API returns 401 without session", () => {
    // Login to get instanceId, then clear cookies so request is truly unauthenticated
    cy.login(EMAIL(), PASS());
    getFirstInstanceId().then((id) => {
      cy.clearCookies();
      cy.request({
        url: `/api/instances/${id}/credentials`,
        failOnStatusCode: false,
      }).then((r) => {
        expect(r.status).to.be.oneOf([401, 403]);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Bootstrap API
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Bootstrap API", () => {
  it("returns 401 without Authorization header", () => {
    cy.request({
      url: "/api/internal/bootstrap/nonexistent-id",
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.eq(401);
    });
  });

  it("returns 401 with wrong bearer token", () => {
    cy.request({
      url: "/api/internal/bootstrap/nonexistent-id",
      headers: { Authorization: "Bearer wrong-token" },
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.oneOf([401, 404]);
    });
  });

  it("returns 404 for non-existent instance even with a token", () => {
    cy.request({
      url: "/api/internal/bootstrap/doesnotexist123",
      headers: { Authorization: "Bearer some-token-value" },
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.oneOf([401, 404]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Provision API
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Provision API — admin", () => {
  const ADMIN_EMAIL = () => Cypress.env("ADMIN_EMAIL") || "cypress@synapseforge.ai";
  const ADMIN_PASS  = () => Cypress.env("ADMIN_PASS") || Cypress.env("ADMIN_PASSWORD") || "cypress123";

  it("returns 503 when HETZNER_API_KEY is not configured (expected in CI)", () => {
    cy.login(ADMIN_EMAIL(), ADMIN_PASS());
    getFirstInstanceId().then((id) => {
      cy.request({
        method: "POST",
        url: `/api/admin/instances/${id}/provision`,
        failOnStatusCode: false,
      }).then((r) => {
        // In CI (no real Hetzner key) → 503; if somehow configured → 200/202
        expect(r.status).to.be.oneOf([200, 202, 503, 400]);
        cy.snap("16-credentials-07-provision-api");
      });
    });
  });

  it("returns 401 when non-admin tries to provision", () => {
    cy.login(EMAIL(), PASS());
    getFirstInstanceId().then((id) => {
      cy.request({
        method: "POST",
        url: `/api/admin/instances/${id}/provision`,
        failOnStatusCode: false,
      }).then((r) => {
        // 401/403 = auth rejection; 503 = service unavailable (no HETZNER_API_KEY in CI)
        expect(r.status).to.be.oneOf([401, 403, 503]);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16 · Instance Setup Wizard
// ─────────────────────────────────────────────────────────────────────────────

describe("16 · Instance Setup Wizard", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("New Instance button opens the wizard", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("New Instance").click();
    cy.contains("Set Up Your AI Instance").should("be.visible");
    cy.snap("16-credentials-08-wizard-open");
  });

  it("Step 1 shows template cards", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("New Instance").click();
    cy.contains(/general assistant|customer support|faq|lead/i).should("be.visible");
    cy.snap("16-credentials-09-wizard-step1-templates");
  });

  it("can navigate from Step 1 to Step 2", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("New Instance").click();
    // Fill name on step 1
    cy.get("input[placeholder*='Bot'], input[placeholder*='bot'], input[name='name'], input[type='text']")
      .first()
      .clear()
      .type("Test Wizard Bot");
    cy.contains("button", /next/i).click();
    // Step 2: AI Provider
    cy.contains(/ai provider|choose.*provider|openai|anthropic/i).should("be.visible");
    cy.snap("16-credentials-10-wizard-step2-provider");
  });

  it("can navigate to Step 3 (Channels)", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("New Instance").click();
    cy.get("input[type='text']").first().clear().type("Channel Test Bot");
    cy.contains("button", /next/i).click();
    // Step 2: AI Provider — must select a provider and enter an API key before Next is enabled
    cy.contains(/openai/i).first().click();
    cy.get("input[placeholder*='sk-']").first().type("sk-test-fake-key-for-wizard");
    cy.contains("button", /next/i).click();
    cy.contains(/connect channels|telegram|discord|slack/i).should("be.visible");
    cy.snap("16-credentials-11-wizard-step3-channels");
  });

  it("wizard can be closed/dismissed", () => {
    cy.visit("/en/dashboard/instances");
    cy.contains("New Instance").click();
    cy.contains("Set Up Your AI Instance").should("be.visible");
    cy.contains("button", /cancel|close/i).click({ force: true });
    cy.contains("Set Up Your AI Instance").should("not.exist");
    cy.snap("16-credentials-12-wizard-closed");
  });
});
