/**
 * i18n — Locale routing and translations
 */
const LOCALES = [
  { code: "en", hero: "Get started free",      signIn: "Welcome back"         },
  { code: "es", hero: "Empieza gratis",         signIn: "Bienvenido de nuevo"  },
  { code: "uk", hero: "Почати безкоштовно",     signIn: "З поверненням"        },
  { code: "ru", hero: "Начать бесплатно",        signIn: "С возвращением"       },
];

describe("05 · i18n — Landing Page", () => {
  LOCALES.forEach(({ code, hero }) => {
    it(`renders landing in ${code.toUpperCase()}`, () => {
      cy.visit(`/${code}`);
      cy.contains(hero, { timeout: 8000 }).should("be.visible");
      cy.snap(`05-i18n-landing-${code}`);
    });
  });
});

describe("05 · i18n — Sign In Page", () => {
  LOCALES.forEach(({ code, signIn }) => {
    it(`renders sign-in in ${code.toUpperCase()}`, () => {
      cy.visit(`/${code}/sign-in`);
      cy.contains(signIn, { timeout: 8000 }).should("be.visible");
      cy.snap(`05-i18n-signin-${code}`);
    });
  });
});

describe("05 · i18n — Locale Switcher", () => {
  it("/ redirects to a locale-prefixed URL", () => {
    cy.visit("/", { failOnStatusCode: false });
    cy.url({ timeout: 8000 }).should("match", /\/(en|es|uk|ru)/);
    cy.snap("05-i18n-root-redirect");
  });

  it("switching from EN to RU updates URL and content", () => {
    cy.visit("/en");
    cy.get("nav").find("button").contains(/EN/i).click();
    cy.get("button").contains("RU").click();
    cy.url({ timeout: 8000 }).should("include", "/ru");
    cy.contains("Начать бесплатно").should("be.visible");
    cy.snap("05-i18n-switch-to-ru");
  });
});
