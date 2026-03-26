"use client";

import React from "react";

interface BlogImageProps {
  className?: string;
}

// 1. How to Add an AI Chatbot to Your Website
export function ChatbotWebsiteImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cw-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#eff6ff] dark:[stop-color:#0d1117]" />
          <stop offset="100%" className="[stop-color:#dbeafe] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
        <linearGradient id="cw-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#cw-bg)" />

      {/* Grid pattern */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={`vg-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="450" className="stroke-blue-200/20 dark:stroke-blue-500/5" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`hg-${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} className="stroke-blue-200/20 dark:stroke-blue-500/5" strokeWidth="0.5" />
      ))}

      {/* Browser window */}
      <rect x="160" y="60" width="480" height="300" rx="12" className="fill-white dark:fill-white/5 stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
      <rect x="160" y="60" width="480" height="36" rx="12" className="fill-gray-50 dark:fill-white/[0.03]" />
      <rect x="160" y="84" width="480" height="12" className="fill-gray-50 dark:fill-white/[0.03]" />
      <circle cx="180" cy="78" r="5" className="fill-red-300 dark:fill-red-500/50" />
      <circle cx="196" cy="78" r="5" className="fill-yellow-300 dark:fill-yellow-500/50" />
      <circle cx="212" cy="78" r="5" className="fill-green-300 dark:fill-green-500/50" />

      {/* URL bar */}
      <rect x="240" y="70" width="280" height="16" rx="4" className="fill-gray-100 dark:fill-white/5" />
      <rect x="248" y="75" width="120" height="6" rx="2" className="fill-gray-300 dark:fill-white/10" />

      {/* Page content lines */}
      <rect x="185" y="115" width="200" height="8" rx="3" className="fill-gray-200 dark:fill-white/10" />
      <rect x="185" y="132" width="160" height="6" rx="3" className="fill-gray-100 dark:fill-white/5" />
      <rect x="185" y="146" width="180" height="6" rx="3" className="fill-gray-100 dark:fill-white/5" />
      <rect x="185" y="166" width="220" height="8" rx="3" className="fill-gray-200 dark:fill-white/10" />
      <rect x="185" y="183" width="140" height="6" rx="3" className="fill-gray-100 dark:fill-white/5" />
      <rect x="185" y="197" width="190" height="6" rx="3" className="fill-gray-100 dark:fill-white/5" />

      {/* Chat widget */}
      <g>
        <rect x="480" y="180" width="140" height="160" rx="12" fill="url(#cw-accent)" fillOpacity="0.1" className="stroke-blue-400 dark:stroke-blue-500/40" strokeWidth="1.5" />
        <rect x="480" y="180" width="140" height="32" rx="12" fill="url(#cw-accent)" fillOpacity="0.9" />
        <rect x="480" y="200" width="140" height="12" className="fill-blue-500" fillOpacity="0.9" />

        {/* Chat header text */}
        <rect x="496" y="191" width="60" height="5" rx="2" fill="white" fillOpacity="0.9" />
        <circle cx="602" cy="196" r="6" fill="white" fillOpacity="0.3" />

        {/* Bot message */}
        <rect x="492" y="224" width="80" height="24" rx="8" className="fill-blue-100 dark:fill-blue-500/20" />
        <rect x="500" y="232" width="50" height="4" rx="2" className="fill-blue-300 dark:fill-blue-400/40" />
        <rect x="500" y="239" width="35" height="4" rx="2" className="fill-blue-300 dark:fill-blue-400/40" />

        {/* User message */}
        <rect x="540" y="256" width="68" height="20" rx="8" fill="url(#cw-accent)" fillOpacity="0.8" />
        <rect x="550" y="263" width="40" height="4" rx="2" fill="white" fillOpacity="0.7" />

        {/* Bot message 2 */}
        <rect x="492" y="284" width="90" height="20" rx="8" className="fill-blue-100 dark:fill-blue-500/20" />
        <rect x="500" y="291" width="60" height="4" rx="2" className="fill-blue-300 dark:fill-blue-400/40" />

        {/* Input bar */}
        <rect x="490" y="312" width="120" height="18" rx="9" className="fill-white dark:fill-white/10 stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
        <rect x="498" y="319" width="50" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      </g>

      {/* Chat bubble FAB */}
      <circle cx="600" cy="356" r="20" fill="url(#cw-accent)" />
      <path d="M590 352 L600 348 L610 352 L610 360 Q610 362 608 362 L592 362 Q590 362 590 360Z" fill="white" fillOpacity="0.9" />
      <circle cx="596" cy="355" r="1.5" fill="white" fillOpacity="0.6" />
      <circle cx="600" cy="355" r="1.5" fill="white" fillOpacity="0.6" />
      <circle cx="604" cy="355" r="1.5" fill="white" fillOpacity="0.6" />

      {/* Decorative code snippet */}
      <rect x="60" y="280" width="80" height="60" rx="6" className="fill-gray-50 dark:fill-white/[0.03] stroke-gray-200 dark:stroke-white/10" strokeWidth="0.5" />
      <rect x="70" y="292" width="30" height="3" rx="1" className="fill-blue-400/40" />
      <rect x="70" y="300" width="50" height="3" rx="1" className="fill-emerald-400/30" />
      <rect x="70" y="308" width="40" height="3" rx="1" className="fill-blue-400/20" />
      <rect x="70" y="316" width="55" height="3" rx="1" className="fill-emerald-400/20" />
      <rect x="70" y="324" width="25" height="3" rx="1" className="fill-blue-400/30" />

      {/* Floating elements */}
      <circle cx="700" cy="100" r="30" className="fill-blue-500/5 dark:fill-blue-500/10" />
      <circle cx="700" cy="100" r="15" className="fill-blue-500/10 dark:fill-blue-500/15" />
      <circle cx="100" cy="120" r="20" className="fill-emerald-500/5 dark:fill-emerald-500/10" />
    </svg>
  );
}

