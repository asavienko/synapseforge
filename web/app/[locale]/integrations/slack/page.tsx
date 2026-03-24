import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Zap, Hash, Bell, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix + Slack Integration — AI Bot for Your Workspace",
  description:
    "Add an AI-powered bot to your Slack workspace. Answer questions, handle support, and automate responses in channels and DMs. Setup guide.",
  openGraph: {
    title: "Slack Integration — AI Bot for Your Workspace",
    description: "Deploy an AI bot to Slack. Handle support, FAQs, and automation in your workspace.",
    type: "article",
  },
};

export default function SlackIntegrationPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/integrations" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Integrations
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#4A154B] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Integration</div>
              <h1 className="text-2xl sm:text-3xl font-bold">OpenHelix + Slack</h1>
            </div>
          </div>
          <p className="text-xl text-zinc-400">
            Add an AI-powered bot to your Slack workspace. Answer questions, handle support, 
            and automate responses in channels and direct messages.
          </p>
        </header>

        {/* What you get */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What You Get</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <Hash className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-medium mb-1">Channel Support</div>
              <div className="text-sm text-zinc-500">AI responds in public channels when mentioned</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <Bell className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-medium mb-1">DM Conversations</div>
              <div className="text-sm text-zinc-500">One-on-one private support with the bot</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <Users className="w-5 h-5 text-violet-400 mb-2" />
              <div className="font-medium mb-1">Thread Handling</div>
              <div className="text-sm text-zinc-500">Maintains context in threaded conversations</div>
            </div>
          </div>
        </section>

        {/* Setup steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Setup Guide</h2>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">1</div>
                <h3 className="font-semibold">Create a Slack App</h3>
              </div>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" className="text-violet-400 hover:underline">api.slack.com/apps</a></li>
                <li>Click &quot;Create New App&quot; → &quot;From scratch&quot;</li>
                <li>Name your app (e.g., &quot;Support Bot&quot;) and select your workspace</li>
              </ol>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">2</div>
                <h3 className="font-semibold">Configure OAuth & Permissions</h3>
              </div>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Go to &quot;OAuth & Permissions&quot; in the left sidebar</li>
                <li>Add these Bot Token Scopes:
                  <ul className="ml-6 mt-1 space-y-1 text-zinc-500">
                    <li>• <code className="bg-white/10 px-1 rounded">chat:write</code></li>
                    <li>• <code className="bg-white/10 px-1 rounded">chat:write.public</code></li>
                    <li>• <code className="bg-white/10 px-1 rounded">im:history</code></li>
                    <li>• <code className="bg-white/10 px-1 rounded">im:read</code></li>
                    <li>• <code className="bg-white/10 px-1 rounded">im:write</code></li>
                  </ul>
                </li>
                <li>Install the app to your workspace</li>
                <li>Copy the &quot;Bot User OAuth Token&quot; (starts with <code className="bg-white/10 px-1 rounded">xoxb-</code>)</li>
              </ol>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">3</div>
                <h3 className="font-semibold">Enable Events</h3>
              </div>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Go to &quot;Event Subscriptions&quot; and enable events</li>
                <li>Request URL: <code className="bg-white/10 px-1 rounded">https://api.openhelixai.com/webhooks/slack</code></li>
                <li>Subscribe to bot events:
                  <ul className="ml-6 mt-1 space-y-1 text-zinc-500">
                    <li>• <code className="bg-white/10 px-1 rounded">message.im</code> (direct messages)</li>
                    <li>• <code className="bg-white/10 px-1 rounded">app_mention</code> (channel mentions)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">4</div>
                <h3 className="font-semibold">Connect to OpenHelix</h3>
              </div>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Go to your OpenHelix dashboard → Instance Settings → Credentials</li>
                <li>Click &quot;Add Slack Bot Token&quot;</li>
                <li>Paste your Bot User OAuth Token</li>
                <li>Select which channels the bot should join (or use DMs only)</li>
                <li>Save and test the connection</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">In Channels</h3>
              <p className="text-sm text-zinc-400 mb-3">
                Mention the bot with @BotName to get a response. The bot will reply in the thread.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                <div className="text-zinc-500 mb-1">#general</div>
                <div><span className="text-blue-400">@supportbot</span> Where is my order #12345?</div>
                <div className="text-violet-400 mt-2">🤖 Support Bot: Your order #12345 shipped yesterday via FedEx. Track it here: ...</div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Direct Messages</h3>
              <p className="text-sm text-zinc-400 mb-3">
                Users can DM the bot directly for private support conversations.
              </p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-300">
                <div className="text-zinc-500 mb-1">Direct Message</div>
                <div>I need to reset my password</div>
                <div className="text-violet-400 mt-2">🤖 Support Bot: I can help with that. I\u0026apos;ve sent a reset link to your email address...</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Pro Tips</h2>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Use threads.</strong> The bot automatically replies in threads to keep channels organized.</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Set up escalation.</strong> Configure keywords like &quot;human&quot; or &quot;manager&quot; to alert your team.</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Train with your docs.</strong> Upload your knowledge base so the bot knows your products/policies.</span>
            </li>
          </ul>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Bot isn\u0026apos;t responding?</h3>
              <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                <li>Verify the bot token is correct and not expired</li>
                <li>Check that the bot is invited to the channel (type <code className="bg-white/10 px-1 rounded">/invite @botname</code>)</li>
                <li>Ensure Event Subscriptions are enabled and URL is correct</li>
              </ul>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Bot responds to everything?</h3>
              <p className="text-sm text-zinc-400">
                By default, the bot only responds to @mentions in channels. Check your settings if it\u0026apos;s responding to every message.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Add AI to Your Slack?</h2>
          <p className="text-zinc-400 mb-6">
            Get started free — no credit card required. 2,000 messages included.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Create Your AI Bot <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </div>
  );
}
