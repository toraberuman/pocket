// Editorial-language home + supporting screens — match Variant C's DNA:
// serif display, mono eyebrows, hairline rules instead of bordered cards.

const TripsHome = ({ trip, others, onOpen }) => (
  <>
    <div style={{ padding: "12px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="eb-eyebrow">May, 2026 · Issue 04</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="icon-btn">{I.search}</button>
        <button className="icon-btn">{I.user}</button>
      </div>
    </div>

    <div style={{ padding: "8px 22px 6px" }}>
      <h1 className="eb-h1" style={{ fontSize: 44, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
        Travels<span className="kome" style={{ color: "var(--ink-3)", fontStyle: "italic" }}>,</span>
      </h1>
      <p className="ed-lede">A pocket-sized atlas of where you've been &amp; where you're going.</p>
    </div>

    <div className="hairline" style={{ margin: "16px 22px 0" }}/>

    {/* Active trip — featured editorial block */}
    <div style={{ padding: "18px 22px 10px" }} onClick={onOpen}>
      <div className="eb-eyebrow" style={{ color: "var(--accent)" }}>● ACTIVE · DAY 01 OF {trip.daysCount}</div>
      <h2 className="eb-h1" style={{ fontSize: 38, marginTop: 8, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {trip.title.split(" in ")[0]}<br/>
        <span className="kome" style={{ fontStyle: "italic", color: "var(--ink-2)" }}>in May.</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 18 }}>
        <Stat label="Cities" value={trip.cities.length}/>
        <Stat label="Days" value={trip.daysCount}/>
        <Stat label="Plans" value={trip.days.reduce((n,d) => n+d.activities.length, 0)}/>
      </div>

      <div className="hairline" style={{ margin: "18px 0 14px" }}/>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {trip.cities.map(c => <span key={c.id} className="city-tag"><span className="city-dot" style={{ background: c.color }}/>{c.name}</span>)}
      </div>

      <button className="btn solid" style={{ marginTop: 16, width: "100%" }}>Open trip →</button>
    </div>

    {/* Other trips — listed like a magazine index */}
    <div style={{ padding: "26px 22px 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 className="ed-section-title">The catalogue</h2>
        <span className="eb-eyebrow">{others.length} entries</span>
      </div>
    </div>

    <div style={{ padding: "0 22px 24px" }}>
      {others.map((o, i) => (
        <div key={i} className="catalogue-row">
          <div className="catalogue-num">{String(i+2).padStart(2,"0")}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ed-kind">{o.status}</div>
            <h3 className="ed-title" style={{ fontSize: 18, margin: "2px 0 4px" }}>{o.name}</h3>
            <div className="ed-meta-text" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: ".04em" }}>{o.dates} · {o.days} days</div>
          </div>
          <div className="catalogue-chev">›</div>
        </div>
      ))}
      <button className="dashed-row" style={{ marginTop: 4 }}>{I.plus} <span>Start a new trip</span></button>
    </div>
  </>
);

const Stat = ({ label, value }) => (
  <div>
    <div className="eb-num" style={{ fontSize: 32, lineHeight: 0.95, letterSpacing: "-0.02em" }}>{value}</div>
    <div className="eb-eyebrow" style={{ marginTop: 4 }}>{label}</div>
  </div>
);

const AddActivitySheet = ({ onClose, onSave }) => {
  const [kind, setKind] = React.useState("Food");
  const kinds = ["Food", "Walk", "Museum", "Stay", "Train", "Flight", "Nightlife"];
  return (
    <div className="sheet-bd" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="grabber"/>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div className="eb-eyebrow">Day 01 · Tokyo</div>
            <h2 className="eb-h1" style={{ fontSize: 30, marginTop: 6 }}>New plan<span className="kome" style={{ color: "var(--ink-3)" }}>.</span></h2>
          </div>
          <button onClick={onClose} className="icon-btn">{I.close}</button>
        </div>

        <div className="hairline" style={{ margin: "14px 0" }}/>

        <div className="eb-eyebrow">Type</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {kinds.map(k => (
            <button key={k} className={"chip" + (kind === k ? " on" : "")} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>

        <div className="hairline" style={{ margin: "14px 0 4px" }}/>
        <FormRow label="Title" defaultValue="Coffee at Koffee Mameya"/>
        <FormRow label="Where" defaultValue="Omotesando, Tokyo"/>
        <FormRow label="When" defaultValue="Tue May 12 · 14:00 — 15:30"/>
        <FormRow label="Notes" defaultValue="Try the aged Geisha, single origin"/>
        <FormRow label="Cost" defaultValue="¥ 2,400" last/>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button className="btn full" onClick={onClose}>Cancel</button>
          <button className="btn full accent" onClick={onSave}>Add to Day 01</button>
        </div>
      </div>
    </div>
  );
};

const FormRow = ({ label, defaultValue, last }) => (
  <div className="form-row">
    <span className="form-lbl">{label}</span>
    <input className="form-input" defaultValue={defaultValue}/>
    {!last && <div className="hairline" style={{ gridColumn: "1 / -1" }}/>}
  </div>
);

const ActivityDetail = ({ a, onBack }) => (
  <>
    <div style={{ padding: "8px 22px 0", display: "flex", justifyContent: "space-between" }}>
      <button className="icon-btn" onClick={onBack}>{I.back}</button>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="icon-btn">{I.share}</button>
        <button className="icon-btn">{I.more}</button>
      </div>
    </div>

    <div style={{ padding: "20px 22px 0" }}>
      <div className="eb-eyebrow">Day 01 · {a.kind}</div>
      <h1 className="eb-h1" style={{ fontSize: 40, lineHeight: 0.95, marginTop: 8, letterSpacing: "-0.025em" }}>
        {a.title}<span className="kome" style={{ color: "var(--ink-3)" }}>.</span>
      </h1>
      <p className="ed-lede" style={{ marginTop: 10 }}>
        Reservation confirmed via Tablecheck. Counter seats facing the chef. <span className="kome">Cash only.</span>
      </p>
    </div>

    <div className="hairline" style={{ margin: "20px 22px 0" }}/>

    {/* Schedule + duration grid */}
    <div className="metrics-grid">
      <div>
        <div className="eb-eyebrow">Begins</div>
        <div className="metric-num">{a.time}</div>
      </div>
      <div className="metric-divider"/>
      <div>
        <div className="eb-eyebrow">Until</div>
        <div className="metric-num">{a.end}</div>
      </div>
      <div className="metric-divider"/>
      <div>
        <div className="eb-eyebrow">Duration</div>
        <div className="metric-num">{durMin(a)}<span style={{ fontFamily:"var(--mono)", fontSize: 11, color: "var(--ink-3)", marginLeft: 4 }}>min</span></div>
      </div>
    </div>

    <div className="hairline" style={{ margin: "0 22px" }}/>

    <div style={{ padding: "20px 22px" }}>
      <div className="eb-eyebrow">Going</div>
      <div style={{ display: "flex", marginTop: 10, alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex" }}>
          {[
            { i: "S", c: "var(--accent)" },
            { i: "R", c: "var(--moss)" },
            { i: "M", c: "var(--sand)" },
          ].map((p, i) => (
            <div key={i} className="going-badge" style={{ background: p.c, marginLeft: i ? -8 : 0 }}>{p.i}</div>
          ))}
        </div>
        <span className="ed-meta-text" style={{ fontSize: 13, color: "var(--ink-2)" }}>Santwrin, Ren, Mai</span>
      </div>
    </div>

    <div className="hairline" style={{ margin: "0 22px" }}/>

    <div style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div className="eb-eyebrow">Where</div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em", color: "var(--ink-3)", textTransform: "uppercase" }}>4-1-15 Ginza</span>
      </div>
      <div className="map" style={{ height: 160, borderRadius: 10, position: "relative", border: "1px solid var(--rule)" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)" }}>
          <div className="going-badge" style={{ background: "var(--accent)" }}>{a.kind[0]}</div>
        </div>
      </div>
    </div>

    <div style={{ padding: "0 22px 24px", display: "flex", gap: 8 }}>
      <button className="btn full">Edit</button>
      <button className="btn full accent">Open in maps</button>
    </div>
  </>
);

const BudgetScreen = ({ trip, onBack }) => {
  const pct = trip.budget.spent / trip.budget.total * 100;
  return (
    <>
      <div style={{ padding: "8px 22px 0", display: "flex", justifyContent: "space-between" }}>
        <button className="icon-btn" onClick={onBack}>{I.back}</button>
        <button className="icon-btn">{I.plus}</button>
      </div>
      <div style={{ padding: "20px 22px 0" }}>
        <div className="eb-eyebrow">Trip ledger · USD</div>
        <h1 className="eb-h1" style={{ fontSize: 44, marginTop: 8, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
          The budget<span className="kome" style={{ color: "var(--ink-3)" }}>.</span>
        </h1>
      </div>

      <div className="hairline" style={{ margin: "20px 22px 0" }}/>

      <div style={{ padding: "20px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div className="eb-eyebrow">Spent</div>
          <div className="eb-eyebrow">{Math.round(pct)}% used</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
          <span className="eb-num" style={{ fontSize: 56, lineHeight: 0.9, letterSpacing: "-0.025em" }}>${trip.budget.spent.toLocaleString()}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-3)" }}>/ ${trip.budget.total.toLocaleString()}</span>
        </div>
        <div className="bar" style={{ marginTop: 12, height: 6, background: "var(--rule)" }}>
          <div style={{ width: `${pct}%`, background: "var(--accent)" }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em", color: "var(--ink-3)" }}>
          <span>${trip.budget.spent}</span>
          <span>${trip.budget.total - trip.budget.spent} left</span>
        </div>
      </div>

      <div className="hairline" style={{ margin: "20px 22px 0" }}/>

      <div style={{ padding: "20px 22px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 className="ed-section-title">By category</h2>
        <span className="eb-eyebrow">{trip.budget_categories.length} buckets</span>
      </div>

      <div style={{ padding: "0 22px 24px" }}>
        {trip.budget_categories.map((c, i) => {
          const cp = c.spent / c.total * 100;
          return (
            <div key={i} className="cat-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 className="ed-title" style={{ fontSize: 18, margin: 0 }}>{c.name}</h3>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)", letterSpacing: ".02em", fontVariantNumeric: "tabular-nums" }}>
                  ${c.spent}<span style={{ color: "var(--ink-3)" }}> / ${c.total}</span>
                </div>
              </div>
              <div className="bar" style={{ marginTop: 10, height: 4, background: "var(--rule)" }}>
                <div style={{ width: `${cp}%`, background: c.color }}/>
              </div>
              <div className="hairline" style={{ marginTop: 16 }}/>
            </div>
          );
        })}
      </div>
    </>
  );
};

const PackingScreen = ({ trip, onBack, packState, togglePack }) => {
  const total = trip.packing.reduce((n, c) => n + c.items.length, 0);
  const done = trip.packing.reduce((n, c, ci) => n + c.items.filter((_, ii) => packState[`${ci}-${ii}`]).length, 0);
  const pct = (done/total) * 100;
  return (
    <>
      <div style={{ padding: "8px 22px 0", display: "flex", justifyContent: "space-between" }}>
        <button className="icon-btn" onClick={onBack}>{I.back}</button>
        <button className="icon-btn">{I.plus}</button>
      </div>
      <div style={{ padding: "20px 22px 0" }}>
        <div className="eb-eyebrow">{done} of {total} packed</div>
        <h1 className="eb-h1" style={{ fontSize: 44, marginTop: 8, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
          The bag<span className="kome" style={{ color: "var(--ink-3)" }}>.</span>
        </h1>
        <div className="bar" style={{ marginTop: 14, height: 4, background: "var(--rule)" }}>
          <div style={{ width: `${pct}%`, background: "var(--ink)" }}/>
        </div>
      </div>

      <div style={{ padding: "20px 22px 24px" }}>
        {trip.packing.map((cat, ci) => {
          const catDone = cat.items.filter((_, ii) => packState[`${ci}-${ii}`]).length;
          return (
            <div key={ci}>
              <div className="hairline" style={{ marginBottom: 14 }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 className="ed-section-title" style={{ fontSize: 22 }}>{cat.cat}</h2>
                <span className="eb-eyebrow">{catDone} / {cat.items.length}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {cat.items.map((it, ii) => {
                  const on = packState[`${ci}-${ii}`];
                  return (
                    <div key={ii} className={"pack-row" + (on ? " on" : "")} onClick={() => togglePack(ci, ii)}>
                      <div className={"checkbox" + (on ? " on" : "")}>{on && I.check}</div>
                      <div className="name" style={{ flex: 1 }}>{it.name}</div>
                    </div>
                  );
                })}
                <div className="pack-row" style={{ color: "var(--ink-3)" }}>
                  <div className="checkbox" style={{ borderStyle: "dashed" }}>{I.plus}</div>
                  <div className="name">Add item</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

window.TripsHome = TripsHome;
window.AddActivitySheet = AddActivitySheet;
window.ActivityDetail = ActivityDetail;
window.BudgetScreen = BudgetScreen;
window.PackingScreen = PackingScreen;
