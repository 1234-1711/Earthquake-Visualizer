import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function App() {
  const [earthquakes, setEarthquakes] = useState([]);

  useEffect(() => {
    fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    )
      .then((res) => res.json())
      .then((data) => {
        const features = data.features.map((eq) => ({
          location: eq.properties.place,
          mag: eq.properties.mag,
          depth: eq.geometry.coordinates[2],
          lat: eq.geometry.coordinates[1],
          lng: eq.geometry.coordinates[0],
          time: new Date(eq.properties.time).toLocaleString(), // ✅ convert timestamp
        }));
        setEarthquakes(features);
      })
      .catch((err) => console.error("Error fetching earthquake data:", err));
  }, []);

  // Function to get marker color based on magnitude
  const getColor = (mag) => {
    if (mag >= 6) return "red";
    if (mag >= 4) return "orange";
    return "green";
  };

  // Function to create custom icon
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

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      {/* ✅ Header */}
      <header style={{ padding: "10px", textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
        🌍 Earthquake Visualizer
      </header>

      {/* ✅ Map */}
      <div style={{ flex: 1 }}>
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

          {/* ✅ Scale bar */}
          <ScaleControl position="bottomleft" />

          {/* ✅ Earthquake markers */}
          {earthquakes.map((eq, i) => (
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
      </div>
    </div>
  );
}

export default App;
