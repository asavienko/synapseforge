export const REGION_LABELS = {
  nbg1: "Näßheim, DE",
  fsn1: "Freistadt, DE",
  hel1: "Helsinki, FI",
  eas1: "Easthaven, US",
  ash1: "Ashburn, US",
  lga1: "New York, US",
  sin1: "Singapore, SG",
  syd1: "Sydney, AU",
} as const;

export type HetznerRegion = keyof typeof REGION_LABELS;

export const TIER_LABEL: Record<string, string> = {
  minimal: "Minimal (trial)",
  standard: "Standard",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const TIER_COST: Record<string, string> = {
  minimal: "€5/mo",
  standard: "€10/mo",
  pro: "€25/mo",
  enterprise: "Custom",
};