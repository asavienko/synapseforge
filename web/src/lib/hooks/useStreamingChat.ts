"use client";

import { useCallback } from "react";

interface UseStreamingChatOptions {
  instanceId: string;
  onToken: (token: string) => void;
  onComplete: (fullMessage: string) => void;
  onError: (error: Error) => void;
}

export function useStreamingChat({
  instanceId,
  onToken,
  onComplete,
  onError,
}: UseStreamingChatOptions) {
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        const response = await fetch(`/api/instances/${instanceId}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                onComplete(fullMessage);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  fullMessage += parsed.token;
                  onToken(parsed.token);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        onComplete(fullMessage);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [instanceId, onToken, onComplete, onError]
  );

  return { sendMessage };
}
