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
  const password = "Cypress123!";

  const hashed = await bcrypt.hash(password, 12);

  // Always upsert — resets name/plan even if user exists (CI runs may mutate data)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      plan: "free",
      onboardingDone: true,
      password: hashed,
    },
    create: {
      email,
      name,
      password: hashed,
      plan: "free",
      onboardingDone: true,
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
  }

  console.log(`✅ Upserted test user: ${email} / ${password} (name reset to "${name}")`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
