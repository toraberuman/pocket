// Main app — wraps screens with state management. Each artboard is one Screen instance.

const initialPack = (() => {
  const s = {};
  window.TRIP_DATA.packing.forEach((c, ci) => c.items.forEach((it, ii) => s[`${ci}-${ii}`] = it.on));
  return s;
})();

function Screen({ initialView, initialDay = 0, timelineStyle, expanded: initExpanded }) {
  const [view, setView] = React.useState(initialView);
  const [dayIdx, setDayIdx] = React.useState(initialDay);
  const [expandedId, setExpandedId] = React.useState(initExpanded || null);
  const [overviewView, setOverviewView] = React.useState("map");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [tabActive, setTabActive] = React.useState("plan");
  const [packState, setPackState] = React.useState(initialPack);
  const [order, setOrder] = React.useState(() => window.TRIP_DATA.days.map(d => d.activities.map(a => a.id)));
  const [dragId, setDragId] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const trip = window.TRIP_DATA;
  // Apply order
  const orderedTrip = React.useMemo(() => ({
    ...trip,
    days: trip.days.map((d, i) => ({
      ...d,
      activities: order[i].map(id => d.activities.find(a => a.id === id)).filter(Boolean),
    })),
  }), [order]);

  const dispatch = (act) => {
    if (act.type === "toggleExpand") setExpandedId(expandedId === act.id ? null : act.id);
    if (act.type === "openSheet") setSheetOpen(true);
    if (act.type === "dragStart") setDragId(act.id);
    if (act.type === "dragOver") setDragOver(act.id);
    if (act.type === "drop") {
      if (dragId && dragId !== act.id) {
        const next = [...order];
        const arr = [...next[dayIdx]];
        const from = arr.indexOf(dragId);
        const to = arr.indexOf(act.id);
        arr.splice(from, 1);
        arr.splice(to, 0, dragId);
        next[dayIdx] = arr;
        setOrder(next);
      }
      setDragId(null); setDragOver(null);
    }
  };

  const togglePack = (ci, ii) => {
    const k = `${ci}-${ii}`;
    setPackState({ ...packState, [k]: !packState[k] });
  };

  const navTo = (tab) => {
    setTabActive(tab);
    if (tab === "plan") setView("timeline");
    if (tab === "map") setView("overview");
    if (tab === "today") setView("home");
    if (tab === "budget") setView("budget");
    if (tab === "bag") setView("packing");
  };

  // Detail view
  const allActs = trip.days.flatMap(d => d.activities);
  const detailAct = allActs[3]; // the omakase

  return (
    <div className={"screen serif-display"}>
      <StatusBar />
      <div className="scroll">
        {view === "home" && <TripsHome trip={orderedTrip} others={window.OTHER_TRIPS} onOpen={() => setView("overview")}/>}
        {view === "overview" && <TripOverview trip={orderedTrip} view={overviewView} onView={setOverviewView} onBack={() => setView("home")}/>}
        {view === "timeline" && (
          <>
            <TimelineHeader trip={orderedTrip} dayIdx={dayIdx} onBack={() => setView("overview")}/>
            <DayStrip days={orderedTrip.days} active={dayIdx} onChange={setDayIdx}/>
            {timelineStyle === "cards" && <TimelineCards trip={orderedTrip} expandedId={expandedId} dayIdx={dayIdx} dragId={dragId} dragOver={dragOver} dispatch={dispatch}/>}
            {timelineStyle === "dotted" && <TimelineDotted trip={orderedTrip} expandedId={expandedId} dayIdx={dayIdx} dispatch={dispatch}/>}
            {timelineStyle === "solid" && <TimelineDotted trip={orderedTrip} expandedId={expandedId} dayIdx={dayIdx} dispatch={dispatch} solid/>}
            {timelineStyle === "editorial" && <TimelineEditorial trip={orderedTrip} expandedId={expandedId} dayIdx={dayIdx} dispatch={dispatch}/>}
          </>
        )}
        {view === "detail" && <ActivityDetail a={detailAct} onBack={() => setView("timeline")}/>}
        {view === "budget" && <BudgetScreen trip={orderedTrip} onBack={() => setView("overview")}/>}
        {view === "packing" && <PackingScreen trip={orderedTrip} onBack={() => setView("overview")} packState={packState} togglePack={togglePack}/>}
        {view === "addsheet" && <TimelineCards trip={orderedTrip} expandedId={null} dayIdx={dayIdx} dragId={null} dragOver={null} dispatch={dispatch}/>}
      </div>
      {sheetOpen && <AddActivitySheet onClose={() => setSheetOpen(false)} onSave={() => setSheetOpen(false)}/>}
      <TabBar active={tabActive} onChange={navTo}/>

      {/* FAB */}
      {(view === "timeline") && (
        <button className="btn accent" style={{ position: "absolute", right: 18, bottom: 92, width: 52, height: 52, borderRadius: 999, padding: 0, boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}
                onClick={() => setSheetOpen(true)}>{I.plus}</button>
      )}
    </div>
  );
}

window.Screen = Screen;
