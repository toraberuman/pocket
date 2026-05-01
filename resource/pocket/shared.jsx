// Tabbar — shared between trip screens
const TabBar = ({ active, onChange }) => {
  const tabs = [
    { id: "today", label: "Today", icon: I.home },
    { id: "plan", label: "Plan", icon: I.calendar },
    { id: "map", label: "Map", icon: I.map },
    { id: "budget", label: "Budget", icon: I.wallet },
    { id: "bag", label: "Pack", icon: I.bag },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={active === t.id ? "active" : ""} onClick={() => onChange?.(t.id)}>
          <span className="ic">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

const ZH_WD = { Mon: "一", Tue: "二", Wed: "三", Thu: "四", Fri: "五", Sat: "六", Sun: "日" };
const ZH_MON = { Jan: "1月", Feb: "2月", Mar: "3月", Apr: "4月", May: "5月", Jun: "6月", Jul: "7月", Aug: "8月", Sep: "9月", Oct: "10月", Nov: "11月", Dec: "12月" };

// Day strip
const DayStrip = ({ days, active, onChange }) => (
  <div className="daystrip">
    {days.map((d, i) => {
      // d.date like "Tue · May 12"
      const [wd, rest] = d.date.split(" · ");
      const [mon, num] = rest.split(" ");
      return (
        <button key={d.day} className={active === i ? "active" : ""} onClick={() => onChange?.(i)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
            <span className="d-label">Day {String(d.day).padStart(2,"0")}</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: 600, opacity: 0.7 }}>週{ZH_WD[wd] || ""}</span>
          </div>
          <span className="d-num">{num}</span>
          <span className="d-mon">{ZH_MON[mon] || mon} · {d.city}</span>
        </button>
      );
    })}
  </div>
);

// Activity card — used in cards style
const ActivityCard = ({ a, idx, expanded, onToggle, draggable, onDragStart, onDragOver, onDrop, ghost, target }) => {
  const cls = ["act"];
  if (ghost) cls.push("reorder-ghost");
  if (target) cls.push("reorder-target");
  return (
    <div className={cls.join(" ")}
         draggable={draggable}
         onDragStart={onDragStart}
         onDragOver={onDragOver}
         onDrop={onDrop}
         onClick={onToggle}>
      <div className="act-img ph" data-label={a.img} style={{ background: tonePh(a.tone) }}/>
      <div style={{ minWidth: 0 }}>
        <div className="act-time">{a.time} — {a.end} · {a.kind}</div>
        <div className="act-title">{a.title}</div>
        <div className="act-meta">
          <span style={{ color: "var(--ink-3)" }}>{I.pin}</span>
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.note}</span>
        </div>
        {expanded && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--rule)", display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="pill">{I.clock}{durMin(a)} min</span>
              <span className="pill">¥¥</span>
              <span className="pill">3 going</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
              Reservation confirmed · arrive 5 minutes early. Cash preferred.
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn" style={{ padding: "8px 12px", fontSize: 12 }}>Open in maps</button>
              <button className="btn" style={{ padding: "8px 12px", fontSize: 12 }}>Edit</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span className="act-num">{String(idx + 1).padStart(2, "0")}</span>
        <span className="handle" title="Drag to reorder">{I.drag}</span>
      </div>
    </div>
  );
};

function tonePh(tone) {
  const map = {
    accent: "linear-gradient(135deg, #d2552c 0%, #b3441e 100%)",
    moss: "linear-gradient(135deg, #2d4a3e 0%, #1f3429 100%)",
    sand: "linear-gradient(135deg, #c89968 0%, #a87a4a 100%)",
    plum: "linear-gradient(135deg, #5a3a4a 0%, #3e2433 100%)",
    sky:  "linear-gradient(135deg, #6e8caa 0%, #4d6a87 100%)",
  };
  return map[tone] || map.moss;
}
function durMin(a) {
  const [sh, sm] = a.time.split(":").map(Number);
  const [eh, em] = a.end.split(":").map(Number);
  return (eh*60 + em) - (sh*60 + sm);
}

window.TabBar = TabBar;
window.DayStrip = DayStrip;
window.ActivityCard = ActivityCard;
window.tonePh = tonePh;
window.durMin = durMin;
