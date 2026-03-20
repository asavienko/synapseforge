export function formatAbsoluteTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function groupLogsByDay(logs: { createdAt: string; id: string; event: string; details?: string }[]): Array<{ label: string; logs: typeof logs }> {
  const groups: Map<string, typeof logs> = new Map();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const log of logs) {
    const d = new Date(log.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else key = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }
  return Array.from(groups.entries()).map(([label, logs]) => ({ label, logs }));
}