// 2. AI Customer Support ROI
export function ROICalculatorImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="roi-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#ecfdf5] dark:[stop-color:#0a0f0d]" />
          <stop offset="100%" className="[stop-color:#d1fae5] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
        <linearGradient id="roi-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="roi-bar2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#roi-bg)" />

      {/* Dot grid */}
      {Array.from({ length: 16 }).map((_, i) =>
        Array.from({ length: 9 }).map((_, j) => (
          <circle key={`d-${i}-${j}`} cx={50 + i * 48} cy={25 + j * 50} r="1" className="fill-emerald-300/20 dark:fill-emerald-500/10" />
        ))
      )}

      {/* Main chart card */}
      <rect x="180" y="50" width="440" height="320" rx="16" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />

      {/* Chart title */}
      <rect x="210" y="72" width="140" height="8" rx="3" className="fill-gray-800 dark:fill-white/60" />
      <rect x="210" y="86" width="100" height="5" rx="2" className="fill-gray-300 dark:fill-white/15" />

      {/* Y axis */}
      <line x1="230" y1="110" x2="230" y2="320" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
      {["$0", "$20K", "$40K", "$60K", "$80K"].map((_, i) => (
        <React.Fragment key={`ya-${i}`}>
          <rect x="200" y={310 - i * 50} width="24" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
          <line x1="228" y1={312 - i * 50} x2="580" y2={312 - i * 50} className="stroke-gray-100 dark:stroke-white/5" strokeWidth="0.5" />
        </React.Fragment>
      ))}

      {/* Bar chart - Before AI (blue) vs After AI (green) */}
      {[
        { x: 270, h1: 160, h2: 60 },
        { x: 340, h1: 140, h2: 55 },
        { x: 410, h1: 170, h2: 65 },
        { x: 480, h1: 150, h2: 50 },
      ].map((bar, i) => (
        <React.Fragment key={`bar-${i}`}>
          <rect x={bar.x} y={312 - bar.h1} width="24" height={bar.h1} rx="4" fill="url(#roi-bar2)" fillOpacity="0.6" />
          <rect x={bar.x + 28} y={312 - bar.h2} width="24" height={bar.h2} rx="4" fill="url(#roi-bar)" fillOpacity="0.8" />
        </React.Fragment>
      ))}

      {/* Legend */}
      <rect x="380" y="72" width="8" height="8" rx="2" className="fill-blue-400/60" />
      <rect x="392" y="73" width="40" height="5" rx="2" className="fill-gray-400 dark:fill-white/30" />
      <rect x="444" y="72" width="8" height="8" rx="2" className="fill-emerald-400/80" />
      <rect x="456" y="73" width="40" height="5" rx="2" className="fill-gray-400 dark:fill-white/30" />

      {/* Savings callout */}
      <rect x="360" y="140" width="120" height="44" rx="10" className="fill-emerald-50 dark:fill-emerald-500/10 stroke-emerald-200 dark:stroke-emerald-500/30" strokeWidth="1" />
      <text x="380" y="158" className="fill-emerald-600 dark:fill-emerald-400" fontSize="10" fontWeight="600">-60% costs</text>
      <text x="380" y="174" className="fill-emerald-500/60 dark:fill-emerald-400/50" fontSize="8">per ticket savings</text>

      {/* Arrow pointing down */}
      <path d="M420 184 L415 192 L425 192 Z" className="fill-emerald-400" />

      {/* Side stat cards */}
      <rect x="50" y="100" width="110" height="70" rx="10" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
      <text x="66" y="125" className="fill-emerald-500" fontSize="20" fontWeight="700">60%</text>
      <rect x="66" y="137" width="60" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="66" y="147" width="40" height="4" rx="2" className="fill-gray-200 dark:fill-white/10" />

      <rect x="640" y="100" width="110" height="70" rx="10" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
      <text x="656" y="125" className="fill-blue-500" fontSize="20" fontWeight="700">3.2x</text>
      <rect x="656" y="137" width="60" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="656" y="147" width="40" height="4" rx="2" className="fill-gray-200 dark:fill-white/10" />

      <rect x="50" y="200" width="110" height="70" rx="10" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
      <text x="66" y="225" className="fill-blue-500" fontSize="18" fontWeight="700">$48K</text>
      <rect x="66" y="237" width="60" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="66" y="247" width="50" height="4" rx="2" className="fill-gray-200 dark:fill-white/10" />

      {/* Trend line */}
      <path d="M240 290 Q350 250 420 200 Q490 150 570 130" className="stroke-emerald-400" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <circle cx="570" cy="130" r="4" className="fill-emerald-400" />

      {/* Dollar signs floating */}
      <text x="680" y="280" className="fill-emerald-400/20 dark:fill-emerald-400/10" fontSize="40" fontWeight="700">$</text>
      <text x="720" y="350" className="fill-emerald-400/15 dark:fill-emerald-400/8" fontSize="28" fontWeight="700">$</text>
      <text x="60" y="360" className="fill-emerald-400/15 dark:fill-emerald-400/8" fontSize="32" fontWeight="700">$</text>
    </svg>
  );
}

