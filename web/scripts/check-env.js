#!/usr/bin/env node
/**
 * Environment Variable Checker
 * 
 * Run this before deployment to verify all required env vars are set.
 * Usage: node scripts/check-env.js
 */

const requiredVars = [
  // Database
  { key: "DATABASE_URL", required: true, example: "postgresql://user:pass@localhost:5432/openhelix" },
  
  // Auth
  { key: "NEXTAUTH_SECRET", required: true, minLength: 32, tip: "Generate with: openssl rand -base64 32" },
  { key: "NEXTAUTH_URL", required: true, example: "https://openhelixai.com" },
  
  // Encryption
  { key: "ENCRYPTION_KEY", required: true, minLength: 32, tip: "Generate with: openssl rand -hex 32" },
  
  // Email
  { key: "RESEND_API_KEY", required: true, example: "re_xxxxxxxx" },
  { key: "EMAIL_FROM", required: true, example: "noreply@openhelixai.com" },
  
  // Admin
  { key: "ADMIN_EMAILS", required: true, example: "admin@example.com,admin2@example.com" },
  
  // Stripe (for billing)
  { key: "STRIPE_SECRET_KEY", required: false, tip: "Required for billing features" },
  { key: "STRIPE_PUBLISHABLE_KEY", required: false },
  { key: "STRIPE_WEBHOOK_SECRET", required: false },
  
  // VPS Provisioning (optional)
  { key: "HETZNER_API_KEY", required: false, tip: "Required for automatic VPS provisioning" },
  
  // Feature flags
  { key: "DISABLE_RATE_LIMIT", required: false, example: "false" },
];

const optionalVars = [
  { key: "POSTHOG_KEY", tip: "Analytics tracking" },
  { key: "POSTHOG_HOST", example: "https://app.posthog.com" },
  { key: "CALCOM_API_KEY", tip: "For Cal.com booking integration" },
  { key: "DEFAULT_MANAGER_ID", tip: "Auto-assign new signups to this manager" },
];

console.log("🔍 Checking environment variables...\n");

let errors = 0;
let warnings = 0;

// Check required vars
for (const { key, required, minLength, example, tip } of requiredVars) {
  const value = process.env[key];
  
  if (!value) {
    if (required) {
      console.log(`❌ ${key}: MISSING (Required)`);
      if (example) console.log(`   Example: ${example}`);
      if (tip) console.log(`   Tip: ${tip}`);
      errors++;
    } else {
      console.log(`⚠️  ${key}: Missing (Optional but recommended)`);
      if (tip) console.log(`   Tip: ${tip}`);
      warnings++;
    }
  } else {
    let status = "✅";
    let issues = [];
    
    if (minLength && value.length < minLength) {
      status = "❌";
      issues.push(`Too short (min ${minLength} chars)`);
      errors++;
    }
    
    if (key === "DATABASE_URL" && !value.startsWith("postgresql://")) {
      status = "⚠️";
      issues.push("Should start with postgresql://");
      warnings++;
    }
    
    console.log(`${status} ${key}: Set${issues.length ? ` (${issues.join(", ")})` : ""}`);
  }
}

console.log("\n📋 Optional variables:\n");

for (const { key, tip, example } of optionalVars) {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`⚪ ${key}: Not set${tip ? ` (${tip})` : ""}${example ? ` - Example: ${example}` : ""}`);
  }
}

console.log("\n" + "=".repeat(50));
console.log(`Results: ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  console.log("\n❌ Fix errors before deploying!");
  process.exit(1);
} else if (warnings > 0) {
  console.log("\n⚠️  Deployment possible but some features may not work.");
  process.exit(0);
} else {
  console.log("\n✅ All required variables set. Ready to deploy!");
  process.exit(0);
}