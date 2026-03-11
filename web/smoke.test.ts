import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const results: string[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    try { await fn(); results.push(`✅ ${name}`); }
    catch(e: any) { results.push(`❌ ${name}: ${String(e.message).slice(0,80)}`); }
  }

  // Landing page
  await test("Landing: hero text", async () => {
    await page.goto(`${BASE}/en`);
    await page.waitForSelector("text=Your AI Agent", { timeout: 10000 });
  });
  await test("Landing: ES locale", async () => {
    await page.goto(`${BASE}/es`);
    await page.waitForSelector("text=Activo en 3 minutos", { timeout: 8000 });
  });
  await test("Landing: pricing", async () => {
    await page.goto(`${BASE}/en`);
    await page.waitForSelector("text=Simple, transparent pricing", { timeout: 8000 });
  });

  // Auth
  await test("Auth: login cypress123", async () => {
    await page.goto(`${BASE}/en/sign-in`);
    await page.fill("input[type=email]", "cypress@synapseforge.ai");
    await page.fill("input[type=password]", "cypress123");
    await page.click("button[type=submit]");
    await page.waitForURL(`${BASE}/en/dashboard**`, { timeout: 15000 });
  });
  await test("Dashboard: loads", async () => {
    await page.goto(`${BASE}/en/dashboard`);
    await page.waitForSelector('[data-testid="messages-stat"]', { timeout: 8000 });
  });
  await test("Dashboard: instances page", async () => {
    await page.goto(`${BASE}/en/dashboard/instances`);
    await page.waitForSelector("text=AI Instances", { timeout: 8000 });
  });

  // Instance detail
  const r = await ctx.request.get(`${BASE}/api/instances`);
  const insts = await r.json() as {id:string}[];
  const id = insts[0]?.id;
  if (id) {
    await test("Instance detail: usage panel", async () => {
      await page.goto(`${BASE}/en/dashboard/instances/${id}`);
      await page.waitForSelector('[data-testid="usage-panel"]', { timeout: 10000 });
    });
    await test("Usage API: 14-day daily array", async () => {
      const ur = await ctx.request.get(`${BASE}/api/instances/${id}/usage`);
      const d = await ur.json() as any;
      if (!Array.isArray(d.daily) || d.daily.length !== 14) throw new Error(`bad: ${JSON.stringify(d).slice(0,50)}`);
    });
    await test("Chat API: returns 402/200 (creds needed)", async () => {
      const cr = await ctx.request.post(`${BASE}/api/instances/${id}/chat`, {
        data: { messages: [{ role: "user", content: "hello" }] }
      });
      if (![200, 402, 400].includes(cr.status())) throw new Error(`status ${cr.status()}`);
    });
  }

  // Onboarding
  await test("Onboarding: renders step 1 for new user", async () => {
    // visit onboarding directly (even with onboardingDone=true, page renders)
    await page.goto(`${BASE}/en/onboarding`);
    await page.waitForSelector("text=Tell us about your business", { timeout: 8000 });
  });

  // Public API
  await test("Public API: /api/v1 docs", async () => {
    const ar = await ctx.request.get(`${BASE}/api/v1`);
    if (ar.status() !== 200) throw new Error(`status ${ar.status()}`);
  });
  await test("Public API: /api/v1/chat no auth = 401", async () => {
    const ar = await ctx.request.post(`${BASE}/api/v1/chat`, { data: { message: "hi" }, headers: {} });
    if (ar.status() !== 401) throw new Error(`expected 401 got ${ar.status()}`);
  });

  // Translations
  await test("Translations: UK pricing page", async () => {
    await page.goto(`${BASE}/uk/pricing`);
    await page.waitForSelector("text=ціноутворення", { timeout: 8000 });
  });

  await browser.close();

  console.log("\n=== SMOKE TEST RESULTS ===");
  results.forEach(r => console.log(r));
  const failed = results.filter(r => r.startsWith("❌")).length;
  console.log(`\n${results.length - failed}/${results.length} passing`);
}

run().catch(e => { console.error(e.message); process.exit(1); });