// 3. Telegram AI Chatbot
export function TelegramBotImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="tg-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#eff6ff] dark:[stop-color:#0a1020]" />
          <stop offset="100%" className="[stop-color:#dbeafe] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
        <linearGradient id="tg-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2AABEE" />
          <stop offset="100%" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#tg-bg)" />

      {/* Subtle radial circles */}
      <circle cx="400" cy="225" r="200" className="fill-blue-500/[0.03] dark:fill-blue-500/[0.05]" />
      <circle cx="400" cy="225" r="140" className="fill-blue-500/[0.03] dark:fill-blue-500/[0.05]" />

      {/* Phone frame */}
      <rect x="300" y="30" width="200" height="390" rx="24" className="fill-white dark:fill-white/[0.05] stroke-gray-200 dark:stroke-white/10" strokeWidth="2" />
      <rect x="300" y="30" width="200" height="390" rx="24" className="fill-gray-50 dark:fill-[#0d1117]" />

      {/* Status bar */}
      <rect x="360" y="38" width="80" height="4" rx="2" className="fill-gray-300 dark:fill-white/10" />

      {/* Telegram header */}
      <rect x="310" y="54" width="180" height="40" rx="0" fill="url(#tg-blue)" fillOpacity="0.9" />
      <circle cx="332" cy="74" r="12" fill="white" fillOpacity="0.2" />
      {/* Bot icon in header */}
      <rect x="326" y="69" width="12" height="8" rx="3" fill="white" fillOpacity="0.6" />
      <circle cx="330" cy="72" r="1.5" fill="white" fillOpacity="0.9" />
      <circle cx="334" cy="72" r="1.5" fill="white" fillOpacity="0.9" />
      <rect x="350" y="68" width="60" height="5" rx="2" fill="white" fillOpacity="0.8" />
      <rect x="350" y="78" width="30" height="3" rx="1" fill="white" fillOpacity="0.4" />

      {/* Chat messages */}
      {/* User message */}
      <rect x="380" y="110" width="100" height="28" rx="12" fill="url(#tg-blue)" fillOpacity="0.15" />
      <rect x="392" y="120" width="60" height="4" rx="2" className="fill-blue-400/30" />
      <rect x="392" y="128" width="40" height="3" rx="1" className="fill-blue-400/15" />

      {/* Bot reply */}
      <rect x="320" y="148" width="130" height="40" rx="12" className="fill-white dark:fill-white/10 stroke-gray-100 dark:stroke-white/5" strokeWidth="0.5" />
      <rect x="332" y="158" width="90" height="4" rx="2" className="fill-gray-400 dark:fill-white/20" />
      <rect x="332" y="166" width="70" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="332" y="174" width="50" height="4" rx="2" className="fill-gray-300 dark:fill-white/10" />

      {/* User message 2 */}
      <rect x="400" y="200" width="80" height="24" rx="12" fill="url(#tg-blue)" fillOpacity="0.15" />
      <rect x="412" y="209" width="50" height="4" rx="2" className="fill-blue-400/30" />

      {/* Bot reply 2 with typing indicator */}
      <rect x="320" y="236" width="110" height="32" rx="12" className="fill-white dark:fill-white/10 stroke-gray-100 dark:stroke-white/5" strokeWidth="0.5" />
      <rect x="332" y="246" width="80" height="4" rx="2" className="fill-gray-400 dark:fill-white/20" />
      <rect x="332" y="254" width="55" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />

      {/* User message 3 */}
      <rect x="370" y="280" width="110" height="24" rx="12" fill="url(#tg-blue)" fillOpacity="0.15" />
      <rect x="382" y="289" width="70" height="4" rx="2" className="fill-blue-400/30" />

      {/* Bot reply 3 */}
      <rect x="320" y="316" width="120" height="36" rx="12" className="fill-white dark:fill-white/10 stroke-gray-100 dark:stroke-white/5" strokeWidth="0.5" />
      <rect x="332" y="326" width="85" height="4" rx="2" className="fill-gray-400 dark:fill-white/20" />
      <rect x="332" y="334" width="60" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="332" y="342" width="40" height="3" rx="1" className="fill-emerald-400/40" />

      {/* Input bar */}
      <rect x="310" y="370" width="180" height="32" rx="0" className="fill-gray-50 dark:fill-white/[0.03]" />
      <rect x="320" y="381" width="80" height="4" rx="2" className="fill-gray-300 dark:fill-white/10" />
      <circle cx="476" cy="386" r="10" fill="url(#tg-blue)" fillOpacity="0.7" />
      {/* Send arrow */}
      <path d="M473 386 L480 386 M477 382 L481 386 L477 390" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Telegram paper plane - left side */}
      <g transform="translate(100, 150)">
        <circle cx="50" cy="50" r="50" fill="url(#tg-blue)" fillOpacity="0.12" />
        <circle cx="50" cy="50" r="35" fill="url(#tg-blue)" fillOpacity="0.15" />
        <path d="M30 50 L55 38 L70 62 L48 52 Z" fill="url(#tg-blue)" fillOpacity="0.6" />
        <path d="M48 52 L55 38 L52 64 Z" fill="url(#tg-blue)" fillOpacity="0.4" />
      </g>

      {/* AI brain icon - right side */}
      <g transform="translate(570, 120)">
        <circle cx="60" cy="60" r="50" className="fill-blue-500/[0.06] dark:fill-blue-500/10" />
        <circle cx="60" cy="60" r="35" className="fill-blue-500/[0.06] dark:fill-blue-500/10" />
        {/* Simple brain/circuit */}
        <circle cx="60" cy="50" r="14" className="stroke-blue-400/30 dark:stroke-blue-400/40" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="65" r="10" className="stroke-blue-400/30 dark:stroke-blue-400/40" strokeWidth="1.5" fill="none" />
        <circle cx="70" cy="65" r="10" className="stroke-blue-400/30 dark:stroke-blue-400/40" strokeWidth="1.5" fill="none" />
        {/* Nodes */}
        <circle cx="60" cy="36" r="3" className="fill-blue-400/50" />
        <circle cx="42" cy="72" r="3" className="fill-blue-400/50" />
        <circle cx="78" cy="72" r="3" className="fill-blue-400/50" />
        <circle cx="60" cy="60" r="3" className="fill-emerald-400/60" />
      </g>

      {/* Connection line */}
      <path d="M200 200 Q250 170 300 185" className="stroke-blue-400/20 dark:stroke-blue-400/15" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <path d="M500 165 Q540 145 570 170" className="stroke-blue-400/20 dark:stroke-blue-400/15" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

      {/* "10 min" badge */}
      <rect x="600" y="300" width="80" height="32" rx="16" className="fill-emerald-50 dark:fill-emerald-500/10 stroke-emerald-200 dark:stroke-emerald-500/30" strokeWidth="1" />
      <text x="618" y="321" className="fill-emerald-600 dark:fill-emerald-400" fontSize="12" fontWeight="600">10 min</text>

      {/* Floating dots */}
      <circle cx="130" cy="350" r="4" className="fill-blue-400/15" />
      <circle cx="680" cy="80" r="6" className="fill-blue-400/10" />
      <circle cx="720" cy="380" r="3" className="fill-emerald-400/15" />
    </svg>
  );
}

