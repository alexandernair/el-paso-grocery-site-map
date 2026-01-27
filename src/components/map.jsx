import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            center: [-106.4850, 31.7619],
            zoom: 11,
        });

        function scoreSite(area) {
            const tjIdeal = 0.000003;
            const tjTolerance = 0.000002;
            const hebMax = 0.000006;

            const tjRaw = Math.exp(-Math.pow(area - tjIdeal, 2) / (2 * Math.pow(tjTolerance, 2)));
            const hebRaw = Math.min(area / hebMax, 1);

            return {
                tj: Math.round(tjRaw * 100),
                heb: Math.round(Math.pow(hebRaw, 1.4) * 100),
            };
        }

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", async () => {
            // --- Zoning outline layer first ---
            map.addSource("zoning", {
                type: "geojson",
                data: "/data/zoning.geojson",
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

            // --- Fetch, score, and add points ---
            const res = await fetch("/data/zoning.geojson");
            const data = await res.json();

            const features = data.features.filter(f =>
                f.properties.ZONE_?.startsWith("C") &&
                f.properties.Shape_Area > 0.000001
            );

            const siteFeatures = features.map(f => {
                const coords = f.geometry.coordinates.flat(2);
                let x = 0, y = 0;
                coords.forEach(c => { x += c[0]; y += c[1]; });
                const centroid = [x / coords.length, y / coords.length];
                const scores = scoreSite(f.properties.Shape_Area);
                const margin = Math.abs(scores.heb - scores.tj);

                return {
                    type: "Feature",
                    properties: {
                        zone: f.properties.ZONE_,
                        area: f.properties.Shape_Area,
                        tj_score: scores.tj,
                        heb_score: scores.heb,
                        winner: scores.heb > scores.tj ? "heb" : "tj",
                        margin: margin
                    },
                    geometry: {
                        type: "Point",
                        coordinates: centroid
                    }
                };
            });

            map.addSource("ranked-sites", {
                type: "geojson",
                data: { type: "FeatureCollection", features: siteFeatures }
            });

            map.addLayer({
                id: "ranked-sites-layer",
                type: "circle",
                source: "ranked-sites",
                paint: {
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["get", "margin"],
                        0, 4,
                        10, 8
                    ],
                    "circle-color": [
                        "match",
                        ["get", "winner"],
                        "heb", "#C62828",
                        "tj", "#F9A825",
                        "#999999"
                    ],
                    "circle-opacity": [
                        "interpolate",
                        ["linear"],
                        ["get", "margin"],
                        0, 0.3,
                        50, 0.85
                    ],
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#333"
                }
            });

            map.on("click", "ranked-sites-layer", (e) => {
                const p = e.features[0].properties;
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                    <strong>Commercial Zone:</strong> ${p.zone}<br/>
                    <strong>Trader Joe’s Score:</strong> ${p.tj_score}<br/>
                    <strong>H-E-B Score:</strong> ${p.heb_score}<br/>
                    <strong>Relative Size:</strong> ${(p.area * 404686).toFixed(1)} acres
                    <strong>Recommendation:</strong>
                    ${p.winner === "heb" ? "H-E-B" : "Trader Joe’s"}
                    (${p.margin} point advantage)
                `)
                    .addTo(map);
            });
        });

        return () => map.remove();
    }, []);


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
