export const REGIONS = [
  { id: "nbg1", label: "Nuremberg (EU)", flag: "🇩🇪" },
  { id: "fsn1", label: "Falkenstein (EU)", flag: "🇩🇪" },
  { id: "ash", label: "Ashburn (US)", flag: "🇺🇸" },
  { id: "sin", label: "Singapore (Asia)", flag: "🇸🇬" },
] as const;

export const TIERS = [
  {
    id: "minimal",
    label: "Minimal",
    specs: "1 vCPU / 2GB RAM",
    price: "$5/mo",
    badge: null,
  },
  {
    id: "standard",
    label: "Standard",
    specs: "2 vCPU / 4GB RAM",
    price: "$10/mo",
    badge: "Most popular",
  },
  {
    id: "pro",
    label: "Pro",
    specs: "4 vCPU / 8GB RAM",
    price: "$20/mo",
    badge: null,
  },
] as const;

export type RegionId = typeof REGIONS[number]["id"];
export type TierId = typeof TIERS[number]["id"];
