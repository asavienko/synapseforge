/**
 * Create admin user for platform management
 * Run: npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "asavienko@gmail.com"; // Anton's email
const ADMIN_NAME = "Anton Savienko";
const ADMIN_PASSWORD = "AdminPass123!"; // Change this after first login

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create or update admin user
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      plan: "enterprise",
      onboardingDone: true,
      password: hashed,
      emailVerified: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: hashed,
      plan: "enterprise",
      onboardingDone: true,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin user created/updated: ${ADMIN_EMAIL}`);
  console.log(`🔑 Temporary password: ${ADMIN_PASSWORD}`);
  console.log(`⚠️  IMPORTANT: Change this password after first login!`);
  console.log(`🔗 Login at: https://synapseforge.ai/en/sign-in`);
  console.log(`🔗 Admin panel: https://synapseforge.ai/en/admin`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
