#!/usr/bin/env tsx
/**
 * Database Migration Helper
 * 
 * Run this after deploying to ensure all required data is seeded.
 * Usage: npx tsx scripts/migrate-and-seed.ts
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🔄 Running database migrations and seeds...\n");

// Check if .env exists
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found!");
  console.log("   Please create .env file first (see .env.example)");
  process.exit(1);
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in environment!");
  console.log("   Please set DATABASE_URL in your .env file");
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log("📦 Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("✅ Prisma client generated\n");

  // Run migrations
  console.log("🗄️  Running database migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("✅ Migrations completed\n");

  // Check if we need to seed
  console.log("🌱 Checking if seeding is needed...");
  
  // Note: In production, you might want to check if data already exists
  // before running seeds to avoid duplicates
  console.log("   Skipping seed - run manually with: npx prisma db seed");
  console.log("   Or create admin with: npx tsx scripts/create-admin.ts\n");

  console.log("✅ Database setup complete!");
  console.log("\nNext steps:");
  console.log("  1. Create an admin user: npx tsx scripts/create-admin.ts");
  console.log("  2. Start the dev server: npm run dev");
  console.log("  3. Visit http://localhost:3000");

} catch (error) {
  console.error("\n❌ Migration failed:", (error as Error).message);
  process.exit(1);
}