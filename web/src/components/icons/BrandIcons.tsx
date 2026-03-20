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
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
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
        d="M21 11.5C21 16.75 16.75 21 11.5 21C10.25 21 9.1 20.75 8 20.35L3 22L4.65 17C4.25 15.9 4 14.75 4 13.5C4 8.25 8.25 4 13.5 4C18.75 4 21 8.25 21 11.5Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="12" r="1" fill="currentColor"/>
      <circle cx="13.5" cy="12" r="1" fill="currentColor"/>
      <circle cx="17.5" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

export function BillingIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SettingsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path 
        d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
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
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RocketLaunchIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M12 2C8 6 6 10 6 14V18L4 20V22H20V20L18 18V14C18 10 16 6 12 2Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 22V18C9 16.5 10.5 15 12 15C13.5 15 15 16.5 15 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function AutomationIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 7H14C15.5 7 17 8.5 17 10V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 11V14C7 15.5 8.5 17 10 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function AnalyticsIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 14L11 11L14 13L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="9" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function CloudSyncIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M17 18C19.5 18 21.5 16 21.5 13.5C21.5 11.5 20 9.8 18 9.3C17.8 6.3 15.3 4 12 4C9 4 6.5 6 6 9C3.5 9.5 2 11.5 2 14C2 16.5 4 18.5 6.5 18.5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M12 13V21M12 21L9 18M12 21L15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CodeIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 7L4 12L9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7L20 12L15 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SupportIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9 9C9 7.5 10.5 6 12 6C13.5 6 15 7.5 15 9C15 10.5 13.5 11 12 12V14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  );
}

// ============================================================================
// STATUS & FEEDBACK
// ============================================================================

export function SuccessIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ErrorIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

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

export function InfoIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
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
      <path 
        d="M21 5L2 12.5L9 13.5M21 5L18.5 20L9 13.5M21 5L9 13.5M9 13.5V19L12 15.5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DiscordIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M8 11C8 11 9.5 12 12 12C14.5 12 16 11 16 11M9 16H9.01M15 16H15.01M7 19L5 21H2V5C2 5 5 4 8 4C8 4 9.5 6 12 6C14.5 6 16 4 16 4C19 4 22 5 22 5V21H19L17 19" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SlackIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="8" y="3" width="3" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="8" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="13" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13" y="13" width="3" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function WhatsAppIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M3 12C3 16.9706 7.02944 21 12 21C13.5759 21 15.0548 20.6067 16.3514 19.913L21 21L19.7894 16.5C20.5687 15.1689 21 13.6338 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M12 7V12L15 15" 
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

export function ArrowLeftIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ChevronDownIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

export function CopyIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 15V5C5 3.89543 5.89543 3 7 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SendIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M23 4V10H17" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M1 20V14H7" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M3.51 9C4.71735 5.14841 7.98026 2.22391 12.0048 2.00314C16.0294 1.78238 19.5642 4.34232 21.1531 8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M20.488 15C19.2807 18.8516 16.0177 21.7761 11.9932 21.9969C7.96862 22.2176 4.43384 19.6577 2.84488 16" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
      <path d="M4 20C4 16 7 14 12 14C17 14 20 16 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

export function BellIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.3 21C10.4674 21.3044 10.7135 21.5583 11.0125 21.7352C11.3116 21.912 11.6526 22.0053 12 22.0053C12.3474 22.0053 12.6884 21.912 12.9875 21.7352C13.2865 21.5583 13.5326 21.3044 13.7 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================================================
// SPECIALTY ICONS
// ============================================================================

export function SparklesIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

export function MailIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 5L12 12L21 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <circle cx="8" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 11L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 4H20V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function EyeIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function EyeOffIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06003M9.9 4.24002C10.5883 4.07888 11.2931 3.99834 12 4.00003C19 4.00003 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8153C12.7782 14.9793 12.3809 15.0683 11.9781 15.0775C11.5753 15.0866 11.1747 15.0158 10.7993 14.8689C10.4239 14.722 10.081 14.5017 9.79035 14.2205C9.49967 13.9393 9.2664 13.6022 9.10328 13.2281C8.94016 12.854 8.84999 12.4501 8.83762 12.0402C8.82525 11.6303 8.89096 11.2221 9.03109 10.8377C9.17121 10.4533 9.3832 10.0998 9.655 9.79701" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
