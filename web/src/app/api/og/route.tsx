import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "AI Agent for Your Business";
  const subtitle = searchParams.get("subtitle") ?? "Live on Telegram & WhatsApp in 10 minutes";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0f",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Violet glow blob */}
        <div
          style={{
            position: "absolute",
            left: "-80px",
            top: "-80px",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-120px",
            bottom: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0) 70%)",
          }}
        />

        {/* Top violet bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "72px 96px",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
              }}
            >
              ⚡
            </div>
            <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}>
              SynapseForge
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: "56px",
              fontWeight: "800",
              lineHeight: "1.1",
              letterSpacing: "-1.5px",
              marginBottom: "24px",
              maxWidth: "820px",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: "#94a3b8",
              fontSize: "26px",
              fontWeight: "400",
              lineHeight: "1.4",
              maxWidth: "700px",
              marginBottom: "56px",
            }}
          >
            {subtitle}
          </div>

          {/* Channel pills */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {["Telegram", "WhatsApp", "Web Widget"].map((channel) => (
              <div
                key={channel}
                style={{
                  padding: "8px 20px",
                  borderRadius: "100px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {channel}
              </div>
            ))}
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "100px",
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
                color: "#a78bfa",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Start free →
            </div>
          </div>
        </div>

        {/* Bottom URL bar */}
        <div
          style={{
            padding: "16px 96px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#52525b", fontSize: "15px" }}>synapseforge.ai</span>
          <span style={{ color: "#52525b", fontSize: "15px" }}>No developers needed · Setup in 10 min</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
