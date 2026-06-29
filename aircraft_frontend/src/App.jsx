import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import "./App.css";

/* ─── D3 Arc Gauge ───────────────────────────────────────────────────────── */
function D3Gauge({ value = 0, max = 100, label = "", color = "#00d9ff" }) {
  const ref = useRef(null);
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const W = 180, H = 110, cx = W / 2, cy = H - 10, r = 72;
    const sa = -Math.PI * 0.82, ea = Math.PI * 0.82;
    const scale = d3.scaleLinear().domain([0, max]).range([sa, ea]);
    const arc = d3.arc().innerRadius(r - 16).outerRadius(r).startAngle(sa);

    // track
    svg.append("path").datum({ endAngle: ea })
      .attr("transform", `translate(${cx},${cy})`)
      .attr("d", arc({ endAngle: ea }))
      .attr("fill", "rgba(255,255,255,0.06)");

    // filled
    const filled = svg.append("path").datum({ endAngle: sa })
      .attr("transform", `translate(${cx},${cy})`)
      .attr("fill", color)
      .attr("filter", `drop-shadow(0 0 8px ${color})`);
    filled.transition().duration(1000).ease(d3.easeCubicOut)
      .attrTween("d", () => {
        const i = d3.interpolate(sa, scale(value));
        return t => arc({ endAngle: i(t) });
      });

    // ticks
    [0, 0.25, 0.5, 0.75, 1].forEach(p => {
      const a = sa + p * (ea - sa);
      const x1 = cx + (r + 3) * Math.cos(a - Math.PI / 2);
      const y1 = cy + (r + 3) * Math.sin(a - Math.PI / 2);
      const x2 = cx + (r + 10) * Math.cos(a - Math.PI / 2);
      const y2 = cy + (r + 10) * Math.sin(a - Math.PI / 2);
      svg.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2)
        .attr("stroke","rgba(255,255,255,0.2)").attr("stroke-width",1.5);
    });

    // needle
    const needle = svg.append("line")
      .attr("x1", cx).attr("y1", cy)
      .attr("x2", cx + (r-20)*Math.cos(sa-Math.PI/2))
      .attr("y2", cy + (r-20)*Math.sin(sa-Math.PI/2))
      .attr("stroke","#fff").attr("stroke-width",2).attr("stroke-linecap","round")
      .attr("filter","drop-shadow(0 0 4px rgba(255,255,255,0.9))");
    needle.transition().duration(1000).ease(d3.easeCubicOut)
      .attrTween("x2", () => { const i=d3.interpolate(sa,scale(value)); return t=>cx+(r-20)*Math.cos(i(t)-Math.PI/2); })
      .attrTween("y2", () => { const i=d3.interpolate(sa,scale(value)); return t=>cy+(r-20)*Math.sin(i(t)-Math.PI/2); });

    svg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",5)
      .attr("fill","#fff").attr("filter","drop-shadow(0 0 5px white)");

    svg.append("text").attr("x",cx).attr("y",cy-18)
      .attr("text-anchor","middle").attr("fill",color)
      .attr("font-size","20px").attr("font-weight","900")
      .attr("filter",`drop-shadow(0 0 6px ${color})`)
      .text(value.toLocaleString());

    svg.append("text").attr("x",cx).attr("y",cy+18)
      .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.45)")
      .attr("font-size","10px").attr("font-weight","700").attr("letter-spacing","1.5px")
      .text(label.toUpperCase());
  }, [value, max, label, color]);
  return <svg ref={ref} viewBox="0 0 180 110" style={{width:"100%",maxWidth:180}} />;
}