// 4. Best AI Models for Customer Support
export function AIModelsComparisonImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="aim-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#f0f9ff] dark:[stop-color:#0a0a18]" />
          <stop offset="100%" className="[stop-color:#e0f2fe] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#aim-bg)" />

      {/* Background hexagon grid */}
      {[
        { x: 100, y: 80 }, { x: 160, y: 80 }, { x: 130, y: 130 }, { x: 190, y: 130 },
        { x: 610, y: 80 }, { x: 670, y: 80 }, { x: 640, y: 130 }, { x: 700, y: 130 },
        { x: 100, y: 320 }, { x: 160, y: 320 }, { x: 640, y: 320 }, { x: 700, y: 320 },
      ].map((pos, i) => (
        <path
          key={`hex-${i}`}
          d={`M${pos.x} ${pos.y - 15} L${pos.x + 13} ${pos.y - 7.5} L${pos.x + 13} ${pos.y + 7.5} L${pos.x} ${pos.y + 15} L${pos.x - 13} ${pos.y + 7.5} L${pos.x - 13} ${pos.y - 7.5}Z`}
          className="stroke-blue-200/20 dark:stroke-blue-500/10"
          strokeWidth="0.5"
          fill="none"
        />
      ))}

      {/* Model cards */}
      {[
        { x: 120, y: 140, label: "GPT-4o", color: "#10b981", score: "92" },
        { x: 310, y: 140, label: "Claude", color: "#3b82f6", score: "94" },
        { x: 500, y: 140, label: "Gemini", color: "#f59e0b", score: "89" },
      ].map((model, i) => (
        <g key={`model-${i}`}>
          <rect x={model.x} y={model.y} width="160" height="180" rx="14" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />

          {/* Model icon circle */}
          <circle cx={model.x + 80} cy={model.y + 50} r="24" fill={model.color} fillOpacity="0.1" />
          <circle cx={model.x + 80} cy={model.y + 50} r="16" fill={model.color} fillOpacity="0.15" />
          {/* AI symbol */}
          <circle cx={model.x + 80} cy={model.y + 44} r="4" fill={model.color} fillOpacity="0.5" />
          <circle cx={model.x + 73} cy={model.y + 54} r="3" fill={model.color} fillOpacity="0.4" />
          <circle cx={model.x + 87} cy={model.y + 54} r="3" fill={model.color} fillOpacity="0.4" />
          <line x1={model.x + 76} y1={model.y + 47} x2={model.x + 73} y2={model.y + 51} stroke={model.color} strokeOpacity="0.3" strokeWidth="1" />
          <line x1={model.x + 84} y1={model.y + 47} x2={model.x + 87} y2={model.y + 51} stroke={model.color} strokeOpacity="0.3" strokeWidth="1" />

          {/* Model name */}
          <text x={model.x + 80} y={model.y + 95} textAnchor="middle" className="fill-gray-700 dark:fill-white/70" fontSize="13" fontWeight="600">{model.label}</text>

          {/* Score */}
          <text x={model.x + 80} y={model.y + 118} textAnchor="middle" fill={model.color} fontSize="22" fontWeight="700">{model.score}</text>
          <text x={model.x + 80} y={model.y + 132} textAnchor="middle" className="fill-gray-400 dark:fill-white/30" fontSize="8">/100 score</text>

          {/* Mini bar charts */}
          {[0.85, 0.9, 0.75, 0.88].map((val, j) => (
            <g key={`mb-${i}-${j}`}>
              <rect x={model.x + 24} y={model.y + 148 + j * 8} width="112" height="4" rx="2" className="fill-gray-100 dark:fill-white/5" />
              <rect x={model.x + 24} y={model.y + 148 + j * 8} width={112 * val * (0.7 + i * 0.1 + j * 0.05)} height="4" rx="2" fill={model.color} fillOpacity="0.4" />
            </g>
          ))}
        </g>
      ))}

      {/* VS labels */}
      <text x="265" y="240" className="fill-gray-300 dark:fill-white/15" fontSize="16" fontWeight="700" textAnchor="middle">vs</text>
      <text x="455" y="240" className="fill-gray-300 dark:fill-white/15" fontSize="16" fontWeight="700" textAnchor="middle">vs</text>

      {/* Bottom comparison bar */}
      <rect x="180" y="360" width="440" height="50" rx="12" className="fill-white dark:fill-white/[0.03] stroke-gray-200 dark:stroke-white/8" strokeWidth="1" />
      <rect x="200" y="376" width="50" height="5" rx="2" className="fill-gray-300 dark:fill-white/15" />
      <rect x="200" y="386" width="80" height="4" rx="2" className="fill-gray-200 dark:fill-white/10" />

      {/* Comparison dots */}
      {[0, 1, 2, 3, 4].map((_, i) => (
        <g key={`cd-${i}`}>
          <circle cx={360 + i * 50} cy={380} r="6" className="fill-emerald-400/20" />
          <circle cx={360 + i * 50} cy={380} r="3" className="fill-emerald-400/50" />
          <circle cx={360 + i * 50} cy={392} r="4" className="fill-blue-400/20" />
          <circle cx={360 + i * 50} cy={392} r="2" className="fill-blue-400/50" />
        </g>
      ))}

      {/* Crown on best model */}
      <path d="M496 128 L504 118 L512 128 L508 126 L504 132 L500 126Z" className="fill-amber-400/60" />
    </svg>
  );
}

