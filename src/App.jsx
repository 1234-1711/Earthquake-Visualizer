import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [magnitudeFilter, setMagnitudeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("day");
  const [showLargeDataWarning, setShowLargeDataWarning] = useState(false);

  useEffect(() => {
    // Show large dataset warning immediately if Past Month
    if (timeFilter === "month") {
      setShowLargeDataWarning(true);
      // Hide after 25 seconds
      const timer = setTimeout(() => setShowLargeDataWarning(false), 25000);
      return () => clearTimeout(timer);
    } else {
      setShowLargeDataWarning(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    // Fetch earthquake data based on selected time filter
    setLoading(true);
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${timeFilter}.geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const features = data.features.map((eq) => ({
          location: eq.properties.place,
          mag: eq.properties.mag,
          depth: eq.geometry.coordinates[2],
          lat: eq.geometry.coordinates[1],
          lng: eq.geometry.coordinates[0],
          time: new Date(eq.properties.time).toLocaleString(),
        }));
        setEarthquakes(features); // Update state with fetched data
        setLoading(false); // Remove loading spinner
      })
      .catch((err) => {
        console.error("Error fetching earthquake data:", err);
        setLoading(false);
      });
  }, [timeFilter]); // Only run when timeFilter changes

  // Determine marker color by magnitude
  const getColor = (mag) => {
    if (mag >= 6) return "red";
    if (mag >= 4) return "orange";
    return "green";
  };

  // Create a custom circular marker icon
  const createIcon = (mag) => {
    const size = mag * 5;
    return L.divIcon({
      html: `<div style="
        background-color:${getColor(mag)};
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        border:2px solid white;
        opacity:0.8;
      "></div>`,
      className: "",
    });
  };

  // Filter earthquakes by magnitude
  const filteredEarthquakes = earthquakes.filter((eq) => {
    if (magnitudeFilter === ">4") return eq.mag >= 4;
    return true;
  });

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "10px", textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
        🌍 Earthquake Visualizer
      </header>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "10px" }}>
        <select value={magnitudeFilter} onChange={(e) => setMagnitudeFilter(e.target.value)}>
          <option value="all">All Magnitudes</option>
          <option value=">4">Magnitude ≥ 4</option>
        </select>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="hour">Past Hour</option>
          <option value="day">Past Day</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
        </select>
      </div>

      {/* Warning for large dataset */}
      {showLargeDataWarning && (
        <div style={{
          textAlign: "center",
          padding: "5px",
          backgroundColor: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeeba",
          borderRadius: "5px",
          marginBottom: "5px"
        }}>
          ⚠️ Showing past month data may take a while...
        </div>
      )}

      {/* Map container */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Loading spinner */}
        {loading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            Loading...
          </div>
        )}

        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ScaleControl position="bottomleft" />

          {/* Earthquake markers */}
          {filteredEarthquakes.map((eq, i) => (
            <Marker
              key={i}
              position={[eq.lat, eq.lng]}
              icon={createIcon(eq.mag)}
            >
              <Popup>
                <b>{eq.location}</b> <br />
                Magnitude: {eq.mag} <br />
                Depth: {eq.depth} km <br />
                Time: {eq.time}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          fontSize: "14px"
        }}>
          <div>🟢 Green → Magnitude &lt; 4</div>
          <div>🟠 Orange → Magnitude 4–5.9</div>
          <div>🔴 Red → Magnitude ≥ 6</div>
        </div>
      </div>
    </div>
  );
}

export default App;
