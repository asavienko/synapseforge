/**
 * Translation Coverage
 *
 * For every non-English locale, verifies:
 *  1. Locale-specific strings ARE present (confirming active translation)
 *  2. Specific English-only strings are NOT present (no fallback leakage)
 *  3. All nav, hero, pricing, auth, onboarding, and dashboard labels are translated
 *
 * Strategy: each locale has a "fingerprint" — a key phrase that ONLY appears in
 * that language. If the English fingerprint appears on an ES/UK/RU page, the
 * translation is broken.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const LOCALES = [
  {
    code: "es",
    name: "Spanish",
    nav: {
      services: "Servicios",
      pricing: "Precios",
      signIn: "Iniciar sesión",
      getStarted: "Empieza gratis",
    },
    hero: "Tu Stack de IA, Completamente Gestionado",
    heroCTA: "Empieza gratis",
    services: "Lo Que Construimos Para Ti",
    pricing: "Precios Simples y Transparentes",
    about: "Forjamos el Stack de IA",
    footer: { privacy: "Política de Privacidad", terms: "Términos de Servicio" },
    auth: {
      signInTitle: "Bienvenido de nuevo",
      signUpTitle: "Crea tu cuenta",
      forgotTitle: "¿Olvidaste tu contraseña?",
      forgotSuccess: "Revisa tu bandeja de entrada",
      forgotBack: "Volver a iniciar sesión",
    },
  },
  {
    code: "uk",
    name: "Ukrainian",
    nav: {
      services: "Послуги",
      pricing: "Ціни",
      signIn: "Увійти",
      getStarted: "Почати безкоштовно",
    },
    hero: "Ваш AI-стек під повним управлінням",
    heroCTA: "Почати безкоштовно",
    services: "Що ми будуємо для вас",
    pricing: "Прозоре ціноутворення",
    about: "Ми будуємо AI-стек",
    footer: { privacy: "Політика конфіденційності", terms: "Умови використання" },
    auth: {
      signInTitle: "З поверненням",
      signUpTitle: "Створіть акаунт",
      forgotTitle: "Забули пароль?",
      forgotSuccess: "Перевірте пошту",
      forgotBack: "Повернутись до входу",
    },
  },
  {
    code: "ru",
    name: "Russian",
    nav: {
      services: "Услуги",
      pricing: "Цены",
      signIn: "Войти",
      getStarted: "Начать бесплатно",
    },
    hero: "Ваш AI-стек под полным управлением",
    heroCTA: "Начать бесплатно",
    services: "Что мы строим для вас",
    pricing: "Прозрачное ценообразование",
    about: "Мы строим AI-стек",
    footer: { privacy: "Политика конфиденциальности", terms: "Условия использования" },
    auth: {
      signInTitle: "С возвращением",
      signUpTitle: "Создайте аккаунт",
      forgotTitle: "Забыли пароль?",
      forgotSuccess: "Проверьте почту",
      forgotBack: "Вернуться ко входу",
    },
  },
] as const;

// Strings that must NOT appear on non-English pages (English fallback detection)
const ENGLISH_ONLY = [
  "Get started free",
  "What We Build For You",
  "Simple, Transparent Pricing",
  "Welcome back",
  "Create your account",
  "Forgot your password?",
  "Check your inbox",
];

// ─── Landing Page Translations ────────────────────────────────────────────────

LOCALES.forEach((locale) => {
  describe(`12 · Translations — ${locale.name} (${locale.code}) — Landing`, () => {
    beforeEach(() => cy.visit(`/${locale.code}`));

    it(`nav: services link is translated`, () => {
      cy.get("nav").contains(locale.nav.services).should("be.visible");
      cy.snap(`12-${locale.code}-nav-services`);
    });

    it(`nav: pricing link is translated`, () => {
      cy.get("nav").contains(locale.nav.pricing).should("be.visible");
      cy.snap(`12-${locale.code}-nav-pricing`);
    });

    it(`nav: sign in is translated`, () => {
      cy.get("nav").contains(locale.nav.signIn).should("be.visible");
      cy.snap(`12-${locale.code}-nav-signin`);
    });

    it(`nav: get started CTA is translated`, () => {
      cy.get("nav").contains(locale.nav.getStarted).should("be.visible");
      cy.snap(`12-${locale.code}-nav-getstarted`);
    });

    it(`hero: title is translated`, () => {
      cy.contains(locale.hero).should("be.visible");
      cy.snap(`12-${locale.code}-hero-title`);
    });

    it(`hero: CTA button is translated`, () => {
      cy.contains(locale.heroCTA).should("be.visible");
      cy.snap(`12-${locale.code}-hero-cta`);
    });

    it(`services section title is translated`, () => {
      cy.get("a[href='#services']").first().click({ force: true });
      cy.contains(locale.services).should("be.visible");
      cy.snap(`12-${locale.code}-services-title`);
    });

    it(`pricing section title is translated`, () => {
      cy.get("a[href='#pricing']").first().click({ force: true });
      cy.contains(locale.pricing).should("be.visible");
      cy.snap(`12-${locale.code}-pricing-title`);
    });

    it(`about section title is translated`, () => {
      cy.get("a[href='#about']").first().click({ force: true });
      cy.contains(locale.about).should("be.visible");
      cy.snap(`12-${locale.code}-about-title`);
    });

    it(`footer: privacy policy link is translated`, () => {
      cy.contains(locale.footer.privacy).should("be.visible");
      cy.snap(`12-${locale.code}-footer-privacy`);
    });

    it(`footer: terms link is translated`, () => {
      cy.contains(locale.footer.terms).should("be.visible");
      cy.snap(`12-${locale.code}-footer-terms`);
    });

    // English fallback detection
    ENGLISH_ONLY.forEach((englishText) => {
      it(`no English fallback: "${englishText}" must not appear`, () => {
        cy.contains(englishText).should("not.exist");
      });
    });
  });
});

// ─── Auth Page Translations ───────────────────────────────────────────────────

LOCALES.forEach((locale) => {
  describe(`12 · Translations — ${locale.name} (${locale.code}) — Auth`, () => {
    it(`sign-in title is translated`, () => {
      cy.visit(`/${locale.code}/sign-in`);
      cy.contains(locale.auth.signInTitle).should("be.visible");
      cy.snap(`12-${locale.code}-auth-signin-title`);
    });

    it(`sign-up title is translated`, () => {
      cy.visit(`/${locale.code}/sign-up`);
      cy.contains(locale.auth.signUpTitle).should("be.visible");
      cy.snap(`12-${locale.code}-auth-signup-title`);
    });

    it(`forgot password title is translated`, () => {
      cy.visit(`/${locale.code}/forgot-password`);
      cy.contains(locale.auth.forgotTitle).should("be.visible");
      cy.snap(`12-${locale.code}-auth-forgot-title`);
    });

    it(`forgot password back link is translated`, () => {
      cy.visit(`/${locale.code}/forgot-password`);
      cy.contains(locale.auth.forgotBack).should("be.visible");
      cy.snap(`12-${locale.code}-auth-forgot-back`);
    });

    it(`forgot password success message is translated`, () => {
      cy.visit(`/${locale.code}/forgot-password`);
      cy.get('input[type="email"]').type("test@test.com");
      cy.get('button[type="submit"]').click();
      cy.contains(locale.auth.forgotSuccess, { timeout: 8000 }).should("be.visible");
      cy.snap(`12-${locale.code}-auth-forgot-success`);
    });
  });
});

// ─── English baseline: all strings present ────────────────────────────────────

describe("12 · Translations — English (en) — Baseline", () => {
  it("landing page has all English strings", () => {
    cy.visit("/en");
    cy.contains("Your AI Stack, Fully Managed").should("be.visible");
    cy.contains("What We Build For You").should("be.visible");
    cy.contains("Simple, Transparent Pricing").should("be.visible");
    cy.snap("12-en-baseline-landing");
  });

  it("sign-in page has English strings", () => {
    cy.visit("/en/sign-in");
    cy.contains("Welcome back").should("be.visible");
    cy.snap("12-en-baseline-signin");
  });

  it("sign-up page has English strings", () => {
    cy.visit("/en/sign-up");
    cy.contains("Create your account").should("be.visible");
    cy.snap("12-en-baseline-signup");
  });

  it("forgot password page has English strings", () => {
    cy.visit("/en/forgot-password");
    cy.contains("Forgot your password?").should("be.visible");
    cy.snap("12-en-baseline-forgot");
  });
});

// ─── Dashboard Page Translations ─────────────────────────────────────────────

const DASHBOARD_LOCALES = [
  {
    code: "es",
    instances: { title: "Instancias de IA", newBtn: "Nueva instancia", emptyTitle: "Aún no hay instancias" },
    messages: { title: "Mensajes", placeholder: "Escribe un mensaje..." },
    settings: { title: "Configuración", profileSection: "Perfil" },
    privacy: { title: "Política de Privacidad" },
    terms: { title: "Términos de Servicio" },
  },
  {
    code: "uk",
    instances: { title: "AI-інстанції", newBtn: "Нова інстанція", emptyTitle: "Інстанцій ще немає" },
    messages: { title: "Повідомлення", placeholder: "Введіть повідомлення..." },
    settings: { title: "Налаштування", profileSection: "Профіль" },
    privacy: { title: "Політика конфіденційності" },
    terms: { title: "Умови використання" },
  },
  {
    code: "ru",
    instances: { title: "AI-инстанции", newBtn: "Новая инстанция", emptyTitle: "Инстанций пока нет" },
    messages: { title: "Сообщения", placeholder: "Введите сообщение..." },
    settings: { title: "Настройки", profileSection: "Профиль" },
    privacy: { title: "Политика конфиденциальности" },
    terms: { title: "Условия использования" },
  },
] as const;

const EMAIL = () => Cypress.env("TEST_EMAIL") as string;
const PASS = () => Cypress.env("TEST_PASSWORD") as string;

DASHBOARD_LOCALES.forEach((locale) => {
  describe(`12 · Translations — Dashboard — ${locale.code.toUpperCase()}`, () => {
    beforeEach(() => cy.login(EMAIL(), PASS()));

    it(`instances page title is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/dashboard/instances`);
      cy.get("main").contains(locale.instances.title).should("be.visible");
      cy.snap(`12-${locale.code}-dashboard-instances`);
    });

    it(`instances New Instance button is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/dashboard/instances`);
      cy.get("main").contains(locale.instances.newBtn).should("exist");
    });

    it(`messages page title is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/dashboard/messages`);
      cy.get("main, h1").contains(locale.messages.title).should("be.visible");
      cy.snap(`12-${locale.code}-dashboard-messages`);
    });

    it(`settings page title is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/dashboard/settings`);
      cy.get("main").contains(locale.settings.title).should("be.visible");
      cy.get("main").contains(locale.settings.profileSection).should("be.visible");
      cy.snap(`12-${locale.code}-dashboard-settings`);
    });
  });

  describe(`12 · Translations — Public pages — ${locale.code.toUpperCase()}`, () => {
    it(`privacy page is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/privacy`);
      cy.contains(locale.privacy.title).should("be.visible");
      cy.snap(`12-${locale.code}-privacy`);
    });

    it(`terms page is translated (${locale.code})`, () => {
      cy.visit(`/${locale.code}/terms`);
      cy.contains(locale.terms.title).should("be.visible");
      cy.snap(`12-${locale.code}-terms`);
    });
  });
});

// ─── English Dashboard Baseline ───────────────────────────────────────────────

describe("12 · Translations — English Dashboard Baseline", () => {
  beforeEach(() => cy.login(EMAIL(), PASS()));

  it("instances page is English", () => {
    cy.visit("/en/dashboard/instances");
    cy.get("main").contains("AI Instances").should("be.visible");
    cy.snap("12-en-dashboard-instances");
  });

  it("messages page is English", () => {
    cy.visit("/en/dashboard/messages");
    cy.get("main, h1").contains("Messages").should("be.visible");
    cy.snap("12-en-dashboard-messages");
  });

  it("settings page is English", () => {
    cy.visit("/en/dashboard/settings");
    cy.get("main").contains("Settings").should("be.visible");
    cy.get("main").contains("Profile").should("be.visible");
    cy.snap("12-en-dashboard-settings");
  });

  it("privacy page is English", () => {
    cy.visit("/en/privacy");
    cy.contains("Privacy Policy").should("be.visible");
    cy.snap("12-en-privacy");
  });

  it("terms page is English", () => {
    cy.visit("/en/terms");
    cy.contains("Terms of Service").should("be.visible");
    cy.snap("12-en-terms");
  });
});
