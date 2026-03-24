import { AgentTool } from "./types";

export const voiceTools: AgentTool[] = [
  {
    name: "generate_voice_response",
    description:
      "Generate a voice audio response. Use when the user explicitly asks for audio/voice or when communicating through a voice channel.",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to convert to speech" },
        voice_id: {
          type: "string",
          description:
            "ElevenLabs voice ID (optional, uses default if not specified)",
        },
      },
      required: ["text"],
    },
    requiredCredential: "elevenlabs_api_key",
    execute: async ({ text, voice_id }, { credentials }) => {
      const vId = (voice_id as string) || "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${vId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": credentials.elevenlabs_api_key,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 },
          }),
        }
      );

      if (!res.ok) return `ElevenLabs error: ${res.status}`;

      // Return a signal that audio was generated.
      // The actual audio delivery is handled by the channel layer.
      const audioBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(audioBuffer).toString("base64");
      return `[VOICE_RESPONSE:${base64.slice(0, 50)}...] Voice message generated (${Math.round(
        audioBuffer.byteLength / 1024
      )}KB)`;
    },
  },
];
