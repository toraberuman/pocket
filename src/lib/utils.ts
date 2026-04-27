import type { TripItemDraft } from "$lib/types";

function toSortableTime(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER - 1;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function groupByDay(items: TripItemDraft[]) {
  const groups = new Map<string, TripItemDraft[]>();

  for (const item of items) {
    const current = groups.get(item.dayDate) || [];
    current.push(item);
    groups.set(item.dayDate, current);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayItems]) => {
      const parsed = new Date(`${date}T00:00:00`);
      const label = parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "long"
      });
      return {
        date,
        label,
        weekday: parsed.toLocaleDateString("en-US", { weekday: "short" }),
        dayOfMonth: String(parsed.getDate()),
        items: [...dayItems].sort((a, b) => {
          const timeDiff = toSortableTime(a.startTime) - toSortableTime(b.startTime);
          if (timeDiff !== 0) return timeDiff;
          return (a.endTime || "").localeCompare(b.endTime || "");
        })
      };
    });
}
