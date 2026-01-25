import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            center: [-106.4850, 31.7619], // El Paso
            zoom: 11,
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.on("load", async () => {
            fetch("/data/zoning.geojson")
                .then(res => res.json())
                .then(data => {
                    const commercial = data.features.filter(
                        f => f.properties.ZONE_?.startsWith("C")
                    );

                    const areas = commercial
                        .map(f => f.properties.Shape_Area)
                        .sort((a, b) => a - b);

                    console.log("Commercial zone count:", areas.length);
                    console.log("Min area:", areas[0]);
                    console.log("Median area:", areas[Math.floor(areas.length / 2)]);
                    console.log("90th percentile:", areas[Math.floor(areas.length * 0.9)]);
                    console.log("Max area:", areas[areas.length - 1]);
                });
            // Add zoning source
            map.addSource("zoning", {
                type: "geojson",
                data: "/data/zoning.geojson",
            });
            map.addLayer({
                id: "zoning-medium-commercial",
                type: "fill",
                source: "zoning",
                paint: {
                    "fill-color": "#F9A825",
                    "fill-opacity": 0.55
                },
                filter: [
                    "all",
                    ["==", ["slice", ["get", "ZONE_"], 0, 1], "C"],
                    [">", ["get", "Shape_Area"], 0.000001],
                    ["<=", ["get", "Shape_Area"], 0.000006]
                ]
            });

            map.addLayer({
                id: "zoning-large-commercial",
                type: "fill",
                source: "zoning",
                paint: {
                    "fill-color": "#5e1b1bff",
                    "fill-opacity": 0.6
                },
                filter: [
                    "all",
                    ["==", ["slice", ["get", "ZONE_"], 0, 1], "C"],
                    [">", ["get", "Shape_Area"], 0.000006]
                ]
            });

            map.addLayer({
                id: "zoning-outline",
                type: "line",
                source: "zoning",
                paint: {
                    "line-color": "#1B5E20",
                    "line-width": 1
                }
            });
            map.on("click", "zoning-large-commercial", (e) => {
                const p = e.features[0].properties;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
      <strong>Zone:</strong> ${p.ZONE_}<br/>
      <strong>Scale:</strong> Big-box commercial<br/>
      <strong>Best fit:</strong> H-E-B<br/>
      <strong>Area:</strong> ${(p.Shape_Area * 404686).toFixed(1)} acres
    `)
                    .addTo(map);
            });
            map.on("click", "zoning-medium-commercial", (e) => {
                const p = e.features[0].properties;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
      <strong>Zone:</strong> ${p.ZONE_}<br/>
      <strong>Scale:</strong> Big-box commercial<br/>
      <strong>Best fit:</strong> Trader Joe's<br/>
      <strong>Area:</strong> ${(p.Shape_Area * 404686).toFixed(1)} acres
    `)
                    .addTo(map);
            });

        });
        return () => map.remove();
    }
        , []);

    return (
        <>
            <div
                ref={mapContainer}
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "100%",
                }}
            />

            <div style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                background: "white",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
            }}>
                <div><span style={{ color: "#5e1b1bff" }}>■</span> Large Commercial (H-E-B)</div>
                <div><span style={{ color: "#F9A825" }}>■</span> Medium Commercial (Trader Joe’s)</div>
            </div>
        </>
    );
}