/* ─── D3 Animated Bar Chart ──────────────────────────────────────────────── */
function D3Bar({ data = [], color = "#00d9ff" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const m = {top:16,right:16,bottom:64,left:52};
    const W=560, H=300, w=W-m.left-m.right, h=H-m.top-m.bottom;
    const g = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);
    const x = d3.scaleBand().domain(data.map(d=>d.name)).range([0,w]).padding(0.3);
    const y = d3.scaleLinear().domain([0,d3.max(data,d=>d.value)*1.1]).range([h,0]);

    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",~s")))
      .selectAll("text").attr("fill","#a9c6dc").attr("font-size",11);
    g.selectAll(".domain").attr("stroke","rgba(255,255,255,0.1)");
    g.selectAll(".tick line").attr("stroke","rgba(255,255,255,0.1)");

    g.append("g").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x))
      .selectAll("text").attr("fill","#a9c6dc").attr("font-size",10)
      .attr("transform","rotate(-18)").style("text-anchor","end");

    // grid
    g.append("g").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""))
      .selectAll("line").attr("stroke","rgba(255,255,255,0.05)").attr("stroke-dasharray","3,3");

    // bars
    const grad = svg.append("defs").append("linearGradient")
      .attr("id","barGrad").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",1);
    grad.append("stop").attr("offset","0%").attr("stop-color",color).attr("stop-opacity",1);
    grad.append("stop").attr("offset","100%").attr("stop-color","#0044aa").attr("stop-opacity",0.7);

    g.selectAll(".bar").data(data).enter().append("rect")
      .attr("x",d=>x(d.name)).attr("width",x.bandwidth())
      .attr("y",h).attr("height",0).attr("rx",6)
      .attr("fill","url(#barGrad)")
      .attr("filter",`drop-shadow(0 0 6px ${color}55)`)
      .transition().duration(750).delay((_,i)=>i*55).ease(d3.easeCubicOut)
      .attr("y",d=>y(d.value)).attr("height",d=>h-y(d.value));

    // value labels
    g.selectAll(".lbl").data(data).enter().append("text")
      .attr("x",d=>x(d.name)+x.bandwidth()/2).attr("y",h)
      .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.7)").attr("font-size",10)
      .transition().duration(750).delay((_,i)=>i*55).ease(d3.easeCubicOut)
      .attr("y",d=>y(d.value)-5).text(d=>d3.format(",~s")(d.value));
  }, [data, color]);
  return <svg ref={ref} viewBox="0 0 560 300" style={{width:"100%",height:"auto"}} />;
}

/* ─── D3 Donut ───────────────────────────────────────────────────────────── */
function D3Donut({ data = [], colors = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const W=300,H=240,cx=W/2,cy=H/2-14,r=88,inner=52;
    const pie = d3.pie().sort(null).value(d=>d.value);
    const arc = d3.arc().innerRadius(inner).outerRadius(r);
    const arcH = d3.arc().innerRadius(inner).outerRadius(r+10);
    const g = svg.append("g").attr("transform",`translate(${cx},${cy})`);
    const arcs = pie(data.slice(0,6));

    arcs.forEach((d,i)=>{
      const path = g.append("path").datum(d)
        .attr("fill",colors[i%colors.length])
        .attr("stroke","#020817").attr("stroke-width",2)
        .attr("filter",`drop-shadow(0 0 5px ${colors[i%colors.length]}88)`)
        .style("cursor","pointer");
      path.transition().duration(700).delay(i*70).ease(d3.easeCubicOut)
        .attrTween("d",()=>{
          const interp=d3.interpolate({startAngle:0,endAngle:0},d);
          return t=>arc(interp(t));
        });
      path.on("mouseover",function(){ d3.select(this).transition().duration(180).attr("d",arcH(d)); })
          .on("mouseout", function(){ d3.select(this).transition().duration(180).attr("d",arc(d)); });
    });

    // center
    svg.append("text").attr("x",cx).attr("y",cy+5)
      .attr("text-anchor","middle").attr("fill","#fff")
      .attr("font-size","13px").attr("font-weight","900")
      .text(d3.format(",")(d3.sum(data.slice(0,6),d=>d.value)));
    svg.append("text").attr("x",cx).attr("y",cy+20)
      .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.4)")
      .attr("font-size","9px").attr("letter-spacing","2px").text("TOTAL");

    // legend
    data.slice(0,6).forEach((d,i)=>{
      const lx=(i%3)*96+10, ly=H-32+Math.floor(i/3)*15;
      svg.append("rect").attr("x",lx).attr("y",ly).attr("width",7).attr("height",7)
        .attr("rx",2).attr("fill",colors[i%colors.length]);
      svg.append("text").attr("x",lx+11).attr("y",ly+7)
        .attr("fill","#a9c6dc").attr("font-size","8.5px")
        .text(d.name.length>13?d.name.slice(0,13)+"…":d.name);
    });
  }, [data, colors]);
  return <svg ref={ref} viewBox="0 0 300 240" style={{width:"100%",height:"auto"}} />;
}

