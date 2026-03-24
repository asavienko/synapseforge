import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "48px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(124,58,237,0.3)",
              border: "1px solid rgba(124,58,237,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>
            OpenHelix AI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "white",
            lineHeight: "1.1",
            letterSpacing: "-2px",
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          AI Agent for Your Business on Telegram & WhatsApp
        </div>

        {/* Subheadline */}
        <div style={{ fontSize: "26px", color: "rgba(161,161,170,1)", marginBottom: "48px", maxWidth: "800px" }}>
          Set up in 10 minutes. Answers customers 24/7. No developers needed.
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["Free to start", "No credit card", "Telegram & WhatsApp"].map((badge) => (
            <div
              key={badge}
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "100px",
                padding: "10px 20px",
                fontSize: "18px",
                color: "rgba(196,181,253,1)",
                fontWeight: "500",
              }}
            >
              ✓ {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
