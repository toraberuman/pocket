// Trip overview — editorial DNA: serif headline, mono eyebrows, hairline rules.
const TripOverview = ({ trip, view, onView, onBack }) => {
  return (
    <>
      {/* Top chrome */}
      <div style={{ padding: "8px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="icon-btn" onClick={onBack}>{I.back}</button>
        <div className="seg-toggle">
          <button className={view === "map" ? "on" : ""} onClick={() => onView("map")}>Map</button>
          <button className={view === "list" ? "on" : ""} onClick={() => onView("list")}>List</button>
        </div>
        <button className="icon-btn">{I.share}</button>
      </div>

      {/* Editorial masthead */}
      <div style={{ padding: "20px 22px 0" }}>
        <div className="eb-eyebrow">{trip.dates}</div>
        <h1 className="eb-h1" style={{ fontSize: 40, marginTop: 8, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
          {trip.title.split(" in ")[0]}<br/>
          <span className="kome" style={{ fontStyle: "italic", color: "var(--ink-2)" }}>in Japan.</span>
        </h1>
      </div>

      <div className="hairline" style={{ margin: "20px 22px 0" }}/>

      {/* Stat strip */}
      <div className="metrics-grid">
        <div>
          <div className="eb-eyebrow">Cities</div>
          <div className="metric-num">{trip.cities.length}</div>
        </div>
        <div className="metric-divider"/>
        <div>
          <div className="eb-eyebrow">Days</div>
          <div className="metric-num">{trip.daysCount}</div>
        </div>
        <div className="metric-divider"/>
        <div>
          <div className="eb-eyebrow">Plans</div>
          <div className="metric-num">{trip.days.reduce((n,d) => n + d.activities.length, 0)}</div>
        </div>
      </div>

      <div className="hairline" style={{ margin: "0 22px" }}/>

      {view === "map" ? (
        <div style={{ padding: "18px 22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <h2 className="ed-section-title" style={{ fontSize: 22 }}>The route</h2>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em", color: "var(--ink-3)", textTransform: "uppercase" }}>847 km · 6h 12m</span>
          </div>
          <div className="map" style={{ height: 360, borderRadius: 12, border: "1px solid var(--rule)", position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset: 0, width:"100%", height:"100%" }}>
              <path d={`M ${trip.cities[0].x} ${trip.cities[0].y} L ${trip.cities[1].x} ${trip.cities[1].y} L ${trip.cities[2].x} ${trip.cities[2].y} L ${trip.cities[3].x} ${trip.cities[3].y}`}
                fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.4" strokeDasharray="1.4 1.6" strokeLinecap="round"/>
            </svg>
            {trip.cities.map((c, i) => (
              <div key={c.id} style={{ position: "absolute", left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%, -100%)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ background: "var(--paper)", padding: "3px 9px", border: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".04em", whiteSpace: "nowrap" }}>{c.name}</div>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: c.color, color: "#fff", border: "2px solid var(--paper)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: 13, fontWeight: 500, marginTop: 4 }}>{c.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "18px 22px 24px" }}>
          <h2 className="ed-section-title" style={{ fontSize: 22, marginBottom: 6 }}>The cities</h2>
          {trip.cities.map((c, i) => (
            <div key={c.id} className="city-row">
              <div className="city-row-num" style={{ background: c.color }}>{c.id}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="ed-title" style={{ fontSize: 22, margin: 0 }}>{c.name}</h3>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: ".06em", marginTop: 4, textTransform: "uppercase" }}>{c.dates}</div>
              </div>
              <div style={{ textAlign: "right", paddingLeft: 8 }}>
                <div className="eb-num" style={{ fontSize: 28, lineHeight: 0.95, letterSpacing: "-0.02em" }}>{c.nights}</div>
                <div className="eb-eyebrow" style={{ marginTop: 2 }}>nights</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

window.TripOverview = TripOverview;
