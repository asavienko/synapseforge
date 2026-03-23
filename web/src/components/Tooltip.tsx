"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {children || <HelpCircle className="w-4 h-4" />}
      </button>
      
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl">
          <div className="text-xs text-zinc-300 leading-relaxed">{content}</div>
          <button
            onClick={() => setShow(false)}
            className="absolute top-1 right-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1a1a24]" />
        </div>
      )}
    </div>
  );
}

// Pre-defined help content for common credentials
export const CREDENTIAL_HELP: Record<string, string> = {
  openai_api_key: "Your OpenAI API key allows the AI agent to use GPT-4o, GPT-4o-mini, and other OpenAI models. Get yours at platform.openai.com/api-keys",
  anthropic_api_key: "Your Anthropic API key enables Claude 3.5 Sonnet and other Claude models. Get yours at console.anthropic.com/settings/keys",
  openrouter_api_key: "OpenRouter provides access to multiple AI models through a single API. Get yours at openrouter.ai/keys",
  telegram_bot_token: "Create a Telegram bot via @BotFather and paste the token here to enable Telegram messaging",
  discord_bot_token: "Create a Discord bot at discord.com/developers/applications and add the bot token here",
  slack_bot_token: "Your Slack Bot User OAuth Token. Required for the bot to send messages in Slack channels",
  slack_app_token: "Your Slack App-level token with connections:write scope. Required for Socket Mode (real-time messaging)",
  twilio_account_sid: "Your Twilio Account SID. Required for WhatsApp Business API integration",
  twilio_auth_token: "Your Twilio Auth Token. Used to authenticate WhatsApp API requests",
  twilio_whatsapp_number: "Your Twilio WhatsApp-enabled phone number in E.164 format (e.g., +1234567890)",
};
