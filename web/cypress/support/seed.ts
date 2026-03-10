/**
 * Seed the Cypress test user.
 * Run: npm run cy:seed
 *
 * Creates cypress@synapseforge.ai with onboarding already completed.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "cypress@synapseforge.ai";
  const name = "Cypress Test";
  const password = "Cypress123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Test user already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
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

  await (prisma as unknown as { aIInstance: { create: (args: unknown) => Promise<unknown> } }).aIInstance.create({
    data: {
      name: "Cypress Agent",
      type: "assistant",
      status: "running",
      tier: "minimal",
      userId: user.id,
    },
  });

  console.log(`✅ Created test user: ${email} / ${password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
