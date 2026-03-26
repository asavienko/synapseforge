// OpenHelix AI - Unique Brand Icons
// Custom SVG icons designed specifically for the brand identity

interface IconProps {
  className?: string;
  size?: number;
}

// ============================================================================
// LOGO & BRAND
// ============================================================================

export function HelixLogo({ className = "", size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path
        d="M16 2C10 2 6 7 6 12C6 17 10 20 16 23C22 26 26 28 26 23C26 18 22 15 16 12C10 9 6 7 6 12"
        stroke="url(#helixGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 30C22 30 26 25 26 20C26 15 22 12 16 9C10 6 6 4 6 9C6 14 10 17 16 20C22 23 26 25 26 20"
        stroke="url(#helixGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle cx="16" cy="16" r="3" fill="url(#helixGradient)" />
    </svg>
  );
}

// ============================================================================
// NAVIGATION & UI
// ============================================================================

export function DashboardIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function InstancesIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 20H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 16V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function MessagesIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6C4 4.9 4.9 4 6 4H14C15.1 4 16 4.9 16 6V11C16 12.1 15.1 13 14 13H10L7 16V13H6C4.9 13 4 12.1 4 11V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13V15C8 16.1 8.9 17 10 17H14L17 20V17H18C19.1 17 20 16.1 20 15V10C20 8.9 19.1 8 18 8H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 7.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 10H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BillingIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SettingsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.2"/>
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IntegrationsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 12L12 7L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 12L12 17L17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ReferralsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="6" y="14" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="11" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// ============================================================================
// FEATURES & ACTIONS
// ============================================================================

export function AIBrainIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3C7.5 3 4 6.5 4 11C4 14.5 6 17.5 9 19V21C9 21.5 9.5 22 10 22H14C14.5 22 15 21.5 15 21V19C18 17.5 20 14.5 20 11C20 6.5 16.5 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12C9 12 10 13 12 13C14 13 15 12 15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M12 16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BotIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="6" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9.5" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14.5" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CircleIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function HeartIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookOpenIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShieldCheckIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2.5L4 6.5V11.5C4 16.5 7.4 21 12 22C16.6 21 20 16.5 20 11.5V6.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12.5L11 14.5L15 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RocketLaunchIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2C12 2 8 6 8 13L6 15.5V17.5H9.5L10.5 16C11 16.3 11.5 16.5 12 16.5C12.5 16.5 13 16.3 13.5 16L14.5 17.5H18V15.5L16 13C16 6 12 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 21C9 19.5 10.5 18.5 12 18.5C13.5 18.5 15 19.5 16 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function AnalyticsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="6" y="13" width="2.5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10.75" y="9" width="2.5" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="15.5" y="6" width="2.5" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function CodeIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 12L5.5 14.5L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12L18.5 14.5L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 11L11 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================================================
// STATUS & FEEDBACK
// ============================================================================

export function WarningIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L2 20H22L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
    </svg>
  );
}

export function LoadingIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
      <path
        d="M12 3C16.9706 3 21 7.02944 21 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

// ============================================================================
// CHANNELS & INTEGRATIONS
// ============================================================================

export function TelegramIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 12.5l3 2.5 7-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 15l-.5 3.5 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function DiscordIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9.09 4.59C9.09 4.59 7.5 4 5.5 5.5C5.5 5.5 3.5 9 3.5 13.5C5.36 15.84 8 16.5 8 16.5L9 15C9 15 7.5 14.5 6.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.91 4.59C14.91 4.59 16.5 4 18.5 5.5C18.5 5.5 20.5 9 20.5 13.5C18.64 15.84 16 16.5 16 16.5L15 15C15 15 16.5 14.5 17.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function SlackIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 15C4.9 15 4 15.9 4 17C4 18.1 4.9 19 6 19C7.1 19 8 18.1 8 17V15H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M6 5C4.9 5 4 5.9 4 7C4 8.1 4.9 9 6 9H11V7C11 5.9 10.1 5 9 5H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M18 9C19.1 9 20 8.1 20 7C20 5.9 19.1 5 18 5C16.9 5 16 5.9 16 7V9H18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M18 19C19.1 19 20 18.1 20 17C20 15.9 19.1 15 18 15H13V17C13 18.1 13.9 19 15 19H18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 7V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 12V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 13H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function WhatsAppIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 13.66 20.02 15.21 19.2 16.52L20 21L15.63 20.09C14.52 20.67 13.3 21 12 21C7.31 21 3.5 16.69 3.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.5C9 10.5 9 9 10 9C11 9 11 10.5 11 10.5V11.5C11 11.5 11.5 12.5 12 13C12.5 13.5 13.5 14 13.5 14H14.5C14.5 14 16 14 16 15C16 16 14.5 16 14.5 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WebIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2C14.5 4.5 15.5 8 15.5 12C15.5 16 14.5 19.5 12 22" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2C9.5 4.5 8.5 8 8.5 12C8.5 16 9.5 19.5 12 22" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

// ============================================================================
// ARROWS & NAVIGATION
// ============================================================================

export function ArrowRightIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PlusIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CloseIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CheckIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RefreshIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.5 12C3.5 7.31 7.31 3.5 12 3.5C14.83 3.5 17.32 5 18.78 7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20.5 12C20.5 16.69 16.69 20.5 12 20.5C9.17 20.5 6.68 19 5.22 16.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M16 7.25H19V4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16.75H5V19.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ============================================================================
// USER & ACCOUNT
// ============================================================================

export function UserIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path
        d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20.5 12C21.5 12.5 22 13.5 22 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function LogoutIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================================================
// SPECIALTY ICONS
// ============================================================================

export function SparklesIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 15L20.6 17.4L23 18L20.6 18.6L20 21L19.4 18.6L17 18L19.4 17.4L20 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5" cy="4" r="1" fill="currentColor"/>
    </svg>
  );
}

export function GiftIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8V20" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8C12 8 12 5 9 5C6 5 6 8 6 8H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8C12 8 12 5 15 5C18 5 18 8 18 8H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CalendarIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function MenuIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function KeyIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="15" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 11L21 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 2H21V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 5L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
