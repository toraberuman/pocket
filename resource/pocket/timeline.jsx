// Daily timeline — hero screen, 3 variants
// All share trip header + day strip + activity list, differ in rail style

const TimelineHeader = ({ trip, dayIdx, onBack }) => {
  const day = trip.days[dayIdx];
  return (
    <div style={{ padding: "8px 22px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="btn" style={{ width: 36, height: 36, padding: 0, borderRadius: 12 }} onClick={onBack}>{I.back}</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" style={{ width: 36, height: 36, padding: 0, borderRadius: 12 }}>{I.share}</button>
          <button className="btn" style={{ width: 36, height: 36, padding: 0, borderRadius: 12 }}>{I.more}</button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18 }}>
        <div>
          <div className="eb-eyebrow">Day {String(day.day).padStart(2,"0")} / {String(trip.daysCount).padStart(2,"0")} · {day.city}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="eb-num" style={{ fontSize: 36, lineHeight: 1 }}>{day.activities.length}</div>
          <div className="eb-eyebrow" style={{ marginTop: 2 }}>plans</div>
        </div>
      </div>
    </div>
  );
};

// ─── Variant A: CARDS ─────────────────────────────────────────────────────
function TimelineCards({ trip, expandedId, dayIdx, dragId, dragOver, dispatch }) {
  const day = trip.days[dayIdx];
  return (
    <div style={{ padding: "4px 22px 24px", display: "grid", gap: 10 }}>
      {day.activities.map((a, i) => (
        <React.Fragment key={a.id}>
          <ActivityCard a={a} idx={i}
            expanded={expandedId === a.id}
            onToggle={() => dispatch({ type: "toggleExpand", id: a.id })}
            draggable
            onDragStart={() => dispatch({ type: "dragStart", id: a.id })}
            onDragOver={(e) => { e.preventDefault(); dispatch({ type: "dragOver", id: a.id }); }}
            onDrop={() => dispatch({ type: "drop", id: a.id })}
            ghost={dragId === a.id}
            target={dragOver === a.id && dragId !== a.id}
          />
          {a.legAfter && <Leg leg={a.legAfter}/>}
        </React.Fragment>
      ))}
      <button className="btn full" style={{ marginTop: 4, borderStyle: "dashed" }}
              onClick={() => dispatch({ type: "openSheet" })}>
        {I.plus} Add to Day {day.day}
      </button>
    </div>
  );
}

// ─── Variant B: DOTTED RAIL ───────────────────────────────────────────────
function TimelineDotted({ trip, expandedId, dayIdx, dispatch, solid = false }) {
  const day = trip.days[dayIdx];
  return (
    <div style={{ padding: "4px 22px 24px", position: "relative" }}>
      <div style={{ position: "relative", paddingLeft: 56 }}>
        <div className={solid ? "rail-solid" : "rail-dotted"} style={{ left: 22 }}/>
        {day.activities.map((a, i) => {
          const expanded = expandedId === a.id;
          const isFirst = i === 0;
          return (
            <React.Fragment key={a.id}>
              <div style={{ position: "relative", paddingBottom: a.legAfter ? 8 : 16 }}>
                <div className={"rail-dot " + (isFirst ? "filled" : "")}
                     style={{ left: -40, top: 14 }}/>
                <div className="card" style={{ cursor: "pointer", padding: 14 }}
                     onClick={() => dispatch({ type: "toggleExpand", id: a.id })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div className="act-time">{a.time} — {a.end}</div>
                    <div className="eb-eyebrow">{a.kind}</div>
                  </div>
                  <div className="act-title" style={{ margin: "6px 0 4px" }}>{a.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="ph" data-label={a.img}
                         style={{ width: 44, height: 44, borderRadius: 8, background: tonePh(a.tone), flexShrink: 0 }}/>
                    <div className="act-meta" style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: "var(--ink-3)" }}>{I.pin}</span>
                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.note}</span>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--rule)", fontSize: 12, color: "var(--ink-2)" }}>
                      {durMin(a)} min · ¥¥ · 3 going. Tap to view full details.
                    </div>
                  )}
                </div>
              </div>
              {a.legAfter && (
                <div style={{ position: "relative", paddingLeft: 0, paddingBottom: 8, marginLeft: -56 }}>
                  <Leg leg={a.legAfter}/>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ position: "relative", paddingBottom: 4 }}>
          <div className="rail-dot" style={{ left: -40, top: 14, background: "transparent" }}/>
          <button className="btn full" style={{ borderStyle: "dashed" }} onClick={() => dispatch({ type: "openSheet" })}>
            {I.plus} Add to Day {day.day}
          </button>
        </div>
      </div>
    </div>
  );
}

// Transit leg row — connects two activities
function Leg({ leg }) {
  const iconMap = { walk: I.walk, taxi: I.taxi, subway: I.subway, train: I.train, car: I.taxi, plane: I.plane };
  const ic = iconMap[leg.mode] || I.walk;
  return (
    <div className="leg">
      <div className="leg-rail" aria-hidden>
        <span className="leg-dot"/>
        <span className="leg-dot"/>
        <span className="leg-dot"/>
      </div>
      <div className="leg-card">
        <span className="leg-icon">{ic}</span>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span className="leg-label">{leg.label}</span>
          <span className="leg-meta">{leg.distance} · {leg.duration}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Variant C: EDITORIAL HOUR-RAIL (card, no image) ──────────────────────
function TimelineEditorial({ trip, expandedId, dayIdx, dispatch }) {
  const day = trip.days[dayIdx];
  return (
    <div style={{ padding: "8px 22px 24px" }}>
      {day.activities.map((a, i) => {
        const expanded = expandedId === a.id;
        return (
          <React.Fragment key={a.id}>
            <div className="ed-row" style={{ display: "grid", gridTemplateColumns: "64px 1fr", columnGap: 16, alignItems: "start" }}>
              {/* Time column — stacked composition */}
              <div className="ed-time">
                <span className="ed-time-start">{a.time}</span>
                <span className="ed-dash"/>
                <span className="ed-time-end">{a.end}</span>
              </div>

              {/* Content column */}
              <div onClick={() => dispatch({ type: "toggleExpand", id: a.id })} className="ed-content">
                <div className="ed-kind">{a.kind}</div>
                <h3 className="ed-title">{a.title}</h3>
                <div className="ed-meta">
                  <span className="ed-meta-ic" aria-hidden>{I.pin}</span>
                  <span className="ed-meta-text">{a.note}</span>
                </div>

                {expanded && (
                  <div className="ed-expand">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      <span className="pill">{durMin(a)} min</span>
                      <span className="pill">¥¥</span>
                      <span className="pill">3 going</span>
                    </div>
                    <p style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.45, color: "var(--ink-2)" }}>
                      Reservation confirmed. Arrive 5 min early. <span className="kome">Cash preferred.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {a.legAfter && <Leg leg={a.legAfter}/>}
            {!a.legAfter && i < day.activities.length - 1 && (
              <div style={{ height: 22 }}/>
            )}
          </React.Fragment>
        );
      })}
      <button className="btn full" style={{ borderStyle: "dashed", marginTop: 14 }} onClick={() => dispatch({ type: "openSheet" })}>
        {I.plus} Add to Day {day.day}
      </button>
    </div>
  );
}

window.TimelineHeader = TimelineHeader;
window.TimelineCards = TimelineCards;
window.TimelineDotted = TimelineDotted;
window.TimelineEditorial = TimelineEditorial;
