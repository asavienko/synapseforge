import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 800,
    // Screenshots saved to cypress/screenshots/ by default
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    video: false,
    defaultCommandTimeout: 10000,
    setupNodeEvents(_on, _config) {},
    reporter: "cypress-multi-reporters",
    reporterOptions: {
      reporterEnabled: "spec, mocha-junit-reporter",
      mochaJunitReporterReporterOptions: {
        mochaFile: "cypress/results/junit-[hash].xml",
        toConsole: false,
      },
    },
  },
  env: {
    // Regular test user
    TEST_EMAIL: "cypress@synapseforge.ai",
    TEST_PASSWORD: "Cypress123!",
    TEST_NAME: "Cypress Test",
    // Admin user (override if your admin has separate credentials)
    ADMIN_EMAIL: "cypress@synapseforge.ai",
    ADMIN_PASSWORD: "cypress123",
    ADMIN_PASS: "cypress123",
    // Manager user (set if you have a dedicated manager account)
    MANAGER_EMAIL: "manager@synapseforge.ai",
    MANAGER_PASSWORD: "Cypress123!",
    // Internal API key for VPS-to-app communication
    INTERNAL_API_KEY: "test-internal-key",
  },
});