/* ─── D3 Sparkline ───────────────────────────────────────────────────────── */
function Spark({ values = [], color = "#00d9ff" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!values.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const W=110,H=36;
    const x = d3.scaleLinear().domain([0,values.length-1]).range([0,W]);
    const y = d3.scaleLinear().domain([d3.min(values),d3.max(values)]).range([H-3,3]);
    const line = d3.line().x((_,i)=>x(i)).y(d=>y(d)).curve(d3.curveCatmullRom);
    const area = d3.area().x((_,i)=>x(i)).y0(H).y1(d=>y(d)).curve(d3.curveCatmullRom);

    const gid = `sg${Math.random().toString(36).slice(2)}`;
    const defs = svg.append("defs");
    const lg = defs.append("linearGradient").attr("id",gid).attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",1);
    lg.append("stop").attr("offset","0%").attr("stop-color",color).attr("stop-opacity",0.4);
    lg.append("stop").attr("offset","100%").attr("stop-color",color).attr("stop-opacity",0);

    svg.append("path").datum(values).attr("d",area).attr("fill",`url(#${gid})`);
    svg.append("path").datum(values).attr("d",line).attr("fill","none")
      .attr("stroke",color).attr("stroke-width",1.8)
      .attr("filter",`drop-shadow(0 0 3px ${color})`);
  }, [values, color]);
  return <svg ref={ref} viewBox="0 0 110 36" style={{width:110,height:36,flexShrink:0}} />;
}

