/**
 * Seed the Cypress test user.
 * Run: npm run cy:seed
 *
 * ALWAYS upserts — resets name/plan to known state so CI tests are idempotent.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "cypress@synapseforge.ai";
  const name = "Cypress Test";
  const password = "cypress123"; // Must match cypress.config.ts TEST_PASSWORD

  const hashed = await bcrypt.hash(password, 12);

  // Remove any stale auto-created instances for the seed user (not named "Cypress Agent")
  const seedUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (seedUser) {
    const staleInstances = await prisma.aIInstance.deleteMany({
      where: { userId: seedUser.id, name: { not: "Cypress Agent" } },
    });
    if (staleInstances.count > 0) console.log(`🧹 Removed ${staleInstances.count} stale instance(s)`);
  }

  // Purge all ephemeral test users created by registerFreshUser() across specs
  const purged = await prisma.user.deleteMany({
    where: {
      email: { not: email },
      OR: [
        { email: { contains: "cypress-ob-" } },
        { email: { contains: "cypress-reg-" } },
        { email: { contains: "cypress-email-" } },
        { email: { contains: "cypress-settings-" } },
        { email: { contains: "cypress-pw-" } },
        { email: { contains: "cypress-msg-" } },
        { email: { contains: "cypress-admin-" } },
      ],
    },
  });
  if (purged.count > 0) console.log(`🧹 Purged ${purged.count} ephemeral test users`);

  // Always upsert — resets name/plan/emailVerified even if user exists (CI runs may mutate data)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      plan: "free",
      onboardingDone: true,
      password: hashed,
      emailVerified: new Date(), // Ensure email is verified — avoids banner blocking tests
    },
    create: {
      email,
      name,
      password: hashed,
      plan: "free",
      onboardingDone: true,
      emailVerified: new Date(),
      onboardingData: JSON.stringify({
        business: "Cypress Corp",
        industry: "SaaS / Software",
        useCase: "customer-support",
      }),
    },
  });

  // Ensure the Cypress Agent instance exists
  const existing = await (prisma as unknown as {
    aIInstance: {
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
      create: (args: unknown) => Promise<unknown>;
    };
  }).aIInstance.findFirst({ where: { userId: user.id, name: "Cypress Agent" } });

  if (!existing) {
    await (prisma as unknown as {
      aIInstance: { create: (args: unknown) => Promise<unknown> };
    }).aIInstance.create({
      data: {
        name: "Cypress Agent",
        type: "assistant",
        status: "running",
        tier: "minimal",
        userId: user.id,
      },
    });
    console.log(`✅ Created Cypress Agent instance`);
  } else {
    // Reset instance to a known state so tests that mutate status/provisionStatus don't bleed
    await (prisma as unknown as {
      aIInstance: { update: (args: unknown) => Promise<unknown> };
    }).aIInstance.update({
      where: { id: existing.id },
      data: {
        status: "running",
        provisionStatus: null,
        vpsUrl: null,
        vpsServerId: null,
        configSynced: true,
      },
    });
    console.log(`✅ Reset Cypress Agent instance to known state (running, no VPS)`);
  }

  console.log(`✅ Upserted test user: ${email} / ${password} (name reset to "${name}")`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
