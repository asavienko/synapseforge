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
    defaultCommandTimeout: 15000,
    setupNodeEvents(on, config) {
      on("task", {
        /**
         * Directly set sandbox state on an instance via Prisma.
         * Used by spec 29 to simulate amber / red / exhausted states
         * without sending real messages.
         */
        async setSandboxState({
          instanceId,
          sandboxUsed,
          sandboxMode,
        }: {
          instanceId: string;
          sandboxUsed?: number;
          sandboxMode?: boolean;
        }) {
          // Dynamic import to avoid top-level require issues in ESM config
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          try {
            const data: Record<string, unknown> = {};
            if (sandboxUsed !== undefined) data.sandboxUsed = sandboxUsed;
            if (sandboxMode !== undefined) data.sandboxMode = sandboxMode;
            await prisma.aIInstance.update({ where: { id: instanceId }, data });
            return { ok: true };
          } finally {
            await prisma.$disconnect();
          }
        },

        /**
         * Directly set instance status via Prisma.
         * Used by spec 20 to reliably simulate a stopped instance.
         */
        async setInstanceStatus({
          instanceId,
          status,
        }: {
          instanceId: string;
          status: string;
        }) {
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          try {
            await prisma.aIInstance.update({ where: { id: instanceId }, data: { status } });
            return { ok: true };
          } finally {
            await prisma.$disconnect();
          }
        },

        /**
         * Get the seeded Cypress Agent instance ID directly from DB.
         * Used by spec 07 (and others) to avoid fragile UI navigation in before().
         */
        async getCypressInstanceId() {
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          try {
            const instance = await prisma.aIInstance.findFirst({
              where: { name: "Cypress Agent" },
              select: { id: true },
            });
            return instance?.id ?? null;
          } finally {
            await prisma.$disconnect();
          }
        },

        /**
         * Seed a ChatMessage directly into the DB for an instance.
         * Used by spec 29 test 05 to ensure chat history exists without
         * relying on intercepted HTTP responses (avoids race conditions).
         * Also wipes existing messages when clearFirst=true.
         */
        async seedChatMessage({
          instanceId,
          role,
          content,
          clearFirst,
        }: {
          instanceId: string;
          role: string;
          content: string;
          clearFirst?: boolean;
        }) {
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          try {
            if (clearFirst) {
              await (prisma as unknown as { chatMessage: { deleteMany: (a: unknown) => Promise<unknown> } })
                .chatMessage.deleteMany({ where: { instanceId } });
            }
            await (prisma as unknown as { chatMessage: { create: (a: unknown) => Promise<unknown> } })
              .chatMessage.create({
                data: { instanceId, role, content, isError: false, source: "web" },
              });
            return { ok: true };
          } finally {
            await prisma.$disconnect();
          }
        },
      });
    },
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
    TEST_PASSWORD: "cypress123",
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