// 5. Reduce Customer Support Costs by 60%
export function CostSavingsImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cs-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#ecfdf5] dark:[stop-color:#0a100d]" />
          <stop offset="100%" className="[stop-color:#f0fdf4] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
        <linearGradient id="cs-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#cs-bg)" />

      {/* Background diagonal lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`dl-${i}`} x1={-50 + i * 80} y1="0" x2={-50 + i * 80 + 450} y2="450" className="stroke-emerald-200/10 dark:stroke-emerald-500/5" strokeWidth="0.5" />
      ))}

      {/* Big 60% */}
      <text x="400" y="200" textAnchor="middle" className="fill-emerald-500/[0.07] dark:fill-emerald-500/[0.06]" fontSize="180" fontWeight="900">60%</text>

      {/* Chart card */}
      <rect x="140" y="80" width="520" height="280" rx="16" className="fill-white/80 dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" style={{ backdropFilter: "blur(10px)" }} />

      {/* Chart area */}
      <line x1="190" y1="310" x2="610" y2="310" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
      <line x1="190" y1="120" x2="190" y2="310" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />

      {/* X axis labels */}
      {["Mo 1", "Mo 2", "Mo 3", "Mo 4", "Mo 5", "Mo 6"].map((_, i) => (
        <rect key={`xl-${i}`} x={220 + i * 65} y="318" width="30" height="4" rx="2" className="fill-gray-300 dark:fill-white/15" />
      ))}

      {/* Cost line (going down - red/orange) */}
      <path d="M220 150 C260 155, 290 170, 330 190 S400 220, 440 250 S510 275, 570 290" className="stroke-red-400/50 dark:stroke-red-400/30" strokeWidth="2.5" fill="none" />

      {/* Savings line (going up - green) */}
      <path d="M220 290 C260 280, 290 260, 330 235 S400 200, 440 175 S510 155, 570 140" stroke="url(#cs-line)" strokeWidth="2.5" fill="none" />

      {/* Area fill under savings line */}
      <path d="M220 290 C260 280, 290 260, 330 235 S400 200, 440 175 S510 155, 570 140 L570 310 L220 310 Z" className="fill-emerald-400/[0.06] dark:fill-emerald-400/[0.08]" />

      {/* Data points on savings line */}
      {[
        { x: 220, y: 290 }, { x: 290, y: 260 }, { x: 360, y: 225 },
        { x: 430, y: 185 }, { x: 500, y: 155 }, { x: 570, y: 140 },
      ].map((pt, i) => (
        <circle key={`dp-${i}`} cx={pt.x} cy={pt.y} r="4" className="fill-emerald-400 stroke-white dark:stroke-[#0a0a1a]" strokeWidth="2" />
      ))}

      {/* Annotation */}
      <rect x="440" y="110" width="100" height="36" rx="8" className="fill-emerald-50 dark:fill-emerald-500/10 stroke-emerald-200 dark:stroke-emerald-500/20" strokeWidth="1" />
      <text x="460" y="127" className="fill-emerald-600 dark:fill-emerald-400" fontSize="10" fontWeight="600">Savings</text>
      <text x="460" y="140" className="fill-emerald-500/60" fontSize="8">$48K/year</text>
      <line x1="490" y1="146" x2="490" y2="155" className="stroke-emerald-400/40" strokeWidth="1" />

      {/* Legend */}
      <line x1="200" y1="100" x2="220" y2="100" className="stroke-red-400/50" strokeWidth="2" />
      <rect x="226" y="97" width="60" height="5" rx="2" className="fill-gray-400 dark:fill-white/30" />
      <line x1="310" y1="100" x2="330" y2="100" stroke="url(#cs-line)" strokeWidth="2" />
      <rect x="336" y="97" width="50" height="5" rx="2" className="fill-gray-400 dark:fill-white/30" />

      {/* Side decorations */}
      <g transform="translate(60, 160)">
        <rect width="50" height="50" rx="10" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
        {/* Down arrow */}
        <path d="M25 16 L25 34 M19 28 L25 34 L31 28" className="stroke-emerald-400" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g transform="translate(690, 160)">
        <rect width="50" height="50" rx="10" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" />
        {/* Checkmark */}
        <path d="M16 25 L22 31 L34 19" className="stroke-emerald-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating percentage badges */}
      <rect x="80" y="310" width="40" height="22" rx="11" className="fill-emerald-100 dark:fill-emerald-500/10" />
      <text x="89" y="325" className="fill-emerald-600 dark:fill-emerald-400" fontSize="9" fontWeight="600">-40%</text>
      <rect x="680" y="300" width="40" height="22" rx="11" className="fill-emerald-100 dark:fill-emerald-500/10" />
      <text x="689" y="315" className="fill-emerald-600 dark:fill-emerald-400" fontSize="9" fontWeight="600">-60%</text>
    </svg>
  );
}