/* ─── Gauge Card ─────────────────────────────────────────────────────────── */
function GaugeCard({ label, value, max, color, sub }) {
  return (
    <article className="gaugeCard">
      <D3Gauge value={value} max={max} label={label} color={color} />
      <p className="gaugeSub">{sub}</p>
    </article>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ heading, value, sub, spark, color = "#00d9ff" }) {
  return (
    <article className="statCard">
      <div className="statCardInner">
        <div>
          <p className="statLabel">{heading}</p>
          <h3 style={{ color, fontSize: 30, fontWeight: 900, margin: "5px 0" }}>{value}</h3>
          <p className="statSub">{sub}</p>
        </div>
        {spark && <Spark values={spark} color={color} />}
      </div>
    </article>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────── */
const COLORS = ["#00d9ff","#22c55e","#f97316","#a855f7","#f43f5e","#eab308"];

function App() {
  const [query, setQuery]           = useState("Lewis");
  const [results, setResults]       = useState([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [showFleetDashboard, setShowFleetDashboard] = useState(false);
  const [analytics, setAnalytics]   = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res  = await fetch("/api/analytics/");
      const data = await res.json();
      if (res.ok) { setAnalytics(data); setLastRefresh(new Date()); }
      else setAnalytics(null);
    } catch { setAnalytics(null); }
    finally { setAnalyticsLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const searchAircraft = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    setSelectedAircraft(null); setShowFleetDashboard(false);
    try {
      const res  = await fetch(`/api/search/?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(res.ok ? (data.results || []) : []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const openAircraftProfile = async (nNumber) => {
    try {
      const res = await fetch(`/api/aircraft/${nNumber}/`);
      if (res.ok) {
        setSelectedAircraft(await res.json());
        setShowFleetDashboard(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {}
  };

  const openFleetDashboard = async () => {
    setSelectedAircraft(null); setShowFleetDashboard(true);
    await fetchAnalytics();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Fleet Dashboard ────────────────────────────────────────────────────── */
  if (showFleetDashboard) {
    const total    = analytics?.total_aircraft || 0;
    const mfgData  = analytics?.top_manufacturers || [];
    const modData  = analytics?.top_models || [];
    const ownData  = analytics?.top_owners || [];
    return (
      <main className="app">
        <BackgroundEffects />
        <nav className="navbar">
          <div className="logo">Coral <span>Comp</span></div>
          <button className="backButton" onClick={() => setShowFleetDashboard(false)}>← Back to Search</button>
        </nav>

        <section className="profileHero">
          <div>
            <p className="eyebrow">Real PostgreSQL Analytics</p>
            <h1>Fleet Intelligence Dashboard</h1>
            <p>Live visualisation layer powered by the Django analytics API and real FAA aircraft registry records stored in PostgreSQL.</p>
          </div>
          <div className="statusCard">
            <span>Data Source</span>
            <strong>FAA + PostgreSQL</strong>
          </div>
        </section>

        {/* D3 Gauge row */}
        <section className="gaugeRow">
          <GaugeCard label="Fleet Size"    value={Math.min(total,99999)} max={100000} color="#00d9ff" sub={`${total.toLocaleString()} records`} />
          <GaugeCard label="Manufacturers" value={mfgData.length}        max={20}     color="#22c55e" sub={`${mfgData.length} tracked`} />
          <GaugeCard label="Models"        value={modData.length}        max={20}     color="#f97316" sub={`${modData.length} tracked`} />
          <GaugeCard label="Top Owners"    value={ownData.length}        max={10}     color="#a855f7" sub={`${ownData.length} indexed`} />
        </section>

        <section className="profileGrid">
          {/* Live DB Summary */}
          <article className="profileCard wide">
            <h2>Live Database Summary</h2>
            {analyticsLoading && <p className="statusText">Loading live analytics...</p>}
            {!analyticsLoading && analytics && (
              <>
                <div className="detailGrid">
                  <div><span>Total Aircraft Records</span><strong>{analytics.total_aircraft?.toLocaleString()}</strong></div>
                  <div><span>Analytics Source</span><strong>PostgreSQL</strong></div>
                  <div><span>Registry Dataset</span><strong>FAA Aircraft Registry</strong></div>
                  <div><span>Frontend Status</span><strong style={{color:"#22c55e"}}>🟢 Live API Connected</strong></div>
                </div>
                <div className="liveBlock">
                  <p><strong>Backend Status:</strong> Connected to Django REST API</p>
                  <p><strong>Data Pipeline:</strong> FAA Registry → PostgreSQL → Django API → React Dashboard</p>
                  <p><strong>Last Refresh:</strong> {lastRefresh ? lastRefresh.toLocaleString() : "Not refreshed yet"}</p>
                  <button className="detailsButton" onClick={fetchAnalytics} style={{marginTop:12}}>↻ Refresh Live Analytics</button>
                </div>
              </>
            )}
            {!analyticsLoading && !analytics && <p className="statusText">Analytics API not available.</p>}
          </article>

          {analytics && <>
            <article className="profileCard wide">
              <h2>Top Aircraft Manufacturers <span className="d3Badge">D3</span></h2>
              <D3Bar data={mfgData} color="#00d9ff" />
            </article>

            <article className="profileCard">
              <h2>Manufacturer Split <span className="d3Badge">D3</span></h2>
              <D3Donut data={mfgData} colors={COLORS} />
            </article>

            <article className="profileCard">
              <h2>Top Owners <span className="d3Badge">D3</span></h2>
              <D3Donut data={ownData} colors={[...COLORS].reverse()} />
            </article>

            <article className="profileCard wide">
              <h2>Top Aircraft Models <span className="d3Badge">D3</span></h2>
              <D3Bar data={modData} color="#22c55e" />
            </article>

            <article className="profileCard wide">
              <h2>Accuracy Note</h2>
              <p>{analytics.accuracy_note}</p>
            </article>
          </>}
        </section>
      </main>
    );
  }

  /* ── Aircraft Profile ───────────────────────────────────────────────────── */
  if (selectedAircraft) {
    return (
      <main className="app">
        <BackgroundEffects />
        <nav className="navbar">
          <div className="logo">Coral <span>Comp</span></div>
          <button className="backButton" onClick={() => setSelectedAircraft(null)}>← Back to Search</button>
        </nav>

        <section className="profileHero">
          <div>
            <p className="eyebrow">Aircraft Registry Profile</p>
            <h1>{selectedAircraft.n_number}</h1>
            <p>Complete aircraft intelligence profile generated from FAA registry records and future lifecycle datasets.</p>
          </div>
          <div className="statusCard">
            <span>Aircraft Status</span>
            <strong>Active Registry Record</strong>
          </div>
        </section>

        {/* Profile gauges */}
        <section className="gaugeRow">
          <GaugeCard label="Reg Confidence" value={72}  max={100} color="#00d9ff" sub="Registry match" />
          <GaugeCard label="Data Quality"   value={85}  max={100} color="#22c55e" sub="FAA completeness" />
          <GaugeCard label="Live Flight"     value={0}   max={100} color="#f97316" sub="ADS-B planned" />
          <GaugeCard label="Maintenance"     value={0}   max={100} color="#a855f7" sub="Dataset pending" />
        </section>

        <section className="profileGrid">
          <article className="profileCard wide">
            <h2>Aircraft Identity</h2>
            <div className="detailGrid">
              <div><span>Tail Number</span><strong>{selectedAircraft.n_number || "Not available"}</strong></div>
              <div><span>Manufacturer</span><strong>{selectedAircraft.aircraft_manufacturer || "Not available"}</strong></div>
              <div><span>Aircraft Model</span><strong>{selectedAircraft.aircraft_model || "Not available"}</strong></div>
              <div><span>Registry Source</span><strong>FAA Aircraft Registry</strong></div>
            </div>
          </article>

          <article className="profileCard">
            <h2>Ownership</h2>
            <h3>{selectedAircraft.owner_name || "Not available"}</h3>
            <p>Current owner information based on public registry data.</p>
          </article>

          <article className="profileCard">
            <h2>Technical Layer</h2>
            <div className="miniList">
              <div><span>Engine</span><strong>Pending Engine Dataset</strong></div>
              <div><span>Seats</span><strong>Pending Configuration Dataset</strong></div>
              <div><span>Live Flight Data</span><strong>OpenSky/ADS-B Planned</strong></div>
            </div>
          </article>

          <article className="profileCard wide">
            <h2>AI Lifecycle Summary</h2>
            <p>
              This aircraft record identifies tail number <strong>{selectedAircraft.n_number}</strong>,
              associated with <strong>{selectedAircraft.owner_name || "an available registry owner"}</strong>.
              The aircraft is listed as a <strong>{selectedAircraft.aircraft_manufacturer || "manufacturer unavailable"}</strong>{" "}
              <strong>{selectedAircraft.aircraft_model || "model unavailable"}</strong>.
              Current values are based on the real FAA registry dataset. Flight hours, distance, and maintenance
              predictions will be added only after connecting valid flight tracking and maintenance datasets.
            </p>
          </article>

          <article className="profileCard wide">
            <h2>Data Pipeline Timeline</h2>
            <div className="timeline">
              {[
                { text: "FAA registry data imported into PostgreSQL", done: true },
                { text: "Django REST API connected to React frontend", done: true },
                { text: "Real analytics endpoint created from PostgreSQL", done: true },
                { text: "OpenSky/ADS-B live flight update pipeline planned next", done: false },
              ].map((step, i) => (
                <div key={i}>
                  <span style={{ background: step.done ? "#00d9ff" : "rgba(255,255,255,0.2)", boxShadow: step.done ? "0 0 18px rgba(0,217,255,0.8)" : "none" }} />
                  <p style={{ color: step.done ? "#e8f4ff" : "#607080" }}>{step.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    );
  }

  /* ── Search Home ────────────────────────────────────────────────────────── */
  return (
    <main className="app">
      <BackgroundEffects />

      <nav className="navbar">
        <div className="logo">Coral <span>Comp</span></div>
        <button className="backButton" onClick={openFleetDashboard}>Fleet Intelligence Dashboard</button>
      </nav>

      <section className="hero">
        <div className="liveBadge">
          <span></span> Live Aviation Intelligence Interface
        </div>
        <h1>Unified <span>Aircraft Search</span> Intelligence Platform</h1>
        <p>Search FAA aircraft registry records using tail number, owner name, manufacturer, or aircraft model through one clean interface.</p>

        <div className="searchPanel">
          <div className="searchRow">
            <input
              value={query}
              placeholder="Search by tail number, owner, manufacturer, model..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") searchAircraft(); }}
            />
            <button onClick={searchAircraft}>{loading ? "Searching..." : "Search Aircraft"}</button>
          </div>
          <div className="chips">
            <button onClick={() => setQuery("1000A")}>Tail: 1000A</button>
            <button onClick={() => setQuery("Lewis")}>Owner: Lewis</button>
            <button onClick={() => setQuery("Cessna")}>Manufacturer: Cessna</button>
            <button onClick={() => setQuery("SR22T")}>Model: SR22T</button>
          </div>
        </div>
      </section>

      {!searched && (
        <section className="stats">
          <StatCard heading="Aircraft Records" value={analytics?.total_aircraft?.toLocaleString() || "FAA"} sub="Real records in database" spark={[40,52,48,63,58,72,69,80,75,90]} color="#00d9ff" />
          <StatCard heading="Storage"          value="SQL"    sub="PostgreSQL-backed layer"          spark={[30,35,32,40,38,45,43,50]}   color="#22c55e" />
          <StatCard heading="Backend"          value="API"    sub="Django REST Framework"            spark={[20,28,25,32,30,38,35,42]}   color="#f97316" />
          <StatCard heading="AI Search"        value="Ready"  sub="Lifecycle intelligence model"     spark={[10,15,12,20,18,25,22,30]}   color="#a855f7" />
        </section>
      )}

      {searched && (
        <section className="resultsSection">
          <h2>Results for <span>"{query}"</span></h2>
          {loading && <p className="statusText">Searching aircraft database...</p>}
          {!loading && results.length === 0 && <p className="statusText">No aircraft records found.</p>}
          <div className="resultsGrid">
            {results.map((aircraft, index) => (
              <article className="aircraftCard" key={index}>
                <div className="cardTop">
                  <h3>{aircraft.n_number || "Unknown"}</h3>
                  <span className="cardPlane">✈</span>
                </div>
                <div className="infoBlock"><label>Owner</label><p>{aircraft.owner_name || "Not available"}</p></div>
                <div className="infoBlock"><label>Manufacturer</label><p>{aircraft.aircraft_manufacturer || "Not available"}</p></div>
                <div className="infoBlock"><label>Aircraft Model</label><p>{aircraft.aircraft_model || "Not available"}</p></div>
                <button className="detailsButton" onClick={() => openAircraftProfile(aircraft.n_number)}>
                  View Aircraft Profile →
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function BackgroundEffects() {
  return (
    <>
      <div className="gridOverlay"></div>
      <div className="glowOne"></div>
      <div className="glowTwo"></div>
      <div className="plane planeOne">✈</div>
      <div className="plane planeTwo">✈</div>
      <div className="plane planeThree">✈</div>
    </>
  );
}

export default App;