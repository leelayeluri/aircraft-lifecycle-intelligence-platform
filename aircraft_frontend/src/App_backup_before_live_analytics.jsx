import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import "./App.css";

function App() {
  const [query, setQuery] = useState("Lewis");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);

  const searchAircraft = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setSelectedAircraft(null);

    try {
      const response = await fetch(
        `/api/search/?q=${encodeURIComponent(query.trim())}`
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openAircraftProfile = async (nNumber) => {
    try {
      const response = await fetch(`/api/aircraft/${nNumber}/`);

      if (response.ok) {
        const aircraft = await response.json();
        setSelectedAircraft(aircraft);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Profile error:", error);
    }
  };

  const statusData = [
    { name: "Active", value: 78 },
    { name: "Maintenance", value: 16 },
    { name: "Inactive", value: 6 },
  ];

  const serviceData = [
    { name: "Minor", value: 18 },
    { name: "Major", value: 7 },
    { name: "Inspection", value: 12 },
  ];

  const performanceData = [
    { name: "Flights", value: 1247 },
    { name: "Hours", value: 8734 },
    { name: "Distance", value: 1800 },
    { name: "Services", value: 37 },
  ];

  const monthlyUsageData = [
    { month: "Jan", hours: 620 },
    { month: "Feb", hours: 710 },
    { month: "Mar", hours: 680 },
    { month: "Apr", hours: 760 },
    { month: "May", hours: 820 },
    { month: "Jun", hours: 790 },
  ];

  const chartColors = ["#38bdf8", "#22c55e", "#f97316", "#a855f7"];

  if (selectedAircraft) {
    return (
      <main className="app">
        <BackgroundEffects />

        <nav className="navbar">
          <div className="logo">
            Coral <span>Comp</span>
          </div>

          <button className="backButton" onClick={() => setSelectedAircraft(null)}>
            ← Back to Search
          </button>
        </nav>

        <section className="profileHero">
          <div>
            <p className="eyebrow">Aircraft Registry Profile</p>
            <h1>{selectedAircraft.n_number}</h1>
            <p>
              Complete aircraft intelligence profile generated from FAA registry
              records and future lifecycle datasets.
            </p>
          </div>

          <div className="statusCard">
            <span>Aircraft Status</span>
            <strong>Active Registry Record</strong>
          </div>
        </section>

        <section className="profileGrid">
          <article className="profileCard wide">
            <h2>Aircraft Identity</h2>

            <div className="detailGrid">
              <div>
                <span>Tail Number</span>
                <strong>{selectedAircraft.n_number || "Not available"}</strong>
              </div>

              <div>
                <span>Manufacturer</span>
                <strong>
                  {selectedAircraft.aircraft_manufacturer || "Not available"}
                </strong>
              </div>

              <div>
                <span>Aircraft Model</span>
                <strong>{selectedAircraft.aircraft_model || "Not available"}</strong>
              </div>

              <div>
                <span>Registry Source</span>
                <strong>FAA Aircraft Registry</strong>
              </div>
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
              <div>
                <span>Engine</span>
                <strong>Pending Dataset</strong>
              </div>

              <div>
                <span>Seats</span>
                <strong>Pending Dataset</strong>
              </div>

              <div>
                <span>Year</span>
                <strong>Pending Dataset</strong>
              </div>
            </div>
          </article>

          <article className="profileCard wide">
            <h2>Flight Analytics Dashboard</h2>

            <div className="detailGrid">
              <div>
                <span>Total Flights</span>
                <strong>1,247</strong>
              </div>

              <div>
                <span>Total Distance</span>
                <strong>1.8M Miles</strong>
              </div>

              <div>
                <span>Total Flight Hours</span>
                <strong>8,734 Hrs</strong>
              </div>

              <div>
                <span>Maintenance Events</span>
                <strong>37</strong>
              </div>
            </div>
          </article>

          <article className="profileCard">
            <h2>Aircraft Status</h2>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="profileCard">
            <h2>Service Type Split</h2>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={serviceData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {serviceData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="profileCard wide">
            <h2>Flight Performance Overview</h2>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="profileCard wide">
            <h2>Monthly Flight Hours Trend</h2>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="profileCard wide">
            <h2>AI Lifecycle Summary</h2>
            <p>
              This aircraft record identifies tail number{" "}
              <strong>{selectedAircraft.n_number}</strong>, associated with{" "}
              <strong>
                {selectedAircraft.owner_name || "an available registry owner"}
              </strong>
              . The aircraft is listed as a{" "}
              <strong>
                {selectedAircraft.aircraft_manufacturer ||
                  "manufacturer unavailable"}
              </strong>{" "}
              <strong>
                {selectedAircraft.aircraft_model || "model unavailable"}
              </strong>
              . As more datasets are added, this section will generate lifecycle
              intelligence including maintenance risk, usage history, remaining
              aircraft life, ownership changes, and predicted service requirements.
            </p>
          </article>

          <article className="profileCard wide">
            <h2>Maintenance Timeline</h2>

            <div className="timeline">
              <div>
                <span></span>
                <p>FAA registry record connected</p>
              </div>

              <div>
                <span></span>
                <p>Engine and configuration dataset pending</p>
              </div>

              <div>
                <span></span>
                <p>Maintenance and lifecycle datasets pending</p>
              </div>

              <div>
                <span></span>
                <p>AI/ML prediction layer planned</p>
              </div>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <BackgroundEffects />

      <nav className="navbar">
        <div className="logo">
          Coral <span>Comp</span>
        </div>

        <div className="navBadge">Aircraft Intelligence MVP</div>
      </nav>

      <section className="hero">
        <div className="liveBadge">
          <span></span> Live Aviation Intelligence Interface
        </div>

        <h1>
          Unified <span>Aircraft Search</span> Intelligence Platform
        </h1>

        <p>
          Search FAA aircraft registry records using tail number, owner name,
          manufacturer, or aircraft model through one clean interface.
        </p>

        <div className="searchPanel">
          <div className="searchRow">
            <input
              value={query}
              placeholder="Search by tail number, owner, manufacturer, model..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchAircraft();
              }}
            />

            <button onClick={searchAircraft}>
              {loading ? "Searching..." : "Search Aircraft"}
            </button>
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
          <article>
            <h3>FAA</h3>
            <p>Public aircraft registry source</p>
          </article>

          <article>
            <h3>SQL</h3>
            <p>PostgreSQL-backed storage layer</p>
          </article>

          <article>
            <h3>API</h3>
            <p>Django REST Framework backend</p>
          </article>

          <article>
            <h3>AI Search</h3>
            <p>Lifecycle intelligence model ready</p>
          </article>
        </section>
      )}

      {searched && (
        <section className="resultsSection">
          <h2>
            Results for <span>"{query}"</span>
          </h2>

          {loading && <p className="statusText">Searching aircraft database...</p>}

          {!loading && results.length === 0 && (
            <p className="statusText">No aircraft records found.</p>
          )}

          <div className="resultsGrid">
            {results.map((aircraft, index) => (
              <article className="aircraftCard" key={index}>
                <div className="cardTop">
                  <h3>{aircraft.n_number || "Unknown"}</h3>
                  <span>✈</span>
                </div>

                <div className="infoBlock">
                  <label>Owner</label>
                  <p>{aircraft.owner_name || "Not available"}</p>
                </div>

                <div className="infoBlock">
                  <label>Manufacturer</label>
                  <p>{aircraft.aircraft_manufacturer || "Not available"}</p>
                </div>

                <div className="infoBlock">
                  <label>Aircraft Model</label>
                  <p>{aircraft.aircraft_model || "Not available"}</p>
                </div>

                <button
                  className="detailsButton"
                  onClick={() => openAircraftProfile(aircraft.n_number)}
                >
                  View Aircraft Profile
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