// 6. Automate Ecommerce Customer Support
export function EcommerceAutomationImage({ className }: BlogImageProps) {
  return (
    <svg viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ec-bg" x1="0" y1="0" x2="800" y2="450">
          <stop offset="0%" className="[stop-color:#eff6ff] dark:[stop-color:#0a0a18]" />
          <stop offset="100%" className="[stop-color:#faf5ff] dark:[stop-color:#0a0a1a]" />
        </linearGradient>
        <linearGradient id="ec-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#ec-bg)" />

      {/* Background circles */}
      <circle cx="400" cy="225" r="180" className="stroke-blue-200/10 dark:stroke-blue-500/5" strokeWidth="1" fill="none" />
      <circle cx="400" cy="225" r="130" className="stroke-blue-200/10 dark:stroke-blue-500/5" strokeWidth="1" fill="none" />

      {/* Central hub - AI bot */}
      <circle cx="400" cy="225" r="50" className="fill-white dark:fill-white/[0.05] stroke-blue-300 dark:stroke-blue-500/30" strokeWidth="2" />
      <circle cx="400" cy="225" r="35" fill="url(#ec-accent)" fillOpacity="0.1" />
      {/* Bot face */}
      <rect x="380" y="210" width="40" height="28" rx="8" className="fill-blue-500/20 dark:fill-blue-400/20" />
      <circle cx="392" cy="222" r="4" className="fill-blue-500/50 dark:fill-blue-400/50" />
      <circle cx="408" cy="222" r="4" className="fill-blue-500/50 dark:fill-blue-400/50" />
      <rect x="393" y="230" width="14" height="3" rx="1.5" className="fill-blue-500/30 dark:fill-blue-400/30" />
      {/* Antenna */}
      <line x1="400" y1="210" x2="400" y2="198" className="stroke-blue-400/40" strokeWidth="1.5" />
      <circle cx="400" cy="195" r="3" className="fill-blue-400/40" />

      {/* Surrounding nodes */}
      {/* Shopping cart */}
      <g transform="translate(200, 120)">
        <circle r="36" cx="36" cy="36" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
        <path d="M22 28 L28 28 L34 44 L46 44" className="stroke-blue-400/50" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="36" cy="48" r="2" className="fill-blue-400/50" />
        <circle cx="44" cy="48" r="2" className="fill-blue-400/50" />
        <rect x="28" y="30" width="18" height="12" rx="2" className="fill-blue-400/10 stroke-blue-400/30" strokeWidth="1" />
      </g>

      {/* Chat/ticket */}
      <g transform="translate(540, 100)">
        <circle r="36" cx="36" cy="36" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
        <rect x="18" y="20" width="36" height="28" rx="6" className="fill-emerald-400/10 stroke-emerald-400/30" strokeWidth="1" />
        <rect x="24" y="28" width="20" height="3" rx="1" className="fill-emerald-400/30" />
        <rect x="24" y="34" width="14" height="3" rx="1" className="fill-emerald-400/20" />
        <rect x="24" y="40" width="18" height="3" rx="1" className="fill-emerald-400/20" />
      </g>

      {/* Order tracking */}
      <g transform="translate(160, 280)">
        <circle r="36" cx="36" cy="36" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
        <rect x="20" y="22" width="32" height="24" rx="4" className="fill-purple-400/10 stroke-purple-400/30" strokeWidth="1" />
        <path d="M28 46 L44 46 L44 38 L38 34 L28 34 Z" className="fill-purple-400/15 stroke-purple-400/30" strokeWidth="0.5" />
        <circle cx="32" cy="48" r="2" className="fill-purple-400/40" />
        <circle cx="40" cy="48" r="2" className="fill-purple-400/40" />
      </g>

      {/* Returns / refund */}
      <g transform="translate(570, 270)">
        <circle r="36" cx="36" cy="36" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
        {/* Circular arrow */}
        <path d="M28 36 A12 12 0 1 1 44 36" className="stroke-amber-400/50" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M42 30 L44 36 L38 36" className="fill-amber-400/50" />
        <text x="36" y="42" textAnchor="middle" className="fill-amber-500/50" fontSize="8" fontWeight="600">$</text>
      </g>

      {/* FAQ */}
      <g transform="translate(365, 50)">
        <circle r="30" cx="30" cy="30" className="fill-white dark:fill-white/[0.04] stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />
        <text x="30" y="37" textAnchor="middle" className="fill-blue-400/50" fontSize="20" fontWeight="700">?</text>
      </g>

      {/* Connection lines from center to nodes */}
      {[
        { x1: 365, y1: 195, x2: 260, y2: 172 },
        { x1: 435, y1: 195, x2: 555, y2: 155 },
        { x1: 365, y1: 255, x2: 220, y2: 305 },
        { x1: 435, y1: 255, x2: 585, y2: 295 },
        { x1: 400, y1: 175, x2: 395, y2: 110 },
      ].map((line, i) => (
        <line key={`conn-${i}`} {...line} className="stroke-blue-300/20 dark:stroke-blue-400/15" strokeWidth="1.5" strokeDasharray="4 4" />
      ))}

      {/* Automation flow indicators */}
      {[
        { x: 310, y: 180 }, { x: 470, y: 165 }, { x: 300, y: 270 }, { x: 500, y: 265 }, { x: 400, y: 145 },
      ].map((pos, i) => (
        <g key={`flow-${i}`}>
          <circle cx={pos.x} cy={pos.y} r="8" className="fill-emerald-400/15 dark:fill-emerald-400/10" />
          <path d={`M${pos.x - 3} ${pos.y} L${pos.x + 2} ${pos.y + 3} L${pos.x + 5} ${pos.y - 3}`} className="stroke-emerald-400/50" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      ))}

      {/* "80% automated" badge */}
      <rect x="340" y="390" width="120" height="32" rx="16" className="fill-white dark:fill-white/[0.05] stroke-blue-200 dark:stroke-blue-500/20" strokeWidth="1" />
      <text x="365" y="411" className="fill-blue-600 dark:fill-blue-400" fontSize="11" fontWeight="600">80% auto</text>
      <circle cx="440" cy="406" r="8" className="fill-emerald-400/20" />
      <path d="M436 406 L439 409 L444 403" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Map slug to component
export const blogImageMap: Record<string, React.FC<BlogImageProps>> = {
  "how-to-add-ai-chatbot-to-your-website": ChatbotWebsiteImage,
  "ai-customer-support-roi-guide": ROICalculatorImage,
  "how-to-build-telegram-chatbot": TelegramBotImage,
  "best-ai-models-for-customer-support": AIModelsComparisonImage,
  "reduce-customer-support-costs-with-ai": CostSavingsImage,
  "how-to-automate-ecommerce-customer-support": EcommerceAutomationImage,
};

export function BlogImage({ slug, className }: { slug: string; className?: string }) {
  const Component = blogImageMap[slug];
  if (!Component) return null;
  return <Component className={className} />;
}
