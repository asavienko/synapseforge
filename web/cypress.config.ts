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
  },
  env: {
    TEST_EMAIL: "cypress@synapseforge.ai",
    TEST_PASSWORD: "Cypress123!",
    TEST_NAME: "Cypress Test",
  },
});
