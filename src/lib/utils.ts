import type { TripItemDraft } from "$lib/types";

const weekdayMap = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

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
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      const label = `${month}月${day}日 (${weekdayMap[parsed.getDay()]})`;
      return {
        date,
        label,
        weekday: weekdayMap[parsed.getDay()],
        dayOfMonth: String(parsed.getDate()),
        items: [...dayItems].sort((a, b) => {
          const timeDiff = toSortableTime(a.startTime) - toSortableTime(b.startTime);
          if (timeDiff !== 0) return timeDiff;
          return (a.endTime || "").localeCompare(b.endTime || "");
        })
      };
    });
}
