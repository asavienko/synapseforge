import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Code, CheckCircle, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Add an AI Chatbot to Your Website (Step-by-Step Guide)",
  description:
    "Learn how to add an AI chatbot to your website in minutes. Step-by-step guide with code examples, embed options, and best practices for 2025.",
  openGraph: {
    title: "How to Add an AI Chatbot to Your Website",
    description: "Complete step-by-step guide with code examples. Embed options, API integration, and best practices.",
    type: "article",
  },
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/blog" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Title */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-violet-400 text-sm mb-4">
            <Zap className="w-4 h-4" />
            <span>Implementation Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            How to Add an AI Chatbot to Your Website
          </h1>
          <p className="text-xl text-zinc-400">
            A complete step-by-step guide to embedding AI chat on any website. 
            No coding required for basic setup — advanced options included.
          </p>
        </header>

        {/* Why add AI chat */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Add an AI Chatbot?</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <Globe className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-medium mb-1">24/7 Availability</div>
              <div className="text-sm text-zinc-500">Answer questions while you sleep</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-medium mb-1">Instant Responses</div>
              <div className="text-sm text-zinc-500">No more &quot;we&apos;ll get back to you&quot;</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-medium mb-1">Cost Savings</div>
              <div className="text-sm text-zinc-500">Handle 80% of inquiries automatically</div>
            </div>
          </div>
        </section>

        {/* Step 1 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Step 1: Choose Your Deployment Method</h2>
          <p className="text-zinc-400 mb-6">
            There are three main ways to add AI chat to your website. Pick the one that fits your technical setup:
          </p>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">1</div>
                <h3 className="font-semibold">Chat Widget (Easiest)</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-3">
                A floating chat bubble that appears in the corner of your website. 
                Just add a single script tag to your HTML.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                {`<script src="https://api.openhelixai.com/widget.js" 
  data-instance-id="your-instance-id"
  data-api-key="your-api-key">
</script>`}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">2</div>
                <h3 className="font-semibold">Embedded Iframe</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-3">
                Embed the chat interface directly in a page or section. 
                Good for dedicated support pages or contact sections.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                {`<iframe 
  src="https://chat.openhelixai.com/your-instance"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>`}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">3</div>
                <h3 className="font-semibold">API Integration (Most Flexible)</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-3">
                Build a completely custom chat UI using our API. 
                Full control over design and behavior.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                {`fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({ message: "Hello!" })
})`}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Step 2: Create Your AI Instance</h2>
          <p className="text-zinc-400 mb-4">
            Before you can embed anything, you need an AI instance with your knowledge base:
          </p>
          <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
            <li><Link href="/sign-up" className="text-violet-400 hover:underline">Sign up for OpenHelix AI</Link> (free tier includes 2,000 messages)</li>
            <li>Create a new AI instance and give it a name</li>
            <li>Upload your knowledge base (FAQs, product docs, support articles)</li>
            <li>Test the chat in the dashboard to make sure answers are accurate</li>
            <li>Generate an API key from the instance settings</li>
          </ol>
        </section>

        {/* Step 3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Step 3: Add the Code to Your Website</h2>
          <p className="text-zinc-400 mb-4">
            Here&apos;s the simplest implementation — the widget script. 
            Add this just before the closing <code className="bg-white/10 px-1 rounded">&lt;/body&gt;</code> tag:
          </p>
          
          <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <Code className="w-3 h-3" /> HTML
            </div>
            <pre className="font-mono text-xs text-zinc-300 overflow-x-auto">{`<!-- OpenHelix AI Chat Widget -->
<script 
  src="https://api.openhelixai.com/widget.js"
  data-instance-id="inst_abc123"
  data-api-key="syn_live_xxxxxxxx"
  data-position="bottom-right"
  data-primary-color="#8b5cf6">
</script>`}</pre>
          </div>

          <h3 className="font-semibold mb-3">Customization Options</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left text-zinc-500">
                  <th className="pb-2 font-medium">Attribute</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 font-mono text-xs">data-position</td>
                  <td className="py-3">Widget position</td>
                  <td className="py-3 text-zinc-500">bottom-right</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-mono text-xs">data-primary-color</td>
                  <td className="py-3">Brand color (hex)</td>
                  <td className="py-3 text-zinc-500">#8b5cf6</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-mono text-xs">data-greeting</td>
                  <td className="py-3">Initial message</td>
                  <td className="py-3 text-zinc-500">&quot;Hi! How can I help?&quot;</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-xs">data-placeholder</td>
                  <td className="py-3">Input placeholder</td>
                  <td className="py-3 text-zinc-500">&quot;Type a message...&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Step 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Step 4: Platform-Specific Instructions</h2>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">WordPress</h3>
              <p className="text-zinc-400 text-sm">
                Use a plugin like &quot;Insert Headers and Footers&quot; or add the script to your theme&apos;s 
                <code className="bg-white/10 px-1 rounded">footer.php</code> file.
              </p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Webflow</h3>
              <p className="text-zinc-400 text-sm">
                Go to Project Settings → Custom Code → Footer Code. Paste the script there.
              </p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Shopify</h3>
              <p className="text-zinc-400 text-sm">
                Online Store → Themes → Edit Code → Layout → theme.liquid. 
                Add the script before the closing <code className="bg-white/10 px-1 rounded">&lt;/body&gt;</code> tag.
              </p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">React / Next.js</h3>
              <p className="text-zinc-400 text-sm mb-3">
                Create a component that loads the script dynamically:
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                {`useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://api.openhelixai.com/widget.js';
  script.setAttribute('data-instance-id', 'your-id');
  document.body.appendChild(script);
}, []);`}
              </div>
            </div>
          </div>
        </section>

        {/* Best practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Train your knowledge base well.</strong> The AI is only as good as the information you give it. Include common questions, edge cases, and up-to-date product info.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Set clear escalation rules.</strong> Know when to hand off to humans — complex issues, angry customers, or sales inquiries.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Monitor conversations.</strong> Review what questions the AI couldn&apos;t answer and add that info to your knowledge base.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Be transparent.</strong> Let users know they&apos;re chatting with AI. It sets expectations and builds trust.</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Add AI Chat to Your Website?</h2>
          <p className="text-zinc-400 mb-6">
            Get started free — no credit card required. 2,000 messages included.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Create Your AI Chatbot <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </div>
  );
}
