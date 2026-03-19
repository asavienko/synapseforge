export interface Milestone {
  key: string;
  label: string;
  description: string;
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalMessages: number;
  totalInstances: number;
  daysActive: number;
  totalCredentials: number;
}

export const MILESTONES: Milestone[] = [
  {
    key: "first_message",
    label: "First conversation",
    description: "Your AI agent had its first real conversation!",
    check: (s) => s.totalMessages >= 1,
  },
  {
    key: "ten_messages",
    label: "10 conversations",
    description: "Your AI agent has handled 10 conversations.",
    check: (s) => s.totalMessages >= 10,
  },
  {
    key: "hundred_messages",
    label: "100 conversations",
    description: "Your AI agent has handled 100 conversations.",
    check: (s) => s.totalMessages >= 100,
  },
  {
    key: "first_instance",
    label: "First agent deployed",
    description: "You deployed your first AI agent.",
    check: (s) => s.totalInstances >= 1,
  },
  {
    key: "three_instances",
    label: "3 agents running",
    description: "You have 3 AI agents running simultaneously.",
    check: (s) => s.totalInstances >= 3,
  },
  {
    key: "week_one",
    label: "First week",
    description: "You've been building with OpenHelix AI for a full week.",
    check: (s) => s.daysActive >= 7,
  },
  {
    key: "month_one",
    label: "One month in",
    description: "30 days of building AI agents. You're a pro.",
    check: (s) => s.daysActive >= 30,
  },
];